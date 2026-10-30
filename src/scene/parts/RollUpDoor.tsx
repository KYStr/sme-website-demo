import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from '../../lib/smoothstep.ts'
import { palette } from '../palette.ts'

const slats = 14
const width = 4.68
const height = 3.48

export function RollUpDoor({ progressRef }: { progressRef: RefObject<number> }) {
  const door = useRef<THREE.Group>(null)

  useFrame(() => {
    const open = smoothstep(0.035, 0.19, progressRef.current)
    if (!door.current) return
    door.current.scale.y = Math.max(0.015, 1 - open)
    door.current.visible = open < 0.99
  })

  const slatH = height / slats
  return (
    <group position={[0, height, -0.03]}>
      <group ref={door}>
        {Array.from({ length: slats }, (_, index) => {
          const brass = index === slats - 1
          return (
            <mesh key={index} position={[0, -slatH / 2 - index * slatH, 0]} castShadow>
              <boxGeometry args={[width, slatH * 0.82, 0.07]} />
              <meshStandardMaterial
                color={brass ? palette.brass : index % 2 === 0 ? '#3e4650' : '#2c333b'}
                metalness={brass ? 0.78 : 0.58}
                roughness={brass ? 0.32 : 0.42}
              />
            </mesh>
          )
        })}
      </group>
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
