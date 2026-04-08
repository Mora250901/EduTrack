const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// Obtener seguimientos de un caso
router.get('/caso/:caso_id', async (req, res) => {
    const { caso_id } = req.params;

    const { data, error } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('caso_id', caso_id)
        .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear un seguimiento
router.post('/', async (req, res) => {
    const { caso_id, tipo, descripcion, realizado_por } = req.body;

    const { data, error } = await supabase
        .from('seguimientos')
        .insert([{ caso_id, tipo, descripcion, realizado_por }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;