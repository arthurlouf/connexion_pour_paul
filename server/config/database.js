// server/config/database.js

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données :', err.message);
        process.exit(1);
    }
    console.log('✅ Connexion à la base de données réussie avec l\'ID :', connection.threadId);
    connection.release();
});

module.exports = db;