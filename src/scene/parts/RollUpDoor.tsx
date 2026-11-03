import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from '../../lib/smoothstep.ts'
import { palette } from '../palette.ts'

const slats = 14
const width = 4.68
const height = 3.48

export function RollUpDoor({ progressRef }: { progressRef: RefObject<number> }) {
  const steelSlats = useRef<THREE.InstancedMesh>(null)
  const brassSlat = useRef<THREE.Mesh>(null)
  const bottomBar = useRef<THREE.Mesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastOpen = useRef(Number.NaN)

  useLayoutEffect(() => {
    if (!steelSlats.current) return
    for (let index = 0; index < slats - 1; index += 1) {
      steelSlats.current.setColorAt(index, new THREE.Color(index % 2 === 0 ? '#3e4650' : '#2c333b'))
    }
    if (steelSlats.current.instanceColor) steelSlats.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    const open = smoothstep(0.035, 0.19, progressRef.current)
    if (open === lastOpen.current) return
    lastOpen.current = open
    const travel = open * height
    if (steelSlats.current) {
      for (let index = 0; index < slats - 1; index += 1) {
        const y = -height + (slats - index - 0.5) * (height / slats) + travel
        dummy.position.set(0, y, 0)
        dummy.scale.setScalar(y < -(height / slats) * 0.45 ? 1 : 0)
        dummy.updateMatrix()
        steelSlats.current.setMatrixAt(index, dummy.matrix)
      }
      steelSlats.current.instanceMatrix.needsUpdate = true
      steelSlats.current.visible = open < 0.98
    }
    if (brassSlat.current) {
      const y = -height + (height / slats) * 0.5 + travel
      brassSlat.current.position.y = y
      brassSlat.current.visible = y < -(height / slats) * 0.45
    }
    if (bottomBar.current) {
      bottomBar.current.position.y = -height + travel
      bottomBar.current.visible = open < 0.98
    }
  })

  const slatH = height / slats
  return (
    <group position={[0, height, -0.03]}>
      <instancedMesh ref={steelSlats} args={[undefined, undefined, slats - 1]} castShadow frustumCulled={false}>
        <boxGeometry args={[width, slatH * 0.99, 0.07]} />
        <meshStandardMaterial color="#ffffff" metalness={0.58} roughness={0.42} />
      </instancedMesh>
      <mesh ref={brassSlat} position={[0, -height + slatH * 0.5, 0]} castShadow>
        <boxGeometry args={[width, slatH * 0.99, 0.07]} />
        <meshStandardMaterial color={palette.brass} metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh ref={bottomBar} position={[0, -height, -0.01]}>
        <boxGeometry args={[width + 0.08, 0.085, 0.11]} />
        <meshStandardMaterial color={palette.brass} metalness={0.76} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.19, 0.19, width + 0.25, 20]} />
        <meshStandardMaterial color="#28313a" metalness={0.64} roughness={0.4} />
      </mesh>
      <mesh position={[-width / 2 - 0.05, -height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.09]} />
        <meshStandardMaterial color={palette.brassDeep} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[width / 2 + 0.05, -height / 2, 0]}>
        <boxGeometry args={[0.06, height, 0.09]} />
        <meshStandardMaterial color={palette.brassDeep} metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}
