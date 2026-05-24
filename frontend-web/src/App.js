import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Asistencia from './pages/Asistencia';
import Alertas from './pages/Alertas';
import Casos from './pages/Casos';
import Reportes from './pages/Reportes';
import { getAlumnos, getAlertasPendientes, getAsistencias, getCasos, getEstadisticasAsistencia } from './api';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

const rolLabel = {
    director: 'Director',
    psicologo: 'Psicólogo',
    docente: 'Docente'
};

const rolColor = {
    director: '#1565C0',
    psicologo: '#6A1B9A',
    docente: '#2E7D32'
};

function App() {
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
        if (!token || !usuario) return;
        const canal = supabase
            .channel('asistencias-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, async () => {
                const hoy = new Date().toISOString().split('T')[0];
                const asistenciasData = await getAsistencias();
                setAsistenciasHoy(asistenciasData.filter(a => a.fecha === hoy));
                if (usuario.rol === 'director') {
                    const graficoData = await getEstadisticasAsistencia();
                    setDatosGrafico(graficoData);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(canal); };
    }, [token, usuario]);

    useEffect(() => {
        setStats({
            totalAlumnos: alumnos.length,
            alertasPendientes: alertas.length,
            presentesHoy: asistenciasHoy.filter(a => a.estado === 'presente').length,
            ausentesHoy: asistenciasHoy.filter(a => a.estado === 'ausente').length
        });
    }, [alumnos, alertas, asistenciasHoy]);

    const handleAlumnoCreado = (nuevoAlumno) => setAlumnos(prev => [...prev, nuevoAlumno]);
    const handleAlertaAtendida = (id) => setAlertas(prev => prev.filter(a => a.id !== id));
    const handleCasoCreado = (caso) => setCasos(prev => [caso, ...prev]);
    const handleCasoCerrado = (id) => setCasos(prev => prev.map(c => c.id === id ? { ...c, estado: 'cerrado' } : c));

    const navItems = [
        { key: 'dashboard',  label: '🏠 Inicio',     roles: ['director', 'psicologo', 'docente'] },
        { key: 'alumnos',    label: '👥 Alumnos',    roles: ['director', 'psicologo'] },
        { key: 'asistencia', label: '📝 Asistencia', roles: ['docente', 'director'] },
        { key: 'alertas',    label: '⚠️ Alertas',    roles: ['psicologo', 'director'] },
        { key: 'casos',      label: '🧠 Casos',      roles: ['psicologo'] },
        { key: 'reportes',   label: '📊 Reportes',   roles: ['director'] },
    ];

    if (!token || !usuario) return <Login onLogin={handleLogin} />;

    const renderVista = () => {
        if (loading) return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--gray-200)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Cargando...</p>
            </div>
        );
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

    const navItemsFiltrados = navItems.filter(item => item.roles.includes(usuario.rol));

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-100)' }}>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* NAVBAR */}
            <nav style={{
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 100%)',
                boxShadow: '0 2px 12px rgba(13,71,161,0.25)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            📚
                        </div>
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '18px', letterSpacing: '-0.3px' }}>EduTrack</span>
                    </div>

                    {/* Nav items - desktop */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {navItemsFiltrados.map(item => (
                            <button
                                key={item.key}
                                onClick={() => { setVista(item.key); }}
                                style={{
                                    padding: '8px 14px',
                                    background: vista === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: vista === item.key ? '600' : '400',
                                    transition: 'var(--transition)',
                                    opacity: vista === item.key ? 1 : 0.85,
                                    borderBottom: vista === item.key ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                }}
                                onMouseEnter={e => { if (vista !== item.key) e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={e => { if (vista !== item.key) e.target.style.background = 'transparent'; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Usuario y logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: 'rgba(255,255,255,0.25)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: '700', color: 'white'
                            }}>
                                {usuario.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ lineHeight: '1.2' }}>
                                <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{usuario.nombre}</div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{rolLabel[usuario.rol]}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'var(--transition)'
                            }}
                            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            Salir
                        </button>
                    </div>
                </div>

                {/* Barra de rol */}
                <div style={{
                    background: rolColor[usuario.rol],
                    height: '3px',
                    transition: 'var(--transition-slow)'
                }} />
            </nav>

            {/* CONTENIDO */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }} className="fade-in">
                {renderVista()}
            </main>
        </div>
    );
}

export default App;