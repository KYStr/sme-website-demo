import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

// The centre aisle stays clear from the roller door to dispatch. Each area has
// a different floor edge, storage, and a physical boundary where it matters.
export function FactoryLayout() {
  const rootRef = useStaticGeometryBatches()
  return (
    <group ref={rootRef}>
      <TrafficAisle />
      <MachiningBays />
      <FinishedGoods />
      <InspectionRoom />
      <DispatchBay />
      <Services />
    </group>
  )
}

function TrafficAisle() {
  return (
    <group>
      {[-1.55, 1.55].map((x) => (
        <group key={x}>
          {[3.2, 7.2, 11.2, 15.2, 19.2, 23.2, 27.2].map((z) => (
            <Solid key={z} args={[0.055, 0.005, 2.55]} position={[x, 0.061, z]} color={palette.caution} roughness={0.85} metalness={0} />
          ))}
        </group>
      ))}
      {[6.2, 15.9, 22.1, 28.5].map((z) => (
        <Solid key={z} args={[3.1, 0.004, 0.075]} position={[0, 0.063, z]} color={palette.caution} roughness={0.85} metalness={0} />
      ))}
    </group>
  )
}

function Screen({ x, z, length = 2.8 }: { x: number; z: number; length?: number }) {
  return (
    <group>
      <Solid args={[length, 0.42, 0.09]} position={[x, 0.43, z]} color="#3b4650" roughness={0.7} metalness={0.35} />
      <Solid args={[length, 1.35, 0.035]} position={[x, 1.31, z]} color="#9ab5ba" opacity={0.18} transparent roughness={0.15} metalness={0.12} />
      <Solid args={[length, 0.055, 0.08]} position={[x, 2.01, z]} color={palette.steelDark} metalness={0.7} />
      {[-length / 2, length / 2].map((offset) => (
        <Solid key={offset} args={[0.07, 2.05, 0.08]} position={[x + offset, 1.03, z]} color={palette.steelDark} metalness={0.68} />
      ))}
    </group>
  )
}

function MachiningBays() {
  return (
    <group>
      <Screen x={3.9} z={12.15} length={3.7} />
      <Screen x={-4.25} z={14.75} length={3.8} />
      <Solid args={[0.08, 2.05, 3.5]} position={[5.72, 1.03, 10.45]} color={palette.steelDark} metalness={0.68} />
      <Solid args={[0.035, 1.32, 3.35]} position={[5.72, 1.35, 10.45]} color="#9ab5ba" opacity={0.17} transparent roughness={0.15} />
      <Solid args={[0.08, 2.05, 3.1]} position={[-5.95, 1.03, 12.9]} color={palette.steelDark} metalness={0.68} />
      <Solid args={[0.035, 1.32, 2.9]} position={[-5.95, 1.35, 12.9]} color="#9ab5ba" opacity={0.17} transparent roughness={0.15} />
      <Cabinet x={5.6} z={6.4} />
      <Cabinet x={-5.7} z={9.1} />
      <Workbench x={5.45} z={15.2} />
      <StockRack x={-5.55} z={17.25} />
      <ChipCart x={4.65} z={13.35} />
      <ChipCart x={-4.95} z={15.5} />
      <UtilityBridge />
      <Solid args={[5.2, 0.035, 0.08]} position={[4.2, 0.075, 7.2]} color={palette.caution} metalness={0} />
      <Solid args={[5.1, 0.035, 0.08]} position={[-4.25, 0.075, 10.45]} color={palette.caution} metalness={0} />
    </group>
  )
}

function UtilityBridge() {
  return (
    <group>
      <Solid args={[0.34, 0.1, 7.4]} position={[4.75, 3.12, 10.4]} color="#65717a" metalness={0.62} roughness={0.37} />
      {[-0.14, 0.14].map((x) => (
        <Solid key={x} args={[0.035, 0.18, 7.4]} position={[4.75 + x, 3.16, 10.4]} color="#303c44" metalness={0.6} roughness={0.4} />
      ))}
      {[8.15, 9.45, 10.75, 12.05].map((z) => (
        <Solid key={z} args={[0.34, 0.03, 0.04]} position={[4.75, 3.21, z]} color="#b4c1c5" metalness={0.52} roughness={0.42} />
      ))}
      <Solid args={[1.6, 0.07, 0.08]} position={[3.85, 3.04, 9.45]} color="#344149" metalness={0.52} roughness={0.46} />
      <Solid args={[0.08, 0.6, 0.08]} position={[3.35, 2.73, 9.45]} color="#344149" metalness={0.52} roughness={0.46} />
      <Solid args={[0.065, 0.065, 0.72]} position={[3.35, 2.45, 9.1]} color="#b0bdc1" metalness={0.54} roughness={0.4} />
      <Solid args={[0.29, 0.08, 4.3]} position={[-5.15, 3.08, 12.6]} color="#65717a" metalness={0.62} roughness={0.37} />
      <Solid args={[1.5, 0.06, 0.07]} position={[-4.28, 3.0, 12.55]} color="#344149" metalness={0.52} roughness={0.46} />
      <Solid args={[0.07, 1.18, 0.07]} position={[-3.52, 2.42, 12.55]} color="#344149" metalness={0.52} roughness={0.46} />
    </group>
  )
}

function Cabinet({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Solid args={[1.1, 1.7, 0.55]} position={[0, 0.85, 0]} color="#33414b" castShadow />
      <Solid args={[1.04, 0.035, 0.04]} position={[0, 1.66, -0.3]} color={palette.caution} metalness={0.3} />
      {[0.52, 0.91, 1.3].map((y) => (
        <group key={y}>
          <Solid args={[1, 0.018, 0.025]} position={[0, y, -0.285]} color="#151e24" />
          <Solid args={[0.26, 0.025, 0.035]} position={[0, y + 0.13, -0.305]} color={palette.steelDark} metalness={0.75} />
        </group>
      ))}
    </group>
  )
}

function Workbench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Solid args={[2.15, 0.12, 0.88]} position={[0, 0.94, 0]} color="#67717a" metalness={0.55} castShadow />
      {[-0.91, 0.91].map((offset) => (
        <Solid key={offset} args={[0.09, 0.9, 0.7]} position={[offset, 0.45, 0]} color="#323b43" metalness={0.6} />
      ))}
      <Solid args={[2.1, 1.1, 0.08]} position={[0, 1.53, 0.38]} color="#2b343c" metalness={0.35} />
      {[-0.65, 0.1, 0.7].map((offset) => (
        <Solid key={offset} args={[0.42, 0.25, 0.32]} position={[offset, 1.19, 0]} color={palette.steelDark} metalness={0.68} />
      ))}
    </group>
  )
}

function StockRack({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[-0.8, 0.8].map((offset) => (
        <Solid key={offset} args={[0.08, 2.35, 0.75]} position={[offset, 1.18, 0]} color="#52606b" metalness={0.6} />
      ))}
      {[0.58, 1.36, 2.12].map((y) => (
        <group key={y}>
          <Solid args={[1.8, 0.07, 0.8]} position={[0, y, 0]} color="#3e4952" metalness={0.48} />
          {[-0.35, 0.05, 0.4].map((offset) => (
            <Cylinder key={offset} args={[0.07, 0.07, 1.38, 10]} position={[offset, y + 0.12, 0]} rotation={[0, 0, Math.PI / 2]} color={palette.steel} metalness={0.7} />
          ))}
        </group>
      ))}
    </group>
  )
}

function ChipCart({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Solid args={[0.8, 0.58, 0.62]} position={[0, 0.46, 0]} color="#50606a" metalness={0.5} castShadow />
      <Solid args={[0.74, 0.035, 0.57]} position={[0, 0.77, 0]} color="#98a5a9" metalness={0.65} />
      {[-0.28, 0.28].map((offset) => (
        <Cylinder key={offset} args={[0.09, 0.09, 0.045, 12]} position={[offset, 0.12, -0.36]} rotation={[Math.PI / 2, 0, 0]} color="#171a1c" metalness={0.2} />
      ))}
    </group>
  )
}

function FinishedGoods() {
  return (
    <group>
      <Solid args={[13.1, 0.008, 0.13]} position={[0, 0.067, 16.35]} color={palette.caution} metalness={0} />
      <Solid args={[2.7, 0.008, 3.5]} position={[-3.65, 0.066, 19.25]} color="#4f626b" roughness={0.9} metalness={0} />
      <Solid args={[2.45, 0.008, 3.3]} position={[-3.65, 0.069, 19.25]} color="#45535b" roughness={0.9} metalness={0} />
      <Workbench x={5.2} z={19.9} />
      <Cabinet x={5.8} z={21.1} />
      <Solid args={[2.8, 2.05, 0.09]} position={[-5.55, 1.03, 21.55]} color="#50616b" metalness={0.45} />
    </group>
  )
}

function Partition({ z, cool = false }: { z: number; cool?: boolean }) {
  const lower = cool ? '#53616a' : '#43505a'
  return (
    <group>
      {[-4.7, 4.7].map((x) => (
        <group key={x}>
          <Solid args={[4.6, 1.15, 0.13]} position={[x, 0.58, z]} color={lower} roughness={0.68} metalness={0.22} />
          <Solid args={[4.52, 2.75, 0.035]} position={[x, 2.52, z]} color={cool ? '#a9c3cd' : '#9ab5ba'} opacity={0.17} transparent roughness={0.1} metalness={0.05} />
          <Solid args={[4.65, 0.08, 0.15]} position={[x, 3.94, z]} color={palette.steelDark} metalness={0.68} />
          <Solid args={[4.65, 0.055, 0.12]} position={[x, 1.17, z]} color={palette.steelDark} metalness={0.68} />
          {[-2.28, 0, 2.28].map((offset) => (
            <Solid key={offset} args={[0.08, 2.8, 0.15]} position={[x + offset, 2.54, z]} color={palette.steelDark} metalness={0.68} />
          ))}
        </group>
      ))}
      <Solid args={[4.75, 0.35, 0.18]} position={[0, 4.03, z]} color={lower} metalness={0.32} />
      <Solid args={[0.14, 4.2, 0.18]} position={[-2.4, 2.1, z]} color={palette.steelDark} metalness={0.65} />
      <Solid args={[0.14, 4.2, 0.18]} position={[2.4, 2.1, z]} color={palette.steelDark} metalness={0.65} />
      <Solid args={[4.55, 0.06, 0.11]} position={[0, 0.08, z]} color={cool ? '#a8c8d7' : palette.caution} metalness={0.1} />
    </group>
  )
}

function InspectionRoom() {
  return (
    <group>
      <Partition z={22.35} cool />
      <InspectionEntrance />
      <Solid args={[0.13, 3.9, 6.1]} position={[5.05, 1.95, 25.45]} color="#62727b" opacity={0.38} transparent roughness={0.18} metalness={0.15} />
      {[22.4, 25.4, 28.45].map((z) => (
        <Solid key={z} args={[0.15, 4.02, 0.14]} position={[5.05, 2.01, z]} color={palette.steelDark} metalness={0.68} />
      ))}
      <Solid args={[4.9, 0.008, 0.09]} position={[1.5, 0.069, 23.3]} color="#afc9d1" metalness={0} />
      <Solid args={[4.9, 0.008, 0.09]} position={[1.5, 0.069, 27.9]} color="#afc9d1" metalness={0} />
      <Cabinet x={-5.55} z={25.55} />
      <Solid args={[0.65, 0.9, 0.45]} position={[4.1, 0.45, 26.8]} color="#d4dce1" roughness={0.35} metalness={0.42} />
      <Solid args={[1.8, 0.11, 0.76]} position={[4.02, 0.94, 24.1]} color="#aeb9be" roughness={0.35} metalness={0.48} />
      {[3.3, 4.74].map((x) => (
        <Solid key={x} args={[0.08, 0.88, 0.65]} position={[x, 0.44, 24.1]} color="#59666e" metalness={0.5} />
      ))}
      <Solid args={[0.62, 0.14, 0.4]} position={[3.65, 1.08, 24.1]} color="#e2e8e9" roughness={0.48} metalness={0.35} />
      <Solid args={[0.58, 0.12, 0.36]} position={[4.4, 1.07, 24.1]} color="#72828b" roughness={0.4} metalness={0.45} />
    </group>
  )
}

function InspectionEntrance() {
  const sign = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const context = canvas.getContext('2d')!
    context.fillStyle = '#24333a'
    context.fillRect(0, 0, 512, 128)
    context.fillStyle = '#f0e7d4'
    context.font = 'bold 58px sans-serif'
    context.textAlign = 'center'
    context.fillText('量測室  /  QC', 256, 81)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
  useEffect(() => () => sign.dispose(), [sign])
  return (
    <group>
      <Solid args={[4.68, 0.1, 0.66]} position={[0, 0.075, 22.12]} color="#768b93" metalness={0.22} roughness={0.83} />
      <Solid args={[4.7, 0.022, 0.035]} position={[0, 0.14, 21.78]} color="#d2bc7a" metalness={0.3} roughness={0.64} />
      {[-2.4, 2.4].map((x) => (
        <group key={x}>
          <Solid args={[0.16, 3.72, 0.22]} position={[x, 1.86, 22.2]} color="#a8b9c0" metalness={0.58} roughness={0.38} />
          <Solid args={[0.08, 3.55, 0.04]} position={[x, 1.84, 22.07]} color="#e6d19a" metalness={0.44} roughness={0.42} />
        </group>
      ))}
      <Solid args={[4.96, 0.18, 0.24]} position={[0, 3.76, 22.2]} color="#aebec2" metalness={0.58} roughness={0.38} />
      <Solid args={[1.55, 0.46, 0.07]} position={[4, 2.65, 22.18]} color="#24333a" metalness={0.35} roughness={0.54} />
      <mesh position={[4, 2.65, 22.135]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.47, 0.38]} />
        <meshBasicMaterial map={sign} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function DispatchBay() {
  return (
    <group>
      <Partition z={28.75} />
      <Solid args={[4.2, 0.008, 0.08]} position={[0, 0.07, 30.05]} color={palette.caution} metalness={0} />
      <Workbench x={-5.4} z={31.45} />
      <Solid args={[1.4, 1.7, 0.5]} position={[5.65, 0.85, 32.1]} color="#39454c" metalness={0.42} castShadow />
      <Solid args={[5.6, 3.65, 0.11]} position={[0.2, 1.87, 33.74]} color="#47545d" metalness={0.42} roughness={0.48} />
      {Array.from({ length: 12 }, (_, index) => (
        <Solid key={index} args={[5.5, 0.035, 0.13]} position={[0.2, 0.3 + index * 0.28, 33.66]} color={index % 3 === 0 ? '#59656e' : '#39434d'} metalness={0.5} roughness={0.5} />
      ))}
      {[-2.7, 3.1].map((x) => (
        <group key={x}>
          <Solid args={[0.12, 3.75, 0.18]} position={[x, 1.88, 33.63]} color={palette.caution} metalness={0.2} />
          {[0.6, 1.12, 1.64, 2.16, 2.68].map((y) => (
            <Solid key={y} args={[0.13, 0.11, 0.19]} position={[x, y, 33.52]} color="#252b2e" roughness={0.72} />
          ))}
        </group>
      ))}
      <Solid args={[5.9, 0.12, 0.2]} position={[0.2, 3.78, 33.63]} color={palette.caution} metalness={0.2} />
      <Solid args={[0.72, 0.38, 0.2]} position={[2.35, 3.5, 33.5]} color="#303c43" metalness={0.55} roughness={0.46} />
      <Solid args={[0.62, 0.09, 0.015]} position={[2.35, 3.54, 33.39]} color="#e8d29b" roughness={0.68} />
      <Solid args={[0.42, 0.06, 0.015]} position={[2.25, 3.46, 33.39]} color="#a5b5ba" roughness={0.64} />
      <Solid args={[0.3, 0.54, 0.14]} position={[3.35, 1.32, 33.52]} color="#3f4d55" metalness={0.48} roughness={0.47} />
      <Solid args={[0.19, 0.15, 0.015]} position={[3.35, 1.39, 33.44]} color="#b4c4c6" emissive="#52727a" emissiveIntensity={0.24} roughness={0.3} />
      <Solid args={[0.08, 0.08, 0.02]} position={[3.35, 1.2, 33.42]} color="#bb5149" roughness={0.45} />
      <Solid args={[3.2, 0.1, 0.38]} position={[0, 5.5, 31.5]} color="#58616a" emissive={palette.warm} emissiveIntensity={1.7} roughness={0.3} />
    </group>
  )
}

function Services() {
  return (
    <group>
      <Solid args={[0.22, 0.22, 28.8]} position={[5.1, 5.55, 17.2]} color="#68737a" metalness={0.65} />
      {[6.5, 14.5, 20.5, 26.5, 31.5].map((z) => (
        <group key={z}>
          <Solid args={[3.1, 0.06, 0.07]} position={[3.65, 5.63, z]} color="#68737a" metalness={0.6} />
          <Solid args={[0.07, 1.15, 0.07]} position={[5.1, 4.94, z]} color="#68737a" metalness={0.6} />
        </group>
      ))}
    </group>
  )
}
