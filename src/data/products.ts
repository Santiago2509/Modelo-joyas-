// ─────────────────────────────────────────────────────────────
// Datos del catálogo. Para agregar una joya nueva basta con
// añadir un objeto aquí. Si la pieza tiene un modelo 3D real
// (archivo .glb exportado desde CAD o escaneo), colócalo en
// /public/models y apunta `modelUrl` a él: el visor lo carga
// automáticamente en lugar del modelo de demostración.
// ─────────────────────────────────────────────────────────────

export const BRAND = 'ATELIER'
export const BRAND_TAGLINE = 'Alta Joyería'
/** Número de WhatsApp con código de país, sin "+" ni espacios. Vacío = sin enlace. */
export const WHATSAPP = ''

export type ModelKind = 'ring' | 'pendant' | 'earrings' | 'necklace'

export interface Product {
  id: string
  name: string
  category: string
  tagline: string
  description: string
  /** Precio de ejemplo para la demo */
  price: string
  specs: { label: string; value: string }[]
  /** Modelo de demostración generado por código */
  model: ModelKind
  /** Modelo real (.glb). Ej: './models/anillo-solitario.glb' */
  modelUrl?: string
  /** Distancia inicial de la cámara y posición */
  camera: [number, number, number]
}

export const METALS = [
  { id: 'amarillo', name: 'Oro amarillo 18k', color: '#f1c36a' },
  { id: 'blanco', name: 'Oro blanco 18k', color: '#e9e9ec' },
  { id: 'rosa', name: 'Oro rosa 18k', color: '#eeb09a' },
] as const

export type Metal = (typeof METALS)[number]

export const PRODUCTS: Product[] = [
  {
    id: 'solitario-aurora',
    name: 'Solitario Aurora',
    category: 'Anillo de compromiso',
    tagline: 'Un diamante, toda la luz.',
    description:
      'Diamante talla brillante sostenido por seis garras sobre una banda de perfil confort, con pavé de diamantes en los hombros.',
    price: 'USD 4.850',
    specs: [
      { label: 'Piedra central', value: 'Diamante 1,20 ct · talla brillante' },
      { label: 'Color / Pureza', value: 'F · VS1' },
      { label: 'Pavé', value: '10 diamantes · 0,15 ct total' },
      { label: 'Peso', value: '4,2 g' },
    ],
    model: 'ring',
    camera: [2.6, 1.9, 5.2],
  },
  {
    id: 'colgante-esmeralda',
    name: 'Colgante Selva',
    category: 'Collar con colgante',
    tagline: 'El verde más profundo, enmarcado en luz.',
    description:
      'Esmeralda oval rodeada por un halo de diamantes, suspendida de una cadena tipo forzada de eslabón fino.',
    price: 'USD 3.200',
    specs: [
      { label: 'Piedra central', value: 'Esmeralda 2,10 ct · talla oval' },
      { label: 'Halo', value: '18 diamantes · 0,36 ct total' },
      { label: 'Cadena', value: '45 cm · eslabón forzado' },
      { label: 'Peso', value: '5,8 g' },
    ],
    model: 'pendant',
    camera: [1.6, 0.4, 7.4],
  },
  {
    id: 'aretes-perla',
    name: 'Aretes Marea',
    category: 'Aretes colgantes',
    tagline: 'Perlas que se mueven contigo.',
    description:
      'Par de perlas cultivadas de lustre alto coronadas por un diamante en bisel, con gancho francés.',
    price: 'USD 1.450',
    specs: [
      { label: 'Perlas', value: 'Cultivadas Akoya · 9 mm' },
      { label: 'Diamantes', value: '2 × 0,10 ct · bisel' },
      { label: 'Cierre', value: 'Gancho francés' },
      { label: 'Peso', value: '3,6 g el par' },
    ],
    model: 'earrings',
    camera: [1.5, 0.6, 4.2],
  },
  {
    id: 'collar-imperial',
    name: 'Collar Imperial',
    category: 'Collar de gala',
    tagline: 'Hecho para ser recordado.',
    description:
      'Rivière de diamantes graduados con nueve colgantes de zafiro oval en halo de diamantes y flecos de brillantes. Una pieza de gala de inspiración real.',
    price: 'USD 86.000',
    specs: [
      { label: 'Zafiros', value: '9 ovales · 21,40 ct total' },
      { label: 'Diamantes', value: '≈ 250 brillantes · 34,80 ct total' },
      { label: 'Largo', value: '42 cm · cierre de seguridad' },
      { label: 'Peso', value: '68 g' },
    ],
    model: 'necklace',
    camera: [1.0, 0.1, 5.7],
  },
]
