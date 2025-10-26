// ============================================
// Управление мануалами
// ============================================

// Используем API_BASE_URL из api.js (уже определен глобально)

let allManuals = [];
let currentManualFilter = 'all';

// Telegraph API конфиг
const TELEGRAPH_CONFIG = {
    access_token: null, // Будет получен при первом использовании
    author_name: 'DUO PARTNERS',
    author_url: 'https://duopartners.com'
};

// Инициализация кнопок удаления мануалов
function initManualDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-manual-btn');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            
            if (!id) return;
            
            if (!confirm(`Вы уверены что хотите удалить мануал ID: ${id}?`)) {
                return;
            }
            
            await deleteManual(id);
        });
    });
}

// Удаление мануала
async function deleteManual(id) {
    try {
        const token = API.getToken();
        if (!token) {
            Toast.error('Необходима авторизация');
            return;
        }
        
        console.log('Удаление мануала ID:', id);
        
        const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Мануал удален!');
            await loadManuals();
        } else {
            Toast.error(data.message || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        Toast.error('Ошибка соединения с сервером');
    }
}

// Загрузка мануалов с сервера
async function loadManuals() {
    try {
        const response = await fetch(`${API_BASE_URL}/materials/manual`);
        const data = await response.json();
        
        if (data.success) {
            allManuals = data.materials;
            console.log('Загружено мануалов:', allManuals.length);
            applyManualFilter();
        } else {
            console.error('Ошибка загрузки мануалов');
        }
    } catch (error) {
        console.error('Ошибка при загрузке мануалов:', error);
    }
}

// Применение фильтра
function applyManualFilter() {
    let filteredManuals = [...allManuals];
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (currentManualFilter === 'new') {
        // Новые мануалы (созданы менее 7 дней назад)
        filteredManuals = filteredManuals.filter(manual => {
            const createdAt = new Date(manual.created_at);
            return createdAt >= sevenDaysAgo;
        });
    } else if (currentManualFilter === 'old') {
        // Старые мануалы (созданы более 7 дней назад)
        filteredManuals = filteredManuals.filter(manual => {
            const createdAt = new Date(manual.created_at);
            return createdAt < sevenDaysAgo;
        });
    }
    
    renderManuals(filteredManuals);
}

// Отрисовка мануалов
function renderManuals(manuals) {
    const container = document.getElementById('manualsContainer');
    if (!container) return;
    
    if (manuals.length === 0) {
        container.innerHTML = '<p style="color: #796161; text-align: center; width: 100%; padding: 40px;">Мануалов не найдено</p>';
        return;
    }
    
    container.innerHTML = manuals.map(manual => createManualCard(manual)).join('');
    
    // Инициализируем кнопки удаления
    initManualDeleteButtons();
    
    // Инициализируем клики на карточки
    initManualClicks();
}

// Создание карточки мануала
function createManualCard(manual) {
    const date = new Date(manual.created_at);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    
    // Проверяем роль пользователя для показа кнопки удаления
    const user = API.getUserFromStorage();
    const isAdmin = user && user.role === 'admin';
    
    // Проверяем новый ли мануал (менее 7 дней)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const createdAt = new Date(manual.created_at);
    const isNew = createdAt >= sevenDaysAgo;
    
    const imageUrl = manual.preview_image || 'image.png';
    const telegraphUrl = manual.telegraph_url || '#';
    
    return `
        <div class="contents_manuals" data-id="${manual.id}" data-telegraph="${telegraphUrl}" data-date="${manual.created_at}">
            ${isNew ? '<div class="manual_new_title">NEW</div>' : ''}
            <div class="bg_manuals">
                <img src="${imageUrl}" alt="${manual.title}">
            </div>
            <div class="content_manuals">
                <div class="title_card_manuals">
                    <span>${manual.title}</span>
                </div>
                <div class="date_card_manuals">
                    <span>${formattedDate}</span>
                </div>
            </div>
            ${isAdmin ? `
            <button class="delete-manual-btn" data-id="${manual.id}" title="Удалить мануал">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
            ` : ''}
        </div>
    `;
}

// Инициализация кликов на карточки мануалов
function initManualClicks() {
    const cards = document.querySelectorAll('.contents_manuals');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Игнорируем клик если это кнопка удаления
            if (e.target.closest('.delete-manual-btn')) {
                return;
            }
            
            const telegraphUrl = card.dataset.telegraph;
            if (telegraphUrl && telegraphUrl !== '#') {
                window.open(telegraphUrl, '_blank');
            }
        });
    });
}

// Создание статьи в Telegraph
async function createTelegraphArticle(title, content, imageUrl) {
    console.log('📡 createTelegraphArticle вызван:', { title, content, imageUrl });
    try {
        // Формируем контент для Telegraph
        const telegraphContent = [
            {
                tag: 'p',
                children: ['Для просмотра полного мануала перейдите по ссылке ниже:']
            },
            {
                tag: 'p',
                children: [
                    {
                        tag: 'a',
                        attrs: { href: content, target: '_blank' },
                        children: ['Открыть мануал']
                    }
                ]
            }
        ];
        
        console.log('📝 Контент для Telegraph:', telegraphContent);
        
        // Если есть изображение - добавляем его первым
        if (imageUrl) {
            telegraphContent.unshift({
                tag: 'figure',
                children: [
                    {
                        tag: 'img',
                        attrs: { src: imageUrl }
                    }
                ]
            });
        }
        
        // Создаем страницу через Telegraph API
        console.log('🌐 Отправка запроса в Telegraph API...');
        console.log('🔑 Токен:', TELEGRAPH_CONFIG.access_token ? 'есть' : 'нет');
        
        const requestBody = {
            access_token: TELEGRAPH_CONFIG.access_token || '',
            title: title,
            author_name: TELEGRAPH_CONFIG.author_name,
            author_url: TELEGRAPH_CONFIG.author_url,
            content: telegraphContent,
            return_content: false
        };
        
        console.log('📤 Тело запроса:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/telegraph/createPage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Ответ получен, статус:', response.status);
        const data = await response.json();
        console.log('📦 Данные ответа:', data);
        
        if (data.ok) {
            console.log('✅ Статья создана успешно:', data.result.url);
            return data.result.url;
        } else {
            console.log('⚠️ Ошибка в ответе Telegraph:', data);
            // Если токена нет - создаем аккаунт
            if (!TELEGRAPH_CONFIG.access_token) {
                console.log('🔄 Токена нет, создаем аккаунт...');
                await createTelegraphAccount();
                // Пробуем еще раз
                console.log('🔄 Повторная попытка создания статьи...');
                return createTelegraphArticle(title, content, imageUrl);
            }
            throw new Error(data.error || 'Ошибка создания статьи');
        }
    } catch (error) {
        console.error('Ошибка создания Telegraph статьи:', error);
        throw error;
    }
}

// Создание аккаунта Telegraph
async function createTelegraphAccount() {
    try {
        console.log('🔑 Создание Telegraph аккаунта...');
        const response = await fetch(`${API_BASE_URL}/telegraph/createAccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                short_name: 'DUO PARTNERS',
                author_name: TELEGRAPH_CONFIG.author_name,
                author_url: TELEGRAPH_CONFIG.author_url
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            TELEGRAPH_CONFIG.access_token = data.result.access_token;
            // Сохраняем токен в localStorage
            localStorage.setItem('telegraph_token', data.result.access_token);
            return data.result.access_token;
        } else {
            throw new Error('Ошибка создания аккаунта Telegraph');
        }
    } catch (error) {
        console.error('Ошибка создания Telegraph аккаунта:', error);
        throw error;
    }
}

// Загрузка токена из localStorage при инициализации
function initTelegraph() {
    const savedToken = localStorage.getItem('telegraph_token');
    if (savedToken) {
        TELEGRAPH_CONFIG.access_token = savedToken;
    }
}

// Экспортируем функции в глобальную область
window.ManualsModule = {
    loadManuals,
    createTelegraphArticle,
    setFilter: (filter) => {
        currentManualFilter = filter;
        applyManualFilter();
    }
};

// Инициализация Telegraph при загрузке
initTelegraph();

console.log('✅ Модуль мануалов загружен');
