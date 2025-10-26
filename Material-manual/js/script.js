// ============================================
// Скрипт для страницы МАНУАЛОВ
// ============================================

console.log('📘 Страница мануалов загружена');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM загружен');
    
    // Загружаем мануалы
    if (window.ManualsModule) {
        await window.ManualsModule.loadManuals();
    }
    
    // Настраиваем фильтры
    setupFilters();
    
    // Настраиваем модальное окно
    setupModal();
});

// Настройка фильтров
function setupFilters() {
    const filterButtons = document.querySelectorAll('.buttons_manual > div');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем active со всех
            filterButtons.forEach(b => b.classList.remove('active'));
            // Добавляем active к текущей
            this.classList.add('active');
            
            // Определяем фильтр
            let filter = 'all';
            if (this.classList.contains('new_nav')) {
                filter = 'new';
            } else if (this.classList.contains('old_nav')) {
                filter = 'old';
            }
            
            // Применяем фильтр
            if (window.ManualsModule) {
                window.ManualsModule.setFilter(filter);
            }
            
            console.log('Фильтр:', filter);
        });
    });
}

// Настройка модального окна
function setupModal() {
    const modal = document.querySelector('.content_alert');
    const addBtn = document.querySelector('.btns_content');
    const closeBtn = document.querySelector('.content_alert .exit');
    const saveBtn = document.querySelector('.content_alert .content_button button');
    
    // Открытие модалки
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            modal.style.setProperty('display', 'flex', 'important');
        });
    }
    
    // Закрытие модалки
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.setProperty('display', 'none', 'important');
            clearForm();
        });
    }
    
    // Сохранение мануала
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            await createManual();
        });
    }
}

// Создание мануала
async function createManual() {
    console.log('📘 === СОЗДАНИЕ МАНУАЛА ===');
    
    const titleInput = document.getElementById('manualTitle');
    const previewInput = document.getElementById('manualPreview');
    const telegraphInput = document.getElementById('manualTelegraph');
    
    const title = titleInput?.value.trim();
    const preview_image = previewInput?.value.trim();
    const telegraph_url = telegraphInput?.value.trim();
    
    console.log('Данные:', { title, preview_image, telegraph_url });
    
    // Функция проверки валидности URL
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    
    // Валидация
    if (!title) {
        Toast.error('Введите заголовок мануала');
        return;
    }
    
    if (!preview_image) {
        Toast.error('Введите ссылку на превью');
        return;
    }
    
    if (!telegraph_url) {
        Toast.error('Введите ссылку на статью Telegraph');
        return;
    }
    
    if (!isValidUrl(telegraph_url)) {
        Toast.error('Введите корректную ссылку на Telegraph (начинается с http:// или https://)');
        return;
    }
    
    // Проверяем что это именно Telegraph
    if (!telegraph_url.includes('telegra.ph')) {
        Toast.error('Ссылка должна быть на telegra.ph');
        return;
    }
    
    try {
        const token = API.getToken();
        if (!token) {
            Toast.error('Необходима авторизация');
            return;
        }
        
        Toast.info('Сохранение мануала...');
        
        // Сохраняем в БД
        const formData = new FormData();
        formData.append('title', title);
        formData.append('preview_image', preview_image);
        formData.append('telegraph_url', telegraph_url);
        formData.append('type', 'manual');
        
        const response = await fetch(`${API_BASE_URL}/materials`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Мануал добавлен!');
            document.querySelector('.content_alert').style.setProperty('display', 'none', 'important');
            clearForm();
            
            // Перезагружаем список мануалов
            if (window.ManualsModule) {
                await window.ManualsModule.loadManuals();
            }
        } else {
            Toast.error(data.message || 'Ошибка создания мануала');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        Toast.error('Ошибка соединения с сервером');
    }
}

// Очистка формы
function clearForm() {
    const titleInput = document.getElementById('manualTitle');
    const previewInput = document.getElementById('manualPreview');
    const telegraphInput = document.getElementById('manualTelegraph');
    
    if (titleInput) titleInput.value = '';
    if (previewInput) previewInput.value = '';
    if (telegraphInput) telegraphInput.value = '';
}

