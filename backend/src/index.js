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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
    console.log(`Prueba la base de datos: http://localhost:${PORT}/api/alumnos`);
});