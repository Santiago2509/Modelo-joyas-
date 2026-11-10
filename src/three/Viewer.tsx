import { Suspense, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Product } from '../data/products'
import { Studio } from './studio'
import { MetalProvider } from './parts'
import { Ring } from './models/Ring'
import { Pendant } from './models/Pendant'
import { Earrings } from './models/Earrings'
import { Necklace } from './models/Necklace'
import { GlbModel } from './GlbModel'

const MIN_DISTANCE = 1.3
const MAX_DISTANCE = 13

export interface ViewerHandle {
  zoom(factor: number): void
  reset(): void
}

type Controls = {
  object: THREE.Camera
  target: THREE.Vector3
  update(): void
}

function Model({ product }: { product: Product }) {
  if (product.modelUrl) return <GlbModel url={product.modelUrl} />
  if (product.model === 'ring') return <Ring />
  if (product.model === 'pendant') return <Pendant />
  if (product.model === 'necklace') return <Necklace />
  return <Earrings />
}

/** Coloca la cámara en la vista inicial de cada pieza y expone zoom/reset. */
const Rig = forwardRef<ViewerHandle, { product: Product; autoRotate: boolean }>(function Rig(
  { product, autoRotate },
  ref,
) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const controls = useRef<Controls>(null)

  const reset = () => {
    // En pantallas verticales (móvil) la cámara se aleja para que la pieza quepa
    const aspect = size.width / size.height
    camera.position.set(...product.camera).multiplyScalar(aspect < 1.15 ? 1.15 / aspect : 1)
    controls.current?.target.set(0, 0, 0)
    controls.current?.update()
  }
  useEffect(reset, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    reset,
    zoom(factor) {
      const c = controls.current
      if (!c) return
      const offset = camera.position.clone().sub(c.target)
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE))
      camera.position.copy(c.target).add(offset)
      c.update()
    },
  }))

  return (
    <OrbitControls
      ref={controls as never}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      zoomSpeed={0.9}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      autoRotate={autoRotate}
      autoRotateSpeed={1.4}
    />
  )
})

interface ViewerProps {
  product: Product
  metalColor: string
  autoRotate: boolean
}

export const Viewer = forwardRef<ViewerHandle, ViewerProps>(function Viewer(
  { product, metalColor, autoRotate },
  ref,
) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.05, far: 60, position: product.camera }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <Studio>
        <MetalProvider color={metalColor}>
          <Suspense fallback={null}>
            <Model key={product.id} product={product} />
          </Suspense>
        </MetalProvider>
      </Studio>
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <ContactShadows position={[0, -1.75, 0]} opacity={0.55} scale={7} blur={2.6} far={4} resolution={512} />
      <Rig ref={ref} product={product} autoRotate={autoRotate} />
    </Canvas>
  )
})
