const express = require('express');
const { body } = require('express-validator');
const supabase = require('../lib/supabase');
const validar = require('../middleware/validar');

const router = express.Router();

const validarAsistencia = [
    body('alumno_id').isUUID().withMessage('El alumno_id no es válido'),
    body('fecha').isDate().withMessage('La fecha no es válida'),
    body('estado').isIn(['presente', 'ausente', 'tarde']).withMessage('El estado debe ser presente, ausente o tarde'),
    body('observacion').optional().isString().withMessage('La observación debe ser texto'),
];

// Verificar si ya existe asistencia para un alumno en una fecha
router.get('/verificar', async (req, res) => {
    const { alumno_id, fecha } = req.query;

    if (!alumno_id || !fecha) {
        return res.status(400).json({ error: 'alumno_id y fecha son requeridos' });
    }

    const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('alumno_id', alumno_id)
        .eq('fecha', fecha)
        .single();

    if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message });
    }

    res.json({ existe: !!data, asistencia: data || null });
});

// Registrar o actualizar asistencia
router.post('/', validarAsistencia, validar, async (req, res) => {
    const { alumno_id, fecha, estado, observacion, registrado_por } = req.body;

    let registradoPorUUID = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (registrado_por && uuidRegex.test(registrado_por)) {
        registradoPorUUID = registrado_por;
    }

    // Verificar si ya existe asistencia para ese alumno en esa fecha
    const { data: existente, error: errorBusqueda } = await supabase
        .from('asistencias')
        .select('*')
        .eq('alumno_id', alumno_id)
        .eq('fecha', fecha)
        .single();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
        return res.status(500).json({ error: errorBusqueda.message });
    }

    if (existente) {
        // Actualizar registro existente
        const { data, error } = await supabase
            .from('asistencias')
            .update({ estado, observacion, registrado_por: registradoPorUUID })
            .eq('id', existente.id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ ...data[0], actualizado: true });
    }

    // Insertar nuevo registro
    const { data, error } = await supabase
        .from('asistencias')
        .insert([{ alumno_id, fecha, estado, observacion, registrado_por: registradoPorUUID }])
        .select();

    if (error) {
        console.error('Error al insertar asistencia:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json({ ...data[0], actualizado: false });
});

// Reporte por fecha (debe ir antes de /:alumno_id)
router.get('/reporte', async (req, res) => {
    const { fecha } = req.query;

    if (!fecha) {
        return res.status(400).json({ error: 'Fecha no proporcionada' });
    }

    try {
        const { data, error } = await supabase
            .from('asistencias')
            .select(`*, alumnos (nombre, apellido, grado, seccion)`)
            .eq('fecha', fecha);

        if (error) return res.status(500).json({ error: error.message });

        const reporte = data.map(item => ({
            alumno_nombre: item.alumnos.nombre,
            alumno_apellido: item.alumnos.apellido,
            grado: item.alumnos.grado,
            seccion: item.alumnos.seccion,
            estado: item.estado,
            observacion: item.observacion
        }));

        res.json(reporte);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Estadísticas para gráficos (debe ir antes de /:alumno_id)
router.get('/estadisticas', async (req, res) => {
    const { data: alumnos, error: alumnosError } = await supabase
        .from('alumnos')
        .select('*');

    if (alumnosError) return res.status(500).json({ error: alumnosError.message });

    const hoy = new Date().toISOString().split('T')[0];
    const { data: asistencias, error: asisError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', hoy);

    if (asisError) return res.status(500).json({ error: asisError.message });

    const grupos = {};
    alumnos.forEach(alumno => {
        const key = `${alumno.grado}_${alumno.seccion}`;
        if (!grupos[key]) {
            grupos[key] = {
                grado: alumno.grado,
                seccion: alumno.seccion,
                total: 0,
                presente: 0,
                ausente: 0,
                tarde: 0
            };
        }
        grupos[key].total++;

        const asistencia = asistencias.find(a => a.alumno_id === alumno.id);
        if (asistencia) {
            if (asistencia.estado === 'presente') grupos[key].presente++;
            else if (asistencia.estado === 'ausente') grupos[key].ausente++;
            else if (asistencia.estado === 'tarde') grupos[key].tarde++;
        }
    });

    const resultado = Object.values(grupos).map(grupo => ({
        grado: grupo.grado,
        seccion: grupo.seccion,
        porcentajePresente: grupo.total > 0 ? (grupo.presente / grupo.total) * 100 : 0,
        porcentajeAusente: grupo.total > 0 ? (grupo.ausente / grupo.total) * 100 : 0,
        porcentajeTarde: grupo.total > 0 ? (grupo.tarde / grupo.total) * 100 : 0
    }));

    res.json(resultado);
});

// Obtener todas las asistencias
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('asistencias')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .order('fecha', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Obtener asistencias de un alumno específico (debe ir al final)
router.get('/:alumno_id', async (req, res) => {
    const { alumno_id } = req.params;

    const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('alumno_id', alumno_id)
        .order('fecha', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;