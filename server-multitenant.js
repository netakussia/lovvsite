const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/css', express.static(path.join(__dirname)));
app.use('/js', express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/music', express.static(path.join(__dirname, 'music')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500
});
app.use('/api/', limiter);

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database tables
db.serialize(() => {
  // Read and execute schema
  const fs = require('fs');
  const schema = fs.readFileSync('./database-schema.sql', 'utf8');
  db.exec(schema);
  
  // Create default admin user
  db.get("SELECT COUNT(*) as count FROM platform_users", (err, row) => {
    if (err) {
      console.error('Error checking platform users:', err);
    } else if (row.count === 0) {
      const defaultPassword = 'admin123';
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      db.run("INSERT INTO platform_users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)", 
        ['admin', 'admin@lovesites.com', hashedPassword, 'Platform Administrator'], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('Default admin created: username=admin, password=admin123');
          }
        });
    }
  });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Site middleware - проверяет существование сайта
function validateSite(req, res, next) {
  const siteSlug = req.params.siteSlug || req.body.siteSlug;
  
  if (!siteSlug) {
    return res.status(400).json({ error: 'Site slug required' });
  }

  db.get("SELECT * FROM user_sites WHERE site_slug = ? AND is_active = 1", [siteSlug], (err, site) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    req.site = site;
    next();
  });
}

// Helper function to get site-specific table name
function getSiteTableName(baseTable, siteId) {
  return `site_${baseTable}`;
}

// Helper function to execute query with site context
function executeSiteQuery(query, params, siteId, callback) {
  const siteQuery = query.replace(/site_(\w+)/g, (match, tableName) => {
    return getSiteTableName(tableName, siteId);
  });
  
  db.all(siteQuery, params, callback);
}

// Routes

// Platform authentication
app.post('/api/platform/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    db.get("SELECT * FROM platform_users WHERE username = ? AND is_active = 1", [username], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, type: 'platform' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, username: user.username, userId: user.id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Platform registration
app.post('/api/platform/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }

    // Check if user already exists
    db.get("SELECT COUNT(*) as count FROM platform_users WHERE username = ? OR email = ?", 
      [username, email], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (row.count > 0) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        
        db.run("INSERT INTO platform_users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
          [username, email, hashedPassword, fullName || username], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            const token = jwt.sign(
              { id: this.lastID, username, type: 'platform' },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.json({ token, username, userId: this.lastID });
          });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's sites
app.get('/api/platform/sites', authenticateToken, (req, res) => {
  db.all("SELECT * FROM user_sites WHERE user_id = ? ORDER BY created_at DESC", 
    [req.user.id], (err, sites) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(sites);
    });
});

// Create new site
app.post('/api/platform/sites', authenticateToken, (req, res) => {
  const { siteName, siteTitle, siteSubtitle, templateType } = req.body;

  if (!siteName || !siteTitle) {
    return res.status(400).json({ error: 'Site name and title required' });
  }

  // Generate unique slug
  const baseSlug = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  let siteSlug = baseSlug;
  let counter = 1;

  const checkSlug = () => {
    db.get("SELECT COUNT(*) as count FROM user_sites WHERE site_slug = ?", [siteSlug], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row.count > 0) {
        siteSlug = `${baseSlug}-${counter}`;
        counter++;
        checkSlug();
      } else {
        // Create site
        db.run("INSERT INTO user_sites (user_id, site_name, site_slug, site_title, site_subtitle, template_type) VALUES (?, ?, ?, ?, ?, ?)",
          [req.user.id, siteName, siteSlug, siteTitle, siteSubtitle || '', templateType || 'love_site'], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            const siteId = this.lastID;
            
            // Initialize site with default data
            initializeSiteData(siteId, siteTitle, siteSubtitle || '', () => {
              res.json({ 
                id: siteId, 
                siteName, 
                siteSlug, 
                siteTitle, 
                siteSubtitle: siteSubtitle || '',
                templateType: templateType || 'love_site'
              });
            });
          });
      }
    });
  };

  checkSlug();
});

// Initialize site with default data
function initializeSiteData(siteId, siteTitle, siteSubtitle, callback) {
  const defaultSettings = [
    { site_id: siteId, setting_key: 'site_title', setting_value: siteTitle },
    { site_id: siteId, setting_key: 'site_subtitle', setting_value: siteSubtitle }
  ];

  const defaultChatMessages = [
    "Привет, любовь моя ❤️",
    "Этот сайт создан специально для тебя",
    "Каждый день с тобой — это подарок",
    "Ты — моя вселенная в человеческом виде ✨",
    "Люблю тебя так, что слова не справляются 💬❤️"
  ];

  // Insert default settings
  const settingsStmt = db.prepare("INSERT INTO site_settings (site_id, setting_key, setting_value) VALUES (?, ?, ?)");
  defaultSettings.forEach(setting => {
    settingsStmt.run(setting.site_id, setting.setting_key, setting.setting_value);
  });
  settingsStmt.finalize();

  // Insert default chat messages
  const chatStmt = db.prepare("INSERT INTO site_chat_messages (site_id, message, order_index) VALUES (?, ?, ?)");
  defaultChatMessages.forEach((message, index) => {
    chatStmt.run(siteId, message, index);
  });
  chatStmt.finalize();

  // Insert default music settings
  db.run("INSERT INTO site_music_settings (site_id, page, music_file, autoplay, loop, volume) VALUES (?, ?, ?, ?, ?, ?)",
    [siteId, 'main', '', 0, 1, 0.3]);

  callback();
}

// Site-specific routes (with siteSlug parameter)

// Get site info
app.get('/api/site/:siteSlug/info', validateSite, (req, res) => {
  res.json({
    id: req.site.id,
    siteName: req.site.site_name,
    siteSlug: req.site.site_slug,
    siteTitle: req.site.site_title,
    siteSubtitle: req.site.site_subtitle,
    templateType: req.site.template_type
  });
});

// Get site settings
app.get('/api/site/:siteSlug/settings', validateSite, (req, res) => {
  db.all("SELECT setting_key, setting_value FROM site_settings WHERE site_id = ?", 
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const settings = {};
      rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });
      res.json(settings);
    });
});

// Get site posts (timeline)
app.get('/api/site/:siteSlug/posts', validateSite, (req, res) => {
  db.all("SELECT * FROM site_posts WHERE site_id = ? ORDER BY date DESC", 
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

// Get site gallery
app.get('/api/site/:siteSlug/gallery', validateSite, (req, res) => {
  db.all("SELECT * FROM site_gallery WHERE site_id = ? ORDER BY created_at DESC", 
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

// Get site chat messages
app.get('/api/site/:siteSlug/chat-messages', validateSite, (req, res) => {
  db.all("SELECT * FROM site_chat_messages WHERE site_id = ? ORDER BY order_index ASC", 
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

// Get site music settings
app.get('/api/site/:siteSlug/music/:page', validateSite, (req, res) => {
  const { page } = req.params;
  db.get("SELECT * FROM site_music_settings WHERE site_id = ? AND page = ?", 
    [req.site.id, page], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row || {});
    });
});

// Check secret post password
app.post('/api/site/:siteSlug/secret-posts/check-password', validateSite, (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  db.get("SELECT id, title FROM site_secret_posts WHERE site_id = ? AND password = ?", 
    [req.site.id, password], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      res.json({ valid: true, postId: row.id, title: row.title });
    });
});

// Get secret post content
app.post('/api/site/:siteSlug/secret-posts/content', validateSite, (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  db.get("SELECT * FROM site_secret_posts WHERE site_id = ? AND password = ?", 
    [req.site.id, password], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      res.json({
        id: row.id,
        title: row.title,
        content: row.content,
        created_at: row.created_at
      });
    });
});

// Temporary messages status
app.get('/api/site/:siteSlug/temporary-messages/status', validateSite, (req, res) => {
  db.all("SELECT * FROM site_temporary_messages WHERE site_id = ? AND is_active = 1 ORDER BY show_from ASC",
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const now = new Date();
      let activeMessage = null;
      let nextMessage = null;
      
      for (let i = 0; i < rows.length; i++) {
        const msg = rows[i];
        const startTime = new Date(msg.show_from);
        const endTime = new Date(startTime.getTime() + (msg.duration_hours * 60 * 60 * 1000));
        
        if (startTime <= now && endTime > now) {
          activeMessage = { ...msg, show_until: endTime.toISOString() };
          break;
        } else if (startTime > now && !nextMessage) {
          nextMessage = msg;
        }
      }
      
      res.json({
        active: activeMessage,
        next: nextMessage,
        status: activeMessage ? 'active' : (nextMessage ? 'waiting' : 'none')
      });
    });
});

// Site management routes (authenticated)

// Update site settings
app.put('/api/site/:siteSlug/admin/settings', authenticateToken, validateSite, (req, res) => {
  // Check if user owns this site
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { site_title, site_subtitle } = req.body;

  if (!site_title || !site_subtitle) {
    return res.status(400).json({ error: 'Site title and subtitle required' });
  }

  const stmt = db.prepare("INSERT OR REPLACE INTO site_settings (site_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
  
  stmt.run(req.site.id, 'site_title', site_title, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });
  
  stmt.run(req.site.id, 'site_subtitle', site_subtitle, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });
  
  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Site settings updated successfully' });
  });
});

// Create secret post
app.post('/api/site/:siteSlug/admin/secret-posts', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({ error: 'Title, content and password required' });
  }

  db.run("INSERT INTO site_secret_posts (site_id, title, content, password) VALUES (?, ?, ?, ?)",
    [req.site.id, title, content, password], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, content, password });
    });
});

// Get all secret posts (admin only)
app.get('/api/site/:siteSlug/admin/secret-posts', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all("SELECT id, title, password, created_at, updated_at FROM site_secret_posts WHERE site_id = ? ORDER BY created_at DESC",
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

// Create post
app.post('/api/site/:siteSlug/admin/posts', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, date, image_url, content } = req.body;

  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content required' });
  }

  db.run("INSERT INTO site_posts (site_id, title, date, image_url, content) VALUES (?, ?, ?, ?, ?)",
    [req.site.id, title || 'Новый пост', date, image_url || '', content], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID, 
        title: title || 'Новый пост',
        date, 
        image_url: image_url || '', 
        content
      });
    });
});

// Get all secret posts (admin only)
app.get('/api/site/:siteSlug/admin/secret-posts', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all("SELECT id, title, password, created_at, updated_at FROM site_secret_posts WHERE site_id = ? ORDER BY created_at DESC",
    [req.site.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

// Update secret post
app.put('/api/site/:siteSlug/admin/secret-posts/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({ error: 'Title, content and password required' });
  }

  db.run(
    "UPDATE site_secret_posts SET title = ?, content = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?",
    [title, content, password, id, req.site.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Secret post not found' });
      }
      res.json({ id, title, content, password });
    }
  );
});

// Delete secret post
app.delete('/api/site/:siteSlug/admin/secret-posts/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;

  db.run("DELETE FROM site_secret_posts WHERE id = ? AND site_id = ?", [id, req.site.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Secret post not found' });
    }
    res.json({ message: 'Secret post deleted successfully' });
  });
});

// Get all posts (admin only)
app.get('/api/site/:siteSlug/admin/posts', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all("SELECT * FROM site_posts WHERE site_id = ? ORDER BY date DESC", [req.site.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Update post
app.put('/api/site/:siteSlug/admin/posts/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  const { title, date, image_url, content } = req.body;

  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content required' });
  }

  db.run(
    "UPDATE site_posts SET title = ?, date = ?, image_url = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?",
    [title || 'Обновленный пост', date, image_url || '', content, id, req.site.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ id, title: title || 'Обновленный пост', date, image_url: image_url || '', content });
    }
  );
});

// Delete post
app.delete('/api/site/:siteSlug/admin/posts/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;

  db.run("DELETE FROM site_posts WHERE id = ? AND site_id = ?", [id, req.site.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// Gallery admin endpoints
app.get('/api/site/:siteSlug/admin/gallery', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all("SELECT * FROM site_gallery WHERE site_id = ? ORDER BY created_at DESC", [req.site.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/site/:siteSlug/admin/gallery', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, description, file_path, file_type, thumbnail_path } = req.body;

  if (!title || !file_path || !file_type) {
    return res.status(400).json({ error: 'Title, file_path and file_type required' });
  }

  db.run(
    "INSERT INTO site_gallery (site_id, title, description, file_path, file_type, thumbnail_path) VALUES (?, ?, ?, ?, ?, ?)",
    [req.site.id, title, description || '', file_path, file_type, thumbnail_path || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Gallery item created successfully' });
    }
  );
});

app.put('/api/site/:siteSlug/admin/gallery/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  const { title, description, file_path, file_type, thumbnail_path } = req.body;

  if (!title || !file_path || !file_type) {
    return res.status(400).json({ error: 'Title, file_path and file_type required' });
  }

  db.run(
    "UPDATE site_gallery SET title = ?, description = ?, file_path = ?, file_type = ?, thumbnail_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?",
    [title, description || '', file_path, file_type, thumbnail_path || '', id, req.site.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Gallery item updated successfully' });
    }
  );
});

app.delete('/api/site/:siteSlug/admin/gallery/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;

  db.run("DELETE FROM site_gallery WHERE id = ? AND site_id = ?", [id, req.site.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  });
});

// Music settings admin endpoints
app.get('/api/site/:siteSlug/admin/music', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all("SELECT * FROM site_music_settings WHERE site_id = ? ORDER BY page ASC", [req.site.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.put('/api/site/:siteSlug/admin/music/:page', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { page } = req.params;
  const { music_file, autoplay, loop, volume } = req.body;

  db.run(
    "INSERT OR REPLACE INTO site_music_settings (site_id, page, music_file, autoplay, loop, volume, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
    [req.site.id, page, music_file || '', autoplay || 0, loop || 1, volume || 0.5],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Music settings updated successfully' });
    }
  );
});

// Temporary messages admin endpoints
app.get('/api/site/:siteSlug/admin/temporary-messages', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all(
    `SELECT *, 
     datetime(show_from, '+' || duration_hours || ' hours') as show_until
     FROM site_temporary_messages 
     WHERE site_id = ?
     ORDER BY show_from DESC`,
    [req.site.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/site/:siteSlug/admin/temporary-messages', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, content, show_from, duration_hours } = req.body;

  if (!title || !content || !show_from || !duration_hours) {
    return res.status(400).json({ error: 'Title, content, show_from and duration_hours required' });
  }

  db.run(
    "INSERT INTO site_temporary_messages (site_id, title, content, show_from, duration_hours) VALUES (?, ?, ?, ?, ?)",
    [req.site.id, title, content, show_from, duration_hours],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Temporary message created successfully' });
    }
  );
});

app.put('/api/site/:siteSlug/admin/temporary-messages/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  const { title, content, show_from, duration_hours, is_active } = req.body;

  if (!title || !content || !show_from || !duration_hours) {
    return res.status(400).json({ error: 'Title, content, show_from and duration_hours required' });
  }

  db.run(
    "UPDATE site_temporary_messages SET title = ?, content = ?, show_from = ?, duration_hours = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND site_id = ?",
    [title, content, show_from, duration_hours, is_active !== undefined ? is_active : 1, id, req.site.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Temporary message updated successfully' });
    }
  );
});

app.delete('/api/site/:siteSlug/admin/temporary-messages/:id', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;

  db.run("DELETE FROM site_temporary_messages WHERE id = ? AND site_id = ?", [id, req.site.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Temporary message deleted successfully' });
  });
});

// Update chat messages
app.put('/api/site/:siteSlug/admin/chat-messages', authenticateToken, validateSite, (req, res) => {
  if (req.site.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  db.run("DELETE FROM site_chat_messages WHERE site_id = ?", [req.site.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const stmt = db.prepare("INSERT INTO site_chat_messages (site_id, message, order_index) VALUES (?, ?, ?)");
    messages.forEach((message, index) => {
      if (message && message.trim()) {
        stmt.run(req.site.id, message.trim(), index);
      }
    });
    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Chat messages updated successfully' });
    });
  });
});

// Serve site pages
app.get('/site/:siteSlug', (req, res) => {
  const { siteSlug } = req.params;
  
  db.get("SELECT * FROM user_sites WHERE site_slug = ? AND is_active = 1", [siteSlug], (err, site) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    
    if (!site) {
      return res.status(404).send('Site not found');
    }
    
    // Serve the appropriate template based on template_type
    const templateFile = site.template_type === 'love_site' ? 'index-multitenant.html' : 'index-multitenant.html';
    res.sendFile(path.join(__dirname, templateFile));
  });
});

app.get('/site/:siteSlug/gallery', (req, res) => {
  const { siteSlug } = req.params;
  
  db.get("SELECT * FROM user_sites WHERE site_slug = ? AND is_active = 1", [siteSlug], (err, site) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    
    if (!site) {
      return res.status(404).send('Site not found');
    }
    
    res.sendFile(path.join(__dirname, 'gallery.html'));
  });
});

// Serve admin panel
app.get('/admin', (req, res) => {
  const siteSlug = req.query.site;
  if (!siteSlug) {
    return res.status(400).send('Site slug is required for admin access. Use /admin?site=YOUR_SITE_SLUG');
  }
  res.sendFile(path.join(__dirname, 'admin-multitenant.html'));
});

// Serve platform admin panel
app.get('/platform-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'platform-admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Multi-tenant Love Sites Platform running on port ${PORT}`);
  console.log(`Platform Admin: http://localhost:${PORT}/platform-admin`);
  console.log(`Site Admin: http://localhost:${PORT}/admin`);
  console.log(`API: http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
