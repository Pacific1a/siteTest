// ============================================
// Админ-функционал
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin module loaded');
    
    // Проверяем есть ли токен
    const token = API.getToken();
    if (!token) {
        console.log('User not authenticated');
        hideAdminButtons(); // Скрываем кнопки для неавторизованных
        return;
    }
    
    // Получаем актуальные данные с СЕРВЕРА
    console.log('Получаем роль с сервера...');
    const result = await API.getUserFromServer();
    
    if (result.success && result.user) {
        const userRole = result.user.role;
        console.log('Роль пользователя с сервера:', userRole);
        
        // Обновляем localStorage с актуальными данными
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Показываем/скрываем админские элементы
        updateAdminUI(userRole === 'admin');
    } else {
        console.log('Не удалось получить данные пользователя');
        hideAdminButtons();
    }
});

// Скрываем все админские кнопки
function hideAdminButtons() {
    const addContentButtons = document.querySelectorAll('[data-admin-only]');
    addContentButtons.forEach(btn => {
        btn.style.display = 'none';
    });
}

// Обновляем UI в зависимости от роли
function updateAdminUI(isAdmin) {
    console.log('Обновление UI, isAdmin:', isAdmin);
    
    // Находим все кнопки с атрибутом data-admin-only
    const addContentButtons = document.querySelectorAll('[data-admin-only]');
    
    console.log('Найдено админских кнопок:', addContentButtons.length);
    
    if (isAdmin) {
        console.log('✅ АДМИН - показываем кнопки');
        addContentButtons.forEach(btn => {
            btn.style.display = 'flex';
        });
        
        // Добавляем индикатор админа в UI
        addAdminBadge();
    } else {
        console.log('👤 Обычный пользователь - кнопки скрыты');
        addContentButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Добавляем бейдж админа
function addAdminBadge() {
    const profile = document.querySelector('.profile');
    if (profile && !document.querySelector('.admin-badge')) {
        const badge = document.createElement('div');
        badge.className = 'admin-badge';
        badge.innerHTML = 'ADMIN';
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: 5px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
            color: white;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            z-index: 10;
            pointer-events: none;
        `;
        profile.style.position = 'relative';
        profile.appendChild(badge);
    }
}

// Функция проверки - является ли пользователь админом
function isUserAdmin() {
    const user = API.getUserFromStorage();
    return user && user.role === 'admin';
}

// Экспортируем для использования в других скриптах
window.AdminModule = {
    isAdmin: isUserAdmin,
    updateUI: updateAdminUI
};
