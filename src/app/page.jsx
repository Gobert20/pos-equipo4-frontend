'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; 

// 🚀 Instancia local unificada orientada al microservicio en Azure
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
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
        
        // Validación preventiva en el cliente antes del envío de red
        if (!email.trim() || !password.trim()) {
            alert("❌ Por favor, rellene todos los campos requeridos.");
            return;
        }

        setCargando(true);

        try {
            // 🔐 Petición POST mapeada al controlador adaptativo de Express
            const res = await api.post('/auth/login', { 
                email: email.trim(), 
                password: password 
            });
            
            // 🔄 Sincronización de Datos del Operador (Respuesta mapeada de Azure)
            if (res.data && res.data.token) {
                // Guardamos el token JWT para que 'axios' en otras pestañas pueda leerlo
                localStorage.setItem('token', res.data.token);
            }

            if (res.data && res.data.user) {
                // Sincroniza tanto el string plano como el objeto completo para los Navbar
                localStorage.setItem('usuario_nombre', res.data.user.nombre);
                localStorage.setItem('usuario', JSON.stringify(res.data.user));
            }

            setCargando(false);
            
            // Redirección hacia el módulo de Usuarios para comprobar la conexión PostgreSQL
            router.push('/users');

        } catch (err) {
            setCargando(false);
            console.error("Fallo en login:", err);
            
            // Captura dinámica del string de error enviado por authController.js
            const mensajeError = err.response?.data?.error || "No se pudo conectar con el backend en el puerto 3000.";
            alert("❌ " + mensajeError);
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