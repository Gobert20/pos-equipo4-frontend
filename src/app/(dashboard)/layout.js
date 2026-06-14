'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [usuario, setUsuario] = useState('Usuario Cloud');

    useEffect(() => {
        // Importamos dinámicamente Bootstrap CSS e Iconos en el layout del dashboard
        import('bootstrap/dist/css/bootstrap.min.css');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
        document.head.appendChild(link);

        // Rescatamos el nombre del usuario logueado que guardamos en la base de datos de Azure
        const nombreGuardado = localStorage.getItem('usuario_nombre');
        if (nombreGuardado) {
            setUsuario(nombreGuardado);
        }
    }, []);

    const manejarCerrarSesion = () => {
        localStorage.clear();
        router.push('/');
    };

    // Lista unificada de todos tus módulos (Listos y por construir)
    const enlacesMenu = [
        { nombre: 'Punto de Venta (POS)', ruta: '/pos', icono: 'bi-cart-fill' },
        { nombre: 'Inventario Cloud', ruta: '/products', icono: 'bi-box-seam-fill' },
        { nombre: 'Historial de Ventas', ruta: '/sales', icono: 'bi-receipt' },
        { nombre: 'Categorías', ruta: '/categories', icono: 'bi-tags-fill' }, // 🆕 Agregado
        { nombre: 'Clientes', ruta: '/clients', icono: 'bi-people-fill' },     // 🆕 Agregado
        { nombre: 'Reportes KPI', ruta: '/reports', icono: 'bi-graph-up-arrow' },// 🆕 Agregado
        { nombre: 'Usuarios / Staff', ruta: '/users', icono: 'bi-person-gear' } // 🆕 Agregado
    ];

    return (
        <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            
            {/* 🔝 Barra Superior (Navbar) */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm py-3">
                <div className="container-fluid">
                    <Link href="/pos" className="navbar-brand fw-bold d-flex align-items-center gap-2 text-white">
                        <i className="bi bi-cpu-fill text-primary fs-4"></i> POS EQUIPO 4
                    </Link>
                    
                    <div className="d-flex align-items-center gap-4 ms-auto">
                        <span className="text-light small d-none d-md-inline-block">
                            <i className="bi bi-person-circle text-primary me-2"></i>
                            Bienvenido, <strong className="text-white">{usuario}</strong>
                        </span>
                        <button 
                            onClick={manejarCerrarSesion} 
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-bold rounded-2 px-3"
                        >
                            <i className="bi bi-box-arrow-right"></i> Salir
                        </button>
                    </div>
                </div>
            </nav>

            {/* 🧭 Contenedor Principal: Menú + Contenido Dinámico */}
            <div className="d-flex flex-grow-1 overflow-hidden">
                
                {/* Menú Lateral (Sidebar) */}
                <div className="bg-white border-end shadow-sm flex-shrink-0 d-none d-lg-block" style={{ width: '260px' }}>
                    <div className="p-3 bg-light border-bottom">
                        <small className="text-muted text-uppercase fw-bold tracking-wider">Módulos del Sistema</small>
                    </div>
                    <div className="list-group list-group-flush p-2 gap-1">
                        {enlacesMenu.map((item) => {
                            const activo = pathname === item.ruta;
                            return (
                                <Link
                                    key={item.ruta}
                                    href={item.ruta}
                                    className={`list-group-item list-group-item-action border-0 rounded-3 d-flex align-items-center gap-3 py-2.5 px-3 fw-medium ${
                                        activo 
                                            ? 'bg-primary text-white shadow-sm' 
                                            : 'text-secondary bg-transparent'
                                    }`}
                                >
                                    <i className={`bi ${item.icono} ${activo ? 'text-white' : 'text-muted'} fs-5`}></i>
                                    <span>{item.nombre}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* 💻 Espacio donde se renderizan las páginas específicas (POS, Products, Categories, etc.) */}
                <div className="flex-grow-1 overflow-auto position-relative bg-light">
                    {children}
                </div>

            </div>
        </div>
    );
}