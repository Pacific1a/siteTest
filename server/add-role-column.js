// Добавление колонки role в существующую базу
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Колонка role уже существует');
        } else {
            console.error('❌ Ошибка:', err.message);
        }
    } else {
        console.log('✅ Колонка role успешно добавлена!');
    }
    
    // Проверяем структуру таблицы
    db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (err) {
            console.error('Ошибка проверки:', err);
        } else {
            console.log('\n📋 Структура таблицы users:');
            columns.forEach(col => {
                console.log(`  - ${col.name}: ${col.type}${col.dflt_value ? ` (default: ${col.dflt_value})` : ''}`);
            });
        }
        
        db.close();
    });
});
