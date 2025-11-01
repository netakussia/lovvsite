// Script to initialize test data
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite');

// Sample secret posts
const sampleSecretPosts = [
    {
        title: "Секретное поздравление",
        content: "Это поздравление видно только с правильным паролем!",
        password: "любовь2025"
    },
    {
        title: "Особый момент",
        content: "Этот пост доступен только тем, кто знает особый пароль.",
        password: "счастье"
    }
];

const samplePosts = [
    {
        date: "01.01.2025",
        image_url: "",
        content: "Первый день нашей истории"
    },
    {
        date: "15.01.2025",
        image_url: "",
        content: "Памятный момент вместе"
    }
];

const sampleChatMessages = [
    "Привет, любимая ❤️",
    "Этот сайт создан специально для тебя",
    "Каждый день с тобой — это подарок",
    "Ты — моя вселенная в человеческом виде ✨",
    "Люблю тебя так, что слова не справляются 💬❤️"
];

// Initialize data
db.serialize(() => {
    console.log('Initializing database with sample data...');

    // Clear existing data
    db.run("DELETE FROM secret_posts");
    db.run("DELETE FROM posts");
    db.run("DELETE FROM chat_messages");
    db.run("DELETE FROM site_settings");

    // Insert secret posts
    const secretPostStmt = db.prepare("INSERT INTO secret_posts (title, content, password) VALUES (?, ?, ?)");
    sampleSecretPosts.forEach(post => {
        secretPostStmt.run(post.title, post.content, post.password);
    });
    secretPostStmt.finalize();

    // Insert posts
    const postStmt = db.prepare("INSERT INTO posts (date, image_url, content) VALUES (?, ?, ?)");
    samplePosts.forEach(post => {
        postStmt.run(post.date, post.image_url, post.content);
    });
    postStmt.finalize();

    // Insert chat messages
    const chatStmt = db.prepare("INSERT INTO chat_messages (message, order_index) VALUES (?, ?)");
    sampleChatMessages.forEach((message, index) => {
        chatStmt.run(message, index);
    });
    chatStmt.finalize();

    // Insert site settings
    const settingsStmt = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
    settingsStmt.run('site_title', 'Добро пожаловать ❤️');
    settingsStmt.run('site_subtitle', 'Подарок только для тебя');
    settingsStmt.finalize();

    console.log('Sample data inserted successfully!');
    console.log(`- ${sampleSecretPosts.length} secret posts`);
    console.log(`- ${samplePosts.length} timeline posts`);
    console.log(`- ${sampleChatMessages.length} chat messages`);
    console.log('\nSecret post passwords:');
    sampleSecretPosts.forEach(post => {
        console.log(`  - "${post.title}": ${post.password}`);
    });
    console.log('\nYou can now access:');
    console.log('- Main site: http://localhost:3000');
    console.log('- Admin panel: http://localhost:3000/admin');
    console.log('- Login: admin / admin123');
});

db.close();
