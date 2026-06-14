'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    const [miSesion, setMiSesion] = useState(null);

    useEffect(() => {
        // Recuperar datos del administrador logueado para mostrarlo en la tabla
        if (typeof window !== 'undefined') {
            const usuarioGuardado = localStorage.getItem('usuario');
            if (usuarioGuardado) {
                try {
                    setMiSesion(JSON.parse(usuarioGuardado));
                } catch (e) {
                    console.error("Error al parsear usuario de sesión", e);
                }
            }
        }
        obtenerUsuarios();
    }, []);

// 1️⃣ Asegúrate de que tu helper de configuración incluya 'withCredentials' para CORS
const obtenerConfigSegura = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        },
        withCredentials: true // 👈 Crucial para que el navegador acepte llamadas entre el puerto 3001 y 3000
    };
};

// 2️⃣ Corrige la URL en la función de lectura incorporando el puerto 3000 del backend
const obtenerUsuarios = async () => {
    try {
        setMensajeError('');
        
        // Recuperamos el token limpio desde el almacenamiento del cliente
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // 🚀 Realizamos la petición estructurando manualmente la configuración de Axios
        const res = await axios({
            method: 'get',
            url: 'https://pos-equipo4-backend.onrender.com/api/users',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            },
            withCredentials: true // Permite la comunicación cruzada de cookies/tokens entre puertos
        });
        
        if (Array.isArray(res.data)) {
            setUsuarios(res.data);
        }
    } catch (error) {
        console.error("Error al obtener usuarios de Azure:", error);
        setMensajeError("⚠️ No se pudo conectar con el servidor Cloud. Mostrando lista vacía.");
        setUsuarios([]); 
    }
};

// 3️⃣ Corrige también la URL de inserción (POST) para registrar nuevos operadores en el puerto 3000
const manejarAgregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim() || !clave.trim()) return;
    setCargando(true);

    const nuevoUsuario = { 
        nombre: nombre.trim(), 
        correo: correo.trim().toLowerCase(), 
        clave: clave 
    };

    try {
        // 🚀 Inserción directa en el puerto 3000 de Express + Azure
        await axios.post('https://pos-equipo4-backend.onrender.com/api/users', nuevoUsuario, obtenerConfigSegura());
        limpiarFormulario();
        obtenerUsuarios(); // Recarga la tabla automáticamente para ver al nuevo operador
    } catch (error) {
        console.error("Error al guardar usuario en Cloud:", error);
        alert("❌ Error al guardar en la base de datos de Azure.");
    } finally {
        setCargando(false);
    }
};

// 4️⃣ Corrige la URL de eliminación (DELETE) apuntando al puerto 3000
const manejarEliminar = async (id) => {
    const usuarioAEliminar = usuarios.find(u => u.id === id);
    if (usuarioAEliminar && (usuarioAEliminar.correo?.includes('admin') || usuarioAEliminar.rol === 'Administrador')) {
        alert("🔒 Por seguridad, no puedes eliminar a un usuario Administrador Maestro.");
        return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este operador de Azure PostgreSQL?")) return;

    try {
        // 🚀 Eliminación en el puerto 3000
        await axios.delete(`https://pos-equipo4-backend.onrender.com/api/users/${id}`, obtenerConfigSegura());
        obtenerUsuarios();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("❌ No se pudo eliminar el usuario de la nube.");
    }
};

    return (
        <div className="container-fluid p-4">
            {/* Encabezado */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                    <i className="bi bi-person-gear fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Gestión de Usuarios & Staff</h2>
                    <p className="text-muted mb-0">Controla las credenciales de acceso del personal autorizado</p>
                </div>
            </div>

            {/* Alerta de Error de Conexión Cloud */}
            {mensajeError && (
                <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
                    {mensajeError}
                </div>
            )}

            <div className="row g-4">
                {/* Formulario de Registro */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <h5 className="fw-bold text-dark mb-3">Registrar Operador</h5>
                        <form onSubmit={manejarAgregar}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">Nombre del Trabajador</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Ej: Constanza Silva"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">Correo Corporativo</label>
                                <input 
                                    type="email" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="nombre@pos.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-secondary">Contraseña de Acceso</label>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="••••••••"
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                                disabled={cargando}
                            >
                                {cargando ? 'Guardando...' : 'Crear Cuenta'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tabla de Personal */}
                <div className="col-12 col-md-8">
                    <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                        <div className="p-3 bg-light border-bottom">
                            <span className="fw-bold text-secondary text-uppercase small">Personal con Acceso Autorizado</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Nombre</th>
                                        <th>Correo</th>
                                        <th>RolAsignado</th>
                                        <th style={{ width: '100px' }} className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 👤 FILA DE SESIÓN ACTIVA: Tu cuenta de Administrador logueada */}
                                    {miSesion && (
                                        <tr className="table-primary border-bottom fw-bold">
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-person-check-fill text-success fs-5"></i>
                                                    <span className="text-dark">{miSesion.nombre}</span>
                                                    <span className="badge bg-success ms-1 small">Tú</span>
                                                </div>
                                            </td>
                                            <td className="text-secondary small">{miSesion.correo || miSesion.email}</td>
                                            <td>
                                                <span className="badge bg-dark text-white rounded-pill px-2.5 py-1.5">
                                                    {miSesion.rol || 'Administrador'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <span className="text-muted small px-2">Activo</span>
                                            </td>
                                        </tr>
                                    )}

                                    {/* 👥 FILAS DINÁMICAS: Operadores traídos de Azure PostgreSQL */}
                                    {usuarios.length === 0 ? (
                                        // Mensaje mostrado si la consulta a la BD no retorna registros adicionales
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                No hay otros usuarios registrados en el clúster de Azure o cargando datos...
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios
                                            // Filtramos para evitar duplicar visualmente tu cuenta si ya viene en la respuesta de la BD
                                            .filter(user => miSesion ? user.correo !== miSesion.correo : true)
                                            .map((user) => {
                                                const esAdmin = user.correo?.includes('admin') || user.email?.includes('admin') || user.rol === 'Administrador';
                                                return (
                                                    <tr key={user.id}>
                                                        <td className="ps-4">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="bi bi-person-badge text-primary fs-5"></i>
                                                                <span className="fw-bold text-dark">{user.nombre}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-secondary small">{user.correo || user.email}</td>
                                                        <td>
                                                            <span className={`badge px-2.5 py-1.5 rounded-pill ${
                                                                esAdmin ? 'bg-dark text-white' : 'bg-light text-dark border'
                                                            }`}>
                                                                {esAdmin ? 'Administrador' : (user.rol || 'Cajero / Staff')}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm rounded-2 border-0"
                                                                onClick={() => manejarEliminar(user.id)}
                                                                disabled={esAdmin}
                                                                title={esAdmin ? "Protegido" : "Eliminar operador"}
                                                            >
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}