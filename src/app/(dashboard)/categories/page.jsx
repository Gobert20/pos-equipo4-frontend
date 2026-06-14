'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState([]);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [cargando, setCargando] = useState(false);

    // Cargar las categorías al montar el componente
    useEffect(() => {
        obtenerCategorias();
    }, []);

    const obtenerCategorias = async () => {
        try {
            // NOTA: Cuando crees tu endpoint en el backend, apuntará aquí
            const res = await axios.get('https://pos-equipo4-backend.onrender.com/api/categories');
            setCategorias(res.data);
        } catch (error) {
            console.error("Error al obtener categorías de Azure:", error);
            // Simulación temporal en caso de que no hayas creado el endpoint en el backend aún
            setCategorias([
                { id: 1, nombre: 'Bebidas y Jugos' },
                { id: 2, nombre: 'Snacks y Papas' },
                { id: 3, nombre: 'Comida Rápida' },
                { id: 4, nombre: 'Tecnología' }
            ]);
        }
    };

    const manejarAgregar = async (e) => {
        e.preventDefault();
        if (!nuevaCategoria.trim()) return;
        setCargando(true);

        try {
            await axios.post('https://pos-equipo4-backend.onrender.com/api/categories', { nombre: nuevaCategoria });
            setNuevaCategoria('');
            obtenerCategorias();
        } catch (error) {
            console.error("Error al guardar categoría:", error);
            // Agregado local para que puedas probar la interfaz de inmediato
            const nueva = { id: Date.now(), nombre: nuevaCategoria };
            setCategorias([...categorias, nueva]);
            setNuevaCategoria('');
        } finally {
            setCargando(false);
        }
    };

    const manejarEliminar = async (id) => {
        try {
            await axios.delete(`https://pos-equipo4-backend.onrender.com/api/categories/${id}`);
            obtenerCategorias();
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            setCategorias(categorias.filter(cat => cat.id !== id));
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                    <i className="bi bi-tags-fill fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Gestión de Categorías</h2>
                    <p className="text-muted mb-0">Organiza los productos de tu inventario en la nube</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Formulario de Registro */}
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <h5 className="fw-bold text-dark mb-3">Nueva Categoría</h5>
                        <form onSubmit={manejarAgregar}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">Nombre de la Categoría</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-2"
                                    placeholder="Ej: Lácteos, Limpieza..."
                                    value={nuevaCategoria}
                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                                disabled={cargando}
                            >
                                {cargando ? 'Guardando...' : 'Agregar Categoría'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tabla/Lista de Categorías */}
                <div className="col-12 col-md-8">
                    <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                        <div className="p-3 bg-light border-bottom">
                            <span className="fw-bold text-secondary text-uppercase small">Categorías Registradas</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '80px' }} className="ps-4">ID</th>
                                        <th>Nombre</th>
                                        <th style={{ width: '120px' }} className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorias.map((cat) => (
                                        <tr key={cat.id}>
                                            <td className="ps-4 text-muted fw-bold">#{cat.id}</td>
                                            <td className="fw-semibold text-dark">{cat.nombre}</td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-outline-danger btn-sm rounded-2 border-0"
                                                    onClick={() => manejarEliminar(cat.id)}
                                                    title="Eliminar categoría"
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categorias.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted py-4">
                                                No hay categorías creadas aún.
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