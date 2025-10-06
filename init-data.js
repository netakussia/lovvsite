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
        date: "17.04.2025",
        image_url: "images/moment7-perviipodarok!!!!.jpg",
        content: "всё началось с торта в Тг — первый подарок, первое «я хочу, чтобы ей было приятно»"
    },
    {
        date: "30.04.2025",
        image_url: "images/moment1.jpg",
        content: "никто ещё не знал, а уже всё началось"
    },
    {
        date: "01.05.2025",
        image_url: "images/moment20-pikmikolya.jpg",
        content: "мы просто гуляли, просто играли с тренд… а потом всё стало не «просто»"
    },
    {
        date: "03.05.2025",
        image_url: "images/moment17-glaza.jpg",
        content: "эти глаза я помню с первого взгляда, даже когда ещё не знал, что запомню🫠"
    },
    {
        date: "03.05.2025",
        image_url: "images/moment10-vstrechata.jpg",
        content: "тогда, в 22:45, я не просто предложил встречаться… я, по сути, выбрал тебя навсегда"
    }
];

const sampleChatMessages = [
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
    settingsStmt.run('site_title', 'С 4 месяца нас, любимая ❤️');
    settingsStmt.run('site_subtitle', 'Подарок только для тебя))');
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
