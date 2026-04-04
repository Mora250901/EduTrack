const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba (para verificar que el servidor funciona)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'EduTrack API funcionando correctamente' 
    });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenido a la API de EduTrack' 
    });
});

// Ruta para obtener todos los alumnos (prueba de base de datos)
app.get('/api/alumnos', async (req, res) => {
    const { data, error } = await supabase
        .from('alumnos')
        .select('*');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear un nuevo alumno
app.post('/api/alumnos', async (req, res) => {
    const { nombre, apellido, grado, seccion } = req.body;
    
    const { data, error } = await supabase
        .from('alumnos')
        .insert([{ nombre, apellido, grado, seccion }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Registrar asistencia de un alumno
app.post('/api/asistencias', async (req, res) => {
    const { alumno_id, fecha, estado, observacion, registrado_por } = req.body;
    
    const { data, error } = await supabase
        .from('asistencias')
        .insert([{ alumno_id, fecha, estado, observacion, registrado_por }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Obtener asistencias de un alumno específico
app.get('/api/asistencias/:alumno_id', async (req, res) => {
    const { alumno_id } = req.params;
    
    const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('alumno_id', alumno_id)
        .order('fecha', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear una alerta para un alumno
app.post('/api/alertas', async (req, res) => {
    const { alumno_id, tipo, nivel, mensaje } = req.body;
    
    const { data, error } = await supabase
        .from('alertas')
        .insert([{ alumno_id, tipo, nivel, mensaje }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Obtener alertas no atendidas
app.get('/api/alertas/pendientes', async (req, res) => {
    const { data, error } = await supabase
        .from('alertas')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .eq('atendida', false)
        .order('fecha_creacion', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Marcar alerta como atendida
app.put('/api/alertas/:id/atender', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('alertas')
        .update({ atendida: true })
        .eq('id', id)
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
    console.log(`Prueba la base de datos: http://localhost:${PORT}/api/alumnos`);
});