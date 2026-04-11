const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const supabase = require('../lib/supabase');
const verificarToken = require('../middleware/auth');
const validar = require('../middleware/validar');
 
const router = express.Router();
 
const JWT_SECRET = process.env.JWT_SECRET || 'edutrack-secret-key-2024';
const SALT_ROUNDS = 10;
 
const validarLogin = [
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];
 
const validarRegistro = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn(['director', 'psicologo', 'docente']).withMessage('El rol debe ser director, psicologo o docente'),
];
 
// Login
router.post('/login', validarLogin, validar, async (req, res) => {
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
 
// Registro
router.post('/registro', validarRegistro, validar, async (req, res) => {
    const { nombre, email, password, rol } = req.body;
 
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
 
    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, password: hashedPassword, rol }])
        .select();
 
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});
 
// Perfil (protegido)
router.get('/perfil', verificarToken, (req, res) => {
    res.json({ usuario: req.usuario });
});
 
module.exports = router;