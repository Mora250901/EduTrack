import React, { useState } from 'react';
import { getReporteAsistencia } from '../api';

function Reportes() {
    const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
    const [reporteData, setReporteData] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const cargarReporte = async () => {
        setCargando(true);
        try {
            const data = await getReporteAsistencia(fechaReporte);
            setReporteData(Array.isArray(data) ? data : []);
        } catch (error) {
            setReporteData([]);
        } finally {
            setCargando(false);
        }
    };

    const exportarCSV = () => {
        if (reporteData.length === 0) {
            setMensaje('❌ No hay datos para exportar');
            setTimeout(() => setMensaje(''), 3000);
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
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `reporte_asistencia_${fechaReporte}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2>📊 Reportes de Asistencia</h2>

            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label><strong>Fecha:</strong></label>
                    <input
                        type="date"
                        value={fechaReporte}
                        onChange={e => setFechaReporte(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        onClick={cargarReporte}
                        disabled={cargando}
                        style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {cargando ? 'Cargando...' : '🔍 Buscar'}
                    </button>
                    <button
                        onClick={exportarCSV}
                        style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        📥 Exportar CSV
                    </button>
                </div>
                {mensaje && <p style={{ marginTop: '8px', color: '#f44336' }}>{mensaje}</p>}
            </div>

            {reporteData.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    <p>Selecciona una fecha y haz clic en Buscar</p>
                </div>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                            <th>Alumno</th>
                            <th>Grado</th>
                            <th>Sección</th>
                            <th>Estado</th>
                            <th>Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporteData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.alumno_nombre} {item.alumno_apellido}</td>
                                <td>{item.grado}</td>
                                <td>{item.seccion}</td>
                                <td style={{ color: item.estado === 'presente' ? '#4CAF50' : item.estado === 'ausente' ? '#f44336' : '#ff9800', fontWeight: 'bold' }}>
                                    {item.estado}
                                </td>
                                <td>{item.observacion || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Reportes;