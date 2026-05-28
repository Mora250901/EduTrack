import React, { useState } from 'react';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                onLogin(data.usuario);
            } else {
                setError(data.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 60%, #42A5F5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <style>{`
                @keyframes floatUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .login-card {
                    animation: floatUp 0.4s ease forwards;
                }
                .login-input:focus {
                    outline: none;
                    border-color: var(--primary-light) !important;
                    box-shadow: 0 0 0 3px rgba(25,118,210,0.15);
                }
                .login-btn:hover:not(:disabled) {
                    background: var(--primary-dark) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(13,71,161,0.35);
                }
                .login-btn:active {
                    transform: translateY(0);
                }
            `}</style>

            <div className="login-card" style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxWidth: '400px',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
                    padding: '32px 40px 28px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', margin: '0 auto 16px'
                    }}>
                        📚
                    </div>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 }}>EduTrack</h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '6px' }}>
                        Plataforma de Gestión del Bienestar Estudiantil
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '32px 40px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '24px', textAlign: 'center' }}>
                        Inicia sesión para continuar
                    </h2>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Correo electrónico</label>
                            <input
                                className="input login-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@edutrack.com"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Contraseña</label>
                            <input
                                className="input login-input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', bottom: '10px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '16px', color: 'var(--gray-500)'
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '12px',
                                fontSize: '15px',
                                marginTop: '8px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    Ingresando...
                                </>
                            ) : 'Ingresar →'}
                        </button>
                    </form>

                    
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default Login;