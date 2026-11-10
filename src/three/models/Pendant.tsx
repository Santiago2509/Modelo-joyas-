import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Gem, useMetal } from '../parts'

type V3 = [number, number, number]
const CHAIN: V3[] = [
  [-1.55, 2.45, -0.35], [-0.95, 1.55, -0.12], [-0.4, 0.98, 0], [0, 0.8, 0],
  [0.4, 0.98, 0], [0.95, 1.55, -0.12], [1.55, 2.45, -0.35],
]
const HALO = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2)

/** Cadena de eslabones reales (instanciados) siguiendo una curva. */
function Chain() {
  const metal = useMetal()
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 104
  const curve = useMemo(() => new THREE.CatmullRomCurve3(CHAIN.map((p) => new THREE.Vector3(...p))), [])
  useLayoutEffect(() => {
    const x = new THREE.Vector3(1, 0, 0)
    const twist = new THREE.Quaternion().setFromAxisAngle(x, Math.PI / 2)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const scale = new THREE.Vector3(1.45, 1, 1)
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      q.setFromUnitVectors(x, curve.getTangentAt(t))
      if (i % 2) q.multiply(twist)
      m.compose(curve.getPointAt(t), q, scale)
      ref.current!.setMatrixAt(i, m)
    }
    ref.current!.instanceMatrix.needsUpdate = true
  }, [curve])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={metal}>
      <torusGeometry args={[0.022, 0.0065, 8, 20]} />
    </instancedMesh>
  )
}

/** Colgante: esmeralda oval en bisel con halo de diamantes y cadena. */
export function Pendant() {
  const metal = useMetal()
  return (
    <group position={[0, -0.7, 0]}>
      <Chain />

      {/* Asa */}
      <mesh material={metal} position={[0, 0.79, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1.5, 1]}>
        <torusGeometry args={[0.07, 0.022, 16, 40]} />
      </mesh>

      {/* Montura del halo */}
      <mesh material={metal} scale={[0.5, 0.64, 0.42]}>
        <torusGeometry args={[1, 0.115, 24, 96]} />
      </mesh>
      {HALO.map((a) => (
        <Gem
          key={a}
          small
          position={[Math.sin(a) * 0.5, Math.cos(a) * 0.64, 0.035]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.058}
        />
      ))}

      {/* Bisel y esmeralda */}
      <mesh material={metal} position={[0, 0, 0.03]} scale={[0.385, 0.525, 0.5]}>
        <torusGeometry args={[1, 0.075, 24, 96]} />
      </mesh>
      <Gem kind="emerald" position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[0.36, 0.2, 0.5]} />
    </group>
  )
}
