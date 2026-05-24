import React, { useState } from 'react';
import { crearCaso, cerrarCaso, crearSeguimiento, getSeguimientosPorCaso } from '../api';

const prioridadConfig = {
    alta:  { color: 'var(--danger)',  bg: 'var(--danger-bg)',  emoji: '🔴' },
    media: { color: 'var(--warning)', bg: 'var(--warning-bg)', emoji: '🟡' },
    baja:  { color: 'var(--success)', bg: 'var(--success-bg)', emoji: '🟢' },
};

function Casos({ casos, alumnos, usuario, onCasoCreado, onCasoCerrado, filtroCasos, setFiltroCasos }) {
    const [mostrarFormularioCaso, setMostrarFormularioCaso] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
    const [nuevoCaso, setNuevoCaso] = useState({ titulo: '', descripcion: '', prioridad: 'media' });
    const [creandoCaso, setCreandoCaso] = useState(false);

    const [seguimientos, setSeguimientos] = useState({});
    const [mostrarSeguimientos, setMostrarSeguimientos] = useState(false);
    const [casoSeleccionado, setCasoSeleccionado] = useState(null);
    const [nuevoSeguimiento, setNuevoSeguimiento] = useState({ tipo: 'entrevista', descripcion: '' });
    const [creandoSeguimiento, setCreandoSeguimiento] = useState(false);

    const handleCrearCaso = async (e) => {
        e.preventDefault();
        setCreandoCaso(true);
        try {
            const caso = await crearCaso({
                alumno_id: alumnoSeleccionado,
                titulo: nuevoCaso.titulo,
                descripcion: nuevoCaso.descripcion,
                prioridad: nuevoCaso.prioridad,
                creado_por: usuario?.id
            });
            onCasoCreado(caso);
            setNuevoCaso({ titulo: '', descripcion: '', prioridad: 'media' });
            setAlumnoSeleccionado('');
            setMostrarFormularioCaso(false);
        } catch (error) {
            console.error('Error al crear caso:', error);
        } finally {
            setCreandoCaso(false);
        }
    };

    const handleCerrarCaso = async (id) => {
        try {
            await cerrarCaso(id);
            onCasoCerrado(id);
        } catch (error) {
            console.error('Error al cerrar caso:', error);
        }
    };

    const handleVerSeguimientos = async (caso) => {
        setCasoSeleccionado(caso);
        setMostrarSeguimientos(true);
        if (!seguimientos[caso.id]) {
            const data = await getSeguimientosPorCaso(caso.id);
            setSeguimientos(prev => ({ ...prev, [caso.id]: data }));
        }
    };

    const handleCrearSeguimiento = async (e) => {
        e.preventDefault();
        setCreandoSeguimiento(true);
        try {
            const seg = await crearSeguimiento({
                caso_id: casoSeleccionado.id,
                tipo: nuevoSeguimiento.tipo,
                descripcion: nuevoSeguimiento.descripcion,
                realizado_por: usuario?.id
            });
            setSeguimientos(prev => ({
                ...prev,
                [casoSeleccionado.id]: [...(prev[casoSeleccionado.id] || []), seg]
            }));
            setNuevoSeguimiento({ tipo: 'entrevista', descripcion: '' });
        } catch (error) {
            console.error('Error al crear seguimiento:', error);
        } finally {
            setCreandoSeguimiento(false);
        }
    };

    const casosFiltrados = casos.filter(c => {
        if (filtroCasos === 'activos') return c.estado === 'activo';
        if (filtroCasos === 'cerrados') return c.estado === 'cerrado';
        return true;
    });

    const filtros = [
        { key: 'activos',  label: 'Activos',  count: casos.filter(c => c.estado === 'activo').length },
        { key: 'cerrados', label: 'Cerrados', count: casos.filter(c => c.estado === 'cerrado').length },
        { key: 'todos',    label: 'Todos',    count: casos.length },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="page-header" style={{ margin: 0 }}>
                    <h2>🧠 Casos Psicológicos</h2>
                    <p>Seguimiento de intervenciones y bienestar estudiantil.</p>
                </div>
                <button
                    className={`btn ${mostrarFormularioCaso ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => setMostrarFormularioCaso(!mostrarFormularioCaso)}
                    style={{ background: mostrarFormularioCaso ? undefined : 'var(--purple)', borderColor: mostrarFormularioCaso ? 'var(--purple)' : undefined, color: mostrarFormularioCaso ? 'var(--purple)' : undefined }}
                >
                    {mostrarFormularioCaso ? '✕ Cancelar' : '+ Nuevo Caso'}
                </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {filtros.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFiltroCasos(f.key)}
                        style={{
                            padding: '7px 16px', borderRadius: 'var(--radius-full)',
                            border: '2px solid', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '500',
                            transition: 'var(--transition)',
                            borderColor: filtroCasos === f.key ? 'var(--purple)' : 'var(--gray-200)',
                            background: filtroCasos === f.key ? 'var(--purple-bg)' : 'var(--white)',
                            color: filtroCasos === f.key ? 'var(--purple)' : 'var(--gray-500)',
                        }}
                    >
                        {f.label} <span style={{ fontSize: '11px', fontWeight: '700' }}>({f.count})</span>
                    </button>
                ))}
            </div>

            {/* Formulario nuevo caso */}
            {mostrarFormularioCaso && (
                <div className="card fade-in" style={{ marginBottom: '24px', borderTop: '4px solid var(--purple)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--purple)' }}>
                        🧠 Nuevo Caso
                    </h3>
                    <form onSubmit={handleCrearCaso}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                <label>Alumno</label>
                                <select className="select" value={alumnoSeleccionado} onChange={e => setAlumnoSeleccionado(e.target.value)} required>
                                    <option value="">Selecciona un alumno</option>
                                    {alumnos.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre} {a.apellido} — {a.grado}° {a.seccion}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Título del caso</label>
                                <input className="input" type="text" placeholder="Ej: Dificultades de integración" value={nuevoCaso.titulo} onChange={e => setNuevoCaso({ ...nuevoCaso, titulo: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Prioridad</label>
                                <select className="select" value={nuevoCaso.prioridad} onChange={e => setNuevoCaso({ ...nuevoCaso, prioridad: e.target.value })}>
                                    <option value="baja">🟢 Baja</option>
                                    <option value="media">🟡 Media</option>
                                    <option value="alta">🔴 Alta</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                <label>Descripción</label>
                                <textarea className="input" placeholder="Describe la situación del alumno..." value={nuevoCaso.descripcion} onChange={e => setNuevoCaso({ ...nuevoCaso, descripcion: e.target.value })} style={{ minHeight: '80px', resize: 'vertical' }} />
                            </div>
                        </div>
                        <button type="submit" className="btn" disabled={creandoCaso} style={{ background: 'var(--purple)', color: 'white' }}>
                            {creandoCaso ? '⏳ Guardando...' : '💾 Guardar Caso'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de casos */}
            {casosFiltrados.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>📂</p>
                    <p>No hay casos {filtroCasos !== 'todos' ? filtroCasos : ''}</p>
                </div>
            ) : (
                casosFiltrados.map(caso => {
                    const cfg = prioridadConfig[caso.prioridad] || prioridadConfig.baja;
                    return (
                        <div key={caso.id} className="fade-in" style={{
                            background: 'var(--white)', borderRadius: 'var(--radius-md)',
                            padding: '16px 20px', marginBottom: '12px',
                            borderLeft: `4px solid ${cfg.color}`,
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <strong style={{ fontSize: '15px', color: 'var(--gray-900)' }}>{caso.titulo}</strong>
                                        <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.emoji} {caso.prioridad}</span>
                                        <span className="badge" style={{ background: caso.estado === 'activo' ? 'var(--primary-bg)' : 'var(--gray-200)', color: caso.estado === 'activo' ? 'var(--primary)' : 'var(--gray-500)' }}>
                                            {caso.estado}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '4px' }}>
                                        👤 {caso.alumnos?.nombre} {caso.alumnos?.apellido} — {caso.alumnos?.grado}° {caso.alumnos?.seccion}
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--gray-700)', margin: 0 }}>{caso.descripcion}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <button className="btn btn-primary" onClick={() => handleVerSeguimientos(caso)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                                        📋 Seguimientos
                                    </button>
                                    {caso.estado === 'activo' && (
                                        <button className="btn btn-danger" onClick={() => handleCerrarCaso(caso.id)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                                            ✕ Cerrar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Modal seguimientos */}
            {mostrarSeguimientos && casoSeleccionado && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setMostrarSeguimientos(false); }}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-900)' }}>
                                📋 {casoSeleccionado.titulo}
                            </h3>
                            <button className="btn btn-ghost" onClick={() => setMostrarSeguimientos(false)} style={{ padding: '4px 10px', fontSize: '16px' }}>✕</button>
                        </div>

                        {/* Lista de seguimientos */}
                        <div style={{ marginBottom: '20px' }}>
                            {(seguimientos[casoSeleccionado.id] || []).length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '16px', fontSize: '13px' }}>
                                    No hay seguimientos registrados aún
                                </p>
                            ) : (
                                (seguimientos[casoSeleccionado.id] || []).map(seg => (
                                    <div key={seg.id} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span className="badge badge-primary">{seg.tipo}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                                                {new Date(seg.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long' })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--gray-700)', margin: 0 }}>{seg.descripcion}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Formulario nuevo seguimiento */}
                        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>
                                ➕ Agregar Seguimiento
                            </h4>
                            <form onSubmit={handleCrearSeguimiento}>
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select className="select" value={nuevoSeguimiento.tipo} onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, tipo: e.target.value })}>
                                        <option value="entrevista">Entrevista</option>
                                        <option value="observacion">Observación</option>
                                        <option value="derivacion">Derivación</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea className="input" placeholder="Describe la intervención realizada..." value={nuevoSeguimiento.descripcion} onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, descripcion: e.target.value })} required style={{ minHeight: '80px', resize: 'vertical' }} />
                                </div>
                                <button type="submit" className="btn btn-success" disabled={creandoSeguimiento} style={{ width: '100%', justifyContent: 'center' }}>
                                    {creandoSeguimiento ? '⏳ Guardando...' : '💾 Guardar Seguimiento'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Casos;