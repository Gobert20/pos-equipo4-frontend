import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', 
    timeout: 8000, // Si el backend no responde en 8 segundos, corta la petición
    withCredentials: true, // 👈 ¡SOLUCIÓN DEFINITIVA! Permite que viajen las cookies HttpOnly entre Next.js y el Backend
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para atrapar errores de red antes de que rompan la pantalla
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('🚨 Error en la llamada API:', error.message);
        return Promise.reject(error);
    }
);

export default api;