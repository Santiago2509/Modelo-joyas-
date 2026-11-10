import { createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react'
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
  sapphire: { color: new THREE.Color('#1c46e0').multiplyScalar(1.9), ior: 1.77, aberration: 0.006 },
} as const
export type GemKind = keyof typeof GEMS

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

/* ── Instancias (muchas piedras o engastes con una sola malla) ── */

function useInstances(matrices: THREE.Matrix4[]) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current!.setMatrixAt(i, m))
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.computeBoundingSphere()
  }, [matrices])
  return ref
}

/** Muchas gemas iguales. Cada matriz parte de una gema con la mesa hacia +Y. */
export function InstancedGems({
  matrices,
  kind = 'diamond',
  small = false,
}: {
  matrices: THREE.Matrix4[]
  kind?: GemKind
  small?: boolean
}) {
  const env = useStudioTexture()
  const ref = useInstances(matrices)
  const g = GEMS[kind]
  return (
    <instancedMesh ref={ref} args={[small ? BRILLIANT_SMALL : BRILLIANT, undefined, matrices.length]}>
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
    </instancedMesh>
  )
}

/** Muchas piezas metálicas iguales (biseles, monturas). */
export function InstancedMetal({ matrices, geometry }: { matrices: THREE.Matrix4[]; geometry: THREE.BufferGeometry }) {
  const metal = useMetal()
  const ref = useInstances(matrices)
  // El material va como prop (no en `args`): así, al cambiar de metal, la malla
  // no se reconstruye y las instancias conservan su posición.
  return <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]} material={metal} />
}

const LINK = new THREE.TorusGeometry(0.022, 0.0065, 8, 20)

/** Cadena de eslabones reales siguiendo una curva por los puntos dados. */
export function Chain({ points, count }: { points: [number, number, number][]; count: number }) {
  const matrices = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    const x = new THREE.Vector3(1, 0, 0)
    const twist = new THREE.Quaternion().setFromAxisAngle(x, Math.PI / 2)
    const scale = new THREE.Vector3(1.45, 1, 1)
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1)
      const q = new THREE.Quaternion().setFromUnitVectors(x, curve.getTangentAt(t))
      if (i % 2) q.multiply(twist)
      return new THREE.Matrix4().compose(curve.getPointAt(t), q, scale)
    })
  }, [points, count])
  return <InstancedMetal matrices={matrices} geometry={LINK} />
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
