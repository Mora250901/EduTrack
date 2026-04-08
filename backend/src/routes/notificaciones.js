const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// Notificar a padre (simulado)
router.post('/padre', async (req, res) => {
    const { alumno_id, mensaje } = req.body;

    const { data: alumno, error } = await supabase
        .from('alumnos')
        .select('nombre, apellido, telefono_padre')
        .eq('id', alumno_id)
        .single();

    if (error) return res.status(500).json({ error: error.message });

    if (!alumno.telefono_padre) {
        return res.status(400).json({ error: 'El alumno no tiene número de teléfono del padre registrado' });
    }

    console.log(`
    =========================================
    📱 NOTIFICACIÓN WHATSAPP A PADRE (SIMULADA)
    =========================================
    Para: ${alumno.telefono_padre}
    Alumno: ${alumno.nombre} ${alumno.apellido}
    Mensaje: ${mensaje}
    =========================================
    `);

    res.json({
        success: true,
        message: 'Notificación enviada al padre (simulada)'
    });
});

module.exports = router;