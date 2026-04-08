import React, { useState } from 'react';
import { crearCaso, cerrarCaso, crearSeguimiento, getSeguimientosPorCaso } from '../api';

function Casos({ casos, alumnos, usuario, onCasoCreado, onCasoCerrado, filtroCasos, setFiltroCasos }) {
    const [mostrarFormularioCaso, setMostrarFormularioCaso] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
    const [nuevoCaso, setNuevoCaso] = useState({ titulo: '', descripcion: '', prioridad: 'media' });
    const [creandoCaso, setCreandoCaso] = useState(false);

    const [seguimientos, setSeguimientos] = useState({});
    const [mostrarFormularioSeguimiento, setMostrarFormularioSeguimiento] = useState(false);
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
        setMostrarFormularioSeguimiento(true);
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

    const colorPrioridad = (p) => p === 'alta' ? '#f44336' : p === 'media' ? '#ff9800' : '#4CAF50';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🧠 Casos Psicológicos</h2>
                <button
                    onClick={() => setMostrarFormularioCaso(!mostrarFormularioCaso)}
                    style={{ padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {mostrarFormularioCaso ? 'Cancelar' : '+ Nuevo Caso'}
                </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['activos', 'cerrados', 'todos'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltroCasos(f)}
                        style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: filtroCasos === f ? '#9C27B0' : '#e0e0e0', color: filtroCasos === f ? 'white' : '#333' }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Formulario nuevo caso */}
            {mostrarFormularioCaso && (
                <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Nuevo Caso</h3>
                    <form onSubmit={handleCrearCaso}>
                        <select value={alumnoSeleccionado} onChange={e => setAlumnoSeleccionado(e.target.value)} required style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">Selecciona un alumno</option>
                            {alumnos.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre} {a.apellido} - {a.grado}° {a.seccion}</option>
                            ))}
                        </select>
                        <input type="text" placeholder="Título del caso" value={nuevoCaso.titulo} onChange={e => setNuevoCaso({ ...nuevoCaso, titulo: e.target.value })} required style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <textarea placeholder="Descripción" value={nuevoCaso.descripcion} onChange={e => setNuevoCaso({ ...nuevoCaso, descripcion: e.target.value })} style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
                        <select value={nuevoCaso.prioridad} onChange={e => setNuevoCaso({ ...nuevoCaso, prioridad: e.target.value })} style={{ padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>
                        <br />
                        <button type="submit" disabled={creandoCaso} style={{ padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {creandoCaso ? 'Guardando...' : 'Guardar Caso'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de casos */}
            {casosFiltrados.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No hay casos {filtroCasos !== 'todos' ? filtroCasos : ''}</p>
            ) : (
                casosFiltrados.map(caso => (
                    <div key={caso.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${colorPrioridad(caso.prioridad)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{caso.titulo}</strong>
                                <span style={{ marginLeft: '10px', fontSize: '12px', backgroundColor: colorPrioridad(caso.prioridad), color: 'white', padding: '2px 8px', borderRadius: '12px' }}>{caso.prioridad}</span>
                                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>{caso.alumnos?.nombre} {caso.alumnos?.apellido} — {caso.alumnos?.grado}° {caso.alumnos?.seccion}</p>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}>{caso.descripcion}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <button onClick={() => handleVerSeguimientos(caso)} style={{ padding: '6px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                    Seguimientos
                                </button>
                                {caso.estado === 'activo' && (
                                    <button onClick={() => handleCerrarCaso(caso.id)} style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                        Cerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Panel de seguimientos */}
            {mostrarFormularioSeguimiento && casoSeleccionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3>Seguimientos: {casoSeleccionado.titulo}</h3>
                        {(seguimientos[casoSeleccionado.id] || []).map(seg => (
                            <div key={seg.id} style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '8px' }}>
                                <strong>{seg.tipo}</strong>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}>{seg.descripcion}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{new Date(seg.fecha).toLocaleDateString()}</p>
                            </div>
                        ))}
                        <form onSubmit={handleCrearSeguimiento} style={{ marginTop: '15px' }}>
                            <select value={nuevoSeguimiento.tipo} onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, tipo: e.target.value })} style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="entrevista">Entrevista</option>
                                <option value="observacion">Observación</option>
                                <option value="derivacion">Derivación</option>
                                <option value="otro">Otro</option>
                            </select>
                            <textarea placeholder="Descripción del seguimiento" value={nuevoSeguimiento.descripcion} onChange={e => setNuevoSeguimiento({ ...nuevoSeguimiento, descripcion: e.target.value })} required style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
                            <button type="submit" disabled={creandoSeguimiento} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {creandoSeguimiento ? 'Guardando...' : 'Guardar Seguimiento'}
                            </button>
                            <button type="button" onClick={() => setMostrarFormularioSeguimiento(false)} style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Casos;