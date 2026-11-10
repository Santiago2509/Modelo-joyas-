import { createContext, useContext, useMemo } from 'react'
import { MeshRefractionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStudioTexture } from './studio'

// Las versiones recientes de three eliminaron este fragmento de shader que el
// material de refracción de drei aún incluye (solo lo usa con mapas equirect).
const chunks = THREE.ShaderChunk as Record<string, string>
chunks.cube_uv_reflection_fragment ??= ''

/* ── Metal ─────────────────────────────────────────────── */

const MetalContext = createContext<THREE.Material>(new THREE.MeshStandardMaterial())
export const useMetal = () => useContext(MetalContext)

export function MetalProvider({ color, children }: { color: string; children: React.ReactNode }) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.14, envMapIntensity: 1.15 }),
    [color],
  )
  return <MetalContext.Provider value={material}>{children}</MetalContext.Provider>
}

/* ── Gemas ─────────────────────────────────────────────── */

/**
 * Talla brillante con proporciones reales (radio 1 en el filetín):
 * mesa 55 %, corona 15 %, pabellón 43 % del diámetro.
 */
function brilliantGeometry(segments: number) {
  const profile = [
    new THREE.Vector2(0.0001, -0.86),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(1, 0.04),
    new THREE.Vector2(0.55, 0.34),
    new THREE.Vector2(0.0001, 0.34),
  ]
  const g = new THREE.LatheGeometry(profile, segments).toNonIndexed()
  g.computeVertexNormals() // normales planas = facetas
  return g
}
const BRILLIANT = brilliantGeometry(16)
const BRILLIANT_SMALL = brilliantGeometry(8)

const GEMS = {
  diamond: { color: new THREE.Color(1.7, 1.7, 1.7), ior: 2.42, aberration: 0.012 },
  emerald: { color: new THREE.Color('#19b266').multiplyScalar(1.4), ior: 1.58, aberration: 0.004 },
} as const

type GemProps = {
  kind?: keyof typeof GEMS
  /** Piedras pequeñas (pavé, halo): menos facetas y rebotes */
  small?: boolean
} & React.ComponentProps<'mesh'>

/** Gema con la mesa orientada hacia +Y. Escalar con `scale` (radio del filetín). */
export function Gem({ kind = 'diamond', small = false, ...props }: GemProps) {
  const env = useStudioTexture()
  const g = GEMS[kind]
  return (
    <mesh geometry={small ? BRILLIANT_SMALL : BRILLIANT} {...props}>
      <MeshRefractionMaterial
        envMap={env as THREE.CubeTexture}
        color={g.color}
        ior={g.ior}
        bounces={small ? 2 : 3}
        fresnel={0.6}
        aberrationStrength={g.aberration}
        fastChroma
        toneMapped={false}
      />
    </mesh>
  )
}

/* ── Utilidades ────────────────────────────────────────── */

type V3 = [number, number, number]
const UP = new THREE.Vector3(0, 1, 0)

/** Varilla metálica redondeada entre dos puntos (garras, postes). */
export function Rod({ from, to, radius }: { from: V3; to: V3; radius: number }) {
  const metal = useMetal()
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    const length = dir.length()
    return {
      length,
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
    }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} material={metal}>
      <capsuleGeometry args={[radius, length, 6, 16]} />
    </mesh>
  )
}

/** Alambre metálico que sigue una curva suave por los puntos dados. */
export function Wire({ points, radius }: { points: V3[]; radius: number }) {
  const metal = useMetal()
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, 96, radius, 12, false)
  }, [points, radius])
  return <mesh geometry={geometry} material={metal} />
}
