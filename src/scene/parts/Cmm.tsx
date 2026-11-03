import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

export function Cmm({ position }: { position: [number, number, number] }) {
  const rootRef = useStaticGeometryBatches()
  const carriage = useRef<THREE.Group>(null)
  const ram = useRef<THREE.Group>(null)
  const phase = useRef(0)

  useFrame((_, delta) => {
    phase.current += Math.min(delta, 0.1)
    const time = phase.current % 6
    const ease = (value: number) => value * value * (3 - 2 * value)
    let x = -0.45
    let y = -0.2
    if (time < 1.8) x = THREE.MathUtils.lerp(-0.45, 0.24, ease(time / 1.8))
    else if (time < 2.7) {
      x = 0.24
      y = THREE.MathUtils.lerp(-0.2, -0.36, ease((time - 1.8) / 0.9))
    } else if (time < 3.3) {
      x = 0.24
      y = THREE.MathUtils.lerp(-0.36, -0.2, ease((time - 2.7) / 0.6))
    } else if (time < 5.4) x = THREE.MathUtils.lerp(0.24, -0.45, ease((time - 3.3) / 2.1))
    if (carriage.current) carriage.current.position.x = x
    if (ram.current) ram.current.position.y = y
  })

  return (
    <group ref={rootRef} position={position}>
      {/* A bridge CMM sits on a supported granite table, not on the floor. */}
      <Solid args={[2.35, 0.72, 1.28]} position={[0, 0.36, 0]} color="#4a5963" roughness={0.48} metalness={0.3} castShadow />
      <Solid args={[2.14, 0.53, 0.065]} position={[0, 0.38, -0.66]} color="#26343d" metalness={0.46} roughness={0.45} />
      {[-0.97, 0.97].map((x) => (
        <group key={x}>
          <Solid args={[0.12, 0.55, 0.12]} position={[x, 0.37, -0.7]} color="#9aabb3" metalness={0.6} roughness={0.35} />
          <Cylinder args={[0.095, 0.095, 0.09, 16]} position={[x, 0.045, -0.5]} color="#27343b" metalness={0.45} roughness={0.58} />
          <Cylinder args={[0.095, 0.095, 0.09, 16]} position={[x, 0.045, 0.5]} color="#27343b" metalness={0.45} roughness={0.58} />
        </group>
      ))}
      <Solid args={[0.43, 0.3, 0.025]} position={[-0.51, 0.38, -0.704]} color="#60737c" metalness={0.5} roughness={0.43} />
      {[-0.64, -0.53, -0.42].map((x) => (
        <Solid key={x} args={[0.06, 0.014, 0.027]} position={[x, 0.39, -0.722]} color="#c4d4d7" roughness={0.47} />
      ))}
      <group position={[0, 0.72, 0]}>
      <Solid args={[2.35, 0.22, 1.28]} position={[0, 0.11, 0]} color={palette.granite} roughness={0.22} metalness={0.12} castShadow receiveShadow />
      <Solid args={[2.05, 0.04, 1.02]} position={[0, 0.29, 0]} color="#8999a2" roughness={0.28} metalness={0.2} />
      <Solid args={[2.22, 0.035, 0.035]} position={[0, 0.24, -0.63]} color="#25323a" metalness={0.55} roughness={0.4} />
      <Solid args={[2.22, 0.035, 0.035]} position={[0, 0.24, 0.63]} color="#25323a" metalness={0.55} roughness={0.4} />
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x) => (
        <Solid key={x} args={[0.012, 0.006, 0.82]} position={[x, 0.316, 0]} color="#62717b" metalness={0.45} roughness={0.5} />
      ))}
      {[-0.28, 0, 0.28].map((z) => (
        <Solid key={z} args={[1.8, 0.006, 0.012]} position={[0, 0.317, z]} color="#62717b" metalness={0.45} roughness={0.5} />
      ))}
      <Solid args={[0.55, 0.09, 0.39]} position={[0.24, 0.38, 0.06]} color="#c8d5dc" roughness={0.34} metalness={0.58} />
      <Cylinder args={[0.23, 0.23, 0.035, 24]} position={[0.24, 0.445, 0.06]} color="#a8bbc4" metalness={0.72} roughness={0.28} />
      <Cylinder args={[0.17, 0.17, 0.22, 24]} position={[0.24, 0.54, 0.06]} color={palette.steel} metalness={0.68} roughness={0.3} />
      {[-0.13, 0.13].flatMap((x) => [-0.13, 0.13].map((z) => (
        <Cylinder key={`${x}-${z}`} args={[0.018, 0.018, 0.012, 12]} position={[0.24 + x, 0.466, 0.06 + z]} color="#34424b" metalness={0.38} roughness={0.5} />
      )))}
      <Cylinder args={[0.06, 0.06, 0.025, 20]} position={[0.24, 0.66, 0.06]} color="#5a6770" metalness={0.6} roughness={0.35} />
      <Cylinder args={[0.033, 0.033, 0.03, 16]} position={[0.24, 0.683, 0.06]} color="#202b30" metalness={0.52} roughness={0.42} />
      {[-0.5, -0.36, -0.22].map((x) => (
        <Cylinder key={x} args={[0.028, 0.028, 0.022, 12]} position={[x, 0.326, 0.32]} color="#d1dbe0" metalness={0.62} roughness={0.28} />
      ))}
      {[-0.56, -0.32].map((x) => (
        <Solid key={x} args={[0.12, 0.11, 0.22]} position={[x, 0.38, -0.1]} color="#aebbc2" metalness={0.52} roughness={0.4} />
      ))}
      <Solid args={[0.1, 1.25, 0.1]} position={[-0.92, 0.95, 0]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      <Solid args={[0.1, 1.25, 0.1]} position={[0.92, 0.95, 0]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      <Solid args={[2.05, 0.1, 0.14]} position={[0, 1.55, 0]} color={palette.machinePanel} metalness={0.6} roughness={0.35} />
      <Solid args={[2.05, 0.045, 0.08]} position={[0, 1.65, -0.04]} color="#b9c9d1" metalness={0.68} roughness={0.3} />
      <Solid args={[1.96, 0.018, 0.025]} position={[0, 1.49, -0.09]} color="#e8d095" metalness={0.48} roughness={0.36} />
      {[-0.9, 0.9].map((x) => (
        <group key={x}>
          <Solid args={[0.16, 0.045, 0.17]} position={[x, 0.35, 0]} color="#b6c3cb" metalness={0.64} roughness={0.32} />
          <Solid args={[0.08, 0.025, 0.15]} position={[x, 0.38, 0]} color="#26333b" metalness={0.55} roughness={0.42} />
        </group>
      ))}
      <group ref={carriage} position={[0, 1.48, 0]} userData={{ dynamic: true }}>
        <Solid args={[0.26, 0.1, 0.18]} color={palette.steelDark} metalness={0.7} roughness={0.32} />
        <group ref={ram} position={[0, -0.42, 0]}>
          <Solid args={[0.045, 0.72, 0.045]} color={palette.steel} metalness={0.8} roughness={0.22} />
          <Cylinder args={[0.065, 0.065, 0.08, 16]} position={[0, -0.33, 0]} color="#d5e1e8" metalness={0.62} roughness={0.27} />
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color={palette.ruby} roughness={0.28} metalness={0.3} />
          </mesh>
        </group>
      </group>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x) => (
        <Solid key={x} args={[0.012, 0.02, 0.16]} position={[x, 1.62, 0]} color={palette.brass} metalness={0.6} roughness={0.4} />
      ))}
      <group position={[0.72, 1.05, -0.38]} rotation={[-0.22, 0.18, 0]}>
        <Solid args={[0.42, 0.62, 0.1]} color="#3d4b56" metalness={0.48} roughness={0.42} />
        <Solid args={[0.32, 0.24, 0.015]} position={[0, 0.12, -0.061]} color="#a9d1d7" emissive="#5e9fa9" emissiveIntensity={0.45} metalness={0.1} roughness={0.2} />
        <Solid args={[0.24, 0.014, 0.018]} position={[0, 0.16, -0.074]} color="#264d5c" emissive="#407a85" emissiveIntensity={0.25} />
        <Solid args={[0.17, 0.014, 0.018]} position={[-0.035, 0.1, -0.074]} color="#264d5c" emissive="#407a85" emissiveIntensity={0.25} />
        <Solid args={[0.29, 0.028, 0.02]} position={[0, -0.065, -0.065]} color="#aebdc4" metalness={0.56} roughness={0.36} />
        {[-0.1, 0, 0.1].map((x) => (
          <Cylinder key={x} args={[0.025, 0.025, 0.018, 10]} position={[x, -0.18, -0.065]} rotation={[Math.PI / 2, 0, 0]} color={x === 0.1 ? '#dc5b4d' : '#d6e3e8'} metalness={0.25} roughness={0.4} />
        ))}
      </group>
      </group>
    </group>
  )
}
