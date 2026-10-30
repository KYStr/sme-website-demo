import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Solid } from '../solids.tsx'

export function Cmm({ position }: { position: [number, number, number] }) {
  const carriage = useRef<THREE.Group>(null)
  const ram = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    if (carriage.current) carriage.current.position.x = Math.sin(time * 0.55) * 0.52
    if (ram.current) ram.current.position.y = Math.sin(time * 0.9) * 0.14
  })

  return (
    <group position={position}>
      <Solid args={[2.35, 0.22, 1.28]} position={[0, 0.11, 0]} color={palette.granite} roughness={0.22} metalness={0.12} castShadow receiveShadow />
      <Solid args={[2.05, 0.04, 1.02]} position={[0, 0.29, 0]} color="#5b636b" roughness={0.18} metalness={0.2} />
      <Solid args={[0.1, 1.25, 0.1]} position={[-0.92, 0.95, 0]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      <Solid args={[0.1, 1.25, 0.1]} position={[0.92, 0.95, 0]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      <Solid args={[2.05, 0.1, 0.14]} position={[0, 1.55, 0]} color={palette.machinePanel} metalness={0.6} roughness={0.35} />
      <group ref={carriage} position={[0, 1.48, 0]}>
        <Solid args={[0.26, 0.1, 0.18]} color={palette.steelDark} metalness={0.7} roughness={0.32} />
        <group ref={ram} position={[0, -0.42, 0]}>
          <Solid args={[0.045, 0.72, 0.045]} color={palette.steel} metalness={0.8} roughness={0.22} />
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color={palette.ruby} roughness={0.28} metalness={0.3} />
          </mesh>
        </group>
      </group>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
        <Solid key={x} args={[0.012, 0.02, 0.16]} position={[x, 1.62, 0]} color={palette.brass} metalness={0.6} roughness={0.4} />
      ))}
    </group>
  )
}
