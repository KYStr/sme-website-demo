import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from '../../lib/smoothstep.ts'
import { palette } from '../palette.ts'
import { Solid } from '../solids.tsx'

export function DispatchDoor({
  progressRef,
  z,
  openFrom,
  openUntil,
}: {
  progressRef: RefObject<number>
  z: number
  openFrom: number
  openUntil: number
}) {
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const lastOpen = useRef(Number.NaN)

  useFrame(() => {
    const open = smoothstep(openFrom, openUntil, progressRef.current)
    if (open === lastOpen.current) return
    lastOpen.current = open
    if (left.current) left.current.position.x = -1.17 - open * 2.36
    if (right.current) right.current.position.x = 1.17 + open * 2.36
  })

  return (
    <group position={[0, 0, z]}>
      <group ref={left} position={[-1.17, 0, 0]}>
        <DoorLeaf handleSide={1} />
      </group>
      <group ref={right} position={[1.17, 0, 0]}>
        <DoorLeaf handleSide={-1} />
      </group>
    </group>
  )
}

function DoorLeaf({ handleSide }: { handleSide: 1 | -1 }) {
  return (
    <group>
      <Solid args={[2.34, 3.8, 0.1]} position={[0, 1.9, 0]} color="#46555f" roughness={0.6} metalness={0.3} />
      <Solid args={[2.16, 0.7, 0.015]} position={[0, 2.46, -0.06]} color="#a8bfca" opacity={0.22} transparent roughness={0.18} metalness={0.1} />
      <Solid args={[2.2, 0.06, 0.04]} position={[0, 1.18, -0.065]} color={palette.steelDark} metalness={0.7} />
      <Solid args={[0.07, 3.8, 0.12]} position={[1.13, 1.9, -0.02]} color={palette.steelDark} metalness={0.7} />
      <Solid args={[0.045, 0.32, 0.045]} position={[handleSide * 1.02, 1.48, -0.095]} color="#d4dce0" metalness={0.65} roughness={0.31} />
      <Solid args={[0.11, 0.045, 0.07]} position={[handleSide * 1.0, 1.38, -0.12]} color="#e1d3ad" metalness={0.55} roughness={0.38} />
    </group>
  )
}
