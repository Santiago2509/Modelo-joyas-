# Catálogo de Joyas 3D

Catálogo web de joyería con visor 3D interactivo: cada pieza se puede girar 360°,
acercar hasta el detalle y ver en oro amarillo, blanco o rosa en tiempo real.

Arranca con 3 piezas destacadas (anillo solitario, colgante de esmeralda y aretes de perla).

## Tecnología

- **React + TypeScript + Vite** — sitio estático, se publica en cualquier hosting.
- **Three.js** (`@react-three/fiber`, `@react-three/drei`) — render WebGL con metales PBR
  y gemas con refracción real (trazado de rayos dentro de la piedra).
- Funciona en móvil (arrastrar para girar, pellizcar para zoom) y escritorio.

## Uso

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera /dist listo para publicar
```

## Estructura

| Ruta | Qué contiene |
| --- | --- |
| `src/data/products.ts` | Catálogo: nombres, precios, especificaciones, marca y WhatsApp |
| `src/three/Viewer.tsx` | Visor 3D (cámara, giro, zoom, sombras) |
| `src/three/studio.tsx` | Iluminación de estudio generada por código |
| `src/three/parts.tsx` | Materiales de metal y gemas |
| `src/three/models/` | Modelos de demostración generados por código |
| `public/models/` | Aquí van los modelos reales en formato `.glb` |

## Cómo poner una joya real

Los tres modelos actuales son de demostración. Para usar una pieza real:

1. Exporta el modelo a **`.glb`** (desde Rhino/MatrixGold/Blender, o el resultado del escaneo).
2. Cópialo a `public/models/`, por ejemplo `public/models/anillo-01.glb`.
3. En `src/data/products.ts` añade `modelUrl: './models/anillo-01.glb'` al producto.

El visor lo centra y escala automáticamente.

> Los precios, nombres y especificaciones son de ejemplo. La marca "ATELIER" es un
> marcador de posición: se cambia en `src/data/products.ts`.
