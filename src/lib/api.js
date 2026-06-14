import axios from 'axios';

const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

const api = axios.create({
    baseURL: isProduction 
        ? 'https://pos-equipo4-backend.onrender.com/api' 
        : 'http://localhost:3000/api', 
    timeout: 30000, // 👈 ¡Subido a 30 segundos para evitar los "Network Error"!
    withCredentials: true, 
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