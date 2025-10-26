// Скрипт создания админ-аккаунтов
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Админ-аккаунты с очень сложными логинами
const admins = [
    {
        email: 'admin@duopartners.secure',
        login: 'adm_kx9p2w7q4m8n', // Случайный, невозможно угадать
        password: 'Admin@DuoP2024!Secure', // Сложный пароль
        telegram: '@admin_duo',
        role: 'admin'
    },
    {
        email: 'superadmin@duopartners.secure',
        login: 'sadm_v5h3t8k2r9x1', // Случайный
        password: 'SuperAdmin@Duo2024#X', // Сложный пароль
        telegram: '@superadmin_duo',
        role: 'admin'
    }
];

async function createAdmins() {
    console.log('🔐 Создание админ-аккаунтов...\n');
    
    for (const admin of admins) {
        try {
            // Проверяем существует ли уже
            const existing = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE login = ? OR email = ?', 
                    [admin.login, admin.email], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (existing) {
                console.log(`⚠️  Аккаунт ${admin.login} уже существует, пропускаем`);
                continue;
            }
            
            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            
            // Создаём админа
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (email, login, password, telegram, role, balance) VALUES (?, ?, ?, ?, ?, 0)',
                    [admin.email, admin.login, hashedPassword, admin.telegram, admin.role],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });
            
            console.log('✅ Админ создан:');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Логин: ${admin.login}`);
            console.log(`   Пароль: ${admin.password}`);
            console.log(`   Роль: ${admin.role}\n`);
            
        } catch (error) {
            console.error(`❌ Ошибка при создании ${admin.login}:`, error);
        }
    }
    
    console.log('✅ Все админы созданы!\n');
    console.log('📝 СОХРАНИ ЭТИ ДАННЫЕ:');
    console.log('=' .repeat(60));
    admins.forEach((admin, i) => {
        console.log(`\nАдмин ${i + 1}:`);
        console.log(`Email: ${admin.email}`);
        console.log(`Логин: ${admin.login}`);
        console.log(`Пароль: ${admin.password}`);
    });
    console.log('\n' + '='.repeat(60));
    
    db.close();
}

createAdmins();
