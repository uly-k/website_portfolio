export default class ScrollController {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    // Проверяем, мобильное ли устройство
    const isMobile = () => window.innerWidth <= 768;
    
    this.container.addEventListener('wheel', (e) => {
      // НЕ блокируем скролл на мобильных устройствах
      if (isMobile()) return;
      
      e.preventDefault();
      this.container.scrollLeft += e.deltaY;
    });
  }
}