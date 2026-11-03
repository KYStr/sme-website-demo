import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

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
  const rootRef = useStaticGeometryBatches()
  const spindle = useRef<THREE.Group>(null)
  const phase = useRef(0)
  useFrame((_, delta) => {
    phase.current += Math.min(delta, 1 / 30)
    if (spindle.current) {
      spindle.current.rotation.y += Math.min(delta, 1 / 30) * 7
      spindle.current.position.y = 1.72 + Math.sin(phase.current * 0.85) * 0.07
    }
  })

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <RoundedBox args={[1.75, 0.92, 1.55]} radius={0.04} smoothness={2} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color={palette.machine} roughness={0.46} metalness={0.62} />
      </RoundedBox>
      <Solid args={[0.62, 0.34, 0.025]} position={[-0.42, 0.48, -0.795]} color="#39444e" metalness={0.48} roughness={0.48} />
      {[0.34, 0.41, 0.48, 0.55, 0.62].map((y) => (
        <Solid key={y} args={[0.48, 0.018, 0.03]} position={[-0.42, y, -0.816]} color="#0d151a" metalness={0.25} roughness={0.62} />
      ))}
      <Solid args={[0.42, 0.09, 0.024]} position={[0.38, 0.72, -0.8]} color="#b9c6c9" metalness={0.42} roughness={0.48} />
      <Solid args={[1.45, 0.08, 0.08]} position={[0, 0.28, -0.8]} color={palette.caution} roughness={0.55} metalness={0.2} />
      <Solid args={[1.28, 0.1, 0.7]} position={[0, 1.03, -0.22]} color={palette.steel} metalness={0.78} roughness={0.28} castShadow />
      {[-0.43, 0, 0.43].map((x) => (
        <Solid key={x} args={[0.025, 0.012, 0.64]} position={[x, 1.092, -0.22]} color="#69747e" metalness={0.74} roughness={0.3} />
      ))}
      <Solid args={[0.34, 0.1, 0.16]} position={[-0.16, 1.13, -0.34]} color="#2c333b" metalness={0.45} roughness={0.45} />
      <Solid args={[0.34, 0.1, 0.16]} position={[0.16, 1.13, -0.34]} color="#2c333b" metalness={0.45} roughness={0.45} />
      <Solid args={[0.38, 0.09, 0.28]} position={[0, 1.2, -0.32]} color="#a7b5bd" metalness={0.72} roughness={0.3} />
      {[-0.21, 0.21].map((x) => (
        <group key={x}>
          <Solid args={[0.13, 0.055, 0.28]} position={[x, 1.27, -0.32]} color="#596771" metalness={0.67} roughness={0.35} />
          <Cylinder args={[0.026, 0.026, 0.035, 10]} position={[x, 1.32, -0.32]} color={palette.steel} metalness={0.78} roughness={0.28} />
        </group>
      ))}
      <Cylinder args={[0.035, 0.035, 0.19, 12]} position={[0, 1.28, -0.32]} color={palette.brass} metalness={0.72} roughness={0.32} />
      <Cylinder args={[0.045, 0.045, 0.08, 16]} position={[0, 1.16, -0.34]} color={palette.steelDark} metalness={0.75} roughness={0.28} />
      <Solid args={[1.56, 1.45, 0.09]} position={[0, 1.68, 0.72]} color="#596874" metalness={0.46} roughness={0.48} castShadow />
      <Solid args={[0.09, 1.42, 1.05]} position={[0.83, 1.67, 0.16]} color="#687782" metalness={0.47} roughness={0.42} castShadow />
      <Solid args={[0.08, 0.64, 1.05]} position={[-0.83, 1.3, 0.16]} color="#687782" metalness={0.47} roughness={0.42} />
      <Solid args={[1.6, 0.12, 1.2]} position={[0, 2.47, 0.13]} color="#73818b" metalness={0.5} roughness={0.4} />
      <Solid args={[1.56, 0.06, 0.06]} position={[0, 2.43, -0.52]} color={palette.caution} metalness={0.2} roughness={0.62} />
      <Solid args={[0.46, 1.35, 0.42]} position={[0, 1.62, 0.42]} color={palette.machinePanel} metalness={0.55} roughness={0.42} castShadow />
      <Solid args={[0.7, 0.36, 0.55]} position={[0, 2.12, 0.08]} color={palette.machine} metalness={0.58} roughness={0.4} castShadow />
      <group ref={spindle} position={[0, 1.72, -0.08]}>
        <Cylinder args={[0.07, 0.08, 0.28, 20]} color={palette.steel} metalness={0.84} roughness={0.2} />
        <Cylinder args={[0.018, 0.012, 0.22, 12]} position={[0, -0.22, 0]} color="#d7dde4" metalness={0.7} roughness={0.25} />
        {[0, 1, 2].map((index) => {
          const angle = index * Math.PI * 2 / 3
          return <Solid key={index} args={[0.014, 0.13, 0.025]} position={[Math.cos(angle) * 0.036, -0.23, Math.sin(angle) * 0.036]} color="#d7dde4" metalness={0.78} roughness={0.24} />
        })}
      </group>
      <Cylinder args={[0.024, 0.024, 0.62, 12]} position={[0.37, 1.76, 0.12]} rotation={[0, 0, -0.75]} color="#335b72" metalness={0.45} roughness={0.42} />
      <Cylinder args={[0.035, 0.025, 0.18, 12]} position={[0.19, 1.52, 0.12]} rotation={[0, 0, -0.75]} color={palette.steel} metalness={0.7} roughness={0.28} />
      <Solid args={[1.42, 0.06, 0.05]} position={[0, 2.12, -0.74]} color={palette.steelDark} metalness={0.65} roughness={0.35} />
      <Solid args={[1.42, 0.06, 0.05]} position={[0, 1.08, -0.74]} color={palette.steelDark} metalness={0.65} roughness={0.35} />
      <Solid args={[0.06, 1.1, 0.05]} position={[-0.68, 1.6, -0.74]} color={palette.steelDark} metalness={0.65} roughness={0.35} />
      <Solid args={[0.06, 1.1, 0.05]} position={[0.68, 1.6, -0.74]} color={palette.steelDark} metalness={0.65} roughness={0.35} />
      <Solid args={[1.22, 0.92, 0.015]} position={[0, 1.6, -0.71]} color={palette.glass} transparent opacity={0.3} roughness={0.09} metalness={0.06} emissive="#9fd0de" emissiveIntensity={0.12} />
      <Solid args={[0.045, 1.06, 0.06]} position={[0, 1.6, -0.75]} color={palette.steelDark} metalness={0.65} roughness={0.32} />
      <Solid args={[1.45, 0.17, 0.07]} position={[0, 1.0, -0.76]} color="#697781" metalness={0.48} roughness={0.48} />
      <Solid args={[0.035, 0.48, 0.055]} position={[0.66, 1.57, -0.77]} color="#c9d5db" metalness={0.72} roughness={0.28} />
      <Solid args={[0.22, 0.065, 0.06]} position={[0.67, 1.42, -0.79]} color="#d9e0e3" metalness={0.7} roughness={0.28} />
      <Solid args={[0.16, 0.06, 0.28]} position={[0.96, 1.48, -0.7]} color="#66737c" metalness={0.6} roughness={0.36} />
      <Solid args={[0.42, 0.09, 0.02]} position={[-0.4, 0.74, -0.81]} color="#e3b347" metalness={0.15} roughness={0.6} />
      <Solid args={[0.39, 0.012, 0.022]} position={[-0.4, 0.735, -0.83]} color="#222a2d" roughness={0.65} />
      <Solid args={[0.31, 0.013, 0.022]} position={[0.36, 0.72, -0.829]} color="#546b73" metalness={0.52} roughness={0.42} />
      {[-0.67, -0.34, 0.34, 0.67].map((x) => (
        <Cylinder key={x} args={[0.019, 0.019, 0.012, 10]} position={[x, 0.17, -0.818]} rotation={[Math.PI / 2, 0, 0]} color="#c0cbd0" metalness={0.76} roughness={0.3} />
      ))}
      <Solid args={[0.26, 0.1, 0.018]} position={[0.35, 0.43, -0.817]} color="#e0b652" roughness={0.54} />
      <Solid args={[0.17, 0.012, 0.021]} position={[0.35, 0.45, -0.831]} color="#242a2b" roughness={0.62} />
      <Solid args={[0.13, 0.012, 0.021]} position={[0.33, 0.42, -0.831]} color="#242a2b" roughness={0.62} />
      <group position={[0.98, 1.48, -0.85]} rotation={[0.25, Math.PI - 0.15, 0]}>
        <Solid args={[0.34, 0.46, 0.05]} color="#101316" metalness={0.45} roughness={0.4} />
        <mesh position={[0, 0.02, 0.03]}>
          <planeGeometry args={[0.26, 0.3]} />
          <meshStandardMaterial color="#10281c" emissive={palette.screen} emissiveIntensity={0.85} roughness={0.3} />
        </mesh>
        {[-0.08, 0, 0.08].map((x) => (
          <mesh key={x} position={[x, -0.18, 0.055]}>
            <sphereGeometry args={[0.017, 10, 8]} />
            <meshStandardMaterial color={x === 0.08 ? '#dd4e41' : '#b8cbd1'} emissive={x === 0.08 ? '#8a221c' : '#000000'} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.55, 2.5, 0.2]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={palette.warm} emissive={palette.warm} emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

function Lathe({ position, rotation }: MachineProps) {
  const rootRef = useStaticGeometryBatches()
  const chuck = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (chuck.current) chuck.current.rotation.x += Math.min(delta, 1 / 30) * 2.4
  })

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
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
      <Solid args={[2.45, 0.55, 0.08]} position={[0, 0.96, 0.43]} color="#596975" metalness={0.48} roughness={0.44} />
      <Solid args={[2.4, 0.58, 0.025]} position={[0, 1.55, 0.44]} color={palette.glass} opacity={0.18} transparent metalness={0.08} roughness={0.16} />
      {[0.25, 0.55, 0.85].map((x) => (
        <Solid key={x} args={[0.06, 0.065, 0.025]} position={[x, 0.56, -0.42]} color={palette.steelDark} metalness={0.62} roughness={0.34} />
      ))}
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
