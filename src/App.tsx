import { useRef, useState } from 'react'
import { BRAND, BRAND_TAGLINE, METALS, PRODUCTS, WHATSAPP } from './data/products'
import { Viewer, type ViewerHandle } from './three/Viewer'

const GLYPHS: Record<string, React.ReactNode> = {
  ring: (
    <>
      <circle cx="24" cy="29" r="12" />
      <path d="M18 13h12l3 4-9 8-9-8z" />
    </>
  ),
  pendant: (
    <>
      <path d="M8 6c4 12 10 18 16 20 6-2 12-8 16-20" />
      <ellipse cx="24" cy="34" rx="6" ry="8" />
    </>
  ),
  earrings: (
    <>
      <path d="M15 8v12M33 8v12" />
      <circle cx="15" cy="29" r="7" />
      <circle cx="33" cy="29" r="7" />
    </>
  ),
}

export default function App() {
  const [index, setIndex] = useState(0)
  const [metal, setMetal] = useState<(typeof METALS)[number]>(METALS[0])
  const [autoRotate, setAutoRotate] = useState(true)
  const viewer = useRef<ViewerHandle>(null)
  const product = PRODUCTS[index]

  const message = encodeURIComponent(`Hola, me interesa la pieza "${product.name}" en ${metal.name}.`)
  const contactHref = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${message}` : '#contacto'

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-name">{BRAND}</span>
          <span className="brand-tag">{BRAND_TAGLINE}</span>
        </a>
        <nav>
          <a href="#visor">Visor 3D</a>
          <a href="#coleccion">Colección</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section className="showcase" id="visor">
          <div className="stage">
            <Viewer ref={viewer} product={product} metalColor={metal.color} autoRotate={autoRotate} />
            <p className="stage-hint">Arrastra para girar · Rueda o pellizca para acercar</p>
            <div className="stage-tools" role="toolbar" aria-label="Controles del visor">
              <button onClick={() => viewer.current?.zoom(0.75)} aria-label="Acercar" title="Acercar">+</button>
              <button onClick={() => viewer.current?.zoom(1.33)} aria-label="Alejar" title="Alejar">−</button>
              <button onClick={() => viewer.current?.reset()} aria-label="Restablecer vista" title="Restablecer vista">⟲</button>
              <button
                className={autoRotate ? 'on' : ''}
                onClick={() => setAutoRotate((v) => !v)}
                aria-pressed={autoRotate}
                title="Giro automático"
              >
                360°
              </button>
            </div>
          </div>

          <article className="details" key={product.id}>
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="tagline">{product.tagline}</p>
            <p className="description">{product.description}</p>

            <div className="metals">
              <p className="label">Metal · <span>{metal.name}</span></p>
              <div className="swatches">
                {METALS.map((m) => (
                  <button
                    key={m.id}
                    className={m.id === metal.id ? 'swatch active' : 'swatch'}
                    style={{ '--swatch': m.color } as React.CSSProperties}
                    onClick={() => setMetal(m)}
                    aria-label={m.name}
                    aria-pressed={m.id === metal.id}
                    title={m.name}
                  />
                ))}
              </div>
            </div>

            <dl className="specs">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="buy">
              <p className="price">{product.price}</p>
              <a className="cta" href={contactHref} target={WHATSAPP ? '_blank' : undefined} rel="noreferrer">
                Solicitar información
              </a>
            </div>
          </article>
        </section>

        <section className="collection" id="coleccion">
          <p className="eyebrow">Colección destacada</p>
          <h2>Tres piezas, vistas como en la vitrina</h2>
          <div className="cards">
            {PRODUCTS.map((p, i) => (
              <button
                key={p.id}
                className={i === index ? 'card active' : 'card'}
                aria-pressed={i === index}
                onClick={() => {
                  setIndex(i)
                  document.getElementById('visor')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <svg viewBox="0 0 48 48" aria-hidden="true">{GLYPHS[p.model]}</svg>
                <span className="card-cat">{p.category}</span>
                <span className="card-name">{p.name}</span>
                <span className="card-price">{p.price}</span>
                <span className="card-link">{i === index ? 'En el visor' : 'Ver en 3D →'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="features">
          <div>
            <h3>Gira 360°</h3>
            <p>Cada pieza se explora desde cualquier ángulo, como si la tuvieras en la mano.</p>
          </div>
          <div>
            <h3>Zoom al detalle</h3>
            <p>Acércate hasta las garras, el engaste y las facetas de cada piedra.</p>
          </div>
          <div>
            <h3>Elige el metal</h3>
            <p>Compara oro amarillo, blanco y rosa sobre la misma joya, en tiempo real.</p>
          </div>
        </section>
      </main>

      <footer id="contacto">
        <p className="brand-name">{BRAND}</p>
        <p>Atención personalizada · Visitas con cita previa</p>
        <p className="fine">Demostración: piezas, precios y especificaciones de ejemplo.</p>
      </footer>
    </>
  )
}
