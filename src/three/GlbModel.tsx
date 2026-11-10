import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Carga un modelo real (.glb) —exportado desde CAD o escaneo— y lo
 * centra y escala automáticamente para que encaje en el visor.
 */
export function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => {
    const root = scene.clone(true)
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const k = 2.6 / Math.max(size.x, size.y, size.z)
    root.position.copy(center).multiplyScalar(-k)
    root.scale.setScalar(k)
    return root
  }, [scene])
  return <primitive object={object} />
}
