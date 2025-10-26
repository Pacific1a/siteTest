// Интерактивность для раскрывающихся меню
document.addEventListener('DOMContentLoaded', function() {
    // Находим все раскрывающиеся пункты меню
    const expandableItems = document.querySelectorAll('.menu-item-expandable');
    
    expandableItems.forEach(item => {
        const button = item.querySelector('.menu-item');
        const submenu = item.querySelector('.submenu');
        
        if (button && submenu) {
            // Изначально скрываем подменю, если оно не активно
            if (!button.classList.contains('active')) {
                submenu.style.display = 'none';
            }
            
            button.addEventListener('click', function() {
                // Переключаем активное состояние
                button.classList.toggle('active');
                
                // Показываем/скрываем подменю с плавной анимацией
                if (submenu.style.display === 'none') {
                    submenu.style.display = 'flex';
                } else {
                    submenu.style.display = 'none';
                }
                
                // Поворачиваем стрелку
                const arrow = button.querySelector('.arrow');
                if (arrow) {
                    const isOpen = submenu.style.display !== 'none';
                    const arrowWidth = arrow.getAttribute('width');
                    if (arrowWidth === '7') {
                        // Горизонтальная стрелка → на 90° становится ↓
                        arrow.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
                    } else {
                        // Стрелка вниз: закрыто (→) -90°, открыто (↓) 0°
                        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
                    }
                }
            });
        }
    });

    // Интерактивность графика
    const chartArea = document.querySelector('.chart-area');
    const dateDetails = document.querySelector('.date-details');
    const chartContainer = document.querySelector('.chart-container');
    
    if (chartArea && dateDetails && chartContainer) {
        // Перемещаем date-details в chart-area
        chartArea.appendChild(dateDetails);
        chartArea.style.position = 'relative';

        // Создаем вертикальную линию индикатора
        const cursorLine = document.createElement('div');
        cursorLine.style.position = 'absolute';
        cursorLine.style.width = '2px';
        cursorLine.style.height = '100%';
        cursorLine.style.background = 'rgba(255, 224, 224, 0.3)';
        cursorLine.style.pointerEvents = 'none';
        cursorLine.style.display = 'none';
        cursorLine.style.top = '0';
        chartArea.appendChild(cursorLine);
        // Данные для каждой даты (пример - замените на реальные данные)
        const chartData = [
            { date: '21.08', income: 150, clicks: 45, deposits: 3500, firstDeposits: 12 },
            { date: '23.08', income: 220, clicks: 67, deposits: 5200, firstDeposits: 18 },
            { date: '18.08', income: 180, clicks: 52, deposits: 4100, firstDeposits: 15 },
            { date: '19.08', income: 310, clicks: 89, deposits: 7200, firstDeposits: 25 },
            { date: '20.08', income: 275, clicks: 74, deposits: 6300, firstDeposits: 21 },
            { date: '22.08', income: 195, clicks: 58, deposits: 4800, firstDeposits: 16 },
            { date: '24.08', income: 340, clicks: 95, deposits: 8100, firstDeposits: 28 }
        ];

        let isHovering = false;

        // Показываем tooltip при входе на график
        chartArea.addEventListener('mouseenter', function() {
            isHovering = true;
            dateDetails.style.display = 'block';
            cursorLine.style.display = 'block';
        });

        // Скрываем tooltip при уходе с графика
        chartArea.addEventListener('mouseleave', function() {
            isHovering = false;
            dateDetails.style.display = 'none';
            cursorLine.style.display = 'none';
        });

        // Отслеживаем движение курсора
        chartArea.addEventListener('mousemove', function(e) {
            if (!isHovering) return;

            const rect = chartArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            // Вычисляем индекс ближайшей точки данных (7 точек)
            const pointIndex = Math.round((x / width) * (chartData.length - 1));
            const clampedIndex = Math.max(0, Math.min(pointIndex, chartData.length - 1));
            
            // Получаем данные для текущей точки
            const data = chartData[clampedIndex];

            // Обновляем содержимое tooltip
            updateTooltip(data);

            // Позиционируем tooltip
            positionTooltip(e, rect);

            // Позиционируем линию курсора
            cursorLine.style.left = x + 'px';
        });

        function updateTooltip(data) {
            const header = dateDetails.querySelector('.date-details-header');
            const detailRows = dateDetails.querySelectorAll('.detail-value');

            if (header) {
                header.textContent = data.date + '.2025';
            }

            if (detailRows.length >= 4) {
                detailRows[0].textContent = data.income + '₽';
                detailRows[1].textContent = data.clicks;
                detailRows[2].textContent = data.deposits + '₽';
                detailRows[3].textContent = data.firstDeposits;
            }
        }

        function positionTooltip(e, chartRect) {
            const tooltipWidth = dateDetails.offsetWidth;
            const tooltipHeight = dateDetails.offsetHeight;

            // Позиция курсора относительно chart-area
            const x = e.clientX - chartRect.left;
            const y = e.clientY - chartRect.top;

            // По умолчанию справа на 80px
            let left = x + 80;
            let top = y - tooltipHeight / 2;

            // Если справа не помещается, ставим слева на 80px
            if (left + tooltipWidth > chartRect.width) {
                left = x - tooltipWidth - 80;
            }

            // Проверяем, чтобы не вышел за левую границу
            if (left < 0) {
                left = 10;
            }

            // Проверяем границы сверху и снизу
            if (top < 0) {
                top = 10;
            }
            if (top + tooltipHeight > chartRect.height) {
                top = chartRect.height - tooltipHeight - 10;
            }

            // Применяем позицию относительно chart-area
            dateDetails.style.position = 'absolute';
            dateDetails.style.left = left + 'px';
            dateDetails.style.top = top + 'px';
            dateDetails.style.pointerEvents = 'none';
        }
    }
});

const input = document.querySelector('.input_code input');
const copyBtn = document.querySelector('.svg_copy');

if (copyBtn && input) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.classList.remove('copied');
      }, 1000); // через 1 секунду возвращается иконка
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  });
}

const inputs = document.querySelectorAll('.code_5');

if (inputs.length > 0) {
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus(); // переход на следующий
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus(); // переход назад при удалении
      }
    });
  });
}

// ============================================
// МОДАЛЬНЫЕ ОКНА - УНИВЕРСАЛЬНАЯ ЛОГИКА
// ============================================

// Функция для открытия модального окна
function openModal(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
  }
}

// Функция для закрытия модального окна
function closeModal(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
  }
}

// Универсальный обработчик закрытия для всех модальных окон
function setupModalClose() {
  const modals = document.querySelectorAll('.alert_bot, .sub_partner, .witd_funds, .funds_sts, .auth_2f, .sts_ac, .content_alert');
  
  modals.forEach(modal => {
    // Закрытие по крестику
    const exitBtn = modal.querySelector('.exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.style.setProperty('display', 'none', 'important');
      });
    }
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.setProperty('display', 'none', 'important');
      }
    });
  });
}

// ============================================
// 1. СОЗДАНИЕ БОТА
// ============================================
const btnCreate = document.querySelector('.btn-create');
if (btnCreate) {
  btnCreate.addEventListener('click', function() {
    openModal('.alert_bot');
  });
}

// ============================================
// 2. ПОДКЛЮЧИТЬ 2FA
// ============================================
const btn2FA = document.querySelector('.btn-2fa-add');
if (btn2FA) {
  btn2FA.addEventListener('click', function() {
    openModal('.auth_2f');
  });
}

// ============================================
// 3. ПРОФИЛЬ -> НАСТРОЙКИ АККАУНТА
// ============================================
const profileBtn = document.querySelector('.profile');
if (profileBtn) {
  profileBtn.addEventListener('click', function() {
    openModal('.sts_ac');
  });
}


// ============================================
// 5. МЕНЮ - ВЫВОД СРЕДСТВ (с проверкой времени)
// ============================================
menuItems.forEach(item => {
  const span = item.querySelector('span');
  if (span && span.textContent.trim() === 'ВЫВОД СРЕДСТВ') {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 - воскресенье, 2 - вторник
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes; // Время в минутах
      
      const startTime = 10 * 60; // 10:00 в минутах
      const endTime = 18 * 60;   // 18:00 в минутах
      
      // Проверка: вторник И время с 10:00 до 18:00
      if (dayOfWeek === 2 && currentTime >= startTime && currentTime < endTime) {
        // Показываем окно с недоступным выводом и кнопкой "Настроить автовыплаты"
        openModal('.witd_funds');
      } else {
        // Показываем окно с формой вывода
        openModal('.funds_sts.after');
      }
    });
  }
});

// Обработчик для кнопки "Настроить автовыплаты"
const btnAutoPayments = document.querySelector('.button_funds button');
if (btnAutoPayments) {
  btnAutoPayments.addEventListener('click', function() {
    closeModal('.witd_funds');
    openModal('.funds_sts');
  });
}

// ============================================
// 6. НАВИГАЦИЯ В НАСТРОЙКАХ АККАУНТА (.sts_ac)
// ============================================
function setupAccountSettings() {
  const navItems = {
    '.log_ac': '.logins',
    '.email_ac': '.log_type:not(.logins):not(.telegram):not(.pass)',
    '.pass_ac': '.pass',
    '.telegram_ac': '.telegram',
    '.fa_ac': null // Особая обработка для 2FA
  };
  
  Object.keys(navItems).forEach(navClass => {
    const navItem = document.querySelector(`.sts_nav ${navClass}`);
    if (navItem) {
      navItem.addEventListener('click', function() {
        // Убираем active со всех
        document.querySelectorAll('.sts_nav > div').forEach(el => {
          el.classList.remove('active');
          el.classList.add('non_active');
        });
        
        // Добавляем active к текущему
        this.classList.add('active');
        this.classList.remove('non_active');
        
        // Проверяем если это 2FA
        if (navClass === '.fa_ac') {
          // Скрываем настройки аккаунта
          const acInput = document.querySelector('.sts_ac .ac_input');
          const acBtn = document.querySelector('.sts_ac .ac_btn');
          const fa2fSettings = document.querySelector('.sts_ac .fa_2f_settings');
          
          // Закрываем настройки аккаунта и открываем модальное окно 2FA
          closeModal('.sts_ac');
          openModal('.auth_2f');
          return; // Выходим, так как открыли другое окно
        } else {
          // Показываем настройки аккаунта, скрываем 2FA
          const acInput = document.querySelector('.sts_ac .ac_input');
          const acBtn = document.querySelector('.sts_ac .ac_btn');
          const fa2fSettings = document.querySelector('.sts_ac .fa_2f_settings');
          
          if (acInput) acInput.style.setProperty('display', 'flex', 'important');
          if (acBtn) acBtn.style.setProperty('display', 'flex', 'important');
          if (fa2fSettings) fa2fSettings.style.setProperty('display', 'none', 'important');
          
          // Скрываем все поля
          document.querySelectorAll('.ac_input .log_type').forEach(field => {
            field.style.display = 'none';
          });
          
          // Показываем нужные поля
          if (navItems[navClass]) {
            const fieldsToShow = document.querySelectorAll(`.ac_input ${navItems[navClass]}`);
            fieldsToShow.forEach(field => {
              field.style.display = 'flex';
            });
          }
        }
      });
    }
  });
  
  // Инициализация: показать только логин при загрузке
  document.querySelectorAll('.ac_input .log_type').forEach(field => {
    field.style.display = 'none';
  });
  document.querySelectorAll('.ac_input .logins').forEach(field => {
    field.style.display = 'flex';
  });
  
  // Скрываем 2FA настройки при инициализации
  const fa2fSettings = document.querySelector('.sts_ac .fa_2f_settings');
  if (fa2fSettings) {
    fa2fSettings.style.display = 'none';
  }
}

// Инициализация setupAccountSettings сразу при загрузке
setupAccountSettings();

// ============================================
// 7. DATE-PICKER
// ============================================
const datePicker = document.querySelector('.date-picker');
const dateSelect = document.querySelector('.date_select');

if (datePicker && dateSelect) {
  datePicker.addEventListener('click', function(e) {
    e.stopPropagation();
    openModal('.date_select');
  });
  
  // Закрытие при клике снаружи
  document.addEventListener('click', function(e) {
    if (!dateSelect.contains(e.target) && !datePicker.contains(e.target)) {
      closeModal('.date_select');
    }
  });
}

// Обработчики для элементов выбора даты
const dateOptions = document.querySelectorAll('.date_select > div');
dateOptions.forEach(option => {
  option.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // Убираем active со всех
    dateOptions.forEach(opt => {
      opt.classList.remove('active');
      opt.classList.add('non_active');
    });
    
    // Добавляем active к текущему
    this.classList.add('active');
    this.classList.remove('non_active');
    
    // Обновляем текст в date-picker
    if (datePicker) {
      const datePickerSpan = datePicker.querySelector('span');
      if (datePickerSpan) {
        // Можно обновить текст на основе выбранного пункта
        // datePickerSpan.textContent = this.textContent;
      }
    }
    
    // Закрываем модальное окно
    closeModal('.date_select');
  });
});


// ============================================
// 8. МАТЕРИАЛЫ - КРЕАТИВЫ И МАНУАЛЫ
// ============================================

// Функция для настройки content_alert модального окна
function setupContentAlert(type) {
  const manualContent = document.querySelector('.content_alert .manual_content');
  const creativeContent = document.querySelector('.content_alert .creative_content');
  const manualFields = document.querySelectorAll('.content_alert .log_type.manuals');
  const creativeFields = document.querySelectorAll('.content_alert .log_type.creative');
  
  if (type === 'manual') {
    // Активируем Мануал
    if (manualContent) {
      manualContent.classList.add('active');
      manualContent.classList.remove('non_active');
    }
    if (creativeContent) {
      creativeContent.classList.remove('active');
      creativeContent.classList.add('non_active');
    }
    
    // Показываем поля мануалов, скрываем креативы
    manualFields.forEach(field => field.style.display = 'flex');
    creativeFields.forEach(field => field.style.display = 'none');
  } else if (type === 'creative') {
    // Активируем Креатив
    if (manualContent) {
      manualContent.classList.remove('active');
      manualContent.classList.add('non_active');
    }
    if (creativeContent) {
      creativeContent.classList.add('active');
      creativeContent.classList.remove('non_active');
    }
    
    // Показываем поля креативов, скрываем мануалы
    manualFields.forEach(field => field.style.display = 'none');
    creativeFields.forEach(field => field.style.display = 'flex');
  }
}


// Обработчик для кнопки "Добавить контент"
const addContentBtn = document.querySelector('.btns_content');
if (addContentBtn) {
  addContentBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // Определяем тип по заголовку страницы
    const titleElement = document.querySelector('.ico_manual span');
    const isManual = titleElement && titleElement.textContent.trim() === 'Мануалы';
    const contentType = isManual ? 'manual' : 'creative';
    
    setupContentAlert(contentType);
    openModal('.content_alert');
  });
}

// Переключатели внутри модального окна
const manualContentBtn = document.querySelector('.content_alert .manual_content');
const creativeContentBtn = document.querySelector('.content_alert .creative_content');

if (manualContentBtn) {
  manualContentBtn.addEventListener('click', function() {
    setupContentAlert('manual');
  });
}

if (creativeContentBtn) {
  creativeContentBtn.addEventListener('click', function() {
    setupContentAlert('creative');
  });
}

// Инициализация - по умолчанию показываем мануалы
setupContentAlert('manual');

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
setupModalClose();