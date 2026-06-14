'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SalesHistoryPage() {
    const [historialVentas, setHistorialVentas] = useState([]);
    const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
    const [detalleBoleta, setDetalleBoleta] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    // 🌐 URL conectada oficialmente al Backend Cloud en Render
    const URL_SALES = 'https://pos-equipo4-backend.onrender.com/api/sales';

    useEffect(() => {
        import('bootstrap/dist/css/bootstrap.min.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(link);
        obtenerHistorialVentas();
    }, []);

    const obtenerHistorialVentas = async () => {
        setCargando(true);
        try {
            const res = await axios.get(URL_SALES);
            setHistorialVentas(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar historial desde Render:", err);
            setHistorialVentas([]);
        } finally {
            setCargando(false);
        }
    };

    const verDetalleBoletaReal = async (id) => {
        setCargandoDetalle(true);
        try {
            const res = await axios.get(`${URL_SALES}/${id}/detalle`);
            setBoletaSeleccionada(id);
            setDetalleBoleta(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al traer desglose de boleta:", err);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const totalRecaudado = historialVentas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const cantidadBoletas = historialVentas.length;
    const ticketPromedio = cantidadBoletas > 0 ? Math.round(totalRecaudado / cantidadBoletas) : 0;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h1 className="h3 fw-bold mb-4 text-dark">
                <i className="bi bi-receipt-cutoff text-warning me-2"></i>Módulo Historial de Ventas (Azure)
            </h1>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 bg-success-subtle p-3 text-center shadow-sm">
                        <small className="text-success fw-bold text-uppercase">Caja Recaudada</small>
                        <h3 className="fw-bold text-success mb-0">${totalRecaudado.toLocaleString('es-CL')}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-primary-subtle p-3 text-center shadow-sm">
                        <small className="text-primary fw-bold text-uppercase">Ventas Totales</small>
                        <h3 className="fw-bold text-primary mb-0">{cantidadBoletas} boletas</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-warning-subtle p-3 text-center shadow-sm">
                        <small className="text-warning-emphasis fw-bold text-uppercase">Ticket Promedio</small>
                        <h3 className="fw-bold text-warning-emphasis mb-0">${ticketPromedio.toLocaleString('es-CL')}</h3>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* TABLA */}
                <div className="col-md-7 mb-4">
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                        <div className="table-responsive">
                            {cargando ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                    <span className="text-muted small fw-semibold">Sincronizando transacciones de Azure...</span>
                                </div>
                            ) : (
                                <table className="table table-hover align-middle" style={{ cursor: 'pointer' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th>N° Boleta</th>
                                            <th>Fecha</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historialVentas.map(v => (
                                            <tr key={v.id} onClick={() => verDetalleBoletaReal(v.id)} className={boletaSeleccionada === v.id ? 'table-warning animate-fade' : ''}>
                                                <td className="fw-bold text-secondary">#000{v.id} 🔍</td>
                                                <td className="small">{new Date(v.created_at || v.fecha).toLocaleString('es-CL')}</td>
                                                <td className="text-end fw-bold text-success">${Number(v.total).toLocaleString('es-CL')}</td>
                                            </tr>
                                        ))}
                                        {historialVentas.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-5">
                                                    <i className="bi bi-folder-x d-block display-6 opacity-25 mb-2"></i>
                                                    Aún no registras boletas emitidas en la base de datos cloud.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESGLOSE */}
                <div className="col-md-5 mb-4">
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-3 sticky-top" style={{ top: '20px' }}>
                        <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">
                            Artículos en la Boleta {boletaSeleccionada ? `#000${boletaSeleccionada}` : ''}
                        </h5>
                        
                        {cargandoDetalle ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-secondary spinner-border-sm me-2" role="status"></div>
                                <span className="text-muted small">Abriendo desglose...</span>
                            </div>
                        ) : boletaSeleccionada ? (
                            <ul className="list-group list-group-flush">
                                {detalleBoleta.map((item, index) => {
                                    const nombreProducto = item.nombre || item.product_name || item.name || 'Producto';
                                    const cantidad = item.cantidad || item.quantity || 1;
                                    const subtotal = item.subtotal || item.price || 0;

                                    return (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0 small">
                                            <div>
                                                <span className="fw-bold text-dark">{nombreProducto}</span>
                                                <span className="text-muted ms-2">(x{cantidad})</span>
                                            </div>
                                            <span className="fw-bold text-secondary">${Number(subtotal).toLocaleString('es-CL')}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center text-muted py-4">
                                <i className="bi bi-arrow-left-circle me-2"></i>
                                Selecciona una boleta a la izquierda para ver su detalle.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}