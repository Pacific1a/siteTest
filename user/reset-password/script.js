document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('email-form');
    const passwordForm = document.getElementById('password-form');
    const successForm = document.getElementById('success-form');
    
    const emailInput = document.getElementById('reset-email');
    const sendResetBtn = document.getElementById('send-reset');
    
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const tokenDisplay = document.getElementById('token-display');
    
    let resetToken = '';
    let userEmail = '';
    
    // Проверяем есть ли токен в URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
        // Если токен есть - сразу показываем форму смены пароля
        resetToken = tokenFromUrl;
        tokenDisplay.textContent = 'Токен получен из ссылки';
        emailForm.style.display = 'none';
        passwordForm.style.display = 'flex';
    }
    
    // Шаг 1: Запрос токена
    sendResetBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const emailOrLogin = emailInput.value.trim();
        
        if (!emailOrLogin) {
            Toast.warning('Пожалуйста, введите email или логин');
            return;
        }
        
        const result = await API.resetPassword(emailOrLogin);
        
        if (result.success) {
            resetToken = result.resetToken || result.resetLink;
            userEmail = emailOrLogin;
            
            // Если есть ссылка - показываем её
            if (result.resetLink) {
                Toast.success('Ссылка для сброса отправлена на email! (Проверьте консоль)');
                tokenDisplay.innerHTML = `<a href="${result.resetLink}" target="_blank" style="color: #ff0000;">${result.resetLink}</a>`;
            } else {
                Toast.success('Письмо отправлено на email!');
                tokenDisplay.textContent = 'Проверьте вашу почту';
            }
            
            // Извлекаем токен из ссылки если нужно
            if (result.resetLink && result.resetLink.includes('token=')) {
                const urlToken = new URL(result.resetLink).searchParams.get('token');
                if (urlToken) resetToken = urlToken;
            }
            
            emailForm.style.display = 'none';
            passwordForm.style.display = 'flex';
        } else {
            Toast.error('Ошибка: ' + result.message);
        }
    });
    
    // Шаг 2: Установка нового пароля
    resetPasswordBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!newPassword || !confirmPassword) {
            Toast.warning('Пожалуйста, заполните оба поля');
            return;
        }
        
        if (newPassword.length < 6) {
            Toast.warning('Пароль должен быть минимум 6 символов');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            Toast.error('Пароли не совпадают');
            return;
        }
        
        const result = await API.confirmPasswordReset(resetToken, newPassword);
        
        if (result.success) {
            Toast.success('Пароль успешно изменён!');
            
            passwordForm.style.display = 'none';
            successForm.style.display = 'flex';
        } else {
            Toast.error('Ошибка: ' + result.message);
        }
    });
});
