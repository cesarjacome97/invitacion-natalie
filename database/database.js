const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// =========================
// UBICACIÓN DE LA BASE DE DATOS
// =========================

// En Deplexo existe un volumen persistente en /data.
// Localmente seguimos utilizando database/invitados.sqlite.

const persistentDataPath = "/data";

const databasePath = fs.existsSync(persistentDataPath)
    ? path.join(persistentDataPath, "invitados.sqlite")
    : path.join(__dirname, "invitados.sqlite");

console.log("Base de datos:", databasePath);

// =========================
// CONEXIÓN
// =========================

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

// =========================
// TABLA DE INVITADOS
// =========================

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