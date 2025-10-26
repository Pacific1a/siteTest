// Проверка авторизации и загрузка данных пользователя
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Auth.js запущен [ВЕРСИЯ 4] ===');
    console.log('Toast доступен?', typeof Toast !== 'undefined' ? '✅ ДА' : '❌ НЕТ');
    console.log('API доступен?', typeof API !== 'undefined' ? '✅ ДА' : '❌ НЕТ');
    
    // Проверяем авторизацию
    if (!API.isAuthenticated()) {
        const isLoginPage = window.location.pathname.includes('/user/login') || 
                           window.location.pathname.includes('/user/registration') ||
                           window.location.pathname.includes('/user/reset-password');
        
        if (!isLoginPage) {
            console.log('Пользователь не авторизован, перенаправление на login');
            window.location.href = '/user/login/index.html';
            return;
        }
        return;
    }
    
    // Загружаем данные пользователя
    let user = API.getUserFromStorage();
    console.log('Данные пользователя из localStorage:', user);
    
    if (user) {
        updateUserData(user);
    } else {
        const result = await API.getUserFromServer();
        if (result.success) {
            updateUserData(result.user);
        } else {
            console.error('Не удалось загрузить данные пользователя');
        }
    }
    
    // Обработчик кнопки "Сохранить" в настройках аккаунта
    console.log('📝 Настройка обработчика кнопки Сохранить...');
    document.addEventListener('click', async function(e) {
        const button = e.target.closest('.sts_ac .ac_btn button');
        if (!button) return;
        
        e.preventDefault();
        console.log('🔘 Кнопка Сохранить нажата!');
        
        const currentUser = API.getUserFromStorage();
        if (!currentUser) {
            Toast.error('Ошибка: данные пользователя не найдены');
            return;
        }
        
        // Находим все поля
        const loginInputs = document.querySelectorAll('.sts_ac .log_type.logins input');
        const emailInputs = document.querySelectorAll('.sts_ac .log_type.emails input');
        const passInputs = document.querySelectorAll('.sts_ac .log_type.pass input');
        const telegramInputs = document.querySelectorAll('.sts_ac .log_type.telegram input');
        
        console.log('Найдено полей - Логин:', loginInputs.length, 'Email:', emailInputs.length);
        
        if (loginInputs.length !== 2 || emailInputs.length !== 2 || passInputs.length !== 2 || telegramInputs.length !== 1) {
            Toast.error('Ошибка: не все поля формы найдены');
            return;
        }
        
        const newLogin = loginInputs[1].value.trim();
        const newEmail = emailInputs[1].value.trim();
        const oldPassword = passInputs[0].value;
        const newPassword = passInputs[1].value;
        const telegram = telegramInputs[0].value.trim();
        
        console.log('Значения - Логин:', newLogin, 'Email:', newEmail, 'Telegram:', telegram);
        
        const updates = {};
        if (newLogin && newLogin !== currentUser.login) updates.login = newLogin;
        if (newEmail && newEmail !== currentUser.email) updates.email = newEmail;
        if (telegram && telegram !== currentUser.telegram) updates.telegram = telegram;
        if (oldPassword && newPassword) {
            updates.oldPassword = oldPassword;
            updates.newPassword = newPassword;
        }
        
        console.log('Объект обновлений:', updates);
        
        if (Object.keys(updates).length === 0) {
            Toast.warning('Нет изменений для сохранения');
            return;
        }
        
        console.log('Отправка на сервер...');
        const result = await API.updateUser(updates);
        console.log('Результат:', result);
        
        if (result.success) {
            Toast.success('Данные успешно обновлены!');
            const updatedUser = API.getUserFromStorage();
            updateUserData(updatedUser);
            loginInputs[1].value = '';
            emailInputs[1].value = '';
            passInputs[0].value = '';
            passInputs[1].value = '';
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.msg).join(', ') : result.message;
            Toast.error('Ошибка: ' + errorMsg);
        }
    });
    
    console.log('✅ Обработчик установлен!');
    setupLogout();
});

// Обновление данных на странице
function updateUserData(user) {
    if (!user) {
        console.error('User data is undefined');
        return;
    }
    
    console.log('Обновление UI с данными:', user);
    
    // Обновляем баланс
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        const balance = user.balance !== undefined && user.balance !== null ? user.balance : 0;
        balanceElement.textContent = `${balance}₽`;
        console.log('Баланс обновлен:', balance);
    }
    
    // Обновляем поле "Актуальный логин" (первое поле в log_type.logins)
    const loginInputs = document.querySelectorAll('.sts_ac .log_type.logins input');
    if (loginInputs.length >= 1) {
        loginInputs[0].value = user.login || '';
        console.log('Актуальный логин установлен:', user.login);
    }
    
    // Обновляем поле "Актуальный email" (первое поле в log_type.emails)
    const emailInputs = document.querySelectorAll('.sts_ac .log_type.emails input');
    if (emailInputs.length >= 1) {
        emailInputs[0].value = user.email || '';
        console.log('Актуальный email установлен:', user.email);
    }
    
    // Обновляем Telegram
    const telegramInputs = document.querySelectorAll('.sts_ac .log_type.telegram input');
    if (telegramInputs.length >= 1) {
        telegramInputs[0].value = user.telegram || '';
        console.log('Telegram установлен:', user.telegram);
    }
}

// Настройка кнопки выхода
function setupLogout() {
    const logoutButtons = document.querySelectorAll('.logout, .exit-account, [data-logout]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Выход из системы');
            API.logout();
            window.location.href = '/user/login/index.html';
        });
    });
}


