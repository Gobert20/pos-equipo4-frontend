'use client';
import { useState } from 'react';

const CATEGORY_COLORS = {
  'Base de Datos':       { bg: '#1e3a8a', border: '#1d4ed8', text: '#60a5fa', badge: '#1e40af' },
  'Alta Disponibilidad': { bg: '#581c87', border: '#6b21a8', text: '#c084fc', badge: '#6b21a8' },
  'Almacenamiento':      { bg: '#713f12', border: '#a16207', text: '#facc15', badge: '#854d0e' },
  'Seguridad':           { bg: '#7f1d1d', border: '#b91c1c', text: '#f87171', badge: '#991b1b' },
  'Observabilidad':      { bg: '#14532d', border: '#15803d', text: '#4ade80', badge: '#166534' },
};

function ScoreRing({ pct }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '140px', height: '140px', margin: '0 auto' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#374151" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', fontWeight: '900', fontSize: '1.5rem', color }}>
        {pct}%
      </div>
    </div>
  );
}

function CategoryCard({ name, data }) {
  const [open, setOpen] = useState(true);
  const c = CATEGORY_COLORS[name] || { bg: '#1f2937', border: '#374151', text: '#f3f4f6', badge: '#4b5563' };
  const catPct = Math.round((data.pts / data.maxPts) * 100);

  return (
    <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.4)', borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden', marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: c.text }}>{name}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px', backgroundColor: c.badge, color: '#fff' }}>
            {data.pts}/{data.maxPts} pts
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px', backgroundColor: c.badge, color: '#fff' }}>
            {catPct}%
          </span>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(55, 65, 81, 0.5)', backgroundColor: 'rgba(17, 24, 39, 0.4)' }}>
          {data.items.map((item, i) => (
            <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'start', gap: '12px', borderBottom: '1px solid #1f2937' }}>
              <span style={{ color: item.pass ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: '1.125rem', marginTop: '2px' }}>
                {item.pass ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: item.pass ? '#e5e7eb' : '#9ca3af', textDecoration: item.pass ? 'none' : 'line-through' }}>
                  {item.name}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all', backgroundColor: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '4px', border: '1px solid #1f2937' }}>
                  {item.detail}
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: item.pass ? '#22c55e' : '#ef4444', fontWeight: 'bold', marginLeft: 'auto' }}>
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

  const fetchReport = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    let cleanURL = url.trim().replace(/\/+$/, '');
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
      setError(err.message || 'No se pudo conectar con el backend. Revisa la URL y los CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Cabecera */}
        <div style={{ textAlign: 'center', paddingTop: '16px', marginBottom: '8px' }}>
          <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', tracking: '0.1em', color: '#818cf8', margin: '0 0 4px 0', fontWeight: 'bold' }}>
            Evaluación de Módulo — Cloud Computing
          </p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: 0, color: '#fff', tracking: '-0.025em' }}>Panel de Evaluación Docente</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '6px 0 0 0' }}>
            Instituto Profesional Virginia Gómez — Uso exclusivo del docente
          </p>
        </div>

        {/* Formulario de Conexión */}
        <form onSubmit={fetchReport} style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', margin: 0, borderBottom: '1px solid #334155', paddingBottom: '8px', color: '#f3f4f6' }}>Conectar al sistema del equipo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL del backend del equipo</label>
              <input
                required
                type="text"
                placeholder="https://pos-equipo4-backend.onrender.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clave de evaluación (EVAL_SECRET)</label>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>
          
          {error && (
            <div style={{ color: '#f87171', fontSize: '0.875rem', backgroundColor: 'rgba(127, 29, 29, 0.3)', border: '1px solid #991b1b', borderRadius: '8px', padding: '10px 16px', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: 'max-content', backgroundColor: '#4f46e5', color: '#fff', border: 'none', fontWeight: 'bold', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'background-color 0.2s', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? '⏳ Evaluando...' : '🎯 Evaluar sistema'}
          </button>
        </form>

        {/* Resultados del Reporte */}
        {report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Tarjeta de Puntaje */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
              <ScoreRing pct={report.score.pct} />
              <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '1.875rem', fontWeight: '900', margin: 0, color: '#fff', tracking: '-0.025em' }}>
                  {report.score.total} / {report.score.max} puntos
                </p>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #15803d', backgroundColor: '#14532d', color: '#4ade80' }}>
                    🚀 Implementación lograda
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginTop: '16px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <div>🖥️ Hostname: <span style={{ color: '#e2e8f0' }}>{report.meta.hostname}</span></div>
                  <div>📦 Node.js: <span style={{ color: '#e2e8f0' }}>{report.meta.nodeVersion}</span></div>
                  <div>⚙️ Entorno: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{report.meta.nodeEnv}</span></div>
                  <div>⏱️ Uptime: <span style={{ color: '#e2e8f0' }}>{report.meta.uptime}</span></div>
                  <div>🔌 Puerto: <span style={{ color: '#e2e8f0' }}>{report.meta.port}</span></div>
                  <div>📅 Fecha: <span style={{ color: '#e2e8f0' }}>{new Date(report.meta.timestamp).toLocaleString('es-CL')}</span></div>
                </div>
              </div>
            </div>

            {/* Progreso Visual */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
              <h2 style={{ fontWeight: 'bold', color: '#f1f5f9', margin: '0 0 16px 0', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumen por categoría</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(report.byCategory).map(([cat, data]) => {
                  const pct = Math.round((data.pts / data.maxPts) * 100);
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600' }}>
                        <span style={{ color: '#cbd5e1' }}>{cat}</span>
                        <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{data.pts}/{data.maxPts} ({pct}%)</span>
                      </div>
                      <div style={{ height: '12px', backgroundColor: '#0f172a', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #334155' }}>
                        <div
                          style={{ width: `${pct}%`, height: '100%', borderRadius: '9999px', backgroundColor: '#22c55e', transition: 'width 1s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desglose Desplegable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(report.byCategory).map(([cat, data]) => (
                <CategoryCard key={cat} name={cat} data={data} />
              ))}
            </div>

            {/* Pie de Página */}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', margin: '16px 0 8px 0' }}>
              Evaluación automatizada — Sistema POS · Prof. Patricio Balboa · 2026
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
