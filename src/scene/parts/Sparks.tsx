import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Sparks({ position, count = 36 }: { position: [number, number, number]; count?: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: '#ff9a3a',
      size: 0.045,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    return new THREE.Points(geometry, material)
  }, [count])

  const life = useRef(new Float32Array(count).fill(0))
  const velocity = useRef(Array.from({ length: count }, () => new THREE.Vector3()))

  useFrame((_, delta) => {
    const attribute = points.geometry.getAttribute('position')
    const array = attribute.array as Float32Array
    for (let index = 0; index < count; index += 1) {
      life.current[index] -= delta
      if (life.current[index] <= 0) {
        array[index * 3] = (Math.random() - 0.5) * 0.04
        array[index * 3 + 1] = 0
        array[index * 3 + 2] = (Math.random() - 0.5) * 0.04
        velocity.current[index].set((Math.random() - 0.5) * 0.8, Math.random() * 0.7 + 0.15, Math.random() * 0.9 + 0.2)
        life.current[index] = 0.18 + Math.random() * 0.32
      }
      array[index * 3] += velocity.current[index].x * delta
      array[index * 3 + 1] += velocity.current[index].y * delta
      array[index * 3 + 2] += velocity.current[index].z * delta
      velocity.current[index].y -= 1.8 * delta
    }
    attribute.needsUpdate = true
  })

  return <primitive object={points} position={position} />
}
