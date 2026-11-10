import { createContext, useContext, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Estudio fotográfico virtual: paneles de luz renderizados una sola vez a un
 * cubemap HDR. Ilumina los metales (scene.environment) y es lo que las gemas
 * refractan. Se genera por código, así que no depende de archivos externos.
 */
function buildStudio() {
  const scene = new THREE.Scene()
  const add = (
    geo: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    intensity: number,
    pos: [number, number, number],
  ) => {
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
    mat.color.set(color).multiplyScalar(intensity)
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    scene.add(m)
  }
  // Cúpula con degradado suave (suelo oscuro, cielo gris cálido)
  const dome = new THREE.SphereGeometry(50, 32, 16)
  const colors: number[] = []
  const p = dome.attributes.position
  for (let i = 0; i < p.count; i++) {
    const t = THREE.MathUtils.smoothstep(p.getY(i) / 50, -0.6, 1)
    const v = THREE.MathUtils.lerp(0.02, 0.38, t)
    colors.push(v * 1.05, v, v * 0.95)
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })))

  const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h)
  add(plane(14, 14), '#ffffff', 6, [0, 20, 0]) // softbox cenital
  add(plane(5, 22), '#fff4e2', 9, [-20, 5, 8]) // tira lateral cálida
  add(plane(5, 22), '#e6f0ff', 7, [20, 6, -4]) // tira lateral fría
  add(plane(18, 4), '#ffffff', 5, [0, 4, 22]) // frontal
  add(plane(12, 6), '#ffffff', 4, [0, 8, -22]) // contra
  add(plane(10, 10), '#ffe8c8', 1.2, [0, -20, 0]) // rebote de mesa
  // Puntos pequeños e intensos: generan los destellos en las facetas
  const spot = new THREE.CircleGeometry(1.1, 24)
  const spots: [number, number, number][] = [
    [12, 16, 12], [-12, 16, -10], [-9, 18, 14], [14, 12, -14],
    [3, 10, 20], [-18, 12, -2], [8, 19, -6], [-4, 14, -19],
  ]
  spots.forEach((s) => add(spot, '#ffffff', 60, s))
  return scene
}

const StudioContext = createContext<THREE.Texture | null>(null)

export function Studio({ children }: { children: React.ReactNode }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const target = useMemo(() => {
    const rt = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType })
    const studio = buildStudio()
    new THREE.CubeCamera(0.1, 100, rt).update(gl, studio)
    studio.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      ;(m.material as THREE.Material | undefined)?.dispose()
    })
    return rt
  }, [gl])

  useEffect(() => {
    scene.environment = target.texture
    return () => {
      scene.environment = null
    }
  }, [scene, target])
  useEffect(() => () => target.dispose(), [target])

  return <StudioContext.Provider value={target.texture}>{children}</StudioContext.Provider>
}

export const useStudioTexture = () => useContext(StudioContext)!
