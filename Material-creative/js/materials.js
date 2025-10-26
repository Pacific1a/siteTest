// ============================================
// Управление креативами
// ============================================

// Используем API_BASE_URL из api.js (уже определен глобально)

let allCreatives = [];
let currentFilter = 'all';

// Инициализация кнопок удаления
function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-creative-btn');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            
            if (!id) return;
            
            // Подтверждение удаления
            if (!confirm(`Вы уверены что хотите удалить креатив ID: ${id}?`)) {
                return;
            }
            
            await deleteCreative(id);
        });
    });
}

// Удаление креатива
async function deleteCreative(id) {
    try {
        const token = API.getToken();
        if (!token) {
            Toast.error('Необходима авторизация');
            return;
        }
        
        console.log('Удаление креатива ID:', id);
        
        const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Креатив удален!');
            // Перезагружаем список креативов
            await loadCreatives();
        } else {
            Toast.error(data.message || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        Toast.error('Ошибка соединения с сервером');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Materials module loaded');
    await loadCreatives();
    setupFilters();
    setupCreateForm();
});

// Загрузка креативов с сервера
async function loadCreatives() {
    try {
        const response = await fetch(`${API_BASE_URL}/materials/creative`);
        const data = await response.json();
        
        if (data.success) {
            allCreatives = data.materials;
            console.log('Загружено креативов:', allCreatives.length);
            applyCurrentFilter();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Применение текущего фильтра
function applyCurrentFilter() {
    let filtered = [];
    
    if (currentFilter === 'all') {
        filtered = allCreatives;
    } else if (currentFilter === 'new') {
        filtered = filterByDate(allCreatives, 'new');
    } else if (currentFilter === 'old') {
        filtered = filterByDate(allCreatives, 'old');
    }
    
    renderCreatives(filtered);
}

// Фильтрация по дате
function filterByDate(creatives, type) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return creatives.filter(creative => {
        const creativeDate = new Date(creative.created_at);
        
        if (type === 'new') {
            return creativeDate >= sevenDaysAgo;
        } else if (type === 'old') {
            return creativeDate < sevenDaysAgo;
        }
        
        return true;
    });
}

// Отрисовка креативов
function renderCreatives(creatives) {
    const container = document.getElementById('creativesContainer');
    
    if (!container) {
        console.error('Контейнер не найден');
        return;
    }
    
    // Удаляем только динамически созданные блоки (с data-dynamic="true")
    const dynamicCards = container.querySelectorAll('.creative_card[data-dynamic="true"]');
    dynamicCards.forEach(card => card.remove());
    
    if (creatives.length === 0) {
        // Если нет динамических креативов, проверяем есть ли статические
        const staticCards = container.querySelectorAll('.creative_card:not([data-dynamic="true"])');
        if (staticCards.length === 0) {
            container.innerHTML = '<p style="color: #FFE0E0; padding: 40px; text-align: center;">Креативов пока нет.</p>';
        }
        return;
    }
    
    // Удаляем сообщение "Креативов пока нет" если оно есть
    const emptyMessage = container.querySelector('p');
    if (emptyMessage) emptyMessage.remove();
    
    // Добавляем динамические карточки в конец
    const dynamicHTML = creatives.map(creative => createCard(creative)).join('');
    container.insertAdjacentHTML('beforeend', dynamicHTML);
    
    // Инициализируем видео плееры после рендера
    initVideoPlayers();
    
    // Инициализируем кнопки удаления
    initDeleteButtons();
}

// Создание HTML карточки
function createCard(creative) {
    const date = new Date(creative.created_at);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    
    // Проверяем есть ли видео
    const hasVideo = creative.video_url && creative.video_url.trim() !== '';
    const imageUrl = creative.preview_image || 'image.png';
    
    // Проверяем роль пользователя для показа кнопки удаления
    const user = API.getUserFromStorage();
    const isAdmin = user && user.role === 'admin';
    
    // Создаем HTML для визуального блока
    let visualContent = '';
    if (hasVideo) {
        // Если есть видео - показываем превью с кнопкой Play
        visualContent = `
            <div class="media-preview-container" data-video-url="${creative.video_url}" data-type="video">
                <img src="${imageUrl}" alt="${creative.title}">
                <div class="video-play-overlay">
                    <div class="video-play-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="video-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>ВИДЕО</span>
                </div>
            </div>
        `;
    } else {
        // Если нет видео - просто изображение с возможностью просмотра
        visualContent = `
            <div class="media-preview-container" data-image-url="${imageUrl}" data-type="image">
                <img src="${imageUrl}" alt="${creative.title}">
            </div>
        `;
    }
    
    return `
        <div class="creative_card" data-id="${creative.id}" data-date="${creative.created_at}" data-dynamic="true">
            <div class="vizual_block">
                ${visualContent}
            </div>
            <div class="info_fixed_content">
                    <span>фывфыв</span>
                </div>
            ${isAdmin ? `
            <button class="delete-creative-btn" data-id="${creative.id}" title="Удалить креатив">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
            ` : ''}
        </div>
    `;
}

// Настройка фильтров
function setupFilters() {
    const allBtn = document.querySelector('.all_nav');
    const newBtn = document.querySelector('.new_nav');
    const oldBtn = document.querySelector('.old_nav');
    
    if (!allBtn || !newBtn || !oldBtn) return;
    
    allBtn.addEventListener('click', () => {
        setActiveFilter(allBtn);
        currentFilter = 'all';
        applyCurrentFilter();
    });
    
    newBtn.addEventListener('click', () => {
        setActiveFilter(newBtn);
        currentFilter = 'new';
        applyCurrentFilter();
    });
    
    oldBtn.addEventListener('click', () => {
        setActiveFilter(oldBtn);
        currentFilter = 'old';
        applyCurrentFilter();
    });
}

// Установка активного фильтра
function setActiveFilter(activeBtn) {
    document.querySelectorAll('.all_nav, .new_nav, .old_nav').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Настройка формы создания
function setupCreateForm() {
    console.log('Настройка формы создания...');
    
    const addBtn = document.querySelector('.btns_content[data-admin-only]');
    const modal = document.querySelector('.content_alert');
    
    console.log('Кнопка добавления:', addBtn);
    console.log('Модалка:', modal);
    
    if (!addBtn) {
        console.error('Кнопка "Добавить контент" не найдена!');
        return;
    }
    
    if (!modal) {
        console.error('Модалка .content_alert не найдена!');
        return;
    }
    
    const exitBtn = modal.querySelector('.exit');
    const saveBtn = modal.querySelector('.content_button button');
    const creativeTab = modal.querySelector('.creative_content');
    const videoInput = document.getElementById('videoFile');
    const fileNameSpan = document.querySelector('.file-name');
    
    console.log('Exit кнопка:', exitBtn);
    console.log('Save кнопка:', saveBtn);
    console.log('Креатив таб:', creativeTab);
    
    // Обработка выбора видео файла
    if (videoInput && fileNameSpan) {
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameSpan.textContent = file.name;
                fileNameSpan.classList.add('selected');
                console.log('Выбран файл:', file.name, file.size, 'bytes');
            } else {
                fileNameSpan.textContent = 'Файл не выбран';
                fileNameSpan.classList.remove('selected');
            }
        });
    }
    
    // Обработка переключателя между изображением и видео (только для креативов)
    const mediaTypeBtns = modal.querySelectorAll('.media-type-btn');
    const imageFields = modal.querySelectorAll('.image-field.creative-only');
    const videoFields = modal.querySelectorAll('.video-field.creative-only');
    
    mediaTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            
            // Убираем active со всех кнопок
            mediaTypeBtns.forEach(b => b.classList.remove('active'));
            
            // Добавляем active к текущей
            btn.classList.add('active');
            
            // Показываем/скрываем поля
            if (type === 'image') {
                imageFields.forEach(field => field.style.display = 'flex');
                videoFields.forEach(field => field.style.display = 'none');
            } else if (type === 'video') {
                imageFields.forEach(field => field.style.display = 'none');
                videoFields.forEach(field => field.style.display = 'flex');
            }
            
            console.log('Переключено на:', type);
        });
    });
    
    // Открытие модалки
    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клик на "Добавить контент"');
        
        // Используем setProperty с important для перекрытия CSS
        modal.style.setProperty('display', 'flex', 'important');
        console.log('Модалка открыта');
        
        // Переключаем на вкладку "Креатив"
        if (creativeTab) {
            setTimeout(() => {
                creativeTab.click();
            }, 100);
        }
    });
    
    // Закрытие модалки
    if (exitBtn) {
        exitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Закрытие модалки');
            modal.style.setProperty('display', 'none', 'important');
            clearForm();
        });
    }
    
    // Сохранение креатива
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Нажата кнопка Добавить');
            await createCreative();
        });
    }
    
    console.log('✅ Форма настроена');
}

// Создание креатива
async function createCreative() {
    console.log('=== Создание креатива ===');
    const modal = document.querySelector('.content_alert');
    
    // Определяем активный тип медиа (он же формат)
    const activeMediaType = modal.querySelector('.media-type-btn.active')?.dataset.type || 'image';
    const format = activeMediaType === 'image' ? 'Изображение' : 'Видео';
    console.log('Активный тип медиа:', activeMediaType);
    console.log('Формат (определен автоматически):', format);
    
    // Находим поле размера - теперь это единственное поле без класса media-field
    const sizeInput = modal.querySelector('.log_type.creative:not(.media-field):not(.file-upload) input');
    const size = sizeInput?.value.trim() || '';
    
    let preview_image = '';
    let videoFile = null;
    
    if (activeMediaType === 'image') {
        // Для изображения - берем ссылку на изображение
        const imageInput = modal.querySelector('.image-field input');
        preview_image = imageInput?.value.trim() || '';
        console.log('Режим: Изображение');
        console.log('Ссылка на изображение:', preview_image);
    } else if (activeMediaType === 'video') {
        // Для видео - берем превью и файл видео
        const previewInput = modal.querySelector('.video-field:not(.file-upload) input');
        preview_image = previewInput?.value.trim() || '';
        
        const videoFileInput = document.getElementById('videoFile');
        videoFile = videoFileInput?.files[0] || null;
        
        console.log('Режим: Видео');
        console.log('Превью:', preview_image);
        console.log('Видео файл:', videoFile ? videoFile.name : 'нет');
    }
    
    console.log('Размер:', size);
    
    // Функция проверки валидности URL
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
    
    // Проверяем обязательные поля
    if (!size) {
        console.error('❌ Не указан размер!');
        Toast.error('Укажите размер креатива');
        return;
    }
    
    // Для изображения обязательна валидная ссылка
    if (activeMediaType === 'image') {
        if (!preview_image) {
            console.error('❌ Не указана ссылка на изображение!');
            Toast.error('Укажите ссылку на изображение');
            return;
        }
        if (!isValidUrl(preview_image)) {
            console.error('❌ Неверный формат ссылки!');
            Toast.error('Введите корректную ссылку (начинается с http:// или https://)');
            return;
        }
    }
    
    // Для видео обязательны превью и файл
    if (activeMediaType === 'video') {
        if (!preview_image) {
            console.error('❌ Не указана ссылка на превью!');
            Toast.error('Укажите ссылку на превью видео');
            return;
        }
        if (!isValidUrl(preview_image)) {
            console.error('❌ Неверный формат ссылки на превью!');
            Toast.error('Введите корректную ссылку на превью (начинается с http:// или https://)');
            return;
        }
        if (!videoFile) {
            console.error('❌ Не выбран видео файл!');
            Toast.error('Выберите видео файл');
            return;
        }
    }
    
    try {
        const token = API.getToken();
        console.log('Токен:', token ? 'Есть' : 'Нет');
        
        // Используем FormData для отправки файла
        const formData = new FormData();
        formData.append('title', `Креатив ${format}`);
        formData.append('format', format);
        formData.append('size', size);
        formData.append('type', 'creative');
        
        if (preview_image) {
            formData.append('preview_image', preview_image);
        }
        
        if (videoFile) {
            formData.append('video', videoFile);
            console.log('Добавлен видео файл:', videoFile.name, videoFile.size, 'bytes');
        }
        
        console.log('📦 FormData готов к отправке');
        console.log('📝 Проверка содержимого FormData:');
        for (let pair of formData.entries()) {
            if (pair[1] instanceof File) {
                console.log(`  - ${pair[0]}: [FILE] ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
            } else {
                console.log(`  - ${pair[0]}: ${pair[1]}`);
            }
        }
        
        // Показываем прогресс-бар если загружается видео
        const progressContainer = document.querySelector('.upload-progress');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const addButton = modal.querySelector('.content_button button');
        
        if (videoFile && progressContainer && addButton) {
            console.log('📊 Показываем прогресс-бар');
            progressContainer.style.display = 'block';
            addButton.disabled = true;
            addButton.textContent = 'Загрузка...';
            addButton.style.opacity = '0.6';
        }
        
        // Используем XMLHttpRequest для отслеживания прогресса
        const response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Отслеживание прогресса загрузки
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && progressFill && progressText) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressFill.style.width = percentComplete + '%';
                    progressText.textContent = `Загрузка: ${percentComplete}%`;
                    console.log('Прогресс загрузки:', percentComplete + '%');
                }
            });
            
            xhr.addEventListener('load', () => {
                console.log('📥 Ответ получен. Статус:', xhr.status);
                console.log('📄 Тело ответа:', xhr.responseText);
                
                if (xhr.status === 200 || xhr.status === 201) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log('✅ Успешный ответ:', data);
                        resolve({ ok: true, status: xhr.status, data });
                    } catch (e) {
                        console.error('❌ Ошибка парсинга ответа:', e);
                        reject(new Error('Ошибка парсинга ответа'));
                    }
                } else {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.error('❌ Ошибка сервера:', xhr.status, data);
                        resolve({ ok: false, status: xhr.status, data });
                    } catch (e) {
                        console.error('❌ Не удалось распарсить ошибку:', e);
                        reject(new Error('Ошибка сервера: ' + xhr.status));
                    }
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Ошибка сети'));
            });
            
            xhr.addEventListener('abort', () => {
                reject(new Error('Загрузка отменена'));
            });
            
            console.log('🚀 Отправка запроса...');
            xhr.open('POST', `${API_BASE_URL}/materials`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            
            console.log('📤 Начинаем отправку файла...');
            xhr.send(formData);
        });
        
        console.log('Статус ответа:', response.status);
        console.log('Ответ сервера:', response.data);
        
        // Скрываем прогресс-бар
        if (progressContainer && addButton) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = 'Загрузка: 0%';
                addButton.disabled = false;
                addButton.textContent = 'Добавить';
                addButton.style.opacity = '1';
            }, 500);
        }
        
        if (response.ok && response.data.success) {
            console.log('✅ Креатив создан с ID:', response.data.material.id);
            Toast.success('Креатив создан! ID: ' + response.data.material.id);
            modal.style.setProperty('display', 'none', 'important');
            clearForm();
            await loadCreatives();
        } else {
            console.error('❌ Ошибка создания:', response.data);
            const errorMsg = response.data.message || 
                           (response.data.errors ? response.data.errors.map(e => e.msg).join(', ') : 'Неизвестная ошибка');
            Toast.error(errorMsg);
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        Toast.error('Ошибка: ' + error.message);
        
        // Скрываем прогресс-бар при ошибке
        const progressContainer = document.querySelector('.upload-progress');
        const addButton = modal.querySelector('.content_button button');
        if (progressContainer) progressContainer.style.display = 'none';
        if (addButton) {
            addButton.disabled = false;
            addButton.textContent = 'Добавить';
            addButton.style.opacity = '1';
        }
    }
}

// Очистка формы
function clearForm() {
    const modal = document.querySelector('.content_alert');
    const textInputs = modal?.querySelectorAll('.log_type.creative input[type="text"]');
    const videoInput = document.getElementById('videoFile');
    const fileNameSpan = document.querySelector('.file-name');
    const mediaTypeBtns = modal?.querySelectorAll('.media-type-btn');
    const imageFields = modal?.querySelectorAll('.image-field');
    const videoFields = modal?.querySelectorAll('.video-field');
    
    // Очищаем все текстовые поля
    textInputs?.forEach(input => {
        input.value = '';
    });
    
    // Очищаем файл
    if (videoInput) {
        videoInput.value = '';
    }
    
    // Сбрасываем имя файла
    if (fileNameSpan) {
        fileNameSpan.textContent = 'Файл не выбран';
        fileNameSpan.classList.remove('selected');
    }
    
    // Сбрасываем переключатель на "Изображение"
    const mediaTypeBtns2 = modal?.querySelectorAll('.media-type-btn');
    mediaTypeBtns2?.forEach(btn => {
        if (btn.dataset.type === 'image') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Показываем поля изображения, скрываем видео
    const imageFields2 = modal?.querySelectorAll('.image-field.creative-only');
    const videoFields2 = modal?.querySelectorAll('.video-field.creative-only');
    imageFields2?.forEach(field => field.style.display = 'flex');
    videoFields2?.forEach(field => field.style.display = 'none');
    
    // Сбрасываем прогресс-бар
    const progressContainer = modal?.querySelector('.upload-progress');
    const progressFill = modal?.querySelector('.progress-fill');
    const progressText = modal?.querySelector('.progress-text');
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = 'Загрузка: 0%';
}

// ============================================
// РАБОТА С ВИДЕО
// ============================================

// Инициализация медиа плееров
function initVideoPlayers() {
    console.log('Инициализация медиа плееров...');
    
    const mediaContainers = document.querySelectorAll('.media-preview-container');
    console.log('Найдено элементов:', mediaContainers.length);
    
    mediaContainers.forEach(container => {
        const type = container.dataset.type;
        const videoUrl = container.dataset.videoUrl;
        const imageUrl = container.dataset.imageUrl;
        
        console.log('Контейнер:', type, videoUrl || imageUrl);
        
        // Обработка клика
        container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (type === 'video' && videoUrl) {
                // Открываем видео в модальном окне
                openVideoModal(videoUrl);
            } else if (type === 'image' && imageUrl) {
                // Открываем изображение в модальном окне
                openImageModal(imageUrl);
            }
        });
        
        // Добавляем эффект при наведении
        container.style.cursor = 'pointer';
    });
    
    // Настройка модальных окон
    setupVideoModal();
    setupImageModal();
}

// Открытие видео в модальном окне
function openVideoModal(videoUrl) {
    console.log('Открытие видео модалки:', videoUrl);
    
    const modal = document.querySelector('.video-modal');
    const player = modal.querySelector('.video-modal-player');
    const source = player.querySelector('source');
    
    if (!modal || !player || !source) {
        console.error('Элементы модального окна не найдены');
        return;
    }
    
    // Устанавливаем URL видео
    source.src = videoUrl;
    player.load();
    
    // Показываем модальное окно
    modal.style.setProperty('display', 'flex', 'important');
    
    // Воспроизводим видео
    setTimeout(() => {
        player.play().catch(err => console.log('Не удалось воспроизвести видео:', err));
    }, 100);
}

// Закрытие видео модального окна
function closeVideoModal() {
    console.log('Закрытие видео модалки');
    
    const modal = document.querySelector('.video-modal');
    const player = modal.querySelector('.video-modal-player');
    
    if (!modal || !player) return;
    
    // Останавливаем видео
    player.pause();
    player.currentTime = 0;
    
    // Скрываем модальное окно
    modal.style.setProperty('display', 'none', 'important');
}

// Настройка модального окна для видео
function setupVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.video-modal-close');
    
    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideoModal);
    }
    
    // Закрытие по клику вне контента
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideoModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeVideoModal();
        }
    });
}

// ============================================
// РАБОТА С ИЗОБРАЖЕНИЯМИ
// ============================================

// Открытие изображения в модальном окне
function openImageModal(imageUrl) {
    console.log('Открытие изображения:', imageUrl);
    
    const modal = document.querySelector('.image-modal');
    const img = modal.querySelector('img');
    
    if (!modal || !img) {
        console.error('Элементы модального окна изображений не найдены');
        return;
    }
    
    // Устанавливаем URL изображения
    img.src = imageUrl;
    
    // Показываем модальное окно
    modal.style.setProperty('display', 'flex', 'important');
}

// Закрытие модального окна изображения
function closeImageModal() {
    console.log('Закрытие модалки изображения');
    
    const modal = document.querySelector('.image-modal');
    
    if (!modal) return;
    
    // Скрываем модальное окно
    modal.style.setProperty('display', 'none', 'important');
}

// Настройка модального окна для изображений
function setupImageModal() {
    const modal = document.querySelector('.image-modal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.image-modal-close');
    
    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }
    
    // Закрытие по клику вне контента
    modal.addEventListener('click', (e) => {
        const content = modal.querySelector('.image-modal-content');
        if (e.target === modal || e.target === content) {
            closeImageModal();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeImageModal();
        }
    });
}
