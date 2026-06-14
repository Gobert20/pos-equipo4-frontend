import axios from 'axios';

const api = axios.create({
    // 🚀 ¡CONECTADO A LA NUBE! Apuntamos directamente a Render
    baseURL: 'https://pos-equipo4-backend.onrender.com/api', 
    timeout: 8000, // Si el backend no responde en 8 segundos, corta la petición
    withCredentials: true, // Permite que viajen las cookies HttpOnly entre Next.js y el Backend
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