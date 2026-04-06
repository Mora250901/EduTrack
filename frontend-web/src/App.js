import React, { useEffect, useState } from 'react';
import Login from './components/Login';

function App() {

  const [casos, setCasos] = useState([]);
  const [mostrarFormularioCaso, setMostrarFormularioCaso] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [nuevoCaso, setNuevoCaso] = useState({ titulo: '', descripcion: '', prioridad: 'media' });
  const [creandoCaso, setCreandoCaso] = useState(false);
  // ==================== TODOS LOS HOOKS JUNTOS AL INICIO ====================
  
  // Hooks de autenticación
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  
  // Hooks de reportes
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
  const [reporteData, setReporteData] = useState([]);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  
  // Hooks de alumnos y asistencia
  const [alumnos, setAlumnos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [asistenciasHoy, setAsistenciasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [asistencia, setAsistencia] = useState({
    estado: 'presente',
    observacion: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [vista, setVista] = useState('dashboard');
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    alertasPendientes: 0,
    presentesHoy: 0,
    ausentesHoy: 0
  });
  
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    grado: '',
    seccion: ''
  });

   // ==================== FUNCIONES DE AUTENTICACIÓN ====================
  
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

  // Verificar sesión guardada al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUsuario));
    }
  }, []);

  // Cargar datos al iniciar (solo si hay usuario autenticado)
  useEffect(() => {
    if (token && usuario) {
      cargarAlumnos();
      cargarAlertas();
      cargarAsistenciasHoy();
      if (usuario.rol === 'psicologo') {
        cargarCasos();
      }
    }
  }, [token, usuario]);

  // Actualizar estadísticas cuando cambien los datos
  useEffect(() => {
    setStats({
      totalAlumnos: alumnos.length,
      alertasPendientes: alertas.length,
      presentesHoy: asistenciasHoy.filter(a => a.estado === 'presente').length,
      ausentesHoy: asistenciasHoy.filter(a => a.estado === 'ausente').length
    });
  }, [alumnos, alertas, asistenciasHoy]);

  const cargarAlumnos = () => {
    setLoading(true);
    fetch('https://edutrack-backend-2ycx.onrender.com/api/alumnos')
      .then(res => res.json())
      .then(data => {
        setAlumnos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const cargarAlertas = async () => {
    try {
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/alertas/pendientes');
      const data = await response.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    }
  };

  const cargarAsistenciasHoy = async () => {
    try {
      // Obtener fecha actual
      const hoy = new Date().toISOString().split('T')[0];
      // Por ahora, obtenemos todas las asistencias (simplificado)
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/asistencias');
      if (response.ok) {
        const data = await response.json();
        const asistenciasFecha = data.filter(a => a.fecha === hoy);
        setAsistenciasHoy(asistenciasFecha);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleReportes = () => {
    setMostrarReportes(!mostrarReportes);
    if (!mostrarReportes) {
      cargarReporte();
    }
  };

  const cargarReporte = async () => {
    setCargandoReporte(true);
    try {
      const response = await fetch(`https://edutrack-backend-2ycx.onrender.com/api/asistencias/reporte?fecha=${fechaReporte}`);
      if (response.ok) {
        const data = await response.json();
        setReporteData(data);
      } else {
        setReporteData([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setReporteData([]);
    } finally {
      setCargandoReporte(false);
    }
  };

  const exportarCSV = () => {
    if (reporteData.length === 0) {
      setMensaje('❌ No hay datos para exportar');
      return;
    }

    // Crear contenido CSV
    const headers = ['Alumno', 'Grado', 'Sección', 'Estado', 'Observación'];
    const rows = reporteData.map(item => [
      `${item.alumno_nombre} ${item.alumno_apellido}`,
      item.grado,
      item.seccion,
      item.estado,
      item.observacion || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_asistencia_${fechaReporte}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMensaje('✅ Reporte exportado correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const verificarAlertas = async (alumnoId, faltasConsecutivas) => {
    if (faltasConsecutivas >= 3) {
      try {
        await fetch('https://edutrack-backend-2ycx.onrender.com/api/alertas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alumno_id: alumnoId,
            tipo: 'faltas',
            nivel: 'alto',
            mensaje: `El alumno tiene ${faltasConsecutivas} faltas consecutivas`
          })
        });
        cargarAlertas(); // Recargar alertas
      } catch (error) {
        console.error('Error al crear alerta:', error);
      }
    }
  };

  const marcarAtendida = async (alertaId) => {
    try {
      await fetch(`https://edutrack-backend-2ycx.onrender.com/api/alertas/${alertaId}/atender`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      setMensaje('✅ Alerta marcada como atendida');
      cargarAlertas(); // Recargar alertas
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al marcar alerta');
    }
  };

  // Agregar alumno
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const nuevoAlumno = await response.json();
      setAlumnos([...alumnos, nuevoAlumno]);
      setForm({ nombre: '', apellido: '', grado: '', seccion: '' });
      setMensaje('✅ Alumno agregado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje('❌ Error al guardar el alumno');
    } finally {
      setSaving(false);
    }
  };

  // Registrar asistencia
  const handleAsistenciaChange = (e) => {
    setAsistencia({ ...asistencia, [e.target.name]: e.target.value });
  };

  const registrarAsistencia = async (e) => {
    e.preventDefault();
    if (!selectedAlumno) {
      setMensaje('❌ Selecciona un alumno');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: selectedAlumno,
          fecha: new Date().toISOString().split('T')[0],
          estado: asistencia.estado,
          observacion: asistencia.observacion || null,
          registrado_por: 'sistema'
        })
      });
      
      if (response.ok) {
        // Simular conteo de faltas (simplificado)
        if (asistencia.estado === 'ausente') {
          await verificarAlertas(selectedAlumno, 3);
        }
        
        setMensaje('✅ Asistencia registrada correctamente');
        setAsistencia({ estado: 'presente', observacion: '' });
        setSelectedAlumno('');
        cargarAsistenciasHoy(); // Recargar asistencias del día
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje('❌ Error al registrar asistencia');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al registrar asistencia');
    } finally {
      setSaving(false);
    }
  };

   // ==================== FUNCIONES PARA CASOS ====================

  const cargarCasos = async () => {
    try {
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/casos');
      const data = await response.json();
      setCasos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const crearCaso = async (e) => {
    e.preventDefault();
    setCreandoCaso(true);
    try {
      const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/casos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: alumnoSeleccionado,
          titulo: nuevoCaso.titulo,
          descripcion: nuevoCaso.descripcion,
          prioridad: nuevoCaso.prioridad,
          creado_por: usuario?.id
        })
      });
      if (response.ok) {
        setMostrarFormularioCaso(false);
        setAlumnoSeleccionado('');
        setNuevoCaso({ titulo: '', descripcion: '', prioridad: 'media' });
        cargarCasos();
        setMensaje('✅ Caso creado correctamente');
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al crear el caso');
    } finally {
      setCreandoCaso(false);
    }
  };

  const cerrarCaso = async (casoId) => {
    try {
      await fetch(`https://edutrack-backend-2ycx.onrender.com/api/casos/${casoId}/cerrar`, { 
        method: 'PUT' 
      });
      cargarCasos();
      setMensaje('✅ Caso cerrado');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al cerrar el caso');
    }
  };

  // ==================== CONDICIÓN DE AUTENTICACIÓN ====================

  if (!token || !usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
    {/* BARRA SUPERIOR CON CERRAR SESIÓN */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <h1>📚 EduTrack - Gestión de Bienestar Estudiantil</h1>
  <div>
    <span style={{ marginRight: '15px' }}>
      👤 {usuario?.nombre} ({usuario?.rol})
    </span>
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Cerrar Sesión
    </button>
  </div>
</div>
    
      {/* Botones de navegación */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setVista('dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: vista === 'dashboard' ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Dashboard Directivo
        </button>
        <button
          onClick={() => setVista('alumnos')}
          style={{
            padding: '10px 20px',
            backgroundColor: vista === 'alumnos' ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          👨‍🎓 Gestión de Alumnos
        </button>
      </div>

      {mensaje && (
        <div style={{
          backgroundColor: mensaje.includes('✅') ? '#d4edda' : '#f8d7da',
          color: mensaje.includes('✅') ? '#155724' : '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {mensaje}
        </div>
      )}

      {/* VISTA DASHBOARD - CONTENIDO SEGÚN ROL */}
      {vista === 'dashboard' && (
        <>
          {/* VISTA PARA DIRECTOR */}
          {usuario?.rol === 'director' && (
            <>
              {/* Tarjetas de estadísticas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalAlumnos}</div>
                  <div>Total Alumnos</div>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100' }}>{stats.alertasPendientes}</div>
                  <div>Alertas Pendientes</div>
                </div>
                <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>{stats.presentesHoy}</div>
                  <div>Presentes Hoy</div>
                </div>
                <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>{stats.ausentesHoy}</div>
                  <div>Ausentes Hoy</div>
                </div>
              </div>

              {/* Botón para ver reportes */}
              <div style={{ marginBottom: '20px' }}>
                <button onClick={toggleReportes} style={{ padding: '10px 20px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {mostrarReportes ? '📊 Ocultar Reportes' : '📊 Ver Reportes de Asistencia'}
                </button>
              </div>

              {/* Panel de Reportes */}
              {mostrarReportes && (
                <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                  <h2>📈 Reporte de Asistencia</h2>
                  <div style={{ marginBottom: '15px' }}>
                    <label>Seleccionar fecha: </label>
                    <input type="date" value={fechaReporte} onChange={(e) => setFechaReporte(e.target.value)} style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px' }} />
                    <button onClick={cargarReporte} style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Buscar</button>
                    <button onClick={exportarCSV} style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📎 Exportar a CSV</button>
                  </div>
                  {cargandoReporte ? <p>Cargando...</p> : (
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead style={{ backgroundColor: '#e1bee7' }}>
                        <tr><th>Alumno</th><th>Grado</th><th>Sección</th><th>Estado</th><th>Observación</th></tr>
                      </thead>
                      <tbody>
                        {reporteData.length === 0 ? <tr><td colSpan="5">No hay registros</td></tr> : reporteData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.alumno_nombre} {item.alumno_apellido}</td>
                            <td>{item.grado}</td>
                            <td>{item.seccion}</td>
                            <td style={{ color: item.estado === 'presente' ? '#4caf50' : item.estado === 'ausente' ? '#f44336' : '#ff9800' }}>
                              {item.estado === 'presente' ? '✅ Presente' : item.estado === 'ausente' ? '❌ Ausente' : '⏰ Tarde'}
                            </td>
                            <td>{item.observacion || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}

          {/* VISTA PARA PSICÓLOGO */}
          {usuario?.rol === 'psicologo' && (
            <>
              <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📋 Panel del Psicólogo</h2>
                <p>Bienvenido, {usuario.nombre}. Aquí podrás gestionar los casos de los alumnos.</p>
              </div>

              {/* Panel de Alertas */}
              <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ff9800' }}>
                <h2 style={{ color: '#e65100' }}>⚠️ Alertas Pendientes</h2>
                {alertas.length === 0 ? <p>✅ No hay alertas pendientes</p> : alertas.map(alerta => (
                  <div key={alerta.id} style={{ backgroundColor: 'white', padding: '12px', marginBottom: '10px', borderRadius: '6px', borderLeft: `4px solid ${alerta.nivel === 'alto' ? '#f44336' : '#ff9800'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{alerta.alumnos?.nombre} {alerta.alumnos?.apellido}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>{alerta.alumnos?.grado}° {alerta.alumnos?.seccion}</span>
                        <div style={{ fontSize: '14px', marginTop: '5px' }}>{alerta.mensaje}</div>
                      </div>
                      <button onClick={() => marcarAtendida(alerta.id)} style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓ Marcar atendida</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sección de Casos Activos */}
              <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2>📋 Casos Activos</h2>
                <button 
                  onClick={() => setMostrarFormularioCaso(!mostrarFormularioCaso)}
                  style={{ marginBottom: '15px', padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  + Nuevo Caso
                </button>

                {mostrarFormularioCaso && (
                  <form onSubmit={crearCaso} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <select value={alumnoSeleccionado} onChange={(e) => setAlumnoSeleccionado(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Selecciona un alumno</option>
                      {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                    </select>
                    <input type="text" placeholder="Título del caso" value={nuevoCaso.titulo} onChange={(e) => setNuevoCaso({...nuevoCaso, titulo: e.target.value})} required style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <textarea placeholder="Descripción" value={nuevoCaso.descripcion} onChange={(e) => setNuevoCaso({...nuevoCaso, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
                    <select value={nuevoCaso.prioridad} onChange={(e) => setNuevoCaso({...nuevoCaso, prioridad: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="baja">Prioridad Baja</option>
                      <option value="media">Prioridad Media</option>
                      <option value="alta">Prioridad Alta</option>
                    </select>
                    <button type="submit" disabled={creandoCaso} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{creandoCaso ? 'Creando...' : 'Crear Caso'}</button>
                    <button type="button" onClick={() => setMostrarFormularioCaso(false)} style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                  </form>
                )}

                {casos.filter(c => c.estado === 'activo').length === 0 ? (
                  <p>No hay casos activos</p>
                ) : (
                  casos.filter(c => c.estado === 'activo').map(caso => (
                    <div key={caso.id} style={{ backgroundColor: 'white', padding: '12px', marginBottom: '10px', borderRadius: '6px', borderLeft: `4px solid ${caso.prioridad === 'alta' ? '#f44336' : caso.prioridad === 'media' ? '#ff9800' : '#4caf50'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{caso.titulo}</strong>
                          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>{caso.alumnos?.nombre} {caso.alumnos?.apellido}</span>
                          <div style={{ fontSize: '14px', marginTop: '5px' }}>{caso.descripcion}</div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Prioridad: {caso.prioridad}</div>
                        </div>
                        <button onClick={() => cerrarCaso(caso.id)} style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cerrar Caso</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Tabla de alumnos */}
              <h2>📋 Lista de Alumnos</h2>
              {loading ? <p>Cargando...</p> : (
                <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead style={{ backgroundColor: '#f0f0f0' }}>
                    <tr><th>Nombre</th><th>Apellido</th><th>Grado</th><th>Sección</th></tr>
                  </thead>
                  <tbody>
                    {alumnos.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay alumnos registrados</td></tr>
                    ) : (
                      alumnos.map(alumno => (
                        <tr key={alumno.id}>
                          <td>{alumno.nombre}</td>
                          <td>{alumno.apellido}</td>
                          <td>{alumno.grado}</td>
                          <td>{alumno.seccion}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* VISTA PARA DOCENTE */}
          {usuario?.rol === 'docente' && (
            <>
              <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📝 Panel del Docente</h2>
                <p>Bienvenido, {usuario.nombre}. Registra la asistencia de tus alumnos.</p>
              </div>

              {/* Sección de Asistencia */}
              <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2>📝 Registrar Asistencia</h2>
                <form onSubmit={registrarAsistencia}>
                  <div style={{ marginBottom: '10px' }}>
                    <select value={selectedAlumno} onChange={(e) => setSelectedAlumno(e.target.value)} required style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Selecciona un alumno</option>
                      {alumnos.map(alumno => (
                        <option key={alumno.id} value={alumno.id}>{alumno.nombre} {alumno.apellido} - {alumno.grado}° {alumno.seccion}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <label><input type="radio" name="estado" value="presente" checked={asistencia.estado === 'presente'} onChange={handleAsistenciaChange} /> ✅ Presente</label>
                    <label><input type="radio" name="estado" value="ausente" checked={asistencia.estado === 'ausente'} onChange={handleAsistenciaChange} /> ❌ Ausente</label>
                    <label><input type="radio" name="estado" value="tarde" checked={asistencia.estado === 'tarde'} onChange={handleAsistenciaChange} /> ⏰ Tarde</label>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <input type="text" name="observacion" placeholder="Observación (opcional)" value={asistencia.observacion} onChange={handleAsistenciaChange} style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{saving ? 'Registrando...' : 'Registrar Asistencia'}</button>
                </form>
              </div>
            </>
          )}
        </>
      )}

      {/* VISTA GESTIÓN DE ALUMNOS */}
      {vista === 'alumnos' && (
        <>
          {/* Formulario para agregar alumnos */}
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2>➕ Agregar Nuevo Alumno</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="grado"
                placeholder="Grado (ej: 3)"
                value={form.grado}
                onChange={handleChange}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                name="seccion"
                placeholder="Sección (ej: A)"
                value={form.seccion}
                onChange={handleChange}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button 
                type="submit" 
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Guardando...' : 'Guardar Alumno'}
              </button>
            </form>
          </div>
          
          {/* Tabla de alumnos */}
          <h2>📋 Lista de Alumnos</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Grado</th>
                  <th>Sección</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No hay alumnos registrados</td>
                  </tr>
                ) : (
                  alumnos.map(alumno => (
                    <tr key={alumno.id}>
                      <td>{alumno.nombre}</td>
                      <td>{alumno.apellido}</td>
                      <td>{alumno.grado}</td>
                      <td>{alumno.seccion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;