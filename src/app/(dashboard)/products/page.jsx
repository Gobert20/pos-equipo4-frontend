'use client';
import { useEffect, useState } from 'react';
import axios from 'axios'; 

export default function ProductsManagementPage() {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // Formulario producto
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [imagenBase64, setImagenBase64] = useState(''); 
    const [idEditando, setIdEditando] = useState(null);
    const [vista, setVista] = useState('tabla'); 

    // ✅ CORREGIDO: Ahora apunta directamente a tu servidor en producción en Render
    const URL_PRODUCTS = 'https://pos-equipo4-backend.onrender.com/api/products';

    useEffect(() => {
        import('bootstrap/dist/css/bootstrap.min.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(link);
        obtenerProductos();
    }, []);

    const obtenerProductos = async () => {
        setCargando(true);
        try {
            const res = await axios.get(URL_PRODUCTS);
            // Validamos que la respuesta contenga un array para evitar crasheos si la base de datos cambia
            const datos = Array.isArray(res.data) ? res.data : [];
            setProductos(datos);
            setProductosFiltrados(datos);
        } catch (err) {
            console.error("Error de conexión:", err);
            alert("Error al conectar con Azure Cloud a través de Render. Revisa la consola o los logs del servidor.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const filtrados = productos.filter(p => {
            const n = (p.nombre || '').toLowerCase();
            const i = String(p.id || p.id_producto || '');
            return n.includes(busqueda.toLowerCase()) || i.includes(busqueda);
        });
        setProductosFiltrados(filtrados);
    }, [busqueda, productos]);

    // 🗜️ Comprime la imagen para que Azure la guarde de forma real en la Base de Datos
    const comprimirImagen = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200; // Redimensionado ideal para miniatura de tabla y POS
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Exporta como JPEG ultraligero
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                setImagenBase64(dataUrl); 
            };
        };
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            comprimirImagen(file);
        }
    };

    const guardarProducto = async (e) => {
        e.preventDefault();
        
        const data = { 
            nombre: nombre.trim(), 
            precio_venta: parseFloat(precio), 
            precio: parseFloat(precio), 
            stock: parseInt(stock),
            imagen_url: imagenBase64 || null,
            uploads: imagenBase64 || null 
        };
        
        try {
            if (idEditando) {
                await axios.put(`${URL_PRODUCTS}/${idEditando}`, data);
                alert("✏️ Producto e imagen guardados con éxito en Azure Cloud.");
            } else {
                await axios.post(URL_PRODUCTS, data);
                alert("➕ Nuevo producto registrado con éxito en Azure.");
            }
            
            setVista('tabla');
            obtenerProductos();
            limpiarFormulario();
        } catch (err) {
            alert("Error al guardar en Azure: " + err.message);
        }
    };

    const prepararEdicion = (p) => {
        setIdEditando(p.id || p.id_producto);
        setNombre(p.nombre);
        setPrecio(p.precio_venta || p.precio);
        setStock(p.stock || p.existencias);
        setImagenBase64(p.imagen_url || p.imagen || ''); 
        setVista('formulario');
    };

    const borrarProducto = async (id) => {
        if (confirm("¿Estás seguro de eliminar este producto de Azure?")) {
            try {
                await axios.delete(`${URL_PRODUCTS}/${id}`);
                obtenerProductos();
            } catch (err) {
                alert("Error al eliminar: " + err.message);
            }
        }
    };

    const limpiarFormulario = () => {
        setIdEditando(null); 
        setNombre(''); 
        setPrecio(''); 
        setStock('');
        setImagenBase64(''); 
    };

    const productosCriticos = productos.filter(p => Number(p.stock || p.existencias) < 10).length;

    return (
        <div className="container p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Cabecera */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h1 className="h3 fw-bold text-dark mb-0">
                    <i className="bi bi-box-seam-fill text-primary me-2"></i>Módulo de Inventario y Productos
                </h1>
                <div className="badge bg-white text-secondary border p-2 shadow-sm small">
                    <i className="bi bi-hdd-network text-primary me-2"></i>pos-db-equipo4.postgres.database.azure.com
                </div>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 bg-primary-subtle p-3 shadow-sm d-flex flex-row justify-content-between align-items-center">
                        <div>
                            <small className="text-primary fw-bold text-uppercase d-block">Items en Catálogo</small>
                            <h4 className="fw-bold text-primary mb-0">{productos.length} productos</h4>
                        </div>
                        <i className="bi bi-tags fs-2 text-primary opacity-50"></i>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 bg-danger-subtle p-3 shadow-sm d-flex flex-row justify-content-between align-items-center">
                        <div>
                            <small className="text-danger fw-bold text-uppercase d-block">Stock Crítico (&lt; 10 unidades)</small>
                            <h4 className="fw-bold text-danger mb-0">{productosCriticos} alertas</h4>
                        </div>
                        <i className="bi bi-exclamation-triangle fs-2 text-danger opacity-50"></i>
                    </div>
                </div>
            </div>

            {/* Vista Tabla Principal */}
            {vista === 'tabla' ? (
                <div className="card border-0 shadow-sm p-4 bg-white">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{ maxWidth: '350px' }} 
                            placeholder="🔍 Buscar por nombre o ID..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)} 
                        />
                        <button onClick={() => { limpiarFormulario(); setVista('formulario'); }} className="btn btn-success fw-bold px-4">
                            <i className="bi bi-plus-lg me-2"></i>Agregar Nuevo Producto
                        </button>
                    </div>

                    <div className="table-responsive">
                        {cargando ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="text-muted mt-2">Conectando con Azure Cloud...</p>
                            </div>
                        ) : (
                            <table className="table table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Imagen</th>
                                        <th>Nombre del Producto</th>
                                        <th>Precio de Venta</th>
                                        <th>Existencias</th>
                                        <th className="text-center" style={{ width: '150px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosFiltrados.map(p => {
                                        const idReal = p.id || p.id_producto;
                                        const fotoDb = p.imagen_url || p.imagen;

                                        return (
                                            <tr key={idReal}>
                                                <td className="text-muted small">#00{idReal}</td>
                                                <td>
                                                    {fotoDb && fotoDb.startsWith('data:image') ? (
                                                        <img 
                                                            src={fotoDb} 
                                                            alt={p.nombre} 
                                                            className="rounded shadow-sm border" 
                                                            style={{ width: '45px', height: '45px', objectFit: 'cover' }} 
                                                        />
                                                    ) : (
                                                        <div className="bg-light text-muted d-flex align-items-center justify-content-center rounded border" style={{ width: '45px', height: '45px', fontSize: '10px' }}>Sin foto</div>
                                                    )}
                                                </td>
                                                <td className="fw-bold text-dark">{p.nombre}</td>
                                                <td className="text-success fw-bold">${Number(p.precio_venta || p.precio).toLocaleString('es-CL')}</td>
                                                <td>
                                                    <span className={`badge ${Number(p.stock || p.existencias) < 10 ? 'bg-danger' : 'bg-light text-dark border'} px-2 py-2`}>
                                                        {p.stock || p.existencias} unidades
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button onClick={() => prepararEdicion(p)} className="btn btn-outline-warning btn-sm me-2">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button onClick={() => borrarProducto(idReal)} className="btn btn-outline-danger btn-sm">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {productosFiltrados.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">No se encontraron productos en la base de datos cloud.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                /* Formulario */
                <div className="card border-0 shadow-sm p-4 bg-white mx-auto" style={{ maxWidth: '600px' }}>
                    <form onSubmit={guardarProducto}>
                        <h4 className="fw-bold text-dark mb-4 border-bottom pb-2">
                            {idEditando ? `✏️ Editar Registro #00${idEditando}` : '➕ Registrar Producto Cloud'}
                        </h4>
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold text-secondary small">Nombre Comercial</label>
                            <input type="text" className="form-control form-control-lg" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Coca-Cola Sabor Original 1.5L" />
                        </div>
                        
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label fw-bold text-secondary small">Precio Público ($)</label>
                                <input type="number" className="form-control form-control-lg" value={precio} onChange={e => setPrecio(e.target.value)} required placeholder="1500" min="1" />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-bold text-secondary small">Stock Inicial</label>
                                <input type="number" className="form-control form-control-lg" value={stock} onChange={e => setStock(e.target.value)} required placeholder="50" min="0" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small">Imagen del Producto (Compresión Automática Cloud)</label>
                            <input 
                                type="file" 
                                className="form-control form-control-md" 
                                accept="image/*" 
                                onChange={handleImagenChange} 
                            />
                            {imagenBase64 && (
                                <div className="mt-3 text-center">
                                    <span className="d-block small text-success fw-bold mb-1">⚡ Imagen optimizada para base de datos y POS</span>
                                    <img src={imagenBase64} alt="Previsualización comprimida" className="rounded border shadow-sm" style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-3 pt-2">
                            <button type="submit" className="btn btn-primary btn-lg flex-grow-1 fw-bold">
                                <i className="bi bi-cloud-arrow-up-fill me-2"></i>Guardar en Azure
                            </button>
                            <button type="button" onClick={() => setVista('tabla')} className="btn btn-light btn-lg border px-4">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}