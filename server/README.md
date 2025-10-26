# DUO PARTNERS - Система аутентификации

## Описание

Полнофункциональная серверная система с базой данных для управления аккаунтами пользователей на сайте DUO PARTNERS.

## Технологии

- **Backend**: Node.js + Express
- **База данных**: SQLite
- **Аутентификация**: JWT токены
- **Безопасность**: bcryptjs для хеширования паролей

## Установка и запуск

### 1. Установка зависимостей

Откройте терминал в папке `server` и выполните:

```bash
npm install
```

Это установит все необходимые пакеты:
- express - веб-сервер
- cors - для кросс-доменных запросов
- sqlite3 - база данных
- bcryptjs - хеширование паролей
- jsonwebtoken - JWT токены
- express-validator - валидация данных
- nodemailer - отправка email (для восстановления пароля)

### 2. Запуск сервера

```bash
npm start
```

Или для режима разработки с автоперезагрузкой:

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

### 3. Проверка работы сервера

После запуска вы должны увидеть в консоли:
```
Server running on http://localhost:3000
Connected to SQLite database
Database initialized
```

## Структура базы данных

База данных `database.db` создается автоматически при первом запуске сервера.

### Таблица users:

| Поле              | Тип      | Описание                          |
|-------------------|----------|-----------------------------------|
| id                | INTEGER  | Уникальный ID пользователя        |
| email             | TEXT     | Email (уникальный)                |
| login             | TEXT     | Логин (уникальный)                |
| password          | TEXT     | Хешированный пароль               |
| telegram          | TEXT     | Telegram юзернейм (опционально)   |
| balance           | REAL     | Баланс пользователя (0 по умолчанию) |
| created_at        | DATETIME | Дата создания аккаунта            |
| last_login        | DATETIME | Дата последнего входа             |
| reset_token       | TEXT     | Токен для сброса пароля           |
| reset_token_expiry| DATETIME | Срок действия токена              |

## API Endpoints

### Регистрация
- **URL**: `/api/register`
- **Метод**: `POST`
- **Тело запроса**:
```json
{
  "email": "user@example.com",
  "login": "username",
  "password": "password123",
  "telegram": "@username"
}
```
- **Ответ при успехе**:
```json
{
  "success": true,
  "message": "Регистрация успешна",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "login": "username",
    "telegram": "@username",
    "balance": 0
  }
}
```

### Вход
- **URL**: `/api/login`
- **Метод**: `POST`
- **Тело запроса**:
```json
{
  "emailOrLogin": "user@example.com",
  "password": "password123"
}
```
- **Ответ при успехе**:
```json
{
  "success": true,
  "message": "Вход выполнен успешно",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "login": "username",
    "telegram": "@username",
    "balance": 0
  }
}
```

### Сброс пароля
- **URL**: `/api/reset-password`
- **Метод**: `POST`
- **Тело запроса**:
```json
{
  "emailOrLogin": "user@example.com"
}
```
- **Ответ**:
```json
{
  "success": true,
  "message": "Письмо с инструкцией отправлено на email",
  "resetToken": "reset_token"
}
```

### Получение данных пользователя
- **URL**: `/api/user`
- **Метод**: `GET`
- **Заголовки**: `Authorization: Bearer <token>`
- **Ответ**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "login": "username",
    "telegram": "@username",
    "balance": 0
  }
}
```

### Обновление данных пользователя
- **URL**: `/api/user/update`
- **Метод**: `PUT`
- **Заголовки**: `Authorization: Bearer <token>`
- **Тело запроса**:
```json
{
  "email": "newemail@example.com",
  "login": "newusername",
  "telegram": "@newusername",
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```
- **Ответ**:
```json
{
  "success": true,
  "message": "Данные обновлены успешно",
  "user": {
    "email": "newemail@example.com",
    "login": "newusername",
    "telegram": "@newusername"
  }
}
```

## Тестирование в реальном времени

### Шаг 1: Запуск сервера

1. Откройте терминал в папке `server`
2. Выполните `npm install` (только первый раз)
3. Выполните `npm start`
4. Сервер должен запуститься на порту 3000

### Шаг 2: Открытие сайта

1. Откройте браузер
2. Перейдите к файлу `user/registration/index.html` в вашем проекте
   - Можно открыть через Live Server в VS Code
   - Или через прямой путь: `file:///C:/Users/rys/Desktop/site/user/registration/index.html`

### Шаг 3: Тестирование регистрации

1. Откройте страницу регистрации (`user/registration/index.html`)
2. Заполните все поля:
   - Email: `test@example.com`
   - Пароль: `password123`
   - Повтор пароля: `password123`
   - Telegram: `@testuser`
3. Отметьте чекбокс "Я ознакомился с правилами"
4. Нажмите "ЗАРЕГИСТРИРОВАТЬСЯ"
5. При успехе вы увидите alert "Регистрация успешна!" и будете перенаправлены на dashboard

### Шаг 4: Проверка данных в dashboard

После регистрации/входа:
1. Вы должны увидеть баланс "0₽" в правом верхнем углу
2. Нажмите на иконку профиля (человечек)
3. Откроется модальное окно "НАСТРОЙКИ АККАУНТА"
4. В полях должны отобразиться:
   - Актуальный логин: ваш логин
   - Актуальный email: ваш email
   - Telegram-аккаунт: ваш telegram

### Шаг 5: Тестирование входа

1. Откройте страницу входа (`user/login/index.html`)
2. Введите email или логин: `test@example.com`
3. Введите пароль: `password123`
4. Нажмите "ВОЙТИ"
5. При успехе вы будете перенаправлены на dashboard с вашими данными

### Шаг 6: Тестирование обновления данных

1. В dashboard нажмите на профиль
2. В модальном окне "НАСТРОЙКИ АККАУНТА" перейдите на вкладку "Логин" или другую
3. Заполните "Новый логин" или другие поля
4. Нажмите "Сохранить"
5. Данные должны обновиться, и вы увидите alert "Данные успешно обновлены!"

### Шаг 7: Тестирование сброса пароля

1. Откройте страницу сброса пароля (`user/reset-password/index.html`)
2. Введите email или логин
3. Нажмите "ВОССТАНОВИТЬ"
4. Должно появиться второе окно с сообщением о том, что письмо отправлено
5. В консоли сервера будет напечатан reset token

### Шаг 8: Проверка базы данных

Чтобы просмотреть содержимое базы данных:

1. Установите SQLite Browser: https://sqlitebrowser.org/
2. Откройте файл `server/database.db`
3. Перейдите на вкладку "Browse Data"
4. Выберите таблицу "users"
5. Вы увидите все зарегистрированные аккаунты

Или через командную строку:
```bash
cd server
sqlite3 database.db
SELECT * FROM users;
.exit
```

## Проверка через DevTools

1. Откройте Developer Tools (F12)
2. Перейдите на вкладку "Application" (Chrome) или "Storage" (Firefox)
3. Посмотрите Local Storage:
   - `authToken` - JWT токен авторизации
   - `user` - данные пользователя в JSON формате

## Проверка через API инструменты

### Использование Postman или Insomnia:

1. **Регистрация**:
   - Method: POST
   - URL: http://localhost:3000/api/register
   - Body (JSON):
   ```json
   {
     "email": "test2@example.com",
     "login": "testuser2",
     "password": "password123",
     "telegram": "@testuser2"
   }
   ```

2. **Вход**:
   - Method: POST
   - URL: http://localhost:3000/api/login
   - Body (JSON):
   ```json
   {
     "emailOrLogin": "test2@example.com",
     "password": "password123"
   }
   ```

3. **Получение данных** (скопируйте token из ответа выше):
   - Method: GET
   - URL: http://localhost:3000/api/user
   - Headers: `Authorization: Bearer <ваш_token>`

## Возможные проблемы и решения

### Ошибка "CORS"
Если появляется ошибка CORS, убедитесь что сервер запущен на порту 3000 и включен CORS в server.js.

### Ошибка "Failed to fetch"
- Проверьте что сервер запущен (`npm start`)
- Проверьте что URL в api.js правильный: `http://localhost:3000/api`

### Не сохраняется токен
Проверьте консоль браузера (F12) на наличие ошибок JavaScript.

### База данных не создается
Убедитесь что у вас есть права на запись в папку `server`.

## Безопасность

- Пароли хешируются с помощью bcrypt перед сохранением
- JWT токены действительны 7 дней
- Reset токены действительны 1 час
- В production замените `JWT_SECRET` на настоящий секретный ключ

## Дополнительные возможности

Для расширения функционала можно добавить:
- Email отправку для восстановления пароля (nodemailer уже подключен)
- 2FA аутентификацию
- Роли пользователей (admin, user, partner)
- История транзакций
- Логирование действий

## Контакты

Если возникли проблемы, проверьте логи сервера в терминале.
