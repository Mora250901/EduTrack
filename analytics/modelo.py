from datetime import datetime, timedelta


def analizar_alumno(alumno_id, asistencias):
    """
    Analiza el historial de asistencias de un alumno
    y retorna una lista de alertas si detecta riesgo.
    """
    alertas = []

    if not asistencias:
        return alertas

    hoy = datetime.today().date()
    hace_30_dias = hoy - timedelta(days=30)

    # Filtrar asistencias de los últimos 30 días
    recientes = [
        a for a in asistencias
        if datetime.strptime(a['fecha'], '%Y-%m-%d').date() >= hace_30_dias
    ]

    if not recientes:
        return alertas

    total = len(recientes)
    ausencias = [a for a in recientes if a['estado'] == 'ausente']
    tardanzas = [a for a in recientes if a['estado'] == 'tarde']
    presentes = [a for a in recientes if a['estado'] == 'presente']

    porcentaje_asistencia = (len(presentes) / total) * 100 if total > 0 else 0
    total_ausencias = len(ausencias)
    total_tardanzas = len(tardanzas)

    # Regla 1: 3 o más ausencias en 30 días → nivel medio
    if total_ausencias >= 3 and total_ausencias < 5:
        alertas.append({
            'alumno_id': alumno_id,
            'tipo': 'ausencias_reiteradas',
            'nivel': 'medio',
            'mensaje': f'El alumno registró {total_ausencias} ausencias en los últimos 30 días.'
        })

    # Regla 2: 5 o más ausencias en 30 días → nivel alto
    if total_ausencias >= 5:
        alertas.append({
            'alumno_id': alumno_id,
            'tipo': 'ausencias_criticas',
            'nivel': 'alto',
            'mensaje': f'Riesgo crítico: {total_ausencias} ausencias en los últimos 30 días. Requiere intervención inmediata.'
        })

    # Regla 3: 4 o más tardanzas → nivel bajo
    if total_tardanzas >= 4:
        alertas.append({
            'alumno_id': alumno_id,
            'tipo': 'tardanzas_reiteradas',
            'nivel': 'bajo',
            'mensaje': f'El alumno llegó tarde {total_tardanzas} veces en los últimos 30 días.'
        })

    # Regla 4: porcentaje de asistencia menor al 85% → nivel medio
    if porcentaje_asistencia < 85 and total_ausencias < 3:
        alertas.append({
            'alumno_id': alumno_id,
            'tipo': 'baja_asistencia',
            'nivel': 'medio',
            'mensaje': f'Porcentaje de asistencia bajo: {porcentaje_asistencia:.1f}% en los últimos 30 días.'
        })

    # Regla 5: porcentaje menor al 70% → nivel alto
    if porcentaje_asistencia < 70:
        alertas.append({
            'alumno_id': alumno_id,
            'tipo': 'asistencia_critica',
            'nivel': 'alto',
            'mensaje': f'Asistencia crítica: solo {porcentaje_asistencia:.1f}% en los últimos 30 días.'
        })

    return alertas


def analizar_todos(alumnos, asistencias_por_alumno):
    """
    Analiza todos los alumnos y retorna un resumen
    con las alertas detectadas.
    """
    resultado = {
        'total_alumnos': len(alumnos),
        'alumnos_en_riesgo': 0,
        'alertas_generadas': 0,
        'alertas': []
    }

    for alumno in alumnos:
        alumno_id = alumno['id']
        asistencias = asistencias_por_alumno.get(alumno_id, [])
        alertas = analizar_alumno(alumno_id, asistencias)

        if alertas:
            resultado['alumnos_en_riesgo'] += 1
            resultado['alertas_generadas'] += len(alertas)
            resultado['alertas'].extend(alertas)

    return resultado