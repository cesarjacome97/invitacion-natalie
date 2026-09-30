const express = require("express");
const path = require("path");

const db = require("./database/database");
const event = require("./config/event");
const rsvpRoutes = require("./routes/rsvp");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// API RSVP
app.use("/api/rsvp", rsvpRoutes);

// Información del evento
app.get("/api/event", (req, res) => {
    res.json(event);
});

// Prueba de base de datos
app.get("/api/database-test", (req, res) => {
    const result = db.prepare("SELECT 1 AS ok").get();

    res.json({
        database: result.ok === 1 ? "OK" : "ERROR"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🤘 XV Metal`);
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Base de datos: SQLite`);
});
