// Gallery functionality
let galleryItems = [];
let currentMusicSettings = null;
let isMusicPlaying = false;

// DOM elements
const galleryContainer = document.getElementById('gallery-container');
const musicPlayer = document.getElementById('music-player');
const musicToggle = document.getElementById('music-toggle');
const musicInfo = document.getElementById('music-info');
const musicTitle = document.getElementById('music-title');
const musicPlay = document.getElementById('music-play');
const musicPrev = document.getElementById('music-prev');
const musicNext = document.getElementById('music-next');
const musicVolume = document.getElementById('music-volume');
const backgroundMusic = document.getElementById('background-music');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const fullscreenClose = document.getElementById('fullscreen-close');
const fullscreenContent = document.getElementById('fullscreen-content');

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  loadGalleryItems();
  loadMusicSettings();
  initializeNavigation();
  initializeMusicPlayer();
  initializeFullscreen();
  hidePreloader();
});

// Theme functionality
function initializeTheme() {
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', currentTheme);
  });
}

// Load gallery items from API
async function loadGalleryItems() {
  try {
    const response = await fetch('/api/gallery');
    if (response.ok) {
      galleryItems = await response.json();
      renderGallery();
    } else {
      showError('Ошибка загрузки галереи');
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    showError('Ошибка загрузки галереи');
  }
}

// Render gallery items
function renderGallery() {
  if (!galleryItems || galleryItems.length === 0) {
    galleryContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Галерея пуста</div>';
    return;
  }

  galleryContainer.innerHTML = '';
  
  galleryItems.forEach((item, index) => {
    const galleryItem = createGalleryItem(item, index);
    galleryContainer.appendChild(galleryItem);
  });
}

// Create gallery item element
function createGalleryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'gallery-item';
  itemDiv.dataset.index = index;
  
  const isVideo = item.file_type === 'video';
  const thumbnail = item.thumbnail_path || item.file_path;
  
  itemDiv.innerHTML = `
    <div class="gallery-item-content">
      <div class="gallery-media">
        ${isVideo ? `
          <video class="gallery-video" preload="metadata" poster="${thumbnail}">
            <source src="${item.file_path}" type="video/mp4">
            Ваш браузер не поддерживает видео.
          </video>
          <div class="play-overlay">▶️</div>
        ` : `
          <img class="gallery-image" src="${item.file_path}" alt="${item.title}" loading="lazy">
        `}
      </div>
      <div class="gallery-info">
        <h3 class="gallery-title">${item.title}</h3>
        ${item.description ? `<p class="gallery-description">${item.description}</p>` : ''}
      </div>
    </div>
  `;
  
  // Add click handler for fullscreen
  itemDiv.addEventListener('click', () => openFullscreen(item, index));
  
  return itemDiv;
}

// Load music settings
async function loadMusicSettings() {
  try {
    const response = await fetch('/api/music/gallery');
    if (response.ok) {
      currentMusicSettings = await response.json();
      if (currentMusicSettings && currentMusicSettings.music_file) {
        backgroundMusic.src = currentMusicSettings.music_file;
        backgroundMusic.volume = currentMusicSettings.volume || 0.5;
        musicVolume.value = currentMusicSettings.volume || 0.5;
        musicTitle.textContent = currentMusicSettings.music_file.split('/').pop();
      }
    }
  } catch (error) {
    console.error('Error loading music settings:', error);
  }
}

// Initialize music player
function initializeMusicPlayer() {
  if (!currentMusicSettings || !currentMusicSettings.music_file) {
    musicPlayer.style.display = 'none';
    return;
  }

  musicToggle.addEventListener('click', toggleMusic);
  musicPlay.addEventListener('click', toggleMusic);
  musicVolume.addEventListener('input', (e) => {
    backgroundMusic.volume = e.target.value;
  });

  backgroundMusic.addEventListener('loadeddata', () => {
    musicTitle.textContent = currentMusicSettings.music_file.split('/').pop();
  });

  backgroundMusic.addEventListener('play', () => {
    musicPlay.textContent = '⏸️';
    isMusicPlaying = true;
  });

  backgroundMusic.addEventListener('pause', () => {
    musicPlay.textContent = '▶️';
    isMusicPlaying = false;
  });
}

// Toggle music
function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play().catch(e => console.log('Autoplay prevented:', e));
  }
}

// Initialize fullscreen functionality
function initializeFullscreen() {
  fullscreenClose.addEventListener('click', closeFullscreen);
  fullscreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlay) {
      closeFullscreen();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenOverlay.style.display !== 'none') {
      closeFullscreen();
    }
  });
}

// Open fullscreen view
function openFullscreen(item, index) {
  const isVideo = item.file_type === 'video';
  
  fullscreenContent.innerHTML = `
    <div class="fullscreen-item">
      ${isVideo ? `
        <video class="fullscreen-video" controls autoplay>
          <source src="${item.file_path}" type="video/mp4">
        </video>
      ` : `
        <img class="fullscreen-image" src="${item.file_path}" alt="${item.title}">
      `}
      <div class="fullscreen-info">
        <h2 class="fullscreen-title">${item.title}</h2>
        ${item.description ? `<p class="fullscreen-description">${item.description}</p>` : ''}
      </div>
    </div>
  `;
  
  fullscreenOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Close fullscreen view
function closeFullscreen() {
  fullscreenOverlay.style.display = 'none';
  document.body.style.overflow = '';
  
  // Pause any playing video
  const video = fullscreenContent.querySelector('video');
  if (video) {
    video.pause();
  }
}

// Initialize navigation
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
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navMenu.classList.remove('show');
    }
  });
}

// Show error message
function showError(message) {
  galleryContainer.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #dc3545;">
      <h3>⚠️ Ошибка</h3>
      <p>${message}</p>
    </div>
  `;
}

// Hide preloader
function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 1000);
  }
}

// Initialize navigation (alias for consistency)
function initializeNavigation() {
  initNavigation();
}
