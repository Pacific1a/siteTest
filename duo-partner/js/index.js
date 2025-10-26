

document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const body = item.querySelector(".accordion-body");
  
      if (item.classList.contains("active")) {
        // закрытие
        body.style.maxHeight = body.scrollHeight + "px"; // фиксируем текущую высоту
        requestAnimationFrame(() => {
          body.style.maxHeight = "0";
          body.style.opacity = "0";
          body.style.padding = "0 26px";
        });
        item.classList.remove("active");
      } else {
        // открытие
        body.style.maxHeight = body.scrollHeight + "px";
        body.style.opacity = "1";
        body.style.padding = "16px 26px";
        item.classList.add("active");
      }
    });
  });


  // Плавный скролл между блоками (только для ПК)
if (window.innerWidth > 768) {
  const blocks = document.querySelectorAll('.block-1, .frame-group, .block-3, .block-4-wrapper, footer');
  let currentBlockIndex = 0;
  let isScrolling = false;
  let scrollTimeout;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetPosition, duration = 1000) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function animation(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        isScrolling = false;
      }
    }
    
    requestAnimationFrame(animation);
  }

  function getCurrentBlockIndex() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    let index = 0;
    
    blocks.forEach((block, i) => {
      if (scrollPosition >= block.offsetTop) {
        index = i;
      }
    });
    
    return index;
  }

  function scrollToBlock(index) {
    if (index < 0 || index >= blocks.length || isScrolling) return;
    
    isScrolling = true;
    currentBlockIndex = index;
    
    const targetPosition = blocks[index].offsetTop;
    smoothScrollTo(targetPosition, 1000);
    
    // Дополнительная защита
    setTimeout(() => {
      isScrolling = false;
    }, 1200);
  }

  window.addEventListener('wheel', (e) => {
    // Предотвращаем накопление событий
    clearTimeout(scrollTimeout);
    
    if (isScrolling) {
      e.preventDefault();
      return;
    }
    
    // Добавляем небольшую задержку для группировки событий скролла
    scrollTimeout = setTimeout(() => {
      currentBlockIndex = getCurrentBlockIndex();
      
      if (e.deltaY > 0 && currentBlockIndex < blocks.length - 1) {
        e.preventDefault();
        scrollToBlock(currentBlockIndex + 1);
      } else if (e.deltaY < 0 && currentBlockIndex > 0) {
        e.preventDefault();
        scrollToBlock(currentBlockIndex - 1);
      }
    }, 50);
    
    e.preventDefault();
  }, { passive: false });
}