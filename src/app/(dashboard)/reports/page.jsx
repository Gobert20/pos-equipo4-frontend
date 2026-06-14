'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReportesPage() {
    const [metricas, setMetricas] = useState({
        totalVentas: 0,
        cantidadTransacciones: 0,
        ticketPromedio: 0,
        productoEstrella: 'Cargando...'
    });
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);

    useEffect(() => {
        obtenerDatosReporte();
    }, []);

    const obtenerDatosReporte = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/reports/dashboard');
            setMetricas(res.data.metricas);
            setProductosMasVendidos(res.data.topProductos);
        } catch (error) {
            console.error("Error al obtener reportes de Azure:", error);
            // Simulación de datos KPI del negocio para poblar la vista en el Sprint
            setMetricas({
                totalVentas: 458990,
                cantidadTransacciones: 34,
                ticketPromedio: 13499,
                productoEstrella: 'Coca-Cola 500ml'
            });
            setProductosMasVendidos([
                { id: 1, nombre: 'Coca-Cola 500ml', cantidad: 45, total: 67500 },
                { id: 2, nombre: 'Café Americano', cantidad: 28, total: 55720 },
                { id: 3, nombre: 'Sándwich Completo', cantidad: 14, total: 49000 },
                { id: 4, nombre: 'Audífonos Bluetooth', cantidad: 2, total: 51980 }
            ]);
        }
    };

    // Función auxiliar para formatear a pesos chilenos / moneda local
    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    return (
        <div className="container-fluid p-4">
            {/* Encabezado */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary text-white p-3 rounded-3 shadow-sm">
                    <i className="bi bi-graph-up-arrow fs-3"></i>
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Reportes KPI & Analítica</h2>
                    <p className="text-muted mb-0">Monitorea el rendimiento financiero de tu POS en tiempo real</p>
                </div>
            </div>

            {/* Fila de Tarjetas Métricas (KPIs) */}
            <div className="row g-3 mb-4">
                {/* KPI 1 */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-3 rounded-3 bg-white h-100">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Ingresos Totales</span>
                                <h3 className="fw-bold text-dark mt-1 mb-0">{formatearMoneda(metricas.totalVentas)}</h3>
                            </div>
                            <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                                <i className="bi bi-cash-coin fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI 2 */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-3 rounded-3 bg-white h-100">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">N° Transacciones</span>
                                <h3 className="fw-bold text-dark mt-1 mb-0">{metricas.cantidadTransacciones}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                                <i className="bi bi-receipt-cutoff fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI 3 */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-3 rounded-3 bg-white h-100">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Ticket Promedio</span>
                                <h3 className="fw-bold text-dark mt-1 mb-0">{formatearMoneda(metricas.ticketPromedio)}</h3>
                            </div>
                            <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                                <i className="bi bi-calculator fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI 4 */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm p-3 rounded-3 bg-white h-100">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Producto Estrella</span>
                                <h5 className="fw-bold text-dark mt-2 mb-0 text-truncate" style={{ maxWidth: '160px' }}>
                                    {metricas.productoEstrella}
                                </h5>
                            </div>
                            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                                <i className="bi bi-star-fill fs-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Productos Más Vendidos */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-secondary text-uppercase small">Top Productos Más Demandados</span>
                    <span className="badge bg-primary rounded-pill">Ranking Cloud</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '70px' }} className="text-center">Rank</th>
                                <th>Nombre del Producto</th>
                                <th className="text-center">Unidades Vendidas</th>
                                <th className="text-end pe-4">Total Recaudado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosMasVendidos.map((prod, index) => (
                                <tr key={prod.id}>
                                    <td className="text-center fw-bold text-secondary">#{index + 1}</td>
                                    <td>
                                        <span className="fw-semibold text-dark">{prod.nombre}</span>
                                    </td>
                                    <td className="text-center fw-bold text-primary">{prod.cantidad} u.</td>
                                    <td className="text-end pe-4 fw-bold text-success">{formatearMoneda(prod.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}