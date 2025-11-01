-- Схема базы данных для мультитенантной платформы сайтов любви

-- Таблица пользователей платформы
CREATE TABLE IF NOT EXISTS platform_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Таблица сайтов пользователей
CREATE TABLE IF NOT EXISTS user_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    site_name TEXT NOT NULL,
    site_slug TEXT UNIQUE NOT NULL, -- уникальный URL slug для сайта
    site_title TEXT NOT NULL,
    site_subtitle TEXT,
    template_type TEXT DEFAULT 'love_site', -- тип шаблона
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
);

-- Таблица настроек сайтов
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, setting_key)
);

-- Таблица постов таймлайна для каждого сайта
CREATE TABLE IF NOT EXISTS site_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    image_url TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE
);

-- Таблица секретных постов для каждого сайта
CREATE TABLE IF NOT EXISTS site_secret_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE
);

-- Таблица галереи для каждого сайта
CREATE TABLE IF NOT EXISTS site_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    thumbnail_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE
);

-- Таблица настроек музыки для каждого сайта
CREATE TABLE IF NOT EXISTS site_music_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    page TEXT NOT NULL,
    music_file TEXT,
    autoplay BOOLEAN DEFAULT 0,
    loop BOOLEAN DEFAULT 1,
    volume REAL DEFAULT 0.5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE,
    UNIQUE(site_id, page)
);

-- Таблица временных сообщений для каждого сайта
CREATE TABLE IF NOT EXISTS site_temporary_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    show_from DATETIME NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE
);

-- Таблица сообщений чата для каждого сайта
CREATE TABLE IF NOT EXISTS site_chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES user_sites(id) ON DELETE CASCADE
);

-- Таблица шаблонов сайтов
CREATE TABLE IF NOT EXISTS site_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT UNIQUE NOT NULL,
    template_description TEXT,
    template_config TEXT, -- JSON конфигурация шаблона
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Вставка базовых шаблонов
INSERT OR IGNORE INTO site_templates (template_name, template_description, template_config) VALUES 
('love_site', 'Классический сайт любви с таймлайном, галереей и секретными постами', '{"features": ["timeline", "gallery", "secret_posts", "chat", "music", "temporary_messages"]}'),
('simple_love', 'Упрощенный сайт любви с основными функциями', '{"features": ["timeline", "gallery", "chat"]}'),
('anniversary', 'Сайт для годовщины с акцентом на таймлайн', '{"features": ["timeline", "gallery", "music"]}');

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_sites_user_id ON user_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sites_slug ON user_sites(site_slug);
CREATE INDEX IF NOT EXISTS idx_site_posts_site_id ON site_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_site_secret_posts_site_id ON site_secret_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_site_gallery_site_id ON site_gallery(site_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_site_id ON site_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_site_music_settings_site_id ON site_music_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_site_temporary_messages_site_id ON site_temporary_messages(site_id);
CREATE INDEX IF NOT EXISTS idx_site_chat_messages_site_id ON site_chat_messages(site_id);
