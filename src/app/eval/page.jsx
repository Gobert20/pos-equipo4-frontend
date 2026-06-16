'use client';
import { useState } from 'react';

const CATEGORY_COLORS = {
  'Base de Datos':       { bg: 'bg-blue-950/30', border: 'border-blue-900/50',    title: 'text-blue-400',    badge: 'bg-blue-900/50 text-blue-300'   },
  'Alta Disponibilidad': { bg: 'bg-purple-950/30', border: 'border-purple-900/50', title: 'text-purple-400', badge: 'bg-purple-900/50 text-purple-300' },
  'Almacenamiento':      { bg: 'bg-amber-950/30',  border: 'border-amber-900/50',  title: 'text-amber-400',  badge: 'bg-amber-900/50 text-amber-300'  },
  'Seguridad':           { bg: 'bg-red-950/30',    border: 'border-red-900/50',    title: 'text-red-400',    badge: 'bg-red-900/50 text-red-300'      },
  'Observabilidad':      { bg: 'bg-green-950/30',  border: 'border-green-200/50', title: 'text-green-400', badge: 'bg-green-900/50 text-green-300' },
};

function ScoreRing({ pct }) {
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center w-[140px] h-[140px]">
      <svg width="140" height="140" className="rotate-[-90deg]">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#374151" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute font-black text-2xl" style={{ color }}>
        {pct}%
      </div>
    </div>
  );
}

function CategoryCard({ name, data }) {
  const [open, setOpen] = useState(true);
  const c = CATEGORY_COLORS[name] || { bg: 'bg-gray-800', border: 'border-gray-700', title: 'text-gray-200', badge: 'bg-gray-700 text-gray-300' };
  const catPct = Math.round((data.pts / data.maxPts) * 100);

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden backdrop-blur-sm`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className={`font-bold text-base ${c.title}`}>{name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {data.pts}/{data.maxPts} pts
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {catPct}%
          </span>
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-700/50 divide-y divide-gray-700/30">
          {data.items.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3 bg-gray-900/40">
              <span className={`mt-0.5 text-lg font-bold leading-none shrink-0 ${item.pass ? 'text-green-400' : 'text-red-400'}`}>
                {item.pass ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.pass ? 'text-gray-200' : 'text-gray-400 line-through'}`}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono break-all bg-black/20 p-1.5 rounded border border-gray-800">{item.detail}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 font-mono ${item.pass ? 'text-green-400' : 'text-red-400'}`}>
                {item.pts}/{item.maxPts}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvalPage() {
  const [key, setKey]       = useState('');
  const [url, setUrl]       = useState('');
  const [report, setReport] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // FUNCIÓN REFORZADA: Auto-repara URLs mal estructuradas e integra parámetros limpios
  const fetchReport = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    let cleanURL = url.trim().replace(/\/+$/, '');
    
    // Si olvidaste poner ".onrender.com", el sistema lo auto-completa por ti
    if (cleanURL.includes('pos-equipo') && !cleanURL.includes('.onrender.com')) {
      cleanURL = `${cleanURL}.onrender.com`;
    }

    try {
      const res = await fetch(`${cleanURL}/api/eval?key=${encodeURIComponent(key.trim())}`, {
        method: 'GET'
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error del servidor (HTTP ${res.status})`);
      }
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el backend de Render. Revisa la URL y los CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 antialiased font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Cabecera */}
        <div className="text-center pt-4">
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1 font-bold">
            Evaluación de Módulo — Cloud Computing
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Panel de Evaluación Docente</h1>
          <p className="text-gray-400 text-sm mt-1.5">
            Instituto Profesional Virginia Gómez — Uso exclusivo del docente
          </p>
        </div>

        {/* Formulario de Conexión */}
        <form onSubmit={fetchReport} className="bg-gray-800 rounded-2xl p-6 space-y-5 border border-gray-700 shadow-xl">
          <h2 className="font-bold text-lg text-gray-100 border-b border-gray-700/50 pb-2">Conectar al sistema del equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">URL del backend del equipo</label>
              <input
                required
                type="text"
                placeholder="https://pos-equipo4-backend.onrender.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Clave de evaluación (EVAL_SECRET)</label>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-2.5 font-medium">
              ⚠️ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all text-sm shadow-md cursor-pointer"
          >
            {loading ? '⏳ Evaluando...' : '🎯 Evaluar sistema'}
          </button>
        </form>

        {/* Resultados del Reporte */}
        {report && (
          <div className="space-y-6 animate-fade-in">

            {/* Tarjeta de Puntaje */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing pct={report.score.pct} />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-3xl font-black tracking-tight text-white">
                  {report.score.total} / {report.score.max} puntos
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  report.score.pct >= 75 ? 'bg-green-950 text-green-400 border border-green-900' : 
                  report.score.pct >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-900' : 
                  'bg-red-950 text-red-400 border border-red-900'
                }`}>
                  {report.score.pct >= 75 ? '🚀 Implementación lograda' : report.score.pct >= 50 ? '⚠️ Implementación parcial' : '❌ Insuficiente'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-400 mt-4 font-mono bg-black/20 p-3 rounded-xl border border-gray-700/50 text-left">
                  <span>🖥️ Hostname: <span className="text-gray-200">{report.meta.hostname}</span></span>
                  <span>📦 Node.js: <span className="text-gray-200">{report.meta.nodeVersion}</span></span>
                  <span>⚙️ Entorno: <span className={report.meta.nodeEnv === 'production' ? 'text-green-400 font-bold' : 'text-amber-400'}>{report.meta.nodeEnv}</span></span>
                  <span>⏱️ Uptime: <span className="text-gray-200">{report.meta.uptime}</span></span>
                  <span>🔌 Puerto: <span className="text-gray-200">{report.meta.port}</span></span>
                  <span>📅 Fecha: <span className="text-gray-200">{new Date(report.meta.timestamp).toLocaleString('es-CL')}</span></span>
                </div>
              </div>
            </div>

            {/* Progreso Visual */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-xl">
              <h2 className="font-bold text-gray-100 mb-4 text-base uppercase tracking-wider">Resumen por categoría</h2>
              <div className="space-y-4">
                {Object.entries(report.byCategory).map(([cat, data]) => {
                  const pct = Math.round((data.pts / data.maxPts) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-300">{cat}</span>
                        <span className="text-gray-400 font-mono">{data.pts}/{data.maxPts} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700/30">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${
                            pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desglose Desplegable */}
            <div className="space-y-3">
              {Object.entries(report.byCategory).map(([cat, data]) => (
                <CategoryCard key={cat} name={cat} data={data} />
              ))}
            </div>

            {/* Pie de Página */}
            <p className="text-center text-xs text-gray-500 pt-2 pb-4 font-mono">
              Evaluación automatizada — Sistema POS · Prof. Patricio Balboa · 2026
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
