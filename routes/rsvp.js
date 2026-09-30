const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const db = require("../database/database");

// Genera un código corto para identificar la invitación
function generateCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Registrar RSVP
router.post("/", (req, res) => {
    try {
        const {
            nombre,
            telefono,
            asistentes,
            confirmacion,
            mensaje
        } = req.body;

        // Validaciones
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: "El nombre es obligatorio."
            });
        }

        if (!["confirmado", "rechazado"].includes(confirmacion)) {
            return res.status(400).json({
                error: "La confirmación no es válida."
            });
        }

        const numeroAsistentes = Number(asistentes);

        if (
            confirmacion === "confirmado" &&
            (!Number.isInteger(numeroAsistentes) ||
                numeroAsistentes < 1 ||
                numeroAsistentes > 10)
        ) {
            return res.status(400).json({
                error: "El número de asistentes no es válido."
            });
        }

        const codigo = generateCode();

        const insert = db.prepare(`
            INSERT INTO invitados (
                codigo,
                nombre,
                telefono,
                asistentes,
                confirmacion,
                mensaje
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            codigo,
            nombre.trim(),
            telefono?.trim() || null,
            confirmacion === "confirmado" ? numeroAsistentes : 0,
            confirmacion,
            mensaje?.trim() || null
        );

        res.status(201).json({
            success: true,
            codigo
        });

    } catch (error) {
        console.error("Error registrando RSVP:", error);

        res.status(500).json({
            error: "No fue posible registrar la confirmación."
        });
    }
});


// Consultar RSVP por código
router.get("/:codigo", (req, res) => {
    try {
        const invitado = db
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
            .get(req.params.codigo.toUpperCase());

        if (!invitado) {
            return res.status(404).json({
                error: "Invitación no encontrada."
            });
        }

        res.json(invitado);

    } catch (error) {
        console.error("Error consultando RSVP:", error);

        res.status(500).json({
            error: "No fue posible consultar la invitación."
        });
    }
});


module.exports = router;
