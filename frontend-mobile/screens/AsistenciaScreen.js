import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function AsistenciaScreen({ navigation }) {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registrando, setRegistrando] = useState(null);

    useEffect(() => {
        cargarAlumnos();
    }, []);

    const cargarAlumnos = async () => {
        try {
            const response = await api.get('/alumnos');
            setAlumnos(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los alumnos');
        } finally {
            setLoading(false);
        }
    };

    const registrarAsistencia = async (alumnoId, estado) => {
        setRegistrando(alumnoId);
        try {
            await api.post('/asistencias', {
                alumno_id: alumnoId,
                fecha: new Date().toISOString().split('T')[0],
                estado: estado,
                registrado_por: 'mobile'
            });
            Alert.alert('Éxito', 'Asistencia registrada');
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar');
        } finally {
            setRegistrando(null);
        }
    };

    const renderAlumno = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
            <Text style={styles.grado}>{item.grado}° {item.seccion}</Text>
            
            <View style={styles.botones}>
                <TouchableOpacity
                    style={[styles.boton, styles.presente]}
                    onPress={() => registrarAsistencia(item.id, 'presente')}
                    disabled={registrando === item.id}
                >
                    <Text style={styles.botonTexto}>✅ Presente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.boton, styles.ausente]}
                    onPress={() => registrarAsistencia(item.id, 'ausente')}
                    disabled={registrando === item.id}
                >
                    <Text style={styles.botonTexto}>❌ Ausente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.boton, styles.tarde]}
                    onPress={() => registrarAsistencia(item.id, 'tarde')}
                    disabled={registrando === item.id}
                >
                    <Text style={styles.botonTexto}>⏰ Tarde</Text>
                </TouchableOpacity>
            </View>
            
            {registrando === item.id && (
                <ActivityIndicator style={styles.spinner} color="#2196F3" />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Registrar Asistencia</Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                    <Text style={styles.logout}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
            
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
            ) : (
                <FlatList
                    data={alumnos}
                    renderItem={renderAlumno}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2196F3',
        paddingTop: 50
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    logout: {
        color: 'white',
        fontSize: 14
    },
    card: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    grado: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    botones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    boton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5
    },
    presente: {
        backgroundColor: '#4CAF50'
    },
    ausente: {
        backgroundColor: '#f44336'
    },
    tarde: {
        backgroundColor: '#ff9800'
    },
    botonTexto: {
        color: 'white',
        fontWeight: 'bold'
    },
    spinner: {
        marginTop: 10
    }
});