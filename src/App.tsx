import { useState } from 'react'
import './App.css'
import type { Vista } from './types'
import FormularioInscripcion from './components/FormularioInscripcion'
import PanelAdmin from './components/PanelAdmin'

/* ── Masthead ─────────────────────────────────────── */
function Masthead({ vistaActual, onNavAdmin }: { vistaActual: Vista; onNavAdmin: () => void }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      {/* Utility bar */}
      <div className="utility-bar">
        <span>Gobierno de Chile · Ministerio de Educación · SLEP Colchagua</span>
        <span style={{ opacity: 0.7, fontSize: 11 }}>Torneo Comunal de Atletismo Escolar 2026</span>
      </div>

      {/* Brand bar */}
      <div className="brand-bar">
        <div className="brand-bar-inner">
          <div className="brand-badge">SC</div>
          <div>
            <div className="brand-wm-ovr">Servicio Local de Educación Pública</div>
            <div className="brand-wm-nm">Colchagua</div>
          </div>
          <div
            className="brand-event-tag"
            style={{ display: 'none' }}
            // mostrado en md+
          >
            Atletismo Escolar 2026
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="brand-event-tag">Atletismo 2026</span>
            {vistaActual !== 'inicio' && (
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={() => window.location.reload()}
                style={{ fontSize: 12 }}
              >
                Inicio
              </button>
            )}
            {vistaActual !== 'admin' && (
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={onNavAdmin}
                style={{ fontSize: 12 }}
              >
                Panel Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

/* ── Vista de Inicio ──────────────────────────────── */
function VistaInicio({ onInscripcion, onAdmin }: { onInscripcion: () => void; onAdmin: () => void }) {
  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">SLEP Colchagua — Deporte Escolar</div>
            <h1 className="hero-h1">
              Torneo Comunal de Atletismo Escolar 2026
            </h1>
            <p className="hero-desc">
              Inscriba a sus estudiantes en el torneo comunal de atletismo. Categorías Sub-14 y Juvenil, con pruebas de pista, campo y postas para todos los establecimientos de la comunidad educativa de Colchagua.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button className="btn btn-primary-dark btn-lg" onClick={onInscripcion}>
                Iniciar inscripción →
              </button>
              <button className="btn btn-outline-dark btn-md" onClick={onAdmin}>
                Panel de administración
              </button>
            </div>
          </div>

          <div className="hero-stat-grid">
            <div className="hero-stat">
              <div className="hero-stat-n">Sub-14</div>
              <div className="hero-stat-l">2012 · 2013 · 2014</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">Juvenil</div>
              <div className="hero-stat-l">2009 · 2010 · 2011</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">20</div>
              <div className="hero-stat-l">Atletas máx. por establecimiento</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">+10</div>
              <div className="hero-stat-l">Pruebas disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cuerpo informativo */}
      <main
        id="main-content"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px', flex: 1 }}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {[
            {
              icono: '🏃',
              titulo: 'Categoría Sub-14',
              descripcion: 'Estudiantes nacidos en 2012, 2013 o 2014. Pruebas de 80m, 150m, 400m, 800m, 1500m, salto, lanzamiento y posta 5x80.',
            },
            {
              icono: '⚡',
              titulo: 'Categoría Juvenil',
              descripcion: 'Estudiantes nacidos en 2009, 2010 o 2011. Pruebas de 100m, 200m, 400m, 800m, 2000m, salto, lanzamiento, jabalina y postas.',
            },
            {
              icono: '📋',
              titulo: 'Cómo inscribirse',
              descripcion: 'Seleccione su establecimiento, complete los datos del responsable y agregue a cada estudiante con sus pruebas. Máximo 20 atletas por establecimiento.',
            },
          ].map((c) => (
            <div key={c.titulo} className="card" style={{ borderTop: '4px solid var(--royal-500)' }}>
              <div className="card-body flex flex-col gap-3">
                <span style={{ fontSize: 32 }}>{c.icono}</span>
                <h3
                  className="text-base font-black"
                  style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)', margin: 0 }}
                >
                  {c.titulo}
                </h3>
                <p className="text-sm" style={{ color: 'var(--fg-3)', lineHeight: 1.6, margin: 0 }}>
                  {c.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: 'var(--grad-hero)', color: '#fff' }}
        >
          <h2
            className="text-xl font-black mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
          >
            ¿Listo para inscribir a sus atletas?
          </h2>
          <p className="mb-5" style={{ color: 'rgba(237,240,245,0.85)', fontSize: 15 }}>
            El proceso toma solo unos minutos. Recuerde tener a mano los datos de todos los estudiantes.
          </p>
          <button className="btn btn-primary-dark btn-lg" onClick={onInscripcion}>
            Comenzar inscripción →
          </button>
        </div>
      </main>
    </>
  )
}

/* ── Footer ───────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer-minimal">
      <span>© 2026 SLEP Colchagua · Ley 21.040 de Nueva Educación Pública</span>
      <div style={{ display: 'flex', gap: 20 }}>
        <span>Región del Libertador Bernardo O'Higgins</span>
      </div>
    </footer>
  )
}

/* ── App principal ────────────────────────────────── */
export default function App() {
  const [vista, setVista] = useState<Vista>('inicio')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>

      <Masthead
        vistaActual={vista}
        onNavAdmin={() => setVista('admin')}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {vista === 'inicio' && (
          <VistaInicio
            onInscripcion={() => setVista('inscripcion')}
            onAdmin={() => setVista('admin')}
          />
        )}
        {vista === 'inscripcion' && (
          <FormularioInscripcion onVolver={() => setVista('inicio')} />
        )}
        {vista === 'admin' && (
          <PanelAdmin onVolver={() => setVista('inicio')} />
        )}
      </div>

      <Footer />
    </div>
  )
}
