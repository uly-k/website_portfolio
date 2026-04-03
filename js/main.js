import ScrollController from './modules/ScrollController.js';

const scrollContainer = document.querySelector('.scroll-container');

new ScrollController(scrollContainer);


class SmartBrushTrail {
  constructor(options = {}) {
    this.options = {
      size: options.size || 28,
      minSize: options.minSize || 3,
      fadeDuration: options.fadeDuration || 2500,
      color: options.color || 'rgba(0, 0, 0, 0.5)',
      blur: options.blur || 4,
      minSpacing: options.minSpacing || 2,    // минимальное расстояние между точками
      maxSpacing: options.maxSpacing || 12,   // максимальное расстояние
      ...options
    };
    
    this.lastX = null;
    this.lastY = null;
    this.lastTime = null;
    this.init();
  }
  
  init() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99999;
      overflow: hidden;
    `;
    document.body.appendChild(this.container);
    
    document.body.style.cursor = 'crosshair';
    this.addStyles();
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseleave', () => {
      this.lastX = null;
      this.lastY = null;
    });
  }
  
  addStyles() {
    if (document.querySelector('#smart-brush-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'smart-brush-styles';
    style.textContent = `
      @keyframes smartFade {
        0% {
          opacity: 0.7;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(0.1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  onMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    const now = Date.now();
    
    if (this.lastX !== null && this.lastY !== null) {
      const distance = Math.hypot(x - this.lastX, y - this.lastY);
      const timeDiff = now - (this.lastTime || now);
      const speed = distance / timeDiff;
      
      // Чем выше скорость, тем меньше расстояние между точками (плотнее)
      let spacing;
      if (speed > 1.5) {
        spacing = this.options.minSpacing;  // очень быстро - очень плотно
      } else if (speed > 0.8) {
        spacing = this.options.minSpacing + 2; // быстро - плотно
      } else {
        spacing = this.options.maxSpacing;  // медленно - редкие точки
      }
      
      // Вычисляем количество промежуточных точек для плавной линии
      const steps = Math.ceil(distance / spacing);
      
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const stepX = this.lastX + (x - this.lastX) * t;
        const stepY = this.lastY + (y - this.lastY) * t;
        this.addDot(stepX, stepY, speed);
      }
    } else {
      this.addDot(x, y, 0);
    }
    
    this.lastX = x;
    this.lastY = y;
    this.lastTime = now;
  }
  
  addDot(x, y, speed = 0) {
    const dot = document.createElement('div');
    
    // Размер зависит от скорости (быстрее = больше точек, но они меньше)
    let size = this.options.size;
    if (speed > 1.2) {
      size = this.options.size * 0.7;  // быстрая линия - точки поменьше
    } else if (speed > 0.6) {
      size = this.options.size * 0.85;
    }
    
    const sizeVar = size * (0.8 + Math.random() * 0.4);
    
    dot.style.cssText = `
      position: absolute;
      left: ${x - sizeVar/2}px;
      top: ${y - sizeVar/2}px;
      width: ${sizeVar}px;
      height: ${sizeVar}px;
      background: radial-gradient(circle, 
        ${this.options.color} 0%, 
        ${this.options.color} 40%, 
        transparent 100%);
      border-radius: 50%;
      filter: blur(${this.options.blur}px);
      pointer-events: none;
      animation: smartFade ${this.options.fadeDuration}ms forwards ease-out;
    `;
    
    this.container.appendChild(dot);
    
    setTimeout(() => {
      if (dot.parentNode) dot.remove();
    }, this.options.fadeDuration);
  }
}

// Использование
const brush = new SmartBrushTrail({
  size: 10,
  minSize: 1,
  fadeDuration: 3500,
  color: 'rgb(255, 0, 0)',
  blur: 4,
  minSpacing: 3,    // при быстром движении точки через 3px
  maxSpacing: 5     // при медленном через 10px
});




// showButtonOnScroll.js


const button = document.getElementById('pr');

// Изначально класс не нужен, кнопка прозрачная через CSS

scrollContainer.addEventListener('scroll', () => {
  const scrollRight = scrollContainer.scrollLeft + scrollContainer.clientWidth;
  if (scrollRight >= scrollContainer.scrollWidth - 1) {
    button.classList.add('visible');   // добавляем класс для плавного появления
  } else {
    button.classList.remove('visible'); // скрываем плавно
  }
});

// ========================================
// MOBILE ADAPTATION SCRIPT (UPDATED)
// С ГОРИЗОНТАЛЬНОЙ ПРОКРУТКОЙ ДЛЯ ИЗОБРАЖЕНИЙ
// ========================================

(function() {
  const isMobile = () => window.innerWidth <= 768;
  
  // Определяем тип изображения и добавляем соответствующие классы
  function classifyAndFixImage(img) {
    if (!isMobile()) return;
    
    // Ждем загрузки изображения
    if (!img.complete) {
      img.addEventListener('load', () => classifyAndFixImage(img));
      return;
    }
    
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const container = img.parentElement;
    
    // Определяем тип изображения
    if (height > width) {
      // Вертикальное изображение
      img.classList.add('vertical-image');
      img.setAttribute('data-vertical', 'true');
      
      if (container && container.classList.contains('cardpro')) {
        container.style.display = 'flex';
        container.style.alignItems = 'flex-start';
        container.style.justifyContent = 'flex-start';
      }
    } 
    else if (width > height * 1.5) {
      // Широкое/панорамное изображение (ширина больше высоты в 1.5+ раза)
      img.classList.add('horizontal-image');
    }
    
    // Проверяем, нужно ли изображению скроллить
    checkIfNeedsScroll(img);
  }
  
  // Проверяем, помещается ли изображение в контейнер
  function checkIfNeedsScroll(img) {
    const container = img.parentElement;
    if (!container || !isMobile()) return;
    
    // Небольшая задержка, чтобы изображение отрендерилось
    setTimeout(() => {
      const containerWidth = container.clientWidth;
      const imgWidth = img.offsetWidth;
      
      // Если ширина изображения больше ширины контейнера
      if (imgWidth > containerWidth + 5) { // +5 на погрешность
        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        
        // Добавляем индикатор скролла (уже есть в CSS)
        container.classList.add('has-scroll');
      }
    }, 100);
  }
  
  // Обработка всех изображений на странице
  function processAllImages() {
    if (!isMobile()) return;
    
    // Все изображения в карточках проектов
    const images = document.querySelectorAll('.cardpro img, .col--four img, .col--vid img, .col--vidlap img');
    
    images.forEach(img => {
      // Убираем абсолютное позиционирование
      img.style.position = 'relative';
      img.style.top = 'auto';
      img.style.left = 'auto';
      img.style.transform = 'none';
      
      classifyAndFixImage(img);
    });
  }
  
  // Следим за скроллом контейнеров, чтобы убирать подсказку
  function setupScrollIndicators() {
    if (!isMobile()) return;
    
    const containers = document.querySelectorAll('.cardpro');
    
    containers.forEach(container => {
      container.addEventListener('scroll', function() {
        this.classList.add('scrolled');
      });
      
      // Проверяем, можно ли вообще скроллить
      setTimeout(() => {
        if (container.scrollWidth <= container.clientWidth) {
          // Убираем подсказку, если скролл не нужен
          container.classList.add('scrolled');
        }
      }, 100);
    });
  }
  
  // Корректировка порядка в карточках на главной
  function fixCardOrder() {
    if (!isMobile()) return;
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const img = card.querySelector('img');
      const text = card.querySelector('p');
      
      if (img && text && card.children[0] !== text) {
        card.insertBefore(text, img);
      }
    });
  }
  
  // Настройка скролла для парных изображений
  function fixPairedImages() {
    if (!isMobile()) return;
    
    const pairedSections = document.querySelectorAll('.col--one, .col--5');
    pairedSections.forEach(section => {
      const cards = section.querySelectorAll('.cardpro');
      cards.forEach(card => {
        card.style.marginBottom = '16px';
      });
    });
  }
  
  // Отключаем горизонтальный скролл у body
  function fixBodyScroll() {
    if (isMobile()) {
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
      
      const scrollContainer = document.querySelector('.scroll-container');
      if (scrollContainer) {
        scrollContainer.style.overflowX = 'hidden';
        scrollContainer.style.overflowY = 'auto';
      }
    }
  }
  
  // Исправляем кнопку "к другим проектам"
  function fixBackButton() {
    if (isMobile()) {
      const backButton = document.getElementById('pr');
      if (backButton) {
        backButton.style.opacity = '1';
        backButton.style.pointerEvents = 'auto';
        backButton.classList.add('visible');
      }
    }
  }
  
  // Отключаем след курсора
  function disableCursorTrail() {
    if (isMobile()) {
      const trails = document.querySelectorAll('div[style*="position: fixed"]');
      trails.forEach(trail => {
        if (trail.style.pointerEvents === 'none') {
          trail.style.display = 'none';
        }
      });
    }
  }
  
  // Обновляем все при изменении размера/повороте экрана
  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMobile()) {
        processAllImages();
        setupScrollIndicators();
        fixPairedImages();
      } else {
        // При выходе из мобильного режима возвращаем стили
        const containers = document.querySelectorAll('.cardpro');
        containers.forEach(container => {
          container.style.overflowX = '';
          container.classList.remove('has-scroll', 'scrolled');
        });
      }
    }, 250);
  }
  
  // Инициализация
  function init() {
    if (isMobile()) {
      fixBodyScroll();
      fixCardOrder();
      processAllImages();
      setupScrollIndicators();
      fixPairedImages();
      fixBackButton();
      disableCursorTrail();
    }
  }
  
  // Запуск
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.addEventListener('load', () => {
    processAllImages();
    setupScrollIndicators();
  });
  
  window.addEventListener('resize', handleResize);
})();