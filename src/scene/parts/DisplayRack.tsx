import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

type PlaceProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export function DisplayRack({ position, rotation = [0, Math.PI / 2, 0] }: PlaceProps) {
  const rootRef = useStaticGeometryBatches()
  const shelves = [0.72, 1.4, 2.05]
  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      {[
        [-0.78, 1.15, -0.28],
        [0.78, 1.15, -0.28],
        [-0.78, 1.15, 0.28],
        [0.78, 1.15, 0.28],
      ].map((post) => (
        <Solid key={post.join()} args={[0.05, 2.3, 0.05]} position={post as [number, number, number]} color={palette.steelDark} metalness={0.72} roughness={0.32} castShadow />
      ))}
      {[-0.78, 0.78].map((x) => (
        <group key={`foot-${x}`}>
          <Solid args={[0.18, 0.06, 0.77]} position={[x, 0.045, 0]} color="#61717a" metalness={0.6} roughness={0.4} />
          <Solid args={[0.1, 0.09, 0.11]} position={[x, 0.04, -0.34]} color="#d1ae62" metalness={0.4} roughness={0.46} />
        </group>
      ))}
      <Solid args={[1.48, 0.045, 0.045]} position={[0, 2.27, 0.28]} color="#8b9ba1" metalness={0.64} roughness={0.34} />
      <Solid args={[0.045, 2.18, 0.045]} position={[0, 1.16, 0.29]} color="#75858c" metalness={0.6} roughness={0.38} />
      {shelves.map((y) => (
        <group key={y}>
          <Solid args={[1.7, 0.045, 0.66]} position={[0, y, 0]} color="#3a4046" metalness={0.55} roughness={0.4} castShadow />
          <Solid args={[1.45, 0.016, 0.49]} position={[0, y + 0.032, 0]} color="#24313a" roughness={0.72} metalness={0.08} />
          <Solid args={[1.7, 0.045, 0.025]} position={[0, y + 0.025, -0.34]} color="#788992" metalness={0.65} roughness={0.36} />
          <Solid args={[1.58, 0.035, 0.035]} position={[0, y + 0.055, -0.29]} color="#b9c7c9" metalness={0.63} roughness={0.34} />
          {[-0.72, 0.72].map((x) => (
            <Cylinder key={x} args={[0.018, 0.018, 0.012, 12]} position={[x, y + 0.05, -0.3]} color="#303b43" metalness={0.46} roughness={0.5} />
          ))}
        </group>
      ))}
      <Solid args={[1.7, 2.15, 0.04]} position={[0, 1.2, 0.34]} color={palette.machine} metalness={0.4} roughness={0.55} />
      <Shaft position={[-0.45, shelves[2] + 0.08, 0]} />
      <Flange position={[0.28, shelves[2] + 0.06, 0.02]} />
      <Solid args={[0.06, 0.23, 0.13]} position={[0.38, shelves[1] + 0.15, -0.08]} color="#66757d" metalness={0.58} roughness={0.4} />
      <Gear position={[0.38, shelves[1] + 0.3, -0.12]} scale={1.6} upright />
      <Bushing position={[-0.62, shelves[1] + 0.02, 0.08]} />
      <Solid args={[0.06, 0.22, 0.13]} position={[-0.28, shelves[1] + 0.14, -0.08]} color="#66757d" metalness={0.58} roughness={0.4} />
      <Flange position={[-0.28, shelves[1] + 0.29, -0.12]} scale={1.4} upright />
      <Nozzle position={[0.05, shelves[1] + 0.02, 0.08]} />
      <Bracket position={[-0.35, shelves[0] + 0.08, 0]} />
      <Plate position={[0.28, shelves[0] + 0.045, 0]} />
      <Shaft position={[0.48, shelves[2] + 0.08, 0.17]} />
      <Flange position={[-0.07, shelves[0] + 0.06, 0.05]} />
      <Flange position={[0.56, shelves[1] + 0.06, 0.16]} />
      <Bushing position={[-0.66, shelves[2] + 0.02, 0.1]} />
      <Shaft position={[0.07, shelves[1] + 0.08, 0.16]} />
      <Solid args={[0.55, 0.025, 0.4]} position={[0.42, shelves[0] + 0.04, 0.06]} color="#83929a" metalness={0.66} roughness={0.34} />
      {[-0.12, 0.04, 0.2].map((z) => (
        <Cylinder key={z} args={[0.045, 0.045, 0.13, 14]} position={[0.28, shelves[0] + 0.12, z]} color={palette.steel} metalness={0.76} roughness={0.3} />
      ))}
      <ShelfLabel position={[-0.53, 0.65, -0.365]} label="S-01" />
      <ShelfLabel position={[-0.53, 1.33, -0.365]} label="S-02" />
      <ShelfLabel position={[-0.53, 1.98, -0.365]} label="S-03" />
      <PartsBin position={[-0.42, 0.27, -0.02]} label="A-07" />
      <PartsBin position={[0.38, 0.27, -0.02]} label="B-12" />
    </group>
  )
}

function ShelfLabel({ position, label }: { position: [number, number, number]; label: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 64
    const context = canvas.getContext('2d')!
    context.fillStyle = '#e5e4d9'
    context.fillRect(0, 0, 192, 64)
    context.fillStyle = '#34444b'
    context.font = 'bold 32px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(label, 96, 32)
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [label])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <group position={position}>
      <Solid args={[0.3, 0.11, 0.014]} color="#d6d6c9" roughness={0.83} />
      <mesh position={[0, 0, -0.009]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.29, 0.1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function PartsBin({ position, label }: { position: [number, number, number]; label: string }) {
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 80
    const context = canvas.getContext('2d')!
    context.fillStyle = '#e6e3d6'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#131b20'
    context.font = 'bold 48px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(label, 128, 40)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [label])
  useEffect(() => () => labelTexture.dispose(), [labelTexture])
  return (
    <group position={position}>
      <Solid args={[0.58, 0.045, 0.46]} position={[0, -0.17, 0]} color="#56656d" roughness={0.65} metalness={0.18} />
      {[-0.27, 0.27].map((x) => (
        <Solid key={x} args={[0.04, 0.35, 0.46]} position={[x, 0, 0]} color="#56656d" roughness={0.65} metalness={0.18} />
      ))}
      {[-0.21, 0.21].map((z) => (
        <Solid key={z} args={[0.58, 0.35, 0.04]} position={[0, 0, z]} color="#56656d" roughness={0.65} metalness={0.18} />
      ))}
      {[-0.13, 0, 0.13].map((x) => (
        <Cylinder key={x} args={[0.045, 0.045, 0.11, 12]} position={[x, 0.13, 0.02]} color={palette.steel} metalness={0.78} roughness={0.3} />
      ))}
      {[-0.13, 0, 0.13].map((x) => (
        <Cylinder key={`nut-${x}`} args={[0.052, 0.052, 0.045, 6]} position={[x, 0.17, -0.08]} color="#c3d0d5" metalness={0.72} roughness={0.32} />
      ))}
      {[-0.1, 0.1].map((x) => (
        <Cylinder key={`pin-${x}`} args={[0.023, 0.023, 0.17, 12]} position={[x, 0.18, 0.12]} rotation={[Math.PI / 2, 0, 0]} color={palette.steel} metalness={0.78} roughness={0.3} />
      ))}
      <Solid args={[0.46, 0.14, 0.015]} position={[0, 0.025, -0.24]} color="#e6e3d6" roughness={0.83} metalness={0.02} />
      <mesh position={[0, 0.025, -0.252]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.45, 0.13]} />
        <meshBasicMaterial map={labelTexture} side={THREE.DoubleSide} />
      </mesh>
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

function Flange({ position, scale = 1, upright = false }: { position: [number, number, number]; scale?: number; upright?: boolean }) {
  return (
    <group position={position} scale={scale} rotation={upright ? [Math.PI / 2, 0, 0] : undefined}>
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

function Gear({ position, scale = 1, upright = false }: { position: [number, number, number]; scale?: number; upright?: boolean }) {
  const teeth = 14
  return (
    <group position={position} scale={scale} rotation={upright ? [Math.PI / 2, 0, 0] : undefined}>
      <Cylinder args={[0.15, 0.15, 0.07, 20]} color={palette.steelDark} metalness={0.75} roughness={0.32} />
      {Array.from({ length: teeth }, (_, index) => {
        const angle = (index / teeth) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.055, 0.07, 0.045]} />
            <meshStandardMaterial color="#c3d3d8" metalness={0.72} roughness={0.3} />
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
