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
    
    // Удаляем только динамически созданные блоки (с data-dynamic="true")
    const dynamicCards = container.querySelectorAll('.contents_manuals[data-dynamic="true"]');
    dynamicCards.forEach(card => card.remove());
    
    if (manuals.length === 0) {
        // Если нет динамических мануалов, проверяем есть ли статические
        const staticCards = container.querySelectorAll('.contents_manuals:not([data-dynamic="true"])');
        if (staticCards.length === 0) {
            container.innerHTML = '<p style="color: #796161; text-align: center; width: 100%; padding: 40px;">Мануалов не найдено</p>';
        }
        return;
    }
    
    // Удаляем сообщение "Мануалов не найдено" если оно есть
    const emptyMessage = container.querySelector('p');
    if (emptyMessage) emptyMessage.remove();
    
    // Добавляем динамические карточки в конец
    const dynamicHTML = manuals.map(manual => createManualCard(manual)).join('');
    container.insertAdjacentHTML('beforeend', dynamicHTML);
    
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
        <div class="contents_manuals" data-id="${manual.id}" data-telegraph="${telegraphUrl}" data-date="${manual.created_at}" data-dynamic="true">
            ${isNew ? `
            <div class="manual_new_title" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="18" viewBox="0 0 17 18" fill="none">
                    <path d="M13.8113 17.499C13.6697 17.4991 13.5313 17.4568 13.4141 17.3775C13.2968 17.2982 13.2059 17.1856 13.1532 17.0542L12.5554 15.5575L11.0566 14.9263C10.928 14.8696 10.8191 14.7761 10.7434 14.6576C10.6678 14.5391 10.6289 14.4009 10.6316 14.2604C10.6342 14.1199 10.6783 13.9833 10.7583 13.8677C10.8384 13.7522 10.9507 13.6629 11.0813 13.611L12.5604 13.0507L13.1532 11.5688C13.2078 11.4393 13.2993 11.3288 13.4163 11.2511C13.5334 11.1734 13.6708 11.1319 13.8113 11.1319C13.9518 11.1319 14.0892 11.1734 14.2062 11.2511C14.3233 11.3288 14.4148 11.4393 14.4693 11.5688L15.0651 13.0563L16.5526 13.652C16.6823 13.7063 16.7931 13.7978 16.8711 13.9148C16.949 14.0319 16.9906 14.1694 16.9906 14.3101C16.9906 14.4507 16.949 14.5883 16.8711 14.7053C16.7931 14.8224 16.6823 14.9139 16.5526 14.9681L15.0651 15.5638L14.4693 17.0514C14.4171 17.1833 14.3265 17.2965 14.2091 17.3763C14.0918 17.4562 13.9532 17.4989 13.8113 17.499ZM7.08205 15.374C6.77603 15.3777 6.47705 15.2822 6.22984 15.1018C5.98264 14.9213 5.80051 14.6657 5.71071 14.3731L4.56744 10.7982L0.981113 9.59824C0.691658 9.50149 0.440449 9.31524 0.263767 9.06639C0.0870853 8.81754 -0.00592259 8.51897 -0.00182321 8.2138C0.00227618 7.90864 0.103271 7.61267 0.286573 7.36866C0.469876 7.12464 0.725998 6.94521 1.01795 6.85627L4.57594 5.76968L5.77446 2.18975C5.86357 1.8957 6.0479 1.63961 6.29845 1.46176C6.549 1.28391 6.85157 1.19439 7.15855 1.20729C7.46463 1.2077 7.76234 1.30723 8.00712 1.49097C8.2519 1.67472 8.43059 1.9328 8.51644 2.22658L9.60162 5.77889L13.1646 6.91931C13.452 7.0157 13.7018 7.19994 13.8788 7.44601C14.0558 7.69208 14.151 7.98753 14.151 8.29065C14.151 8.59377 14.0558 8.88922 13.8788 9.13529C13.7018 9.38136 13.452 9.5656 13.1646 9.66199L9.59525 10.8038L8.4534 14.3731C8.3636 14.6657 8.18147 14.9213 7.93426 15.1018C7.68706 15.2822 7.38808 15.3777 7.08205 15.374ZM14.5196 5.4573C14.3617 5.4573 14.2083 5.40453 14.0839 5.30738C13.9594 5.21023 13.8709 5.07427 13.8325 4.92109L13.5797 3.90817L12.5646 3.63546C12.4121 3.59447 12.2776 3.50366 12.1825 3.37746C12.0875 3.25126 12.0374 3.09692 12.0402 2.93897C12.0429 2.78103 12.0984 2.62854 12.1978 2.50574C12.2972 2.38295 12.4348 2.29691 12.5887 2.26129L13.5804 2.03108L13.8325 1.03516C13.8709 0.881998 13.9594 0.746053 14.0839 0.648917C14.2084 0.551781 14.3617 0.499023 14.5196 0.499023C14.6775 0.499023 14.8309 0.551781 14.9554 0.648917C15.0799 0.746053 15.1683 0.881998 15.2067 1.03516L15.4575 2.03958L16.4619 2.29104C16.6151 2.32943 16.751 2.41789 16.8482 2.54237C16.9453 2.66686 16.998 2.82023 16.998 2.97813C16.998 3.13603 16.9453 3.2894 16.8482 3.41388C16.751 3.53837 16.6151 3.62683 16.4619 3.66521L15.4575 3.91667L15.2067 4.92109C15.1684 5.07427 15.0799 5.21023 14.9554 5.30738C14.8309 5.40453 14.6775 5.4573 14.5196 5.4573Z" fill="#B59C9C"/>
                </svg>
                <span>Новый мануал</span>
            </div>
            ` : ''}
            <div class="bg_manuals">
                <img src="${imageUrl}" alt="${manual.title}">
                <div class="info_fixed_content">
                    <span>${manual.title}</span>
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
        // Формируем контент для Telegraph - ПОЛНАЯ СТАТЬЯ с текстом и ссылкой
        const telegraphContent = [
            {
                tag: 'h3',
                children: ['📋 Описание мануала']
            },
            {
                tag: 'p',
                children: ['Этот мануал содержит подробную информацию и инструкции.']
            },
            {
                tag: 'p',
                children: ['Для полного доступа к материалам перейдите по ссылке ниже:']
            },
            {
                tag: 'p',
                children: [
                    {
                        tag: 'a',
                        attrs: { href: content },
                        children: ['📖 Открыть полный мануал']
                    }
                ]
            },
            {
                tag: 'hr'
            },
            {
                tag: 'p',
                children: [
                    {
                        tag: 'strong',
                        children: ['Источник:']
                    },
                    ' ',
                    {
                        tag: 'a',
                        attrs: { href: content },
                        children: [content]
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
