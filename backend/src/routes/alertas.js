const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// Crear una alerta
router.post('/', async (req, res) => {
    const { alumno_id, tipo, nivel, mensaje } = req.body;

    const { data, error } = await supabase
        .from('alertas')
        .insert([{ alumno_id, tipo, nivel, mensaje }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Obtener alertas pendientes (debe ir antes de /:id)
router.get('/pendientes', async (req, res) => {
    const { data, error } = await supabase
        .from('alertas')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .eq('atendida', false)
        .order('fecha_creacion', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Marcar alerta como atendida
router.put('/:id/atender', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('alertas')
        .update({ atendida: true })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;