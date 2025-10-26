document.addEventListener('DOMContentLoaded', async function() {
    if (!API.isAuthenticated()) {
        const isLoginPage = window.location.pathname.includes('/user/login') || 
                           window.location.pathname.includes('/user/registration') ||
                           window.location.pathname.includes('/user/reset-password');
        
        if (!isLoginPage) {
            window.location.href = '/user/login/index.html';
            return;
        }
        return;
    }
    
    let user = API.getUserFromStorage();
    
    if (user) {
        updateUserData(user);
    } else {
        const result = await API.getUserFromServer();
        if (result.success) {
            updateUserData(result.user);
        } else {
            console.error('Failed to load user data');
        }
    }
});

function updateUserData(user) {
    if (!user) {
        console.error('User data is undefined');
        return;
    }
    
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        const balance = user.balance !== undefined && user.balance !== null ? user.balance : 0;
        balanceElement.textContent = `${balance}₽`;
    }
    
    const loginInputs = document.querySelectorAll('.sts_ac input[placeholder="example-login"]');
    loginInputs.forEach(input => {
        input.value = user.login || '';
    });
    
    const emailInputs = document.querySelectorAll('.sts_ac input[placeholder="example@gmail.com"]');
    emailInputs.forEach(input => {
        input.value = user.email || '';
    });
    
    const telegramInputs = document.querySelectorAll('.sts_ac .telegram input');
    telegramInputs.forEach(input => {
        input.value = user.telegram || '';
    });
    
    setupAccountSettings(user);
}

function setupAccountSettings(user) {
    const saveButton = document.querySelector('.sts_ac .ac_btn button');
    
    if (saveButton) {
        // Удаляем старый обработчик если есть
        const newButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newButton, saveButton);
        
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            console.log('Кнопка Сохранить нажата');
            
            // Получаем актуальные данные пользователя
            const currentUser = API.getUserFromStorage();
            console.log('Текущий пользователь:', currentUser);
            
            // Находим все инпуты в правильном порядке
            const allInputs = document.querySelectorAll('.sts_ac .log_input input');
            console.log('Найдено инпутов:', allInputs.length);
            
            const currentLoginInput = allInputs[0];
            const newLoginInput = allInputs[1];
            const currentEmailInput = allInputs[2];
            const newEmailInput = allInputs[3];
            const oldPasswordInput = allInputs[4];
            const newPasswordInput = allInputs[5];
            const telegramInput = allInputs[6];
            
            const newLogin = newLoginInput?.value.trim();
            const newEmail = newEmailInput?.value.trim();
            const oldPassword = oldPasswordInput?.value;
            const newPassword = newPasswordInput?.value;
            const telegram = telegramInput?.value.trim();
            
            console.log('Введенные данные:', { newLogin, newEmail, telegram, hasOldPassword: !!oldPassword, hasNewPassword: !!newPassword });
            
            const updates = {};
            
            if (newLogin && newLogin !== currentUser.login) {
                updates.login = newLogin;
                console.log('Будет обновлен логин:', newLogin);
            }
            
            if (newEmail && newEmail !== currentUser.email) {
                updates.email = newEmail;
                console.log('Будет обновлен email:', newEmail);
            }
            
            if (telegram && telegram !== currentUser.telegram) {
                updates.telegram = telegram;
                console.log('Будет обновлен telegram:', telegram);
            }
            
            if (oldPassword && newPassword) {
                updates.oldPassword = oldPassword;
                updates.newPassword = newPassword;
                console.log('Будет обновлен пароль');
            }
            
            console.log('Объект обновлений:', updates);
            
            if (Object.keys(updates).length === 0) {
                Notification.warning('Нет изменений для сохранения');
                return;
            }
            
            console.log('Отправка запроса на сервер...');
            const result = await API.updateUser(updates);
            console.log('Ответ сервера:', result);
            
            if (result.success) {
                Notification.success('Данные успешно обновлены!');
                
                // Ждем немного чтобы localStorage обновился
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const updatedUser = API.getUserFromStorage();
                console.log('Обновленный пользователь:', updatedUser);
                updateUserData(updatedUser);
                
                // Обновляем текущие данные и очищаем поля ввода
                currentLoginInput.value = updatedUser.login;
                currentEmailInput.value = updatedUser.email;
                
                newLoginInput.value = '';
                newEmailInput.value = '';
                oldPasswordInput.value = '';
                newPasswordInput.value = '';
            } else {
                const errorMsg = result.errors 
                    ? result.errors.map(e => e.msg).join('<br>')
                    : result.message;
                Notification.error('Ошибка обновления: ' + errorMsg);
            }
        });
    }
}

function setupLogout() {
    const logoutButtons = document.querySelectorAll('.logout, .exit-account, [data-logout]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            API.logout();
            window.location.href = '/user/login/index.html';
        });
    });
}

setupLogout();
