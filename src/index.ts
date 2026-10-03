import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import crypto from "crypto";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// DATOS DEL EVENTO
// ========================================

const event = {
    name: "Natalie",
    age: 15,

    event: {
        date: "2026-11-14",
        time: "20:00"
    },

    venue: {
        name: "Privada de las Águilas 35",
        address:
            "Privada de las Águilas 35, Pueblo de San Bartolo Ameyalco",
        city: "Ciudad de México",
        maps:
            "https://maps.google.com/maps?q=19.3326454%2C-99.2637266&z=17&hl=es"
    },

    contact: {
        whatsapp: ""
    }
};

// ========================================
// GENERAR CÓDIGO INTERNO
// ========================================

function generateCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// ========================================
// API DEL EVENTO
// ========================================

app.get("/api/event", (req, res) => {
    res.json(event);
});

// ========================================
// PRUEBA DE BASE DE DATOS
// ========================================

app.get("/api/database-test", async (req, res) => {
    try {
        const result = await env.DB
            .prepare("SELECT 1 AS ok")
            .first();

        res.json({
            database: result?.ok === 1 ? "OK" : "ERROR"
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

// ========================================
// CREAR RSVP
// ========================================

app.post("/api/rsvp", async (req, res) => {
    try {
        const {
            nombre,
            telefono,
            asistentes,
            confirmacion,
            mensaje
        } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: "El nombre es obligatorio."
            });
        }

        if (
            !["confirmado", "rechazado"].includes(
                confirmacion
            )
        ) {
            return res.status(400).json({
                error: "La confirmación no es válida."
            });
        }

        const numeroAsistentes = Number(asistentes);

        if (
            confirmacion === "confirmado" &&
            (
                !Number.isInteger(numeroAsistentes) ||
                numeroAsistentes < 1 ||
                numeroAsistentes > 10
            )
        ) {
            return res.status(400).json({
                error:
                    "El número de asistentes no es válido."
            });
        }

        const codigo = generateCode();

        await env.DB
            .prepare(`
                INSERT INTO invitados (
                    codigo,
                    nombre,
                    telefono,
                    asistentes,
                    confirmacion,
                    mensaje
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
                codigo,
                nombre.trim(),
                telefono?.trim() || null,
                confirmacion === "confirmado"
                    ? numeroAsistentes
                    : 0,
                confirmacion,
                mensaje?.trim() || null
            )
            .run();

        res.status(201).json({
            success: true,
            codigo
        });

    } catch (error) {
        console.error(
            "Error registrando RSVP:",
            error
        );

        res.status(500).json({
            error:
                "No fue posible registrar la confirmación."
        });
    }
});

// ========================================
// CONSULTAR RSVP POR CÓDIGO
// ========================================

app.get("/api/rsvp/:codigo", async (req, res) => {
    try {
        const invitado = await env.DB
            .prepare(`
                SELECT
                    codigo,
                    nombre,
                    telefono,
                    asistentes,
                    confirmacion,
                    mensaje,
                    created_at
                FROM invitados
                WHERE codigo = ?
            `)
            .bind(
                req.params.codigo.toUpperCase()
            )
            .first();

        if (!invitado) {
            return res.status(404).json({
                error: "Invitación no encontrada."
            });
        }

        res.json(invitado);

    } catch (error) {
        console.error(
            "Error consultando RSVP:",
            error
        );

        res.status(500).json({
            error:
                "No fue posible consultar la invitación."
        });
    }
});

// ========================================
// MANEJO DE ERRORES
// ========================================

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

// ========================================
// CLOUDFLARE WORKERS
// ========================================

app.listen(3000);

export default httpServerHandler({
    port: 3000
});