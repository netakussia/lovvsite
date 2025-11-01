const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

console.log('🚀 Начинаем миграцию данных...');

const oldDb = new sqlite3.Database('./database-backup.sqlite');
const newDb = new sqlite3.Database('./database.sqlite');

// Создаем пользователя
const hashedPassword = bcrypt.hashSync('migrated123', 10);
newDb.run(
    "INSERT INTO platform_users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
    ['migrated_user', 'migrated@example.com', hashedPassword, 'Migrated User'],
    function(err) {
        if (err) {
            console.error('❌ Ошибка создания пользователя:', err);
            return;
        }
        
        const userId = this.lastID;
        console.log('✅ Пользователь создан с ID:', userId);
        
        // Создаем сайт
        newDb.run(
            "INSERT INTO user_sites (user_id, site_name, site_slug, site_title, site_subtitle, template_type) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, 'Migrated Love Site', 'migrated-love-site', 'Добро пожаловать ❤️', 'Подарок только для тебя', 'love_site'],
            function(err) {
                if (err) {
                    console.error('❌ Ошибка создания сайта:', err);
                    return;
                }
                
                const siteId = this.lastID;
                console.log('✅ Сайт создан с ID:', siteId);
                
                // Мигрируем данные
                migrateData(siteId);
            }
        );
    }
);

function migrateData(siteId) {
    // Мигрируем настройки
    oldDb.all("SELECT key, value FROM site_settings", (err, settings) => {
        if (!err && settings) {
            const stmt = newDb.prepare("INSERT INTO site_settings (site_id, setting_key, setting_value) VALUES (?, ?, ?)");
            settings.forEach(setting => {
                stmt.run(siteId, setting.key, setting.value);
            });
            stmt.finalize();
            console.log(`✅ Мигрировано ${settings.length} настроек`);
        }
        
        // Мигрируем посты
        oldDb.all("SELECT * FROM posts", (err, posts) => {
            if (!err && posts) {
                const stmt = newDb.prepare("INSERT INTO site_posts (site_id, title, date, image_url, content) VALUES (?, ?, ?, ?, ?)");
                posts.forEach(post => {
                    stmt.run(siteId, post.title, post.date, post.image_url, post.content);
                });
                stmt.finalize();
                console.log(`✅ Мигрировано ${posts.length} постов`);
            }
            
            // Мигрируем секретные посты
            oldDb.all("SELECT * FROM secret_posts", (err, secretPosts) => {
                if (!err && secretPosts) {
                    const stmt = newDb.prepare("INSERT INTO site_secret_posts (site_id, title, content, password) VALUES (?, ?, ?, ?)");
                    secretPosts.forEach(post => {
                        stmt.run(siteId, post.title, post.content, post.password);
                    });
                    stmt.finalize();
                    console.log(`✅ Мигрировано ${secretPosts.length} секретных постов`);
                }
                
                // Мигрируем галерею
                oldDb.all("SELECT * FROM gallery", (err, galleryItems) => {
                    if (!err && galleryItems) {
                        const stmt = newDb.prepare("INSERT INTO site_gallery (site_id, title, description, file_path, file_type, thumbnail_path) VALUES (?, ?, ?, ?, ?, ?)");
                        galleryItems.forEach(item => {
                            stmt.run(siteId, item.title, item.description, item.file_path, item.file_type, item.thumbnail_path);
                        });
                        stmt.finalize();
                        console.log(`✅ Мигрировано ${galleryItems.length} элементов галереи`);
                    }
                    
                    // Мигрируем настройки музыки
                    oldDb.all("SELECT * FROM music_settings", (err, musicSettings) => {
                        if (!err && musicSettings) {
                            const stmt = newDb.prepare("INSERT INTO site_music_settings (site_id, page, music_file, autoplay, loop, volume) VALUES (?, ?, ?, ?, ?, ?)");
                            musicSettings.forEach(setting => {
                                stmt.run(siteId, setting.page, setting.music_file, setting.autoplay, setting.loop, setting.volume);
                            });
                            stmt.finalize();
                            console.log(`✅ Мигрировано ${musicSettings.length} настроек музыки`);
                        }
                        
                        // Мигрируем временные сообщения
                        oldDb.all("SELECT * FROM temporary_messages", (err, tempMessages) => {
                            if (!err && tempMessages) {
                                const stmt = newDb.prepare("INSERT INTO site_temporary_messages (site_id, title, content, show_from, duration_hours, is_active) VALUES (?, ?, ?, ?, ?, ?)");
                                tempMessages.forEach(msg => {
                                    stmt.run(siteId, msg.title, msg.content, msg.show_from, msg.duration_hours, msg.is_active);
                                });
                                stmt.finalize();
                                console.log(`✅ Мигрировано ${tempMessages.length} временных сообщений`);
                            }
                            
                            // Мигрируем сообщения чата
                            oldDb.all("SELECT * FROM chat_messages", (err, chatMessages) => {
                                if (!err && chatMessages) {
                                    const stmt = newDb.prepare("INSERT INTO site_chat_messages (site_id, message, order_index) VALUES (?, ?, ?)");
                                    chatMessages.forEach(msg => {
                                        stmt.run(siteId, msg.message, msg.order_index);
                                    });
                                    stmt.finalize();
                                    console.log(`✅ Мигрировано ${chatMessages.length} сообщений чата`);
                                }
                                
                                // Завершаем миграцию
                                oldDb.close();
                                newDb.close();
                                
                                console.log('\n🎉 Миграция завершена успешно!');
                                console.log('\n📋 Информация для входа:');
                                console.log('👤 Логин: migrated_user');
                                console.log('🔑 Пароль: migrated123');
                                console.log('🌐 URL сайта: /site/migrated-love-site');
                                console.log('\n🚀 Теперь вы можете:');
                                console.log('   1. Открыть http://localhost:3000/platform-admin');
                                console.log('   2. Войти с логином migrated_user и паролем migrated123');
                                console.log('   3. Просматривать сайт по адресу http://localhost:3000/site/migrated-love-site');
                            });
                        });
                    });
                });
            });
        });
    });
}
