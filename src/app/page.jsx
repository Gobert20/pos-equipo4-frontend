'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; 

// 🚀 DETECCIÓN DINÁMICA: Detecta si está en internet (Vercel) o en tu PC local (localhost)
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

const api = axios.create({
    baseURL: isProduction 
        ? 'https://pos-equipo4-backend.onrender.com/api' 
        : 'http://localhost:3000/api',
    withCredentials: true // Permite procesar cookies HttpOnly si el backend las inyecta
});

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    useEffect(() => {
        import('bootstrap/dist/css/bootstrap.min.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(link);
    }, []);

    const manejarLogin = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            alert("❌ Por favor, rellene todos los campos requeridos.");
            return;
        }

        setCargando(true);

        try {
            const res = await api.post('/auth/login', { 
                email: email.trim(), 
                password: password 
            });
            
            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            if (res.data && res.data.user) {
                localStorage.setItem('usuario_nombre', res.data.user.nombre);
                localStorage.setItem('usuario', JSON.stringify(res.data.user));
            }

            setCargando(false);
            router.push('/users');

        } catch (err) {
            setCargando(false);
            console.error("Fallo en login:", err);
            
            // 🔍 ALERTA INTELIGENTE: Muestra el error real devuelto por la nube o la red
            const mensajeError = err.response?.data?.error || err.response?.data?.message || err.message;
            alert("❌ Error de comunicación: " + mensajeError);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#212529' }}>
            <div className="card border-0 shadow-lg p-4 bg-white" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
                
                {/* Encabezado */}
                <div className="text-center mb-4">
                    <div className="bg-primary text-white d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                        <i className="bi bi-cpu-fill fs-2"></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-1">POS EQUIPO 4</h3>
                    <small className="text-muted text-uppercase fw-bold tracking-wider">Acceso al Sistema Cloud</small>
                </div>

                {/* Formulario */}
                <form onSubmit={manejarLogin}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Correo Electrónico</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input 
                                type="email" 
                                className="form-control bg-light border-start-0 ps-0"
                                placeholder="admin4@pos.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-secondary">Contraseña</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input 
                                type="password" 
                                className="form-control bg-light border-start-0 ps-0"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        disabled={cargando}
                    >
                        {cargando ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Conectando a Azure...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i> Ingresar
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-4 pt-2 border-top">
                    <small className="text-muted">Conectado de forma segura a Azure PostgreSQL</small>
                </div>

            </div>
        </div>
    );
}