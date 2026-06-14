'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PuntoDeVentaPage() {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    
    // 🛒 Estado activo del carrito de compras (Boleta Actual)
    const [carrito, setCarrito] = useState([]);

    // 🌐 Conexión directa al backend oficial alojado en Render
    const URL_PRODUCTS = 'https://pos-equipo4-backend.onrender.com/api/products';

    useEffect(() => {
        import('bootstrap/dist/css/bootstrap.min.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(link);
        obtenerProductosPOS();
    }, []);

    const obtenerProductosPOS = async () => {
        setCargando(true);
        try {
            const res = await axios.get(URL_PRODUCTS);
            setProductos(res.data);
            setProductosFiltrados(res.data);
        } catch (err) {
            console.error("Error cargando productos al POS:", err);
        } finally {
            boxCargando(false);
        }
    };

    function boxCargando(estado) {
        setCargando(estado);
    }

    useEffect(() => {
        const filtrados = productos.filter(p => 
            (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            String(p.id || p.id_producto || '').includes(busqueda)
        );
        setProductosFiltrados(filtrados);
    }, [busqueda, productos]);

    // ⚡ LÓGICA REACTIVA: Añade productos al carrito o incrementa su cantidad
    const agregarAlCarrito = (producto) => {
        const idProd = producto.id || producto.id_producto;
        
        // Verificar si el producto ya está en la boleta actual
        const existe = carrito.find(item => (item.id || item.id_producto) === idProd);

        if (existe) {
            // Validar que no exceda el stock físico disponible en Azure
            if (existe.cantidadActiva >= Number(producto.stock || producto.existencias)) {
                alert(`⚠️ No puedes agregar más. Stock máximo alcanzado (${producto.stock || producto.existencias} unids).`);
                return;
            }
            setCarrito(carrito.map(item => 
                (item.id || item.id_producto) === idProd 
                    ? { ...item, cantidadActiva: item.cantidadActiva + 1 } 
                    : item
            ));
        } else {
            // Si es nuevo en la boleta, se inicializa con cantidad 1
            if (Number(producto.stock || producto.existencias) <= 0) {
                alert("❌ Este producto no cuenta con existencias en el inventario cloud.");
                return;
            }
            setCarrito([...carrito, { ...producto, cantidadActiva: 1 }]);
        }
    };

    // Modificar cantidades directamente desde la boleta
    const cambiarCantidadManual = (idProd, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(idProd);
            return;
        }
        setCarrito(carrito.map(item => 
            (item.id || item.id_producto) === idProd ? { ...item, cantidadActiva: nuevaCantidad } : item
        ));
    };

    const eliminarDelCarrito = (idProd) => {
        setCarrito(carrito.filter(item => (item.id || item.id_producto) !== idProd));
    };

    // Operaciones matemáticas para los totales de la boleta
    const totalBoleta = carrito.reduce((acc, item) => {
        const precio = Number(item.precio_venta || item.precio || 0);
        return acc + (precio * item.cantidadActiva);
    }, 0);

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="row">
                
                {/* 🛒 SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm p-4 bg-white mb-4">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                            <h3 className="fw-bold text-dark mb-0">
                                <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i>Catálogo de Ventas (POS)
                            </h3>
                            <input 
                                type="text" 
                                className="form-control" 
                                style={{ maxWidth: '320px' }}
                                placeholder="🔍 Buscar producto por nombre o ID..." 
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </div>

                        {cargando ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : (
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                {productosFiltrados.map(p => {
                                    const idReal = p.id || p.id_producto;
                                    const fotoDb = p.imagen_url || p.imagen;
                                    const tieneFotoValida = fotoDb && fotoDb.startsWith('data:image');
                                    const stockDisponible = Number(p.stock || p.existencias || 0);

                                    return (
                                        <div className="col" key={idReal}>
                                            <div className="card h-100 border shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                                
                                                <div className="position-relative">
                                                    <span className={`badge position-absolute top-0 start-0 m-2 ${stockDisponible < 10 ? 'bg-danger' : 'bg-success'}`}>
                                                        Stock: {stockDisponible} unids
                                                    </span>
                                                    
                                                    {tieneFotoValida ? (
                                                        <img 
                                                            src={fotoDb} 
                                                            alt={p.nombre} 
                                                            className="w-100 border-bottom" 
                                                            style={{ height: '140px', objectFit: 'cover' }} 
                                                        />
                                                    ) : (
                                                        <div className="bg-light text-muted d-flex flex-column align-items-center justify-content-center border-bottom" style={{ height: '140px' }}>
                                                            <i className="bi bi-image text-secondary opacity-50 fs-2 mb-1"></i>
                                                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>SIN FOTO</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="card-body p-3 d-flex flex-column justify-content-between text-center">
                                                    <div>
                                                        <h6 className="fw-bold text-dark text-truncate mb-1">{p.nombre}</h6>
                                                        <h5 className="fw-bold text-success mb-3">
                                                            ${Number(p.precio_venta || p.precio).toLocaleString('es-CL')}
                                                        </h5>
                                                    </div>
                                                    <button 
                                                        onClick={() => agregarAlCarrito(p)}
                                                        className="btn btn-primary btn-sm w-100 fw-bold rounded-pill py-2 shadow-sm"
                                                        disabled={stockDisponible <= 0}
                                                    >
                                                        {stockDisponible <= 0 ? '⚠️ Agotado' : <><i className="bi bi-plus-circle me-1"></i> Agregar al Carrito</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 📋 SECCIÓN DERECHA: BOLETA ACTUAL DINÁMICA */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-4 bg-white position-sticky" style={{ top: '20px', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h4 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bi bi-receipt-cutoff text-primary me-2"></i>Boleta Actual
                            </h4>

                            {carrito.length === 0 ? (
                                <div className="text-center text-muted py-5 mt-4">
                                    <i className="bi bi-cart-x display-5 opacity-25 d-block mb-3"></i>
                                    El carrito está vacío.<br/>Haz clic en un producto para agregarlo.
                                </div>
                            ) : (
                                <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                                    {carrito.map(item => {
                                        const idI = item.id || item.id_producto;
                                        const pr = Number(item.precio_venta || item.precio || 0);
                                        return (
                                            <div key={idI} className="d-flex align-items-center justify-content-between border-bottom py-2 g-2">
                                                <div style={{ maxWidth: '60%' }}>
                                                    <span className="fw-bold text-dark d-block text-truncate" style={{ fontSize: '14px' }}>{item.nombre}</span>
                                                    <small className="text-muted">${pr.toLocaleString('es-CL')} c/u</small>
                                                </div>
                                                <div className="d-flex align-items-center gap-1">
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-sm text-center px-1" 
                                                        style={{ width: '50px', fontWeight: 'bold' }}
                                                        value={item.cantidadActiva} 
                                                        onChange={(e) => cambiarCantidadManual(idI, parseInt(e.target.value) || 0)}
                                                    />
                                                    <button onClick={() => eliminarDelCarrito(idI)} className="btn btn-link text-danger p-1">
                                                        <i className="bi bi-trash3-fill"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pie de la Boleta Fija con Totales */}
                        {carrito.length > 0 && (
                            <div className="border-top pt-3 mt-auto">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0 text-secondary fw-bold">TOTAL VENTA:</h5>
                                    <h3 className="mb-0 text-success fw-bold">${totalBoleta.toLocaleString('es-CL')}</h3>
                                </div>
                                <button onClick={() => { alert("🛒 ¡Venta procesada exitosamente en el POS frontend!"); setCarrito([]); }} className="btn btn-success btn-lg w-100 fw-bold shadow-sm rounded-3">
                                    <i className="bi bi-currency-dollar me-1"></i>Finalizar y Cobrar
                                </button>
                                <button onClick={() => setCarrito([])} className="btn btn-light btn-sm w-100 text-muted mt-2 border-0">
                                    Vaciar Carrito
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}