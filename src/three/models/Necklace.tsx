import { useMemo } from 'react'
import * as THREE from 'three'
import { Chain, InstancedGems, InstancedMetal, Wire } from '../parts'

type V3 = [number, number, number]

// El collar sigue una elipse en el plano XY; t = 0 es el centro inferior.
const RX = 1.45
const RY = 1.75
const T_MAX = 2.4 // hasta dónde llegan las piedras; el resto es cadena

const point = (t: number, offset = 0) => {
  const x = RX * Math.sin(t)
  const y = -RY * Math.cos(t)
  const n = new THREE.Vector2(x / (RX * RX), y / (RY * RY)).normalize() // normal hacia fuera
  return { x: x + n.x * offset, y: y + n.y * offset, angle: Math.atan2(n.x, -n.y) }
}

const BEZEL = new THREE.TorusGeometry(1, 0.1, 12, 40)
const HALO_BASE = new THREE.TorusGeometry(1, 0.2, 12, 56)
const X90 = new THREE.Matrix4().makeRotationX(Math.PI / 2)

/** Matriz de una gema plana (mesa hacia la cámara), ovalada rx × ry, girada `angle`. */
function gemMatrix(x: number, y: number, angle: number, rx: number, ry = rx, z = 0.02) {
  return new THREE.Matrix4()
    .makeTranslation(x, y, z)
    .multiply(new THREE.Matrix4().makeRotationZ(angle))
    .multiply(X90)
    .multiply(new THREE.Matrix4().makeScale(rx, Math.min(rx, ry) * 0.62, ry))
}
/** Matriz de un aro metálico (bisel o montura) alrededor de una gema. */
function ringMatrix(x: number, y: number, angle: number, rx: number, ry = rx, depth = 0.3, z = 0) {
  return new THREE.Matrix4()
    .makeTranslation(x, y, z)
    .multiply(new THREE.Matrix4().makeRotationZ(angle))
    .multiply(new THREE.Matrix4().makeScale(rx, ry, depth))
}

function build() {
  const diamonds: THREE.Matrix4[] = [] // piedras principales (16 facetas)
  const melee: THREE.Matrix4[] = [] // piedras pequeñas de halo
  const sapphires: THREE.Matrix4[] = []
  const bezels: THREE.Matrix4[] = []
  const halos: THREE.Matrix4[] = []

  const round = (t: number, offset: number, r: number) => {
    const p = point(t, offset)
    diamonds.push(gemMatrix(p.x, p.y, p.angle, r))
    bezels.push(ringMatrix(p.x, p.y, p.angle, r * 1.03))
  }

  // 1 · Rivière: hilera de brillantes graduados, del centro hacia los extremos
  const rowR = (t: number) => THREE.MathUtils.lerp(0.088, 0.04, Math.min(1, Math.abs(t) / T_MAX) ** 0.8)
  round(0, 0, rowR(0))
  for (let t = 0, prev = rowR(0); ; ) {
    const speed = Math.hypot(RX * Math.cos(t), RY * Math.sin(t))
    let r = rowR(t + (2 * prev) / speed)
    t += ((prev + r) * 1.06) / speed
    if (t > T_MAX) break
    r = rowR(t)
    round(t, 0, r)
    round(-t, 0, r)
    prev = r
  }

  // 2 · Colgantes: zafiro oval con halo de diamantes, colgado de un brillante
  const drop = (t: number, k: number, extra: boolean) => {
    const rx = 0.15 * k
    const ry = 0.21 * k
    const m = 0.034 // radio de las piedras del halo
    round(t, rowR(t) + 0.05, 0.042)
    const d = rowR(t) + 0.115 + ry + 2 * m
    const c = point(t, d)
    sapphires.push(gemMatrix(c.x, c.y, c.angle, rx, ry, 0.03))
    bezels.push(ringMatrix(c.x, c.y, c.angle, rx * 1.02, ry * 1.02, 0.45, 0.02))
    const hx = rx + m + 0.012
    const hy = ry + m + 0.012
    halos.push(ringMatrix(c.x, c.y, c.angle, hx, hy, 0.16, -0.005))
    const n = Math.round((Math.PI * (hx + hy)) / (2 * m * 1.04))
    const rot = new THREE.Matrix4().makeRotationZ(c.angle)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const v = new THREE.Vector3(Math.sin(a) * hx, Math.cos(a) * hy, 0).applyMatrix4(rot)
      melee.push(gemMatrix(c.x + v.x, c.y + v.y, 0, m, m, 0.025))
    }
    if (extra) {
      // Pera de diamante bajo el colgante central
      const e = point(t, d + hy + m + 0.16)
      diamonds.push(gemMatrix(e.x, e.y, e.angle, 0.085, 0.125))
      bezels.push(ringMatrix(e.x, e.y, e.angle, 0.088, 0.128))
      round(t, d + hy + m + 0.012, 0.03)
    }
  }
  const STEP = 0.235
  for (let i = 0; i <= 4; i++) {
    const k = 1 - i * 0.125
    drop(i * STEP, k, i === 0)
    if (i) drop(-i * STEP, k, false)
  }

  // 3 · Flecos: brillantes sueltos entre colgantes y hacia los lados
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.5) * STEP
    const r = i < 4 ? 0.062 - i * 0.004 : 0.05 - (i - 4) * 0.004
    for (const s of [t, -t]) {
      round(s, rowR(s) + r + 0.022, r)
      if (i < 4) round(s, rowR(s) + 2 * r + 0.07, r * 0.62)
    }
  }

  const rail: V3[] = Array.from({ length: 41 }, (_, i) => {
    const p = point(THREE.MathUtils.lerp(-T_MAX, T_MAX, i / 40))
    return [p.x, p.y, -0.015]
  })
  const back: V3[] = Array.from({ length: 13 }, (_, i) => {
    const p = point(THREE.MathUtils.lerp(T_MAX, Math.PI * 2 - T_MAX, i / 12))
    return [p.x, p.y, -0.01]
  })
  return { diamonds, melee, sapphires, bezels, halos, rail, back }
}

/** Collar de gala: rivière de diamantes, colgantes de zafiro con halo y flecos. */
export function Necklace() {
  const n = useMemo(build, [])
  return (
    <group position={[0, 0.44, 0]} scale={0.6}>
      <Wire points={n.rail} radius={0.014} />
      <Chain points={n.back} count={62} />
      <InstancedMetal matrices={n.bezels} geometry={BEZEL} />
      <InstancedMetal matrices={n.halos} geometry={HALO_BASE} />
      <InstancedGems matrices={n.diamonds} />
      <InstancedGems matrices={n.melee} small />
      <InstancedGems matrices={n.sapphires} kind="sapphire" />
    </group>
  )
}
