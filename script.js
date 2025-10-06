const canvas = document.getElementById("hearts-canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

const hearts = []
const colors = ["#ffc0cb", "#ffb6c1", "#ff69b4", "#ff4d6d", "#c94fcf", "#ffccd5"]

function createHeart() {
  const size = Math.random() * 20 + 10
  hearts.push({
    x: Math.random() * canvas.width,
    y: canvas.height + size,
    size,
    speed: Math.random() * 1 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.5 + 0.5
  })
}

function drawHeart(h) {
  ctx.globalAlpha = h.opacity
  ctx.beginPath()
  const topCurveHeight = h.size * 0.3
  ctx.moveTo(h.x, h.y)
  ctx.bezierCurveTo(h.x - h.size / 2, h.y - topCurveHeight,
                    h.x - h.size, h.y + h.size / 2,
                    h.x, h.y + h.size)
  ctx.bezierCurveTo(h.x + h.size, h.y + h.size / 2,
                    h.x + h.size / 2, h.y - topCurveHeight,
                    h.x, h.y)
  ctx.fillStyle = h.color
  ctx.fill()
  ctx.globalAlpha = 1
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < hearts.length; i++) {
    const h = hearts[i]
    h.y -= h.speed
    drawHeart(h)
  }
  while (hearts.length < 30) createHeart()
  requestAnimationFrame(animate)
}

animate()










const loaderText = document.getElementById("loaderText")
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
]

let index = 0

const changeText = () => {
  loaderText.textContent = phrases[index]
  index = (index + 1) % phrases.length
}

const preloader = document.getElementById("preloader")

// Меняем текст каждые 1.5 секунды
const interval = setInterval(changeText, 300)

// Функция для скрытия preloader
function hidePreloader() {
  if (preloader && preloader.style.display !== 'none') {
    preloader.style.opacity = "0"
    setTimeout(() => {
      preloader.style.display = "none"
      clearInterval(interval)
    }, 500)
  }
}

// Прячем прелоадер через 5.5 секунд (автоматически)
window.addEventListener("load", () => {
  setTimeout(() => {
    hidePreloader()
  }, 5000)
})

// Пропуск preloader по нажатию любой клавиши
document.addEventListener('keydown', (e) => {
  hidePreloader()
})

// Пропуск preloader по клику мыши
document.addEventListener('click', (e) => {
  // Проверяем, что клик не по кнопке темы или навигации
  if (!e.target.closest('#theme-toggle') && !e.target.closest('#hidden-nav')) {
    hidePreloader()
  }
})

// Пропуск preloader по клику на подсказку
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('skip-hint')) {
    hidePreloader()
  }
})




function updateDayCounter() {
  const counter = document.getElementById("dayCounter");
  // Укажи дату начала (год, месяц-1, день)
  const startDate = new Date(2025, 4, 3); // 16 июня 2024 (месяцы с нуля!)
  const now = new Date();
  // Считаем разницу в днях
  const diffTime = now - startDate;
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 чтобы включить первый день
  counter.textContent = `${days} ${pluralizeDays(days)}`;
}

function pluralizeDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "день"
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня"
  return "дней"
}

updateDayCounter()








const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.getElementById("typing-indicator");

let messages = [
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

// Функция показа индикатора новых сообщений
function showNewMessageIndicator() {
  const indicator = document.getElementById('new-message-indicator');
  if (indicator) {
    indicator.classList.add('show');
    // Скрыть через 3 секунды
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 3000);
  }
}

// Функция показа кнопки "Назад к началу"
function showBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }
}

// Функция показа sticky навигации
function showStickyNav() {
  const stickyNav = document.getElementById('sticky-nav');
  if (stickyNav) {
    if (window.scrollY > 200) {
      stickyNav.classList.add('show');
    } else {
      stickyNav.classList.remove('show');
    }
  }
}

// Функция анимации элементов при скролле
function revealOnScroll() {
  const elements = document.querySelectorAll('.scroll-reveal');
  const windowHeight = window.innerHeight;
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('revealed');
    }
  });
}

// Функция для добавления анимаций к элементам
function addAnimations() {
  // Добавляем классы анимации к секциям
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.classList.add('scroll-reveal');
    // Добавляем задержку для каждой секции
    section.style.transitionDelay = `${index * 0.1}s`;
  });
  
  // Добавляем hover эффекты к карточкам
  const cards = document.querySelectorAll('.card, .message-content, .secret-post-card');
  cards.forEach(card => {
    card.classList.add('hover-lift', 'smooth-transition');
  });
  
  // Добавляем анимации к кнопкам
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.classList.add('smooth-transition');
  });
}

// Load chat messages from API
async function loadChatMessages() {
  try {
    const response = await fetch('/api/chat-messages');
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
    const response = await fetch('/api/posts');
    const posts = await response.json();
    
    const container = document.getElementById('timeline-container');
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
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Ошибка загрузки воспоминаний</div>';
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
    
    showNewMessageIndicator();
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
  if (isInViewport(chatSection)) {
    startChat();
  }
});



// Timeline observer is now initialized in loadTimelinePosts()











function toggleGift() {
  const gift = document.querySelector('.gift-wrapper')
  const popup = document.getElementById('giftPopup')

  if (gift.classList.contains('open')) {
    gift.classList.remove('open')
    popup.classList.add('hidden')
  } else {
    gift.classList.add('open')
    popup.classList.remove('hidden')
  }
}



const giftBtn = document.getElementById('gift-open-btn');
const passwordContainer = document.getElementById('password-container');
const submitPasswordBtn = document.getElementById('submit-password');
const giftPasswordInput = document.getElementById('gift-password');
const errorMessage = document.getElementById('error-message');
const giftMessage = document.getElementById('gift-message');
const confettiCanvas = document.getElementById('confetti-canvas');

const correctPassword = 'сучка'; // Твой пароль
let confettiStarted = false;

giftBtn.addEventListener('click', () => {
  giftBtn.style.display = 'none';
  passwordContainer.style.display = 'block';
  giftPasswordInput.focus();
});

submitPasswordBtn.addEventListener('click', () => {
  const entered = giftPasswordInput.value.trim();

  if (entered === correctPassword) {
    errorMessage.style.display = 'none';
    passwordContainer.style.display = 'none';
    showGiftMessage();
  } else {
    errorMessage.textContent = 'Не те букавки солнышко, попробуй ещё☺️';
    errorMessage.style.display = 'block';
    shake(passwordContainer);
  }
});

function shake(element) {
  element.style.animation = 'shake 0.4s';
  element.addEventListener('animationend', () => {
    element.style.animation = '';
  }, { once: true });
}

function showGiftMessage() {
  giftMessage.style.display = 'block';
  if (!confettiStarted) {
    confettiStarted = true;
    startConfetti();
  }
}

function startConfetti() {
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
      decay: Math.random() * 0.005 + 0.002,  // скорость затухания
    });
  }

  let animationFrameId;
  let confettiTime = 0;
  const maxConfettiTime = 8000; // показывать конфети 8 секунд

  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiTime += 16;

    confettiPieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        // перезапускаем сверху
        p.x = Math.random() * confettiCanvas.width;
        p.y = 0;
        p.opacity = 1;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      // вместо квадратика сделаем стильный ромб
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
    }, 300); // Оптимальное время для плавности

    circle.addEventListener('animationend', () => {
      circle.remove();
      // Восстанавливаем возможность клика
      setTimeout(() => {
        themeToggle.style.pointerEvents = 'auto';
      }, 100);
    });
  });
});

// --- Только для мобильных: раскрытие миниатюр timeline по тапу на картинку ---
if (window.innerWidth <= 700) {
  document.querySelectorAll('.moment-popup-img-wrap').forEach(imgWrap => {
    imgWrap.addEventListener('click', function (e) {
      e.stopPropagation();
      const item = imgWrap.closest('.timeline-item');
      // Закрыть все остальные
      document.querySelectorAll('.timeline-item.open').forEach(opened => {
        if (opened !== item) opened.classList.remove('open');
      });
      // Переключить текущую
      item.classList.toggle('open');
    });
  });
  // Если клик вне timeline — всё свернуть
  document.body.addEventListener('click', function (e) {
    if (!e.target.closest('.timeline-item')) {
      document.querySelectorAll('.timeline-item.open').forEach(opened => {
        opened.classList.remove('open');
      });
    }
  });
}

// --- Мобильный полноэкранный просмотр фото timeline ---
if (window.innerWidth <= 700) {
  document.querySelectorAll('.moment-popup-img-wrap img').forEach(img => {
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      // Создать оверлей
      const overlay = document.createElement('div');
      overlay.className = 'timeline-photo-fullscreen';
      // Клонируем картинку
      const bigImg = document.createElement('img');
      bigImg.src = img.src;
      bigImg.alt = img.alt || '';
      overlay.appendChild(bigImg);
      // Кнопка закрытия
      const closeBtn = document.createElement('button');
      closeBtn.className = 'timeline-photo-fullscreen-close';
      closeBtn.innerHTML = '✕';
      overlay.appendChild(closeBtn);

      // Закрытие по кнопке или по клику на фон
      function closeOverlay() {
        overlay.remove();
        document.body.style.overflow = '';
      }
      closeBtn.addEventListener('click', closeOverlay);
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay) closeOverlay();
      });
      // Отключаем скролл body
      document.body.style.overflow = 'hidden';
      document.body.appendChild(overlay);
    });
  });
}

// --- Предложение: "Да" и убегающая "Нет" ---
document.addEventListener("DOMContentLoaded", () => {
  // Proposal logic
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const ringImg = document.getElementById('ring-img');
  const msgAbove = document.getElementById('gift-message-above');
  const giftPopup = document.getElementById('giftPopup');
  const proposalBtns = document.querySelector('.proposal-buttons');

  // "Да" — показать надпись и кольцо
  if (yesBtn && ringImg && msgAbove) {
    yesBtn.addEventListener('click', function (e) {
      e.preventDefault();
      msgAbove.textContent = "Официально — ты моя жена в душе 💍";
      msgAbove.classList.add('active');
      ringImg.classList.add('active');
      
      // Добавляем эффект успеха
      yesBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
      yesBtn.textContent = 'Да! Я согласна! 💍';
      yesBtn.style.transform = 'scale(1.1)';
      
      // Запускаем конфетти
      if (!confettiStarted) {
        confettiStarted = true;
        startConfetti();
      }
    });
  }
});

// AUTONOMOUS TEMPORARY MESSAGES SYSTEM
let allMessages = []; // Cache all messages locally
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
    const response = await fetch('/api/temporary-messages');
    if (!response.ok) {
      console.log('Failed to fetch messages, using cache');
      return;
    }
    
    allMessages = await response.json();
    lastFetchTime = now;
    console.log('Loaded', allMessages.length, 'messages from server');
    
    // Start local processing
    processMessagesLocally();
    
  } catch (error) {
    console.log('Error fetching messages:', error);
    // Continue with cached messages if available
    if (allMessages.length > 0) {
      processMessagesLocally();
    }
  }
}

// Process messages locally without server calls
function processMessagesLocally() {
  const now = new Date();
  let activeMessage = null;
  let nextMessage = null;
  
  // Find active message
  for (const msg of allMessages) {
    if (!msg.is_active) continue;
    
    const startTime = new Date(msg.show_from);
    const endTime = new Date(startTime.getTime() + (msg.duration_hours * 60 * 60 * 1000));
    
    if (startTime <= now && endTime > now) {
      activeMessage = { ...msg, show_until: endTime.toISOString() };
      break;
    }
  }
  
  // Find next message if no active
  if (!activeMessage) {
    for (const msg of allMessages) {
      if (!msg.is_active) continue;
      
      const startTime = new Date(msg.show_from);
      if (startTime > now) {
        nextMessage = msg;
        break;
      }
    }
  }
  
  // Clear existing timers
  if (statusTimer) {
    clearInterval(statusTimer);
    statusTimer = null;
  }
  
  // Show appropriate state
  if (activeMessage) {
    showActiveMessage(activeMessage);
  } else if (nextMessage) {
    showWaitingForMessage(nextMessage);
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
      // Message expired, process locally
      console.log('Message expired, processing locally...');
      processMessagesLocally();
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
      // Time reached, process locally
      console.log('Message time reached, processing locally...');
      processMessagesLocally();
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
    const response = await fetch('/api/settings');
    
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
    const response = await fetch('/api/music/main');
    const musicSettings = await response.json();
    
    if (musicSettings && musicSettings.music_file) {
      const audio = document.getElementById('background-music');
      if (audio) {
        audio.src = musicSettings.music_file;
        audio.volume = musicSettings.volume || 0.3;
        audio.loop = musicSettings.loop === 1;
        
        // Update music player UI
        const musicTitle = document.getElementById('music-title');
        if (musicTitle) {
          musicTitle.textContent = musicSettings.music_file.split('/').pop();
        }
        
        const musicVolume = document.getElementById('music-volume');
        if (musicVolume) {
          musicVolume.value = musicSettings.volume || 0.3;
        }
      }
    }
  } catch (error) {
    console.log('Using default music settings');
  }
}

// OLD CODE REMOVED - REPLACED WITH SIMPLE SYSTEM ABOVE
let cachedNextMessage = null;
let cachedNextMessageTime = 0;
const NEXT_MESSAGE_CACHE_TIME = 60000; // 1 minute cache

// Debounce mechanism to prevent too frequent reloads
let lastLoadTime = 0;
const MIN_LOAD_INTERVAL = 5000; // Minimum 5 seconds between loads

// Load temporary messages
async function loadTemporaryMessages(forceReload = false) {
  const now = Date.now();
  
  // Prevent too frequent reloads, but allow forced reloads for critical updates
  if (!forceReload && now - lastLoadTime < MIN_LOAD_INTERVAL) {
    console.log('Skipping load - too soon since last load');
    return;
  }
  
  lastLoadTime = now;
  try {
    console.log('Loading temporary messages...');
    
    // Check for active messages
    const activeResponse = await fetch('/api/temporary-messages/active');
    
    if (!activeResponse.ok) {
      console.log('Rate limited, using cached state');
      showNoMessagesState();
      return;
    }
    
    const activeMessages = await activeResponse.json();
    console.log('Active messages:', activeMessages);
    
    if (activeMessages && activeMessages.length > 0) {
      // Show the first active message
      const message = activeMessages[0];
      console.log('Showing active message:', message);
      showActiveTemporaryMessage(message);
    } else {
      // Only check for next message occasionally or when explicitly needed
      console.log('No active messages, showing countdown to next message');
      loadNextMessageOnce();
    }
  } catch (error) {
    console.log('Error loading temporary messages:', error);
    showNoMessagesState();
  }
}

// Load next message once and cache it
async function loadNextMessageOnce() {
  const now = Date.now();
  
  // Use cached data if still fresh
  if (cachedNextMessage && (now - cachedNextMessageTime) < NEXT_MESSAGE_CACHE_TIME) {
    console.log('Using cached next message');
    showCountdownToNextMessage(cachedNextMessage);
    return;
  }
  
  try {
    console.log('Loading next message from API...');
    const nextResponse = await fetch('/api/temporary-messages/next');
    
    if (!nextResponse.ok) {
      console.log('Rate limited, showing no messages state');
      showNoMessagesState();
      return;
    }
    
    const nextMessage = await nextResponse.json();
    console.log('Next message loaded:', nextMessage);
    
    if (nextMessage) {
      // Cache the message
      cachedNextMessage = nextMessage;
      cachedNextMessageTime = now;
      showCountdownToNextMessage(nextMessage);
    } else {
      showNoMessagesState();
    }
  } catch (error) {
    console.log('Error loading next message:', error);
    showNoMessagesState();
  }
}

// Show active temporary message
function showActiveTemporaryMessage(message) {
  console.log('showActiveTemporaryMessage called with:', message);
  
  const title = document.getElementById('temporary-message-title');
  const text = document.getElementById('temporary-message-text');
  const timer = document.getElementById('temporary-message-timer');
  
  if (!title || !text || !timer) {
    console.log('Some elements not found, returning');
    return;
  }
  
  // Set message content
  title.textContent = message.title;
  text.textContent = message.content;
  
  // Start countdown timer for message expiration
  const showFrom = new Date(message.show_from);
  const showUntil = new Date(showFrom.getTime() + (message.duration_hours * 60 * 60 * 1000));
  
  const updateTimer = () => {
    const now = new Date();
    const timeLeft = showUntil - now;
    
    if (timeLeft <= 0) {
      // Message expired, reload once to check for next message
      console.log('Message expired, reloading...');
      clearInterval(timerInterval);
      loadTemporaryMessages(true); // Force reload since message expired
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
  
  // Update timer immediately and then every second
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  
  // Auto-reload when time expires (fallback)
  setTimeout(() => {
    clearInterval(timerInterval);
    loadTemporaryMessagesStatus();
  }, showUntil - new Date());
}

// Show countdown to next message
function showCountdownToNextMessage(nextMessage) {
  console.log('showCountdownToNextMessage called with:', nextMessage);
  
  const title = document.getElementById('temporary-message-title');
  const text = document.getElementById('temporary-message-text');
  const timer = document.getElementById('temporary-message-timer');
  
  if (!title || !text || !timer) {
    console.log('Some elements not found, returning');
    return;
  }
  
  // Set countdown content
  title.textContent = 'Следующее сообщение';
  text.textContent = `"${nextMessage.title}" появится в указанное время`;
  
  // Start countdown timer to next message
  const showFrom = new Date(nextMessage.show_from);
  const timeToNext = showFrom - new Date();
  
  // If message is supposed to show now or in the past, reload
  if (timeToNext <= 0) {
    console.log('Message time already reached, reloading...');
    loadTemporaryMessages(true); // Force reload since message time has come
    return;
  }

  // Only set up timer if we have enough time (more than 1 second)
  if (timeToNext > 1000) {
    let timerInterval = setInterval(() => {
      const now = new Date();
      const timeLeft = showFrom - now;
      
      if (timeLeft <= 0) {
        console.log('Time reached, reloading...');
        clearInterval(timerInterval);
        loadTemporaryMessages(true); // Force reload since timer expired
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
    }, 1000);
    
    // Initial update
    const days = Math.floor(timeToNext / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeToNext % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeToNext % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeToNext % (1000 * 60)) / 1000);
    
    if (days > 0) {
      timer.textContent = `Появится через: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
    } else if (hours > 0) {
      timer.textContent = `Появится через: ${hours}ч ${minutes}м ${seconds}с`;
    } else {
      timer.textContent = `Появится через: ${minutes}м ${seconds}с`;
    }
  }
}

// Show no messages state
function showNoMessagesState() {
  console.log('showNoMessagesState called');
  
  const title = document.getElementById('temporary-message-title');
  const text = document.getElementById('temporary-message-text');
  const timer = document.getElementById('temporary-message-timer');
  
  if (!title || !text || !timer) {
    console.log('Some elements not found, returning');
    return;
  }
  
  title.textContent = 'Нет запланированных сообщений';
  text.textContent = 'Временные сообщения будут появляться здесь по расписанию';
  timer.textContent = 'Проверьте админ-панель для настройки';
}

// Hide temporary message
function hideTemporaryMessage() {
  const section = document.getElementById('temporary-message-section');
  if (section) {
    section.style.display = 'none';
  }
}

// Load site settings when page loads
loadSiteSettings();
loadMusicSettings();
loadAllMessages();

// Пасхалки для любопытных
function addEasterEggs() {
  // Сообщение в консоль
  console.log('%c🔍 Ты попал в секретку, но настоящего контента тут нет 🙃', 'color: #c94fcf; font-size: 16px; font-weight: bold;');
  console.log('%cВесь секретный контент хранится на сервере и загружается только с правильным паролем!', 'color: #666; font-size: 12px;');
  
  // Скрытый фейковый контент для тех, кто смотрит исходный код
  const fakeContent = document.getElementById('fake-secret-content');
  if (fakeContent) {
    // Показываем фейковый контент только если кто-то пытается его найти
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target;
          if (target.id === 'fake-secret-content' && target.style.display !== 'none') {
            console.log('%c🎭 Ага! Ты пытаешься подсмотреть фейковый контент!', 'color: #ff69b4; font-size: 14px; font-weight: bold;');
            console.log('%cНастоящие секреты защищены паролем и загружаются с сервера!', 'color: #666; font-size: 12px;');
          }
        }
      });
    });
    
    observer.observe(fakeContent, { attributes: true, attributeFilter: ['style'] });
  }
  
  // Дополнительные пасхалки при попытке инспектировать элементы
  document.addEventListener('keydown', (e) => {
    // F12 или Ctrl+Shift+I
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      setTimeout(() => {
        console.log('%c🕵️ О, ты открыл DevTools! Умно!', 'color: #c94fcf; font-size: 14px; font-weight: bold;');
        console.log('%cНо секреты всё равно защищены паролем на сервере 😎', 'color: #666; font-size: 12px;');
      }, 1000);
    }
  });
  
  // Пасхалка при попытке сохранить страницу
  window.addEventListener('beforeunload', () => {
    console.log('%c💾 Сохраняешь страницу? Секреты всё равно не сохранятся!', 'color: #ff69b4; font-size: 12px;');
  });
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

// Обработчики для кнопок навигации
document.addEventListener('DOMContentLoaded', function() {
  // Кнопка "Назад к началу"
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Индикатор новых сообщений
  const newMessageIndicator = document.getElementById('new-message-indicator');
  if (newMessageIndicator) {
    newMessageIndicator.addEventListener('click', () => {
      const chatSection = document.getElementById('chat-section');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
        newMessageIndicator.classList.remove('show');
      }
    });
  }

  // Отслеживание прокрутки для кнопки "Назад к началу" и sticky навигации
  window.addEventListener('scroll', () => {
    showBackToTop();
    showStickyNav();
    revealOnScroll();
  });

  // Поиск по чату
  const searchInput = document.getElementById('chat-search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  
  if (searchInput && clearSearchBtn) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length > 0) {
        clearSearchBtn.classList.add('show');
        searchMessages(query);
      } else {
        clearSearchBtn.classList.remove('show');
        clearSearch();
      }
    });
    
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.remove('show');
      clearSearch();
    });
  }
});

// Функция поиска по сообщениям
function searchMessages(query) {
  const messages = document.querySelectorAll('.message');
  let foundCount = 0;
  
  messages.forEach(message => {
    const content = message.querySelector('.message-content');
    if (content) {
      const text = content.textContent.toLowerCase();
      if (text.includes(query)) {
        message.classList.add('highlight');
        foundCount++;
      } else {
        message.classList.remove('highlight');
      }
    }
  });
  
  // Показать количество найденных сообщений
  if (foundCount > 0) {
    showSearchResults(foundCount);
  }
}

// Функция очистки поиска
function clearSearch() {
  const messages = document.querySelectorAll('.message');
  messages.forEach(message => {
    message.classList.remove('highlight');
  });
  hideSearchResults();
}

// Функция показа результатов поиска
function showSearchResults(count) {
  let resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) {
    resultsDiv = document.createElement('div');
    resultsDiv.id = 'search-results';
    resultsDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #c94fcf, #ff69b4);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(196, 79, 207, 0.3);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(resultsDiv);
  }
  
  resultsDiv.textContent = `Найдено: ${count} сообщений`;
  resultsDiv.style.display = 'block';
}

// Функция скрытия результатов поиска
function hideSearchResults() {
  const resultsDiv = document.getElementById('search-results');
  if (resultsDiv) {
    resultsDiv.style.display = 'none';
  }
}

// Инициализируем анимации и пасхалки
addAnimations();
addEasterEggs();

// Secret post functionality
document.getElementById('submit-password').onclick = async function() {
  const password = document.getElementById('gift-password').value;
  const secretContent = document.getElementById('secret-content');
  const secretTitle = document.getElementById('secret-title');
  const secretMessage = document.getElementById('secret-message');
  const error = document.getElementById('error-message');
  
  // Hide all content
  secretContent.style.display = 'none';
  error.style.display = 'none';

  if (!password.trim()) {
    error.textContent = 'Введите пароль!';
    error.style.display = 'block';
    return;
  }

  try {
    // Check password and get content
    const response = await fetch('/api/secret-posts/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: password.trim() })
    });

    if (response.ok) {
      const data = await response.json();
      secretTitle.textContent = data.title;
      secretMessage.textContent = data.content;
      
      // Format date
      const secretDate = document.getElementById('secret-date');
      if (data.created_at) {
        const date = new Date(data.created_at);
        secretDate.textContent = date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      secretContent.style.display = 'block';
      
      // Clear password field
      document.getElementById('gift-password').value = '';
  } else {
      const errorData = await response.json();
      error.textContent = errorData.error || 'Неверный пароль!';
      error.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading secret post:', error);
    error.textContent = 'Ошибка загрузки секретного поста';
    error.style.display = 'block';
  }
};










