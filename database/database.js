const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "invitados.sqlite");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS invitados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        telefono TEXT,
        asistentes INTEGER NOT NULL DEFAULT 1,
        confirmacion TEXT NOT NULL DEFAULT 'pendiente',
        mensaje TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;