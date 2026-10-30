import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'

type PlaceProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function DisplayRack({ position, rotation = [0, Math.PI / 2, 0] }: PlaceProps) {
  const shelves = [0.72, 1.4, 2.05]
  return (
    <group position={position} rotation={rotation}>
      {[
        [-0.78, 1.15, -0.28],
        [0.78, 1.15, -0.28],
        [-0.78, 1.15, 0.28],
        [0.78, 1.15, 0.28],
      ].map((post) => (
        <Solid key={post.join()} args={[0.05, 2.3, 0.05]} position={post as [number, number, number]} color={palette.steelDark} metalness={0.72} roughness={0.32} castShadow />
      ))}
      {shelves.map((y) => (
        <Solid key={y} args={[1.7, 0.045, 0.66]} position={[0, y, 0]} color="#3a4046" metalness={0.55} roughness={0.4} castShadow />
      ))}
      <Solid args={[1.7, 2.15, 0.04]} position={[0, 1.2, 0.34]} color={palette.machine} metalness={0.4} roughness={0.55} />
      <Shaft position={[-0.45, shelves[2] + 0.08, 0]} />
      <Flange position={[0.28, shelves[2] + 0.06, 0.02]} />
      <Gear position={[0.48, shelves[1] + 0.08, -0.05]} />
      <Bushing position={[-0.42, shelves[1] + 0.02, 0.05]} />
      <Nozzle position={[0.05, shelves[1] + 0.02, 0.08]} />
      <Bracket position={[-0.35, shelves[0] + 0.08, 0]} />
      <Plate position={[0.28, shelves[0] + 0.045, 0]} />
    </group>
  )
}

function Shaft({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <Cylinder args={[0.045, 0.045, 0.62, 16]} color={palette.steel} metalness={0.82} roughness={0.22} />
      <Cylinder args={[0.07, 0.07, 0.16, 16]} position={[0, 0.12, 0]} color={palette.steel} metalness={0.82} roughness={0.22} />
    </group>
  )
}

function Flange({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.16, 0.16, 0.045, 24]} color={palette.steel} metalness={0.78} roughness={0.28} />
      <Cylinder args={[0.05, 0.05, 0.08, 16]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <Cylinder
            key={index}
            args={[0.018, 0.018, 0.06, 8]}
            position={[Math.cos(angle) * 0.1, 0.02, Math.sin(angle) * 0.1]}
            color={palette.brassDeep}
            metalness={0.7}
            roughness={0.35}
          />
        )
      })}
    </group>
  )
}

function Gear({ position }: { position: [number, number, number] }) {
  const teeth = 14
  return (
    <group position={position}>
      <Cylinder args={[0.15, 0.15, 0.07, 20]} color={palette.steelDark} metalness={0.75} roughness={0.32} />
      {Array.from({ length: teeth }, (_, index) => {
        const angle = (index / teeth) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.055, 0.07, 0.045]} />
            <meshStandardMaterial color={palette.steel} metalness={0.72} roughness={0.34} />
          </mesh>
        )
      })}
      <Cylinder args={[0.04, 0.04, 0.09, 12]} color={palette.machine} metalness={0.4} roughness={0.5} />
    </group>
  )
}

function Bushing({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.2, 20, 1, true]} />
        <meshStandardMaterial color={palette.brass} metalness={0.8} roughness={0.3} side={2} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.2, 20, 1, true]} />
        <meshStandardMaterial color={palette.brassDeep} metalness={0.65} roughness={0.4} side={1} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.055, 0.09, 20]} />
        <meshStandardMaterial color={palette.brass} metalness={0.8} roughness={0.3} side={2} />
      </mesh>
    </group>
  )
}

function Nozzle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <Cylinder args={[0.045, 0.045, 0.22, 16]} color={palette.steel} metalness={0.8} roughness={0.24} />
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.045, 0.16, 16]} />
        <meshStandardMaterial color={palette.steelDark} metalness={0.75} roughness={0.28} />
      </mesh>
    </group>
  )
}

function Bracket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Solid args={[0.42, 0.05, 0.16]} position={[0, 0, 0]} color="#d5dee6" metalness={0.55} roughness={0.35} />
      <Solid args={[0.05, 0.22, 0.16]} position={[-0.185, 0.1, 0]} color="#d5dee6" metalness={0.55} roughness={0.35} />
      <Cylinder args={[0.03, 0.03, 0.04, 12]} position={[0.08, 0.04, 0]} color={palette.machine} roughness={0.5} metalness={0.3} />
    </group>
  )
}

function Plate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Solid args={[0.46, 0.035, 0.28]} color={palette.steelDark} metalness={0.7} roughness={0.3} />
      {[
        [-0.14, 0.03, -0.07],
        [0.14, 0.03, -0.07],
        [-0.14, 0.03, 0.07],
        [0.14, 0.03, 0.07],
      ].map((hole) => (
        <Cylinder key={hole.join()} args={[0.025, 0.025, 0.02, 10]} position={hole as [number, number, number]} color={palette.machine} metalness={0.3} roughness={0.6} />
      ))}
    </group>
  )
}
