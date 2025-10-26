// ============================================
// 2FA Management
// ============================================

let currentSecret = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('2FA module loaded');
    
    // Проверяем статус 2FA и показываем нужную кнопку
    await check2FAStatusAndUpdateButtons();
    
    // При открытии модального окна 2FA
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const auth2f = document.querySelector('.auth_2f');
            if (auth2f && auth2f.style.display === 'flex') {
                console.log('2FA modal opened');
                init2FA();
            }
        });
    });
    
    const auth2f = document.querySelector('.auth_2f');
    if (auth2f) {
        observer.observe(auth2f, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Кнопка "Подключить"
    const connectBtn = document.querySelector('.auth_2f .button_2f button');
    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnect2FA);
    }
    
    
    // Автопереключение между полями кода
    setupCodeInputs();
    
    // Копирование секрета
    setupCopyButton();
});

// Инициализация 2FA при открытии модального окна
async function init2FA() {
    console.log('Initializing 2FA...');
    
    // Проверяем статус 2FA
    const status = await API.check2FAStatus();
    console.log('2FA Status:', status);
    
    if (status.enabled) {
        // 2FA уже подключен - показываем форму отключения
        show2FADisableForm();
    } else {
        // 2FA не подключен - генерируем новый секрет
        const setupResult = await API.setup2FA();
        console.log('Setup result:', setupResult);
        
        if (setupResult.success) {
            currentSecret = setupResult.secret;
            
            // Устанавливаем QR код
            const qrImg = document.querySelector('.auth_2f .auth_qr img');
            if (qrImg) {
                qrImg.src = setupResult.qrCode;
            }
            
            // Устанавливаем секрет
            const secretInput = document.querySelector('.auth_2f .input_code input');
            if (secretInput) {
                secretInput.value = setupResult.secret;
            }
            
            // Показываем форму включения
            show2FAEnableForm();
        } else {
            Toast.error('Ошибка генерации 2FA: ' + setupResult.message);
        }
    }
}

// Показываем форму включения 2FA
function show2FAEnableForm() {
    const connectBtn = document.querySelector('.auth_2f .button_2f button');
    if (connectBtn) {
        connectBtn.textContent = 'Подключить';
        connectBtn.onclick = handleConnect2FA;
    }
    
    const infoSpan = document.querySelector('.auth_2f .auth_info span');
    if (infoSpan) {
        infoSpan.textContent = 'Рекомендуем использовать Google Authenticator';
    }
}

// Показываем форму отключения 2FA
function show2FADisableForm() {
    const connectBtn = document.querySelector('.auth_2f .button_2f button');
    if (connectBtn) {
        connectBtn.textContent = 'Отключить 2FA';
        connectBtn.onclick = handleDisconnect2FA;
    }
    
    const infoSpan = document.querySelector('.auth_2f .auth_info span');
    if (infoSpan) {
        infoSpan.textContent = '2FA уже подключен. Введите код для отключения';
    }
    
    // Скрываем QR и секрет
    const qrDiv = document.querySelector('.auth_2f .auth_qr');
    const inputCodeDiv = document.querySelector('.auth_2f .input_code');
    if (qrDiv) qrDiv.style.display = 'none';
    if (inputCodeDiv) inputCodeDiv.style.display = 'none';
}

// Обработчик подключения 2FA
async function handleConnect2FA() {
    console.log('Connect 2FA clicked');
    
    if (!currentSecret) {
        Toast.error('Секрет не сгенерирован');
        return;
    }
    
    // Собираем код из 6 полей
    const codeInputs = document.querySelectorAll('.auth_2f .type_code .code');
    let code = '';
    codeInputs.forEach(input => {
        code += input.value.trim();
    });
    
    console.log('🔑 Отправка данных на сервер:');
    console.log('- Secret:', currentSecret);
    console.log('- Code:', code);
    console.log('- Code length:', code.length);
    
    if (code.length !== 6) {
        Toast.warning('Введите полный код (6 цифр)');
        return;
    }
    
    // Проверка что все символы - цифры
    if (!/^\d{6}$/.test(code)) {
        Toast.error('Код должен содержать только цифры');
        return;
    }
    
    // Отправляем на сервер
    console.log('📡 Отправка запроса...');
    const result = await API.enable2FA(currentSecret, code);
    console.log('📥 Ответ сервера:', result);
    
    if (result.success) {
        // Показываем модалку успеха
        showSuccess();
        
        // Через 5 секунд закрываем окно и обновляем кнопки
        setTimeout(() => {
            hideConditionModals();
            const modal = document.querySelector('.auth_2f');
            if (modal) {
                modal.style.setProperty('display', 'none', 'important');
            }
            
            // Обновляем кнопки - показываем "Отключить 2FA"
            updateButtonsVisibility(true);
        }, 5000);
    } else {
        showError();
        setTimeout(() => {
            hideConditionModals();
        }, 3000);
    }
}

// Обработчик отключения 2FA
async function handleDisconnect2FA() {
    console.log('Disconnect 2FA clicked');
    
    // Собираем код из 6 полей
    const codeInputs = document.querySelectorAll('.auth_2f .type_code .code');
    let code = '';
    codeInputs.forEach(input => {
        code += input.value;
    });
    
    if (code.length !== 6) {
        Toast.warning('Введите код (6 цифр)');
        return;
    }
    
    // Отправляем на сервер
    const result = await API.disable2FA(code);
    console.log('Disable result:', result);
    
    if (result.success) {
        Toast.success('2FA успешно отключен');
        
        // Закрываем окно и обновляем кнопки
        setTimeout(() => {
            const modal = document.querySelector('.auth_2f');
            if (modal) {
                modal.style.setProperty('display', 'none', 'important');
            }
            
            // Обновляем кнопки - показываем "Подключить 2FA"
            updateButtonsVisibility(false);
        }, 1000);
    } else {
        showError();
        setTimeout(() => {
            hideConditionModals();
        }, 3000);
    }
}

// Показываем модалку успеха
function showSuccess() {
    const container = document.querySelector('.btn_condition');
    const successDiv = document.querySelector('.btn_condition .succes');
    
    if (container && successDiv) {
        container.style.setProperty('display', 'flex', 'important');
        successDiv.style.setProperty('display', 'flex', 'important');
    }
}

// Показываем модалку ошибки
function showError() {
    const container = document.querySelector('.btn_condition');
    const errorDiv = document.querySelector('.btn_condition .error');
    
    if (container && errorDiv) {
        container.style.setProperty('display', 'flex', 'important');
        errorDiv.style.setProperty('display', 'flex', 'important');
    }
}

// Скрываем модалки результата
function hideConditionModals() {
    const container = document.querySelector('.btn_condition');
    const successDiv = document.querySelector('.btn_condition .succes');
    const errorDiv = document.querySelector('.btn_condition .error');
    
    if (container) container.style.setProperty('display', 'none', 'important');
    if (successDiv) successDiv.style.setProperty('display', 'none', 'important');
    if (errorDiv) errorDiv.style.setProperty('display', 'none', 'important');
}

// Обновляем видимость кнопок в зависимости от статуса 2FA
function updateButtonsVisibility(isEnabled) {
    const connectBtn = document.querySelector('.auth_2f .button_2f button');
    
    if (!connectBtn) return;
    
    if (isEnabled) {
        // 2FA включена - показываем кнопку "Отключить"
        connectBtn.textContent = 'Отключить 2FA';
        connectBtn.onclick = handleDisconnect2FA;
    } else {
        // 2FA выключена - показываем кнопку "Подключить"
        connectBtn.textContent = 'Подключить';
        connectBtn.onclick = handleConnect2FA;
    }
}

// Проверяем статус 2FA и обновляем кнопки
async function check2FAStatusAndUpdateButtons() {
    const status = await API.check2FAStatus();
    console.log('2FA Status on load:', status);
    
    if (status.success) {
        updateButtonsVisibility(status.enabled);
    }
}




// Настройка автопереключения между полями кода
function setupCodeInputs() {
    const codeInputs = document.querySelectorAll('.auth_2f .type_code .code');
    
    codeInputs.forEach((input, index) => {
        // Автопереход на следующее поле
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        // Backspace - переход на предыдущее поле
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // Только цифры
        input.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
        
        // Вставка кода из буфера
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');
            const digits = paste.replace(/\D/g, '').split('').slice(0, 6);
            
            digits.forEach((digit, i) => {
                if (codeInputs[i]) {
                    codeInputs[i].value = digit;
                }
            });
            
            // Фокус на последнем заполненном поле
            if (digits.length > 0 && codeInputs[Math.min(digits.length - 1, 5)]) {
                codeInputs[Math.min(digits.length - 1, 5)].focus();
            }
        });
    });
}

// Копирование секрета
function setupCopyButton() {
    const copyBtn = document.querySelector('.auth_2f .svg_copy');
    const secretInput = document.querySelector('.auth_2f .input_code input');
    
    if (copyBtn && secretInput) {
        copyBtn.addEventListener('click', function() {
            secretInput.select();
            document.execCommand('copy');
            
            // Анимация копирования
            const iconCopy = copyBtn.querySelector('.icon-copy');
            const iconCheck = copyBtn.querySelector('.icon-check');
            
            if (iconCopy && iconCheck) {
                iconCopy.style.display = 'none';
                iconCheck.style.display = 'block';
                
                setTimeout(() => {
                    iconCopy.style.display = 'block';
                    iconCheck.style.display = 'none';
                }, 1500);
            }
            
            Toast.success('Секрет скопирован!');
        });
    }
}
