const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// Obtener todos los casos
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('casos')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .order('fecha_creacion', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Obtener casos de un alumno específico (debe ir antes de /:id)
router.get('/alumno/:alumno_id', async (req, res) => {
    const { alumno_id } = req.params;

    const { data, error } = await supabase
        .from('casos')
        .select('*, seguimientos(*)')
        .eq('alumno_id', alumno_id)
        .order('fecha_creacion', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear un caso
router.post('/', async (req, res) => {
    const { alumno_id, titulo, descripcion, prioridad, creado_por } = req.body;

    const { data, error } = await supabase
        .from('casos')
        .insert([{ alumno_id, titulo, descripcion, prioridad, creado_por, estado: 'activo' }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Cerrar un caso
router.put('/:id/cerrar', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('casos')
        .update({ estado: 'cerrado', fecha_cierre: new Date() })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;