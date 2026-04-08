const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// Obtener todos los alumnos
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('alumnos')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear un nuevo alumno
router.post('/', async (req, res) => {
    const { nombre, apellido, grado, seccion, telefono_padre } = req.body;

    const { data, error } = await supabase
        .from('alumnos')
        .insert([{ nombre, apellido, grado, seccion, telefono_padre }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;