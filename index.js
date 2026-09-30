const express = require("express");
const path = require("path");

const db = require("./database/database");
const event = require("./config/event");
const rsvpRoutes = require("./routes/rsvp");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ARCHIVOS ESTÁTICOS
// =====================================================

// En Vercel, los archivos dentro de /public se sirven
// directamente como archivos estáticos.
// Express no necesita servirlos mediante express.static().
if (!process.env.VERCEL) {
    app.use(
        express.static(
            path.join(__dirname, "public")
        )
    );
}

// =====================================================
// RUTAS API
// =====================================================

app.use("/api/rsvp", rsvpRoutes);

app.get("/api/event", (req, res) => {
    res.json(event);
});

app.get("/api/database-test", (req, res) => {

    try {

        const result =
            db.prepare(
                "SELECT 1 AS ok"
            ).get();

        res.json({
            database:
                result.ok === 1
                    ? "OK"
                    : "ERROR"
        });

    } catch (error) {

        console.error(
            "Error comprobando base de datos:",
            error
        );

        res.status(500).json({
            database: "ERROR"
        });

    }

});

// =====================================================
// MANEJO DE ERRORES
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        "Error del servidor:",
        error
    );

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        error: "Error interno del servidor."
    });

});

// =====================================================
// DESARROLLO LOCAL
// =====================================================

// Vercel se encarga de ejecutar la aplicación.
// Localmente seguimos usando npm start.

if (!process.env.VERCEL) {

    app.listen(
        PORT,
        () => {

            console.log("🤘 XV Metal");
            console.log(
                `Servidor: http://localhost:${PORT}`
            );
            console.log(
                "Base de datos: SQLite"
            );

        }
    );

}

// =====================================================
// EXPORTAR EXPRESS
// =====================================================

module.exports = app;
