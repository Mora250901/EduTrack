from flask import Flask, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from modelo import analizar_todos
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'EduTrack Analytics funcionando'})


@app.route('/analizar', methods=['POST'])
def analizar():
    try:
        # Obtener todos los alumnos
        alumnos_res = supabase.table('alumnos').select('*').execute()
        alumnos = alumnos_res.data

        # Obtener todas las asistencias
        asistencias_res = supabase.table('asistencias').select('*').execute()
        asistencias = asistencias_res.data

        # Agrupar asistencias por alumno
        asistencias_por_alumno = {}
        for a in asistencias:
            alumno_id = a['alumno_id']
            if alumno_id not in asistencias_por_alumno:
                asistencias_por_alumno[alumno_id] = []
            asistencias_por_alumno[alumno_id].append(a)

        # Analizar
        resultado = analizar_todos(alumnos, asistencias_por_alumno)

        # Obtener alertas ya existentes para no duplicar
        alertas_existentes = supabase.table('alertas') \
            .select('alumno_id, tipo') \
            .eq('atendida', False) \
            .execute()

        existentes_set = set(
            (a['alumno_id'], a['tipo']) for a in alertas_existentes.data
        )

        # Insertar solo alertas nuevas
        alertas_nuevas = 0
        for alerta in resultado['alertas']:
            key = (alerta['alumno_id'], alerta['tipo'])
            if key not in existentes_set:
                supabase.table('alertas').insert({
                    'alumno_id': alerta['alumno_id'],
                    'tipo': alerta['tipo'],
                    'nivel': alerta['nivel'],
                    'mensaje': alerta['mensaje'],
                    'atendida': False
                }).execute()
                alertas_nuevas += 1

        return jsonify({
            'status': 'ok',
            'total_alumnos': resultado['total_alumnos'],
            'alumnos_en_riesgo': resultado['alumnos_en_riesgo'],
            'alertas_detectadas': resultado['alertas_generadas'],
            'alertas_nuevas_insertadas': alertas_nuevas
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/reporte', methods=['GET'])
def reporte():
    try:
        alumnos_res = supabase.table('alumnos').select('*').execute()
        alumnos = alumnos_res.data

        asistencias_res = supabase.table('asistencias').select('*').execute()
        asistencias = asistencias_res.data

        asistencias_por_alumno = {}
        for a in asistencias:
            alumno_id = a['alumno_id']
            if alumno_id not in asistencias_por_alumno:
                asistencias_por_alumno[alumno_id] = []
            asistencias_por_alumno[alumno_id].append(a)

        resultado = analizar_todos(alumnos, asistencias_por_alumno)

        # Enriquecer con nombre del alumno
        alumnos_dict = {a['id']: a for a in alumnos}
        for alerta in resultado['alertas']:
            alumno = alumnos_dict.get(alerta['alumno_id'], {})
            alerta['alumno_nombre'] = f"{alumno.get('nombre', '')} {alumno.get('apellido', '')}"
            alerta['grado'] = alumno.get('grado', '')
            alerta['seccion'] = alumno.get('seccion', '')

        return jsonify(resultado)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)