const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting on Render
app.set('trust proxy', 1);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Flag to prevent multiple initializations
let isInitializing = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Rate limiting - very lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 500 requests per windowMs (increased for prod)
});
app.use('/api/', limiter);

// More lenient rate limiting for temporary messages
const temporaryMessagesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200 // limit each IP to 200 requests per minute (increased)
});

// Apply stricter rate limiting to temporary messages endpoints
app.use('/api/temporary-messages/*', temporaryMessagesLimiter);

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database tables
db.serialize(() => {
  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Secret posts table (with individual passwords)
  db.run(`CREATE TABLE IF NOT EXISTS secret_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table (timeline moments) - public only
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    image_url TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Gallery table
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    thumbnail_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Music settings table
  db.run(`CREATE TABLE IF NOT EXISTS music_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL UNIQUE,
    music_file TEXT,
    autoplay BOOLEAN DEFAULT 0,
    loop BOOLEAN DEFAULT 1,
    volume REAL DEFAULT 0.5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Temporary messages table
  db.run(`CREATE TABLE IF NOT EXISTS temporary_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    show_from DATETIME NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Site settings table
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Chat messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user if not exists
  db.get("SELECT COUNT(*) as count FROM admin_users", (err, row) => {
    if (err) {
      console.error('Error checking admin users:', err);
    } else if (row.count === 0) {
      const defaultPassword = 'lovv1'; // More secure password
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      db.run("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)", 
        ['neta', hashedPassword], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('Default admin created: username=neta, password=lovv1');
          }
        });
    }
  });

  // Data will be initialized in server start to avoid double initialization
});

function insertDefaultData() {
  console.log('Starting data insertion...');
  
  // Use transaction to ensure data integrity
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert default site settings
    const defaultSettings = [
      { key: 'site_title', value: 'С 4 месяца нас, любимая ❤️' },
      { key: 'site_subtitle', value: 'Подарок только для тебя))' }
    ];

    const stmt = db.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)");
    defaultSettings.forEach(setting => {
      stmt.run(setting.key, setting.value);
    });
    stmt.finalize();

  // Insert default chat messages
  const defaultMessages = [
    "Привет, любовь моя ❤️",
    "Знаешь, я хотел бы начать этот сайт с чего-то простого, но настоящего",
    "Ты — причина, по которой я улыбаюсь без причины 🥺",
    "Спасибо за эти чудесные 3 месяца 🌸",
    "А теперь... погнали дальше 😉",
    "Ты — моя вселенная в человеческом виде ✨",
    "Каждая минута с тобой — как отдельная глава сказки 📖",
    "Иногда я просто сижу и думаю, как же мне повезло с тобой 🥹",
    "Если бы я мог, я бы закрыл тебя в объятиях навсегда 🤍",
    "У нас ещё столько впереди... и всё это — вместе 🤝",
    "Даже в плохие дни ты — моё самое светлое 🌙",
    "Люблю тебя так, что слова не справляются 💬❤️",
    "Этот сайт — не просто сюрприз, а отражение моей любви к тебе 💌"
  ];

    // Insert default chat messages
    const chatStmt = db.prepare("INSERT OR IGNORE INTO chat_messages (message, order_index) VALUES (?, ?)");
    defaultMessages.forEach((message, index) => {
      chatStmt.run(message, index);
    });
    chatStmt.finalize();
    console.log(`Inserted ${defaultMessages.length} default chat messages`);

  // Insert default posts (original data from init-data.js + additional moments)
  const samplePosts = [
    {
      title: "Первый подарок 🎁",
      content: "всё началось с торта в Тг — первый подарок, первое «я хочу, чтобы ей было приятно»",
      image: "images/moment7-perviipodarok!!!!.jpg",
      date: "17.04.2025"
    },
    {
      title: "Начало истории 💕",
      content: "никто ещё не знал, а уже всё началось",
      image: "images/moment1.jpg",
      date: "30.04.2025"
    },
    {
      title: "Игра с трендом 🎮",
      content: "мы просто гуляли, просто играли с тренд… а потом всё стало не «просто»",
      image: "images/moment20-pikmikolya.jpg",
      date: "01.05.2025"
    },
    {
      title: "Твои глаза 👀",
      content: "эти глаза я помню с первого взгляда, даже когда ещё не знал, что запомню🫠",
      image: "images/moment17-glaza.jpg",
      date: "03.05.2025"
    },
    {
      title: "Предложение встречаться 💍",
      content: "тогда, в 22:45, я не просто предложил встречаться… я, по сути, выбрал тебя навсегда",
      image: "images/moment10-vstrechata.jpg",
      date: "03.05.2025"
    },
    {
      title: "Наш первый поцелуй 😘",
      content: "Этот момент изменил всё. Когда наши губы встретились впервые, я понял - это то, чего я ждал всю жизнь.",
      image: "images/moment2.jpg",
      date: "05.05.2025"
    },
    {
      title: "Первое признание в любви 💌",
      content: "Сказать тебе 'я люблю тебя' было самым страшным и одновременно самым счастливым моментом в моей жизни.",
      image: "images/moment9-pervoepriznanie.jpg",
      date: "10.05.2025"
    },
    {
      title: "Наши глупые шутки 😄",
      content: "Ты всегда умеешь рассмешить меня. Твои шутки, твоя улыбка, твой смех - это музыка для моих ушей.",
      image: "images/moment6-ily.jpg",
      date: "15.05.2025"
    },
    {
      title: "Мы вместе 🤝",
      content: "Это фото - наша история. Два человека, которые нашли друг друга в этом огромном мире.",
      image: "images/moment18-mi.jpg",
      date: "20.05.2025"
    },
    {
      title: "Прогулка по городу 🌆",
      content: "Мы гуляли по вечернему городу, держась за руки. Каждый шаг с тобой - это приключение.",
      image: "images/moment4.jpg",
      date: "25.05.2025"
    }
  ];

    // Insert default posts
    const postsStmt = db.prepare("INSERT OR IGNORE INTO posts (title, content, image_url, date) VALUES (?, ?, ?, ?)");
    samplePosts.forEach(post => {
      postsStmt.run(post.title, post.content, post.image, post.date);
    });
    postsStmt.finalize();
    console.log(`Inserted ${samplePosts.length} sample posts`);

  // Insert default secret posts
  const sampleSecretPosts = [
    {
      title: "Секретное послание 💕",
      content: "Это мое первое секретное послание для тебя. Я создал этот сайт, чтобы показать тебе, как сильно я тебя люблю. Каждый день с тобой - это подарок.",
      password: "любовь2025"
    },
    {
      title: "Тайное признание 🌟",
      content: "Знаешь, что самое прекрасное в тебе? Твоя способность делать мир лучше просто своим присутствием. Ты - мой свет в темноте, моя надежда, моя любовь.",
      password: "счастье"
    }
  ];

    // Insert default secret posts
    const secretStmt = db.prepare("INSERT OR IGNORE INTO secret_posts (title, content, password) VALUES (?, ?, ?)");
    sampleSecretPosts.forEach(post => {
      secretStmt.run(post.title, post.content, post.password);
    });
    secretStmt.finalize();
    console.log(`Inserted ${sampleSecretPosts.length} sample secret posts`);
  
  // Insert default music settings
  const musicSettings = [
    { page: 'main', music_file: 'music/papin-olimpos-eto-lyubov-2018.mp3', autoplay: 0, loop: 1, volume: 0.3 },
    { page: 'gallery', music_file: 'music/Рем Дигга - Тринадцатый.mp3', autoplay: 0, loop: 1, volume: 0.4 }
  ];

  musicSettings.forEach(setting => {
    db.run("INSERT OR IGNORE INTO music_settings (page, music_file, autoplay, loop, volume) VALUES (?, ?, ?, ?, ?)", 
      [setting.page, setting.music_file, setting.autoplay, setting.loop, setting.volume], (err) => {
        if (err) {
          console.error('Error inserting music setting:', err);
        }
      });
  });

  // Insert sample gallery items (from existing timeline posts)
  const sampleGalleryItems = [
    {
      title: "Первый подарок 🎁",
      description: "всё началось с торта в Тг — первый подарок, первое «я хочу, чтобы ей было приятно»",
      file_path: "images/moment7-perviipodarok!!!!.jpg",
      file_type: "image"
    },
    {
      title: "Наша встреча 💕",
      description: "Первый раз увидели друг друга вживую. Сердце билось так быстро!",
      file_path: "images/moment10-vstrechata.jpg",
      file_type: "image"
    },
    {
      title: "Весёлые моменты 😄",
      description: "Всегда смеёмся вместе, даже в самые трудные времена",
      file_path: "images/moment11-prikolina.jpg",
      file_type: "image"
    }
  ];

    // Insert sample gallery items
    const galleryStmt = db.prepare("INSERT OR IGNORE INTO gallery (title, description, file_path, file_type) VALUES (?, ?, ?, ?)");
    sampleGalleryItems.forEach(item => {
      galleryStmt.run(item.title, item.description, item.file_path, item.file_type);
    });
    galleryStmt.finalize();
    console.log(`Inserted ${sampleGalleryItems.length} sample gallery items`);
    
    // Create default admin user
    const defaultPassword = 'lovv1';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    db.run("INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)",
      ['neta', hashedPassword], (err) => {
        if (!err) {
          console.log('Default admin created: username=neta, password=lovv1');
        }
      });

    // Commit transaction and reset initialization flag
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err);
        db.run('ROLLBACK');
      } else {
        console.log('Data initialization completed successfully!');
      }
      isInitializing = false;
    });
  });
}

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

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    db.get("SELECT * FROM admin_users WHERE username = ?", [username], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, username: user.username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get site settings (public)
app.get('/api/settings', (req, res) => {
  db.all("SELECT key, value FROM site_settings", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

// Check secret post password
app.post('/api/secret-posts/check-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  db.get("SELECT id, title FROM secret_posts WHERE password = ?", [password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    res.json({ valid: true, postId: row.id, title: row.title });
  });
});

// Get secret post content (only with correct password)
app.post('/api/secret-posts/content', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  db.get("SELECT * FROM secret_posts WHERE password = ?", [password], (err, row) => {
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

// Get posts (public timeline)
app.get('/api/posts', (req, res) => {
  db.all("SELECT * FROM posts ORDER BY date DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get gallery items (public)
app.get('/api/gallery', (req, res) => {
  db.all("SELECT * FROM gallery ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get music settings for page
app.get('/api/music/:page', (req, res) => {
  const { page } = req.params;
  db.get("SELECT * FROM music_settings WHERE page = ?", [page], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(row || {});
  });
});

// Simple unified endpoint for temporary messages status
let lastStatusCall = 0;
let currentStatus = null;

app.get('/api/temporary-messages/status', (req, res) => {
  const now = Date.now();
  
  // Server-side protection: max 1 call per 10 seconds per IP
  if (now - lastStatusCall < 10000) {
    console.log('Status API rate limited - returning cached response');
    return res.json({ active: null, next: null, status: 'rate_limited' });
  }
  
  lastStatusCall = now;
  console.log('Temporary messages status requested');
  
  db.all(
    `SELECT * FROM temporary_messages WHERE is_active = 1 ORDER BY show_from ASC`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const now = new Date();
      console.log('Current server time:', now.toISOString());
      
      // Find current active message
      let activeMessage = null;
      let nextMessage = null;
      
      for (let i = 0; i < rows.length; i++) {
        const msg = rows[i];
        const startTime = new Date(msg.show_from);
        const endTime = new Date(startTime.getTime() + (msg.duration_hours * 60 * 60 * 1000));
        
        console.log(`Checking message ${msg.id}: start=${startTime.toISOString()}, end=${endTime.toISOString()}, now=${now.toISOString()}`);
        
        if (startTime <= now && endTime > now) {
          // Currently active
          activeMessage = msg;
          activeMessage.show_until = endTime.toISOString();
          console.log(`Message ${msg.id} is ACTIVE`);
          break;
        } else if (startTime > now && !nextMessage) {
          // Future message, only take the first one
          nextMessage = msg;
          console.log(`Message ${msg.id} is FUTURE`);
        } else {
          console.log(`Message ${msg.id} is EXPIRED`);
        }
      }
      
      const response = {
        active: activeMessage,
        next: nextMessage,
        status: activeMessage ? 'active' : (nextMessage ? 'waiting' : 'none')
      };
      
      console.log('Status response:', response.status, activeMessage ? `Active: ${activeMessage.title}` : '', nextMessage ? `Next: ${nextMessage.title}` : '');
      currentStatus = response; // Cache the response
      res.json(response);
    }
  );
});

// Get all temporary messages for admin
app.get('/api/temporary-messages', (req, res) => {
  db.all(
    `SELECT *, 
     datetime(show_from, '+' || duration_hours || ' hours') as show_until
     FROM temporary_messages 
     ORDER BY show_from DESC`,
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get chat messages (public)
app.get('/api/chat-messages', (req, res) => {
  db.all("SELECT * FROM chat_messages ORDER BY order_index ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Admin routes (protected)

// Create secret post
app.post('/api/admin/secret-posts', authenticateToken, (req, res) => {
  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({ error: 'Title, content and password required' });
  }

  db.run(
    "INSERT INTO secret_posts (title, content, password) VALUES (?, ?, ?)",
    [title, content, password],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, content, password });
    }
  );
});

// Update secret post
app.put('/api/admin/secret-posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    return res.status(400).json({ error: 'Title, content and password required' });
  }

  db.run(
    "UPDATE secret_posts SET title = ?, content = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, content, password, id],
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
app.delete('/api/admin/secret-posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM secret_posts WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Secret post not found' });
    }
    res.json({ message: 'Secret post deleted successfully' });
  });
});

// Get all secret posts (admin only)
app.get('/api/admin/secret-posts', authenticateToken, (req, res) => {
  db.all("SELECT id, title, password, created_at, updated_at FROM secret_posts ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Gallery admin endpoints
app.get('/api/admin/gallery', authenticateToken, (req, res) => {
  db.all("SELECT * FROM gallery ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/admin/gallery', authenticateToken, (req, res) => {
  const { title, description, file_path, file_type, thumbnail_path } = req.body;

  if (!title || !file_path || !file_type) {
    return res.status(400).json({ error: 'Title, file_path and file_type required' });
  }

  db.run(
    "INSERT INTO gallery (title, description, file_path, file_type, thumbnail_path) VALUES (?, ?, ?, ?, ?)",
    [title, description || '', file_path, file_type, thumbnail_path || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Gallery item created successfully' });
    }
  );
});

app.put('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, file_path, file_type, thumbnail_path } = req.body;

  if (!title || !file_path || !file_type) {
    return res.status(400).json({ error: 'Title, file_path and file_type required' });
  }

  db.run(
    "UPDATE gallery SET title = ?, description = ?, file_path = ?, file_type = ?, thumbnail_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description || '', file_path, file_type, thumbnail_path || '', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Gallery item updated successfully' });
    }
  );
});

app.delete('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM gallery WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  });
});

// Music settings admin endpoints
app.get('/api/admin/music', authenticateToken, (req, res) => {
  db.all("SELECT * FROM music_settings ORDER BY page ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.put('/api/admin/music/:page', authenticateToken, (req, res) => {
  const { page } = req.params;
  const { music_file, autoplay, loop, volume } = req.body;

  db.run(
    "INSERT OR REPLACE INTO music_settings (page, music_file, autoplay, loop, volume, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
    [page, music_file || '', autoplay || 0, loop || 1, volume || 0.5],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Music settings updated successfully' });
    }
  );
});

// Temporary messages admin endpoints
app.get('/api/admin/temporary-messages', authenticateToken, (req, res) => {
  db.all(
    `SELECT *, 
     datetime(show_from, '+' || duration_hours || ' hours') as show_until
     FROM temporary_messages 
     ORDER BY show_from DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/admin/temporary-messages', authenticateToken, (req, res) => {
  const { title, content, show_from, duration_hours } = req.body;

  if (!title || !content || !show_from || !duration_hours) {
    return res.status(400).json({ error: 'Title, content, show_from and duration_hours required' });
  }

  db.run(
    "INSERT INTO temporary_messages (title, content, show_from, duration_hours) VALUES (?, ?, ?, ?)",
    [title, content, show_from, duration_hours],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Temporary message created successfully' });
    }
  );
});

app.put('/api/admin/temporary-messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, show_from, duration_hours, is_active } = req.body;

  if (!title || !content || !show_from || !duration_hours) {
    return res.status(400).json({ error: 'Title, content, show_from and duration_hours required' });
  }

  db.run(
    "UPDATE temporary_messages SET title = ?, content = ?, show_from = ?, duration_hours = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, content, show_from, duration_hours, is_active !== undefined ? is_active : 1, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Temporary message updated successfully' });
    }
  );
});

app.delete('/api/admin/temporary-messages/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM temporary_messages WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Temporary message deleted successfully' });
  });
});

// Create post
app.post('/api/admin/posts', authenticateToken, (req, res) => {
  const { date, image_url, content } = req.body;

  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content required' });
  }

  db.run(
    "INSERT INTO posts (title, date, image_url, content) VALUES (?, ?, ?, ?)",
    [title || 'Новый пост', date, image_url || '', content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id: this.lastID, 
        date, 
        image_url: image_url || '', 
        content
      });
    }
  );
});

// Update post
app.put('/api/admin/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { date, image_url, content } = req.body;

  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content required' });
  }

  db.run(
    "UPDATE posts SET title = ?, date = ?, image_url = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title || 'Обновленный пост', date, image_url || '', content, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ id, date, image_url: image_url || '', content });
    }
  );
});

// Delete post
app.delete('/api/admin/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM posts WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// Update chat messages
app.put('/api/admin/chat-messages', authenticateToken, (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  db.run("DELETE FROM chat_messages", (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const stmt = db.prepare("INSERT INTO chat_messages (message, order_index) VALUES (?, ?)");
    messages.forEach((message, index) => {
      if (message && message.trim()) {
        stmt.run(message.trim(), index);
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

// Update site settings
app.put('/api/admin/settings', authenticateToken, (req, res) => {
  const { site_title, site_subtitle } = req.body;

  if (!site_title || !site_subtitle) {
    return res.status(400).json({ error: 'Site title and subtitle required' });
  }

  const stmt = db.prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
  
  stmt.run('site_title', site_title, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });
  
  stmt.run('site_subtitle', site_subtitle, (err) => {
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

// Function to initialize data if database is empty
function initializeDataIfNeeded() {
  if (isInitializing) {
    console.log('Data initialization already in progress, skipping...');
    return;
  }
  
  // Check if any data already exists (posts, settings, etc.)
  db.get('SELECT COUNT(*) as count FROM posts', (err, postsRow) => {
    if (err) {
      console.error('Error checking posts count:', err);
      return;
    }
    
    db.get('SELECT COUNT(*) as count FROM site_settings', (err, settingsRow) => {
      if (err) {
        console.error('Error checking site_settings count:', err);
        return;
      }
      
      // Only initialize if both tables are completely empty
      if (postsRow.count === 0 && settingsRow.count === 0) {
        isInitializing = true;
        console.log('Database is empty, initializing with sample data...');
        insertDefaultData();
      } else {
        console.log(`Database already has ${postsRow.count} posts and ${settingsRow.count} settings, skipping initialization.`);
      }
    });
  });
}

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`API: http://localhost:${PORT}/api/`);
  
  // Initialize data if database is empty
  initializeDataIfNeeded();
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
