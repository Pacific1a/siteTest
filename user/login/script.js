document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.sign-in .group');
    const emailInput = form.querySelector('.email');
    const passwordInput = form.querySelector('.password');
    const loginButton = form.querySelector('.login-button');
    
    loginButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const emailOrLogin = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!emailOrLogin || !password) {
            Toast.warning('Пожалуйста, заполните все поля');
            return;
        }
        
        const result = await API.login(emailOrLogin, password);
        
        if (result.success) {
            Toast.success('Вход выполнен успешно! Перенаправление...');
            setTimeout(() => {
                window.location.href = '../../dashboard/index.html';
            }, 1000);
        } else {
            Toast.error('Ошибка входа: ' + result.message);
        }
    });
});
