const express = require('express');
const { body } = require('express-validator');
const supabase = require('../lib/supabase');
const validar = require('../middleware/validar');
 
const router = express.Router();
 
const validarAlumno = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
    body('grado').isIn(['1','2','3','4','5','6']).withMessage('El grado debe ser entre 1 y 6'),
    body('seccion').isIn(['A','B','C']).withMessage('La sección debe ser A, B o C'),
    body('telefono_padre').optional().isMobilePhone().withMessage('El teléfono del padre no es válido'),
];
 
// Obtener todos los alumnos
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('alumnos')
        .select('*');
 
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
 
// Crear un nuevo alumno
router.post('/', validarAlumno, validar, async (req, res) => {
    const { nombre, apellido, grado, seccion, telefono_padre } = req.body;
 
    const { data, error } = await supabase
        .from('alumnos')
        .insert([{ nombre, apellido, grado, seccion, telefono_padre }])
        .select();
 
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});
 
module.exports = router;