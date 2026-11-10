import { Gem, Rod, useMetal } from '../parts'

const PRONGS = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2 + Math.PI / 6)
const PAVE = [-1, 1].flatMap((side) => Array.from({ length: 5 }, (_, k) => side * (0.42 + k * 0.125)))

/** Solitario: banda confort, cesta de seis garras, diamante central y pavé. */
export function Ring() {
  const metal = useMetal()
  return (
    <group position={[0, -0.3, 0]}>
      {/* Banda */}
      <mesh material={metal} scale={[1, 1, 1.55]}>
        <torusGeometry args={[1, 0.085, 48, 160]} />
      </mesh>

      {/* Pavé en los hombros */}
      {PAVE.map((a) => (
        <Gem
          key={a}
          small
          position={[Math.sin(a) * 1.078, Math.cos(a) * 1.078, 0]}
          rotation={[0, 0, -a]}
          scale={0.052}
        />
      ))}

      {/* Cesta y garras */}
      <mesh material={metal} position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.245, 0.02, 16, 48]} />
      </mesh>
      {PRONGS.map((a) => {
        const c = Math.cos(a)
        const s = Math.sin(a)
        return (
          <group key={a}>
            <Rod from={[0.09 * c, 1.08, 0.09 * s]} to={[0.39 * c, 1.5, 0.39 * s]} radius={0.027} />
            <mesh material={metal} position={[0.365 * c, 1.515, 0.365 * s]}>
              <sphereGeometry args={[0.04, 16, 12]} />
            </mesh>
          </group>
        )
      })}

      {/* Diamante central */}
      <Gem position={[0, 1.48, 0]} scale={0.38} />
    </group>
  )
}
