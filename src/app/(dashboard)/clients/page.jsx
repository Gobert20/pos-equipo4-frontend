'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState('');
    const [rut, setRut] = useState('');
    const [correo, setCorreo] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        obtenerClientes();
    }, []);

    const obtenerClientes = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/clients');
            setClientes(res.data);
        } catch (error) {
            console.error("Error al obtener clientes de Azure:", error);
            // Simulación local inicial para poblar la tabla mientras se monta el backend
            setClientes([
                { id: 1, nombre: 'Juan Pérez', rut: '12.345.678-9', correo: 'juan.perez@email.com' },
                { id: 2, nombre: 'María José Concha', rut: '18.765.432-1', correo: 'mariajose@email.com' }
            ]);
        }
    };

    const manejarAgregar = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !rut.trim()) return;
        setCargando(true);

        const nuevoCliente = { nombre, rut, correo };

        try {
            await axios.post('http://localhost:3000/api/clients', nuevoCliente);
            limpiarFormulario();
            obtenerClientes();
        } catch (error) {
            console.error("Error al guardar cliente en Cloud:", error);
            // Backup local para pruebas de interfaz
            setClientes([...clientes, { id: Date.now(), ...nuevoCliente }]);
            limpiarFormulario();
        } finally {
            setCargando(false);
        }
    };

    const limpiarFormulario = () => {
        setNombre('');
        setRut('');
        setCorreo('');
    };

    const manejarEliminar = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/clients/${id}`);
            obtenerClientes();
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            setClientes(clientes.filter(c => c.id !== id));
        }
    };

    return (
        <div className="container-fluid p-4">
            {/* Encabezado */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                    <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Gestión de Clientes</h2>
                    <p className="text-muted mb-0">Administra la base de datos de compradores de la empresa</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Formulario de Registro */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <h5 className="fw-bold text-dark mb-3">Nuevo Cliente</h5>
                        <form onSubmit={manejarAgregar}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Ej: Carlos Muñoz"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">RUT / Identificación</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Ej: 19.888.777-6"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-secondary">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="correo@ejemplo.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                                disabled={cargando}
                            >
                                {cargando ? 'Guardando...' : 'Registrar Cliente'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tabla de Datos */}
                <div className="col-12 col-md-8">
                    <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                        <div className="p-3 bg-light border-bottom">
                            <span className="fw-bold text-secondary text-uppercase small">Directorio de Clientes</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Nombre</th>
                                        <th>RUT</th>
                                        <th>Correo</th>
                                        <th style={{ width: '100px' }} className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{cliente.nombre}</div>
                                            </td>
                                            <td className="text-secondary fw-medium">{cliente.rut}</td>
                                            <td className="text-muted small">{cliente.correo || 'No registrado'}</td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-outline-danger btn-sm rounded-2 border-0"
                                                    onClick={() => manejarEliminar(cliente.id)}
                                                    title="Eliminar Cliente"
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {clientes.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4">
                                                No hay clientes registrados en el sistema.
                                            </td>
                                        </tr>
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