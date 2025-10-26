// Создание таблицы materials для креативов и мануалов
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Создаём таблицу materials
db.run(`CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    format TEXT,
    size TEXT,
    preview_image TEXT,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Ошибка создания таблицы:', err);
    } else {
        console.log('✅ Таблица materials создана!');
        
        // Проверяем структуру
        db.all(`PRAGMA table_info(materials)`, (err, columns) => {
            if (err) {
                console.error('Ошибка проверки:', err);
            } else {
                console.log('\n📋 Структура таблицы materials:');
                columns.forEach(col => {
                    console.log(`  - ${col.name}: ${col.type}`);
                });
            }
            
            db.close();
        });
    }
});
