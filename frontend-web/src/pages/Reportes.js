import React, { useState } from 'react';
import { getReporteAsistencia } from '../api';

const estadoConfig = {
    presente: { color: 'var(--success)', bg: 'var(--success-bg)', emoji: '✅' },
    ausente:  { color: 'var(--danger)',  bg: 'var(--danger-bg)',  emoji: '❌' },
    tarde:    { color: 'var(--warning)', bg: 'var(--warning-bg)', emoji: '⏰' },
};

function Reportes() {
    const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
    const [reporteData, setReporteData] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [buscado, setBuscado] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const cargarReporte = async () => {
        setCargando(true);
        try {
            const data = await getReporteAsistencia(fechaReporte);
            setReporteData(Array.isArray(data) ? data : []);
            setBuscado(true);
        } catch (error) {
            setReporteData([]);
            setBuscado(true);
        } finally {
            setCargando(false);
        }
    };

    const exportarCSV = () => {
        if (reporteData.length === 0) {
            setMensaje({ texto: 'No hay datos para exportar', tipo: 'danger' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
            return;
        }
        const headers = ['Alumno', 'Grado', 'Sección', 'Estado', 'Observación'];
        const rows = reporteData.map(item => [
            `${item.alumno_nombre} ${item.alumno_apellido}`,
            item.grado,
            item.seccion,
            item.estado,
            item.observacion || ''
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `reporte_asistencia_${fechaReporte}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMensaje({ texto: 'Reporte exportado correctamente', tipo: 'success' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    };

    // Resumen del reporte
    const resumen = {
        presentes: reporteData.filter(r => r.estado === 'presente').length,
        ausentes:  reporteData.filter(r => r.estado === 'ausente').length,
        tardes:    reporteData.filter(r => r.estado === 'tarde').length,
    };

    return (
        <div>
            <div className="page-header">
                <h2>📊 Reportes de Asistencia</h2>
                <p>Consulta y exporta el registro de asistencia por fecha.</p>
            </div>

            {/* Controles */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Fecha del reporte</label>
                        <input
                            className="input"
                            type="date"
                            value={fechaReporte}
                            onChange={e => setFechaReporte(e.target.value)}
                            style={{ width: 'auto' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={cargarReporte} disabled={cargando}>
                        {cargando ? '⏳ Buscando...' : '🔍 Buscar'}
                    </button>
                    <button className="btn btn-success" onClick={exportarCSV}>
                        📥 Exportar CSV
                    </button>
                </div>
                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`} style={{ marginTop: '12px' }}>
                        {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
                    </div>
                )}
            </div>

            {/* Resumen si hay datos */}
            {reporteData.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Presentes', count: resumen.presentes, ...estadoConfig.presente },
                        { label: 'Ausentes',  count: resumen.ausentes,  ...estadoConfig.ausente  },
                        { label: 'Tarde',     count: resumen.tardes,    ...estadoConfig.tarde    },
                    ].map(item => (
                        <div key={item.label} style={{
                            background: item.bg, borderRadius: 'var(--radius-md)',
                            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px',
                            flex: 1, minWidth: '120px'
                        }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: '700', color: item.color }}>{item.count}</span>
                            <span style={{ fontSize: '13px', color: item.color, fontWeight: '500' }}>
                                {item.emoji} {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabla o estado vacío */}
            {!buscado ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-500)' }}>
                    <p style={{ fontSize: '36px', marginBottom: '12px' }}>📅</p>
                    <p style={{ fontWeight: '500' }}>Selecciona una fecha y haz clic en Buscar</p>
                </div>
            ) : reporteData.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-500)' }}>
                    <p style={{ fontSize: '36px', marginBottom: '12px' }}>📭</p>
                    <p style={{ fontWeight: '500' }}>No hay registros de asistencia para esta fecha</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Grado</th>
                                    <th>Sección</th>
                                    <th>Estado</th>
                                    <th>Observación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteData.map((item, index) => {
                                    const cfg = estadoConfig[item.estado] || estadoConfig.presente;
                                    return (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '500' }}>
                                                {item.alumno_nombre} {item.alumno_apellido}
                                            </td>
                                            <td><span className="badge badge-primary">{item.grado}°</span></td>
                                            <td><span className="badge badge-purple">{item.seccion}</span></td>
                                            <td>
                                                <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                                                    {cfg.emoji} {item.estado}
                                                </span>
                                            </td>
                                            <td style={{ color: item.observacion ? 'var(--gray-700)' : 'var(--gray-300)', fontSize: '13px' }}>
                                                {item.observacion || '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reportes;