import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            const { token, usuario } = response.data;
            
            // Guardar token y usuario (en una app real, usar AsyncStorage)
            global.token = token;
            global.usuario = usuario;
            
            navigation.replace('Asistencia');
        } catch (error) {
            Alert.alert('Error', 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📚 EduTrack</Text>
            <Text style={styles.subtitle}>Iniciar Sesión</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Ingresar</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: '#666'
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
        marginBottom: 15
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: '#2196F3',
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});