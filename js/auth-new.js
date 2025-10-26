// Проверка авторизации и загрузка данных пользователя
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Auth.js запущен ===');
    
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
    
    // Настраиваем обработчики
    setupAccountSettings();
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
    
    // Обновляем поле "Актуальный логин"
    const currentLoginInputs = document.querySelectorAll('.sts_ac input[placeholder="example-login"]');
    currentLoginInputs.forEach(input => {
        input.value = user.login || '';
        console.log('Актуальный логин установлен:', user.login);
    });
    
    // Обновляем поле "Актуальный email"
    const currentEmailInputs = document.querySelectorAll('.sts_ac input[placeholder="example@gmail.com"]');
    currentEmailInputs.forEach(input => {
        input.value = user.email || '';
        console.log('Актуальный email установлен:', user.email);
    });
    
    // Обновляем Telegram
    const telegramInputs = document.querySelectorAll('.sts_ac .telegram input');
    telegramInputs.forEach(input => {
        input.value = user.telegram || '';
        console.log('Telegram установлен:', user.telegram);
    });
}

// Настройка обработчика кнопки "Сохранить"
function setupAccountSettings() {
    const saveButton = document.querySelector('.sts_ac .ac_btn button');
    
    if (!saveButton) {
        console.error('Кнопка Сохранить не найдена!');
        return;
    }
    
    console.log('Кнопка Сохранить найдена, добавляю обработчик');
    
    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        console.log('=== КНОПКА СОХРАНИТЬ НАЖАТА ===');
        
        // Получаем актуальные данные пользователя из localStorage
        const currentUser = API.getUserFromStorage();
        if (!currentUser) {
            console.error('Нет данных пользователя в localStorage');
            Notification.error('Ошибка: данные пользователя не найдены');
            return;
        }
        
        console.log('Текущий пользователь:', currentUser);
        
        // Находим все инпуты
        const allInputs = document.querySelectorAll('.sts_ac .log_input input');
        console.log('Всего найдено инпутов:', allInputs.length);
        
        if (allInputs.length < 7) {
            console.error('Недостаточно инпутов! Найдено:', allInputs.length);
            Notification.error('Ошибка: не все поля формы найдены');
            return;
        }
        
        // Распределяем инпуты
        const currentLoginInput = allInputs[0];    // Актуальный логин
        const newLoginInput = allInputs[1];        // Новый логин
        const currentEmailInput = allInputs[2];    // Актуальный email
        const newEmailInput = allInputs[3];        // Новый email
        const oldPasswordInput = allInputs[4];     // Старый пароль
        const newPasswordInput = allInputs[5];     // Новый пароль
        const telegramInput = allInputs[6];        // Telegram
        
        // Получаем значения
        const newLogin = newLoginInput.value.trim();
        const newEmail = newEmailInput.value.trim();
        const oldPassword = oldPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const telegram = telegramInput.value.trim();
        
        console.log('Введенные значения:');
        console.log('- Новый логин:', newLogin || '(пусто)');
        console.log('- Новый email:', newEmail || '(пусто)');
        console.log('- Telegram:', telegram || '(пусто)');
        console.log('- Старый пароль:', oldPassword ? '***' : '(пусто)');
        console.log('- Новый пароль:', newPassword ? '***' : '(пусто)');
        
        // Формируем объект обновлений
        const updates = {};
        
        if (newLogin && newLogin !== currentUser.login) {
            updates.login = newLogin;
            console.log('→ Будет обновлен логин');
        }
        
        if (newEmail && newEmail !== currentUser.email) {
            updates.email = newEmail;
            console.log('→ Будет обновлен email');
        }
        
        if (telegram && telegram !== currentUser.telegram) {
            updates.telegram = telegram;
            console.log('→ Будет обновлен telegram');
        }
        
        if (oldPassword && newPassword) {
            updates.oldPassword = oldPassword;
            updates.newPassword = newPassword;
            console.log('→ Будет обновлен пароль');
        }
        
        console.log('Итоговый объект обновлений:', updates);
        
        // Проверяем есть ли изменения
        if (Object.keys(updates).length === 0) {
            console.log('Нет изменений');
            Notification.warning('Нет изменений для сохранения');
            return;
        }
        
        // Отправляем запрос
        console.log('Отправка запроса на API...');
        const result = await API.updateUser(updates);
        console.log('Ответ от API:', result);
        
        if (result.success) {
            console.log('✅ Данные успешно обновлены!');
            Notification.success('Данные успешно обновлены!');
            
            // Получаем обновленные данные
            const updatedUser = API.getUserFromStorage();
            console.log('Обновленные данные пользователя:', updatedUser);
            
            // Обновляем интерфейс
            updateUserData(updatedUser);
            
            // Очищаем поля ввода
            newLoginInput.value = '';
            newEmailInput.value = '';
            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            
            console.log('Поля очищены');
        } else {
            console.error('❌ Ошибка обновления:', result);
            const errorMsg = result.errors 
                ? result.errors.map(e => e.msg).join('<br>')
                : result.message;
            Notification.error('Ошибка: ' + errorMsg);
        }
    });
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
