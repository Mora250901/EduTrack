import React, { useState } from 'react';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f0f0'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '350px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>📚 EduTrack</h1>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px' }}>Iniciar Sesión</h2>
                
                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#f44336',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
                
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    <p>Usuarios de prueba:</p>
                    <p>director@edutrack.com / admin123</p>
                    <p>psicologo@edutrack.com / admin123</p>
                    <p>docente@edutrack.com / admin123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;