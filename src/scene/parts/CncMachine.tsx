import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Sparks } from './Sparks.tsx'
import { Cylinder, Solid } from '../solids.tsx'

type MachineProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function CncMachine({
  position,
  rotation = [0, 0, 0],
  variant,
}: MachineProps & { variant: 'mill' | 'lathe' }) {
  if (variant === 'lathe') return <Lathe position={position} rotation={rotation} />
  return <Mill position={position} rotation={rotation} />
}

function Mill({ position, rotation }: MachineProps) {
  const spindle = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (spindle.current) spindle.current.rotation.y += delta * 7
  })

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.75, 0.92, 1.55]} radius={0.04} smoothness={2} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color={palette.machine} roughness={0.46} metalness={0.62} />
      </RoundedBox>
      <Solid args={[1.45, 0.08, 0.08]} position={[0, 0.28, -0.8]} color={palette.caution} roughness={0.55} metalness={0.2} />
      <Solid args={[1.42, 0.1, 0.78]} position={[0, 1.03, -0.28]} color={palette.steel} metalness={0.78} roughness={0.28} castShadow />
      <Solid args={[0.42, 0.06, 0.34]} position={[0, 1.11, -0.28]} color={palette.brass} metalness={0.72} roughness={0.34} />
      <Solid args={[0.52, 1.55, 0.48]} position={[0, 1.7, 0.48]} color={palette.machinePanel} metalness={0.55} roughness={0.42} castShadow />
      <Solid args={[0.78, 0.42, 0.62]} position={[0, 2.22, 0.12]} color={palette.machine} metalness={0.58} roughness={0.4} castShadow />
      <group ref={spindle} position={[0, 1.82, -0.02]}>
        <Cylinder args={[0.11, 0.13, 0.42]} color={palette.steelDark} metalness={0.8} roughness={0.25} />
        <Cylinder args={[0.028, 0.02, 0.32]} position={[0, -0.32, 0]} color={palette.brass} metalness={0.7} roughness={0.3} />
      </group>
      <Sparks position={[0, 1.42, -0.02]} />
      <Frame />
      <Solid args={[1.15, 0.72, 0.03]} position={[0, 1.55, -0.78]} color={palette.glass} transparent opacity={0.22} roughness={0.05} metalness={0.05} emissive="#7eb4c8" emissiveIntensity={0.25} />
      <group position={[1.08, 1.28, -0.2]} rotation={[-0.45, 0.35, 0]}>
        <Solid args={[0.34, 0.46, 0.05]} color="#101316" metalness={0.45} roughness={0.4} />
        <mesh position={[0, 0.02, 0.03]}>
          <planeGeometry args={[0.26, 0.3]} />
          <meshStandardMaterial color="#10281c" emissive={palette.screen} emissiveIntensity={0.85} roughness={0.3} />
        </mesh>
      </group>
      <mesh position={[0.55, 2.5, 0.2]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={palette.warm} emissive={palette.warm} emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

function Frame() {
  const posts: Array<[number, number, number]> = [
    [-0.78, 1.45, -0.72],
    [0.78, 1.45, -0.72],
    [-0.78, 1.45, 0.55],
    [0.78, 1.45, 0.55],
  ]
  return (
    <group>
      {posts.map((position) => (
        <Solid key={position.join()} args={[0.06, 1.7, 0.06]} position={position} color={palette.steelDark} metalness={0.7} roughness={0.35} />
      ))}
      <Solid args={[1.62, 0.05, 0.05]} position={[0, 2.28, -0.72]} color={palette.steelDark} metalness={0.7} roughness={0.35} />
    </group>
  )
}

function Lathe({ position, rotation }: MachineProps) {
  const chuck = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (chuck.current) chuck.current.rotation.x += delta * 2.4
  })

  return (
    <group position={position} rotation={rotation}>
      <Solid args={[2.35, 0.26, 0.72]} position={[0, 0.13, 0]} color="#14181c" metalness={0.4} roughness={0.62} />
      <RoundedBox args={[2.55, 0.34, 0.78]} radius={0.03} smoothness={2} position={[0, 0.43, 0]} castShadow>
        <meshStandardMaterial color={palette.machine} roughness={0.48} metalness={0.55} />
      </RoundedBox>
      <Solid args={[2.3, 0.045, 0.06]} position={[0, 0.62, -0.18]} color={palette.brass} metalness={0.75} roughness={0.32} />
      <Solid args={[2.3, 0.045, 0.06]} position={[0, 0.62, 0.18]} color={palette.brass} metalness={0.75} roughness={0.32} />
      <Solid args={[0.62, 0.78, 0.78]} position={[-0.9, 0.95, 0]} color={palette.machinePanel} metalness={0.55} roughness={0.4} castShadow />
      <group ref={chuck} position={[-0.48, 0.98, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.28, 24]} />
          <meshStandardMaterial color={palette.steel} metalness={0.82} roughness={0.22} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 6]} />
          <meshStandardMaterial color={palette.steelDark} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 1.15, 18]} />
          <meshStandardMaterial color={palette.brass} metalness={0.74} roughness={0.3} />
        </mesh>
      </group>
      <Solid args={[0.38, 0.28, 0.46]} position={[0.15, 0.78, -0.02]} color={palette.machinePanel} metalness={0.5} roughness={0.45} />
      <Solid args={[0.08, 0.16, 0.08]} position={[0.15, 0.92, -0.22]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      <Solid args={[0.42, 0.5, 0.5]} position={[0.92, 0.86, 0]} color={palette.machine} metalness={0.55} roughness={0.42} castShadow />
      <mesh position={[-1.28, 0.95, -0.42]} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[0.1, 0.018, 10, 18]} />
        <meshStandardMaterial color={palette.brass} metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[-0.9, 1.42, 0.2]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color={palette.screen} emissive={palette.screen} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
