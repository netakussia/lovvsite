// Multi-tenant frontend JavaScript
// Этот файл заменяет script.js для работы с мультитенантной платформой

// Получаем siteSlug из URL
function getSiteSlug() {
    const path = window.location.pathname;
    const match = path.match(/\/site\/([^\/]+)/);
    return match ? match[1] : null;
}

// Базовый URL для API с учетом сайта
function getApiBaseUrl() {
    const siteSlug = getSiteSlug();
    return siteSlug ? `/api/site/${siteSlug}` : '/api';
}

// Canvas для сердечек
const canvas = document.getElementById("hearts-canvas");
const ctx = canvas.getContext("2d");

if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const hearts = [];
    const colors = ["#ffc0cb", "#ffb6c1", "#ff69b4", "#ff4d6d", "#c94fcf", "#ffccd5"];

    function createHeart() {
        const size = Math.random() * 20 + 10;
        hearts.push({
            x: Math.random() * canvas.width,
            y: canvas.height + size,
            size,
            speed: Math.random() * 1 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.5
        });
    }

    function drawHeart(h) {
        ctx.globalAlpha = h.opacity;
        ctx.beginPath();
        const topCurveHeight = h.size * 0.3;
        ctx.moveTo(h.x, h.y);
        ctx.bezierCurveTo(h.x - h.size / 2, h.y - topCurveHeight,
                        h.x - h.size, h.y + h.size / 2,
                        h.x, h.y + h.size);
        ctx.bezierCurveTo(h.x + h.size, h.y + h.size / 2,
                        h.x + h.size / 2, h.y - topCurveHeight,
                        h.x, h.y);
        ctx.fillStyle = h.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < hearts.length; i++) {
            const h = hearts[i];
            h.y -= h.speed;
            drawHeart(h);
        }
        while (hearts.length < 30) createHeart();
        requestAnimationFrame(animate);
    }

    animate();
}

// Preloader functionality
const loaderText = document.getElementById("loaderText");
const phrases = [
    "Загрузка любви...",
    "Связываемся с сердцем...",
    "Ожидаем поцелуй...",
    "Синхронизация воспоминаний...",
    "Подключение к любимой...",
    "Анализ обнимашек...",
    "Обновление чувств...",
    "Кэшируем нежность...",
    "Запуск бабочек в животе...",
    "Шифруем взгляды...",
    "Устанавливаем связь душ...",
    "Обнаружена любовь — соединяем...",
    "Инициализация романтики...",
    "Передаём тепло касаний...",
    "Подготовка сюрпризов...",
    "Вспоминаем первые «я тебя люблю»...",
    "Сохраняем моменты счастья..."
];

let index = 0;

const changeText = () => {
    if (loaderText) {
        loaderText.textContent = phrases[index];
        index = (index + 1) % phrases.length;
    }
};

const preloader = document.getElementById("preloader");

if (preloader && loaderText) {
    // Меняем текст каждые 300ms
    const interval = setInterval(changeText, 300);

    // Функция для скрытия preloader
    function hidePreloader() {
        if (preloader && preloader.style.display !== 'none') {
            preloader.style.opacity = "0";
            setTimeout(() => {
                preloader.style.display = "none";
                clearInterval(interval);
            }, 500);
        }
    }

    // Прячем прелоадер через 5 секунд (автоматически)
    window.addEventListener("load", () => {
        setTimeout(() => {
            hidePreloader();
        }, 5000);
    });

    // Пропуск preloader по нажатию любой клавиши
    document.addEventListener('keydown', (e) => {
        hidePreloader();
    });

    // Пропуск preloader по клику мыши
    document.addEventListener('click', (e) => {
        // Проверяем, что клик не по кнопке темы или навигации
        if (!e.target.closest('#theme-toggle') && !e.target.closest('#hidden-nav')) {
            hidePreloader();
        }
    });

    // Пропуск preloader по клику на подсказку
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('skip-hint')) {
            hidePreloader();
        }
    });
}

// Day counter functionality
function updateDayCounter() {
    const counter = document.getElementById("dayCounter");
    if (!counter) return;
    
    // Укажи дату начала (год, месяц-1, день)
    const startDate = new Date(2025, 0, 1); // 1 января 2025 (месяцы с нуля!)
    const now = new Date();
    // Считаем разницу в днях
    const diffTime = now - startDate;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 чтобы включить первый день
    counter.textContent = `${days} ${pluralizeDays(days)}`;
}

function pluralizeDays(n) {
    if (n % 10 === 1 && n % 100 !== 11) return "день";
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
    return "дней";
}

updateDayCounter();

// Chat functionality
const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.getElementById("typing-indicator");

let messages = [];

let chatStarted = false;

// Функция для создания сообщения чата с аватаркой
function createChatMessage(text, isBot = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isBot ? '💬' : '👤';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

// Функция прокрутки вниз
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Load chat messages from API
async function loadChatMessages() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/chat-messages`);
        if (response.ok) {
            const apiMessages = await response.json();
            if (apiMessages && apiMessages.length > 0) {
                messages = apiMessages.map(msg => msg.message);
                console.log('Chat messages loaded from API:', messages.length);
            }
        }
    } catch (error) {
        console.log('Using default chat messages:', error.message);
    }
}

// Load timeline posts from API
async function loadTimelinePosts() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/posts`);
        const posts = await response.json();
        
        const container = document.getElementById('timeline-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (posts && posts.length > 0) {
            posts.forEach((post, index) => {
                const timelineItem = createTimelineItem(post, index);
                container.appendChild(timelineItem);
            });
            
            // Re-initialize intersection observer for new items
            initializeTimelineObserver();
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Пока нет воспоминаний...</div>';
        }
    } catch (error) {
        console.error('Error loading timeline posts:', error);
        const container = document.getElementById('timeline-container');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Ошибка загрузки воспоминаний</div>';
        }
    }
}

// Create timeline item element
function createTimelineItem(post, index) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    // Generate alt text for image if not provided
    const altText = post.image_url ? `Воспоминание от ${post.date}` : '';
    
    timelineItem.innerHTML = `
        <div class="timeline-date">${post.date}</div>
        <div class="timeline-dot"></div>
        <div class="moment-popup">
            ${post.image_url ? `
                <div class="moment-popup-img-wrap">
                    <img src="${post.image_url}" alt="${altText}">
                </div>
            ` : ''}
            <p>${post.content}</p>
        </div>
    `;
    
    // Add click handler for fullscreen image view
    if (post.image_url) {
        const img = timelineItem.querySelector('img');
        if (img) {
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Create fullscreen overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                `;
                
                // Create image
                const fullscreenImg = document.createElement('img');
                fullscreenImg.src = img.src;
                fullscreenImg.alt = img.alt;
                fullscreenImg.style.cssText = `
                    max-width: 95vw;
                    max-height: 95vh;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                `;
                
                // Create close button
                const closeBtn = document.createElement('div');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    color: white;
                    font-size: 30px;
                    cursor: pointer;
                    background: rgba(0, 0, 0, 0.5);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                `;
                
                overlay.appendChild(fullscreenImg);
                overlay.appendChild(closeBtn);
                
                // Close function
                const closeFullscreen = () => {
                    document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                };
                
                // Event listeners
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeFullscreen();
                });
                
                overlay.addEventListener('click', closeFullscreen);
                
                // Prevent body scroll
                document.body.style.overflow = 'hidden';
                document.body.appendChild(overlay);
            });
        }
    }
    
    return timelineItem;
}

// Initialize intersection observer for timeline items
function initializeTimelineObserver() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    timelineItems.forEach(item => observer.observe(item));
}

function showTyping(message, callback) {
    if (typingIndicator) {
        typingIndicator.style.display = "flex";
    }
    
    const delay = Math.min(50 * message.length + 1000, 3000); // Максимум 3 секунды

    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.style.display = "none";
        }
        
        if (chatMessages) {
            const msg = createChatMessage(message, true);
            chatMessages.appendChild(msg);
            scrollToBottom();
        }
        
        callback();
    }, delay);
}

function startChat() {
    if (chatStarted || !messages || messages.length === 0) return;
    chatStarted = true;

    let index = 0;
    function next() {
        if (index < messages.length && chatMessages) {
            showTyping(messages[index], () => {
                index++;
                setTimeout(next, 500); // Пауза между сообщениями
            });
        }
    }
    next();
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Load content when page loads
loadChatMessages();
loadTimelinePosts();

// Initialize navigation menu
initNavigation();

document.addEventListener("scroll", () => {
    const chatSection = document.getElementById("chat-section");
    if (chatSection && isInViewport(chatSection)) {
        startChat();
    }
});

// Gift functionality
function toggleGift() {
    const gift = document.querySelector('.gift-wrapper');
    const popup = document.getElementById('giftPopup');

    if (gift && popup) {
        if (gift.classList.contains('open')) {
            gift.classList.remove('open');
            popup.classList.add('hidden');
        } else {
            gift.classList.add('open');
            popup.classList.remove('hidden');
        }
    }
}

// Secret post functionality
const giftBtn = document.getElementById('gift-open-btn');
const passwordContainer = document.getElementById('password-container');
const submitPasswordBtn = document.getElementById('submit-password');
const giftPasswordInput = document.getElementById('gift-password');
const errorMessage = document.getElementById('error-message');
const giftMessage = document.getElementById('gift-message');
const confettiCanvas = document.getElementById('confetti-canvas');

let confettiStarted = false;

if (giftBtn) {
    giftBtn.addEventListener('click', () => {
        giftBtn.style.display = 'none';
        if (passwordContainer) passwordContainer.style.display = 'block';
        if (giftPasswordInput) giftPasswordInput.focus();
    });
}

if (submitPasswordBtn) {
    submitPasswordBtn.addEventListener('click', async () => {
        const entered = giftPasswordInput ? giftPasswordInput.value.trim() : '';

        try {
            const response = await fetch(`${getApiBaseUrl()}/secret-posts/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: entered })
            });

            if (response.ok) {
                const data = await response.json();
                if (errorMessage) errorMessage.style.display = 'none';
                if (passwordContainer) passwordContainer.style.display = 'none';
                showSecretContent(data);
            } else {
                if (errorMessage) {
                    errorMessage.textContent = 'Не те букавки солнышко, попробуй ещё☺️';
                    errorMessage.style.display = 'block';
                    if (passwordContainer) shake(passwordContainer);
                }
            }
        } catch (error) {
            console.error('Error checking password:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Ошибка проверки пароля';
                errorMessage.style.display = 'block';
            }
        }
    });
}

function shake(element) {
    element.style.animation = 'shake 0.4s';
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

function showSecretContent(data) {
    const secretContent = document.getElementById('secret-content');
    const secretTitle = document.getElementById('secret-title');
    const secretMessage = document.getElementById('secret-message');
    const secretDate = document.getElementById('secret-date');

    if (secretContent && secretTitle && secretMessage) {
        secretTitle.textContent = data.title;
        secretMessage.textContent = data.content;
        
        if (secretDate && data.created_at) {
            const date = new Date(data.created_at);
            secretDate.textContent = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        secretContent.style.display = 'block';
        
        if (giftPasswordInput) giftPasswordInput.value = '';
        
        if (!confettiStarted) {
            confettiStarted = true;
            startConfetti();
        }
    }
}

function startConfetti() {
    if (!confettiCanvas) return;
    
    confettiCanvas.style.display = 'block';
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'];

    for (let i = 0; i < 50; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 10 + 5,
            speedY: Math.random() * 3 + 1.5,
            speedX: (Math.random() - 0.5) * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 6,
            opacity: 1,
            decay: Math.random() * 0.005 + 0.002,
        });
    }

    let animationFrameId;
    let confettiTime = 0;
    const maxConfettiTime = 8000;

    function draw() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiTime += 16;

        confettiPieces.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0) {
                p.x = Math.random() * confettiCanvas.width;
                p.y = 0;
                p.opacity = 1;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, 0);
            ctx.lineTo(0, p.size / 2);
            ctx.lineTo(-p.size / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        if (confettiTime < maxConfettiTime) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiCanvas.style.display = 'none';
            cancelAnimationFrame(animationFrameId);
        }
    }

    draw();
}

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Плавное появление кнопки
    themeToggle.classList.add('hide');
    setTimeout(() => {
        themeToggle.classList.remove('hide');
    }, 100);

    function setTheme(mode) {
        // Добавляем класс для анимации перехода
        document.body.classList.add('theme-transitioning');
        
        // Устанавливаем тему
        document.documentElement.setAttribute('data-theme', mode);
        themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
        
        // Убираем класс анимации после завершения перехода
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 800);
    }

    // Начальная установка темы
    let theme = localStorage.getItem('theme');
    if (theme !== 'dark' && theme !== 'light') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setTheme(theme);

    themeToggle.addEventListener('click', (e) => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        // Анимация кругового перехода
        const circle = document.createElement('div');
        circle.className = 'theme-transition-circle';
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + rect.height / 2 + window.scrollY;
        circle.style.setProperty('--theme-circle-x', `${x}px`);
        circle.style.setProperty('--theme-circle-y', `${y}px`);
        circle.style.setProperty('--theme-transition-bg', next === 'dark' ? '#2a0036' : '#ffe4f1');
        document.body.appendChild(circle);

        // Предотвращаем множественные клики
        themeToggle.style.pointerEvents = 'none';
        
        setTimeout(() => {
            setTheme(next);
            localStorage.setItem('theme', next);
        }, 300);

        circle.addEventListener('animationend', () => {
            circle.remove();
            // Восстанавливаем возможность клика
            setTimeout(() => {
                themeToggle.style.pointerEvents = 'auto';
            }, 100);
        });
    });
});

// Temporary messages system
let allMessages = [];
let currentMessage = null;
let statusTimer = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 300000; // 5 minutes between server fetches
const TIMER_UPDATE_INTERVAL = 1000; // 1 second for UI updates

// Load all messages once and work with them locally
async function loadAllMessages() {
    const now = Date.now();
    
    // Only fetch from server every 5 minutes
    if (now - lastFetchTime < FETCH_INTERVAL) {
        console.log('Using cached messages, server fetch not needed');
        return;
    }
    
    try {
        console.log('Fetching messages from server...');
        const response = await fetch(`${getApiBaseUrl()}/temporary-messages/status`);
        if (!response.ok) {
            console.log('Failed to fetch messages, using cache');
            return;
        }
        
        const data = await response.json();
        lastFetchTime = now;
        console.log('Loaded messages from server');
        
        // Process the response
        processTemporaryMessages(data);
        
    } catch (error) {
        console.log('Error fetching messages:', error);
        // Continue with cached messages if available
        if (allMessages.length > 0) {
            processTemporaryMessages({ active: null, next: null, status: 'none' });
        }
    }
}

// Process temporary messages
function processTemporaryMessages(data) {
    // Clear existing timers
    if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
    }
    
    // Show appropriate state
    if (data.active) {
        showActiveMessage(data.active);
    } else if (data.next) {
        showWaitingForMessage(data.next);
    } else {
        showNoMessagesState();
    }
}

// Show active message with countdown
function showActiveMessage(message) {
    console.log('Showing active message:', message.title);
    
    const title = document.getElementById('temporary-message-title');
    const text = document.getElementById('temporary-message-text');
    const timer = document.getElementById('temporary-message-timer');
    
    if (!title || !text || !timer) return;
    
    title.textContent = message.title;
    text.textContent = message.content;
    
    const endTime = new Date(message.show_until);
    
    const updateTimer = () => {
        const now = new Date();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            // Message expired, reload
            console.log('Message expired, reloading...');
            loadAllMessages();
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            timer.textContent = `Исчезнет через: ${hours}ч ${minutes}м ${seconds}с`;
        } else {
            timer.textContent = `Исчезнет через: ${minutes}м ${seconds}с`;
        }
    };
    
    updateTimer();
    statusTimer = setInterval(updateTimer, TIMER_UPDATE_INTERVAL);
}

// Show countdown to next message
function showWaitingForMessage(nextMessage) {
    console.log('Showing countdown to:', nextMessage.title);
    
    const title = document.getElementById('temporary-message-title');
    const text = document.getElementById('temporary-message-text');
    const timer = document.getElementById('temporary-message-timer');
    
    if (!title || !text || !timer) return;
    
    title.textContent = 'Следующее сообщение';
    text.textContent = `"${nextMessage.title}" появится в указанное время`;
    
    const startTime = new Date(nextMessage.show_from);
    
    const updateTimer = () => {
        const now = new Date();
        const timeLeft = startTime - now;
        
        if (timeLeft <= 0) {
            // Time reached, reload
            console.log('Message time reached, reloading...');
            loadAllMessages();
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (days > 0) {
            timer.textContent = `Появится через: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
        } else if (hours > 0) {
            timer.textContent = `Появится через: ${hours}ч ${minutes}м ${seconds}с`;
        } else {
            timer.textContent = `Появится через: ${minutes}м ${seconds}с`;
        }
    };
    
    updateTimer();
    statusTimer = setInterval(updateTimer, TIMER_UPDATE_INTERVAL);
}

// Show no messages state
function showNoMessagesState() {
    console.log('No messages to show');
    
    const title = document.getElementById('temporary-message-title');
    const text = document.getElementById('temporary-message-text');
    const timer = document.getElementById('temporary-message-timer');
    
    if (!title || !text || !timer) return;
    
    title.textContent = 'Нет запланированных сообщений';
    text.textContent = 'Временные сообщения будут появляться здесь по расписанию';
    timer.textContent = 'Проверьте админ-панель для настройки';
}

// Load site settings
async function loadSiteSettings() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/settings`);
        
        if (!response.ok) {
            console.log('Rate limited, using default site settings');
            return;
        }
        
        const settings = await response.json();
        
        // Update site title and subtitle
        const titleElement = document.querySelector('#hero h1');
        const subtitleElement = document.querySelector('#hero p');
        
        if (titleElement && settings.site_title) {
            titleElement.textContent = settings.site_title;
        }
        if (subtitleElement && settings.site_subtitle) {
            subtitleElement.textContent = settings.site_subtitle;
        }
    } catch (error) {
        console.log('Using default site settings');
    }
}

// Load music settings
async function loadMusicSettings() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/music/main`);
        const musicSettings = await response.json();
        
        if (musicSettings && musicSettings.music_file) {
            const audio = document.getElementById('bg-music');
            if (audio) {
                audio.src = musicSettings.music_file;
                audio.volume = musicSettings.volume || 0.3;
                audio.loop = musicSettings.loop === 1;
            }
        }
    } catch (error) {
        console.log('Using default music settings');
    }
}

// Navigation menu functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navToggle || !navMenu) return;
    
    // Toggle menu visibility
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Close menu
                navMenu.classList.remove('show');
                
                // Smooth scroll
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('show');
        }
    });
}

// Load site settings and temporary messages when page loads
loadSiteSettings();
loadMusicSettings();
loadAllMessages();

// Make toggleGift global for onclick handlers
window.toggleGift = toggleGift;
