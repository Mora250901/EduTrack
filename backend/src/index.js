const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edutrack-secret-key-2024';
const SALT_ROUNDS = 10;

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
    const { nombre, apellido, grado, seccion, telefono_padre } = req.body;
    
    const { data, error } = await supabase
        .from('alumnos')
        .insert([{ nombre, apellido, grado, seccion, telefono_padre }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Registrar asistencia de un alumno
app.post('/api/asistencias', async (req, res) => {
    const { alumno_id, fecha, estado, observacion, registrado_por } = req.body;
    
    let registradoPorUUID = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (registrado_por && uuidRegex.test(registrado_por)) {
        registradoPorUUID = registrado_por;
    }
    
    const { data, error } = await supabase
        .from('asistencias')
        .insert([{ 
            alumno_id, 
            fecha, 
            estado, 
            observacion, 
            registrado_por: registradoPorUUID 
        }])
        .select();
    
    if (error) {
        console.error('Error al insertar asistencia:', error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
});

// ========== RUTAS ESPECÍFICAS DE ASISTENCIAS (DEBEN IR ANTES DE /:alumno_id) ==========

// Reporte de asistencia por fecha
app.get('/api/asistencias/reporte', async (req, res) => {
    const { fecha } = req.query;
    console.log('Fecha recibida:', fecha);
    
    if (!fecha) {
        return res.status(400).json({ error: 'Fecha no proporcionada' });
    }
    
    try {
        const { data, error } = await supabase
            .from('asistencias')
            .select(`
                *,
                alumnos (nombre, apellido, grado, seccion)
            `)
            .eq('fecha', fecha);
        
        if (error) {
            console.log('Error de Supabase:', error);
            return res.status(500).json({ error: error.message });
        }
        
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
        console.log('Error inesperado:', err);
        res.status(500).json({ error: err.message });
    }
});

// Estadísticas para gráficos
app.get('/api/asistencias/estadisticas', async (req, res) => {
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
app.get('/api/asistencias', async (req, res) => {
    const { data, error } = await supabase
        .from('asistencias')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .order('fecha', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ========== RUTA CON PARÁMETRO (DEBE IR AL FINAL) ==========

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

// Ruta de login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email);
    
    if (error || !usuarios || usuarios.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];
    
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    
    res.json({
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        }
    });
});

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Ruta protegida de ejemplo
app.get('/api/perfil', verificarToken, (req, res) => {
    res.json({ usuario: req.usuario });
});

// Registrar nuevo usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, password: hashedPassword, rol }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// ==================== RUTAS PARA PSICÓLOGO ====================

app.get('/api/casos', async (req, res) => {
    const { data, error } = await supabase
        .from('casos')
        .select('*, alumnos(nombre, apellido, grado, seccion)')
        .order('fecha_creacion', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/api/casos/alumno/:alumno_id', async (req, res) => {
    const { alumno_id } = req.params;
    const { data, error } = await supabase
        .from('casos')
        .select('*, seguimientos(*)')
        .eq('alumno_id', alumno_id)
        .order('fecha_creacion', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/casos', async (req, res) => {
    const { alumno_id, titulo, descripcion, prioridad, creado_por } = req.body;
    
    const { data, error } = await supabase
        .from('casos')
        .insert([{ alumno_id, titulo, descripcion, prioridad, creado_por, estado: 'activo' }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

app.put('/api/casos/:id/cerrar', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('casos')
        .update({ estado: 'cerrado', fecha_cierre: new Date() })
        .eq('id', id)
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// ==================== RUTAS PARA SEGUIMIENTOS ====================

app.get('/api/seguimientos/caso/:caso_id', async (req, res) => {
    const { caso_id } = req.params;
    const { data, error } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('caso_id', caso_id)
        .order('fecha', { ascending: true });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/seguimientos', async (req, res) => {
    const { caso_id, tipo, descripcion, realizado_por } = req.body;
    
    const { data, error } = await supabase
        .from('seguimientos')
        .insert([{ caso_id, tipo, descripcion, realizado_por }])
        .select();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// ==================== NOTIFICACIONES A PADRES ====================

app.post('/api/notificar/padre', async (req, res) => {
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
    console.log(`Prueba la base de datos: http://localhost:${PORT}/api/alumnos`);
});