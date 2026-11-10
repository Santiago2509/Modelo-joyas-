import { useMemo } from 'react'
import * as THREE from 'three'
import { Gem, Rod, Wire, useMetal } from '../parts'

type V3 = [number, number, number]
const HOOK: V3[] = [
  [0, 0.6, 0], [0, 0.95, 0.0], [0, 1.13, -0.1], [0, 1.08, -0.27], [0, 0.7, -0.33], [0, 0.3, -0.3],
]

function Earring(props: React.ComponentProps<'group'>) {
  const metal = useMetal()
  const pearl = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f7f0e8',
        roughness: 0.22,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 1,
        sheenColor: new THREE.Color('#ffd9d2'),
        sheenRoughness: 0.35,
        iridescence: 0.55,
        iridescenceIOR: 1.6,
        envMapIntensity: 0.9,
      }),
    [],
  )
  return (
    <group {...props}>
      <Wire points={HOOK} radius={0.013} />

      {/* Diamante en bisel */}
      <mesh material={metal} position={[0, 0.5, 0]}>
        <torusGeometry args={[0.1, 0.024, 16, 48]} />
      </mesh>
      <mesh material={metal} position={[0, 0.5, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.06, 0.06, 32]} />
      </mesh>
      <Gem position={[0, 0.5, 0.005]} rotation={[Math.PI / 2, 0, 0]} scale={[0.092, 0.06, 0.092]} />

      {/* Enlace, casquillo y perla */}
      <mesh material={metal} position={[0, 0.345, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.04, 0.01, 12, 32]} />
      </mesh>
      <Rod from={[0, 0.2, 0]} to={[0, 0.3, 0]} radius={0.014} />
      <mesh material={metal} position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.025, 0.115, 0.09, 32]} />
      </mesh>
      <mesh material={pearl} position={[0, -0.11, 0]} scale={[1, 1.08, 1]}>
        <sphereGeometry args={[0.26, 64, 48]} />
      </mesh>
    </group>
  )
}

/** Par de aretes de perla con diamante y gancho francés. */
export function Earrings() {
  return (
    <group position={[0, -0.38, 0]}>
      <Earring position={[-0.46, 0, 0]} rotation={[0, 0.3, 0]} />
      <Earring position={[0.46, 0, 0]} rotation={[0, -0.3, 0]} />
    </group>
  )
}
