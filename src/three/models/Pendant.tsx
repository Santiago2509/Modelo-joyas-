import { Chain, Gem, useMetal } from '../parts'

type V3 = [number, number, number]
const CHAIN: V3[] = [
  [-1.55, 2.45, -0.35], [-0.95, 1.55, -0.12], [-0.4, 0.98, 0], [0, 0.8, 0],
  [0.4, 0.98, 0], [0.95, 1.55, -0.12], [1.55, 2.45, -0.35],
]
const HALO = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2)

/** Colgante: esmeralda oval en bisel con halo de diamantes y cadena. */
export function Pendant() {
  const metal = useMetal()
  return (
    <group position={[0, -0.7, 0]}>
      <Chain points={CHAIN} count={104} />

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
