const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado, inicia sesión nuevamente' });
    }

    // Error de validación de Supabase
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({ error: 'Error de validación en la base de datos' });
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;