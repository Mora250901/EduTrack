import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Asistencia from './pages/Asistencia';
import Alertas from './pages/Alertas';
import Casos from './pages/Casos';
import Reportes from './pages/Reportes';
import { getAlumnos, getAlertasPendientes, getAsistencias, getCasos, getEstadisticasAsistencia } from './api';

function App() {
    // ==================== ESTADO GLOBAL ====================
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [vista, setVista] = useState('dashboard');

    const [alumnos, setAlumnos] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [asistenciasHoy, setAsistenciasHoy] = useState([]);
    const [casos, setCasos] = useState([]);
    const [datosGrafico, setDatosGrafico] = useState([]);
    const [filtroCasos, setFiltroCasos] = useState('activos');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalAlumnos: 0,
        alertasPendientes: 0,
        presentesHoy: 0,
        ausentesHoy: 0
    });

    // ==================== AUTENTICACIÓN ====================

    const handleLogin = (usuarioData) => {
        setUsuario(usuarioData);
        setToken(localStorage.getItem('token'));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUsuario = localStorage.getItem('usuario');
        if (savedToken && savedUsuario) {
            setToken(savedToken);
            setUsuario(JSON.parse(savedUsuario));
        }
    }, []);

    // ==================== CARGA DE DATOS ====================

    useEffect(() => {
        if (!token || !usuario) return;

        const cargarDatos = async () => {
            setLoading(true);
            try {
                const [alumnosData, alertasData, asistenciasData] = await Promise.all([
                    getAlumnos(),
                    getAlertasPendientes(),
                    getAsistencias()
                ]);
                setAlumnos(alumnosData);
                setAlertas(alertasData);
                const hoy = new Date().toISOString().split('T')[0];
                setAsistenciasHoy(asistenciasData.filter(a => a.fecha === hoy));

                if (usuario.rol === 'psicologo') {
                    const casosData = await getCasos();
                    setCasos(casosData);
                }
                if (usuario.rol === 'director') {
                    const graficoData = await getEstadisticasAsistencia();
                    setDatosGrafico(graficoData);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [token, usuario]);

    useEffect(() => {
        setStats({
            totalAlumnos: alumnos.length,
            alertasPendientes: alertas.length,
            presentesHoy: asistenciasHoy.filter(a => a.estado === 'presente').length,
            ausentesHoy: asistenciasHoy.filter(a => a.estado === 'ausente').length
        });
    }, [alumnos, alertas, asistenciasHoy]);

    // ==================== HANDLERS GLOBALES ====================

    const handleAlumnoCreado = (nuevoAlumno) => {
        setAlumnos(prev => [...prev, nuevoAlumno]);
    };

    const handleAlertaAtendida = (id) => {
        setAlertas(prev => prev.filter(a => a.id !== id));
    };

    const handleCasoCreado = (caso) => {
        setCasos(prev => [caso, ...prev]);
    };

    const handleCasoCerrado = (id) => {
        setCasos(prev => prev.map(c => c.id === id ? { ...c, estado: 'cerrado' } : c));
    };

    // ==================== NAVEGACIÓN ====================

    const navItems = [
        { key: 'dashboard', label: '🏠 Inicio', roles: ['director', 'psicologo', 'docente'] },
        { key: 'alumnos', label: '👥 Alumnos', roles: ['director', 'psicologo'] },
        { key: 'asistencia', label: '📝 Asistencia', roles: ['docente', 'director'] },
        { key: 'alertas', label: '⚠️ Alertas', roles: ['psicologo', 'director'] },
        { key: 'casos', label: '🧠 Casos', roles: ['psicologo'] },
        { key: 'reportes', label: '📊 Reportes', roles: ['director'] },
    ];

    // ==================== RENDER ====================

    if (!token || !usuario) {
        return <Login onLogin={handleLogin} />;
    }

    const renderVista = () => {
        if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Cargando...</p>;
        switch (vista) {
            case 'dashboard':  return <Dashboard usuario={usuario} stats={stats} alertas={alertas} asistenciasHoy={asistenciasHoy} datosGrafico={datosGrafico} onAtenderAlerta={handleAlertaAtendida} />;
            case 'alumnos':    return <Alumnos alumnos={alumnos} onAlumnoCreado={handleAlumnoCreado} />;
            case 'asistencia': return <Asistencia alumnos={alumnos} usuario={usuario} />;
            case 'alertas':    return <Alertas alertas={alertas} onAlertaAtendida={handleAlertaAtendida} />;
            case 'casos':      return <Casos casos={casos} alumnos={alumnos} usuario={usuario} onCasoCreado={handleCasoCreado} onCasoCerrado={handleCasoCerrado} filtroCasos={filtroCasos} setFiltroCasos={setFiltroCasos} />;
            case 'reportes':   return <Reportes />;
            default:           return <Dashboard usuario={usuario} stats={stats} alertas={alertas} asistenciasHoy={asistenciasHoy} datosGrafico={datosGrafico} onAtenderAlerta={handleAlertaAtendida} />;
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Navbar */}
            <nav style={{ backgroundColor: '#1976D2', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', padding: '15px 10px' }}>📚 EduTrack</span>
                    {navItems
                        .filter(item => item.roles.includes(usuario.rol))
                        .map(item => (
                            <button
                                key={item.key}
                                onClick={() => setVista(item.key)}
                                style={{
                                    padding: '15px 12px',
                                    backgroundColor: vista === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    borderBottom: vista === item.key ? '3px solid white' : '3px solid transparent'
                                }}
                            >
                                {item.label}
                            </button>
                        ))
                    }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{usuario.nombre} · {usuario.rol}</span>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        Salir
                    </button>
                </div>
            </nav>

            {/* Contenido */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
                {renderVista()}
            </main>
        </div>
    );
}

export default App;