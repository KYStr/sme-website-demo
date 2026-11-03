import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

export function Shipping() {
  const rootRef = useStaticGeometryBatches()
  return (
    <group ref={rootRef}>
      <Pallet position={[-1.05, 0, 30.7]} />
      <Carton position={[-1.05, 0.18, 30.7]} size={[0.72, 0.48, 0.55]} />
      <Carton position={[-0.95, 0.66, 30.65]} size={[0.48, 0.34, 0.4]} />
      <Pallet position={[3.2, 0, 32.35]} />
      <Carton position={[3.2, 0.18, 32.35]} size={[0.86, 0.42, 0.62]} />
      <Carton position={[3.58, 0.6, 32.38]} size={[0.38, 0.28, 0.36]} />
      <Solid args={[0.28, 0.28, 0.22]} position={[3.5, 0.74, 32.3]} color={palette.carton} roughness={0.88} metalness={0.02} castShadow />
      <PackingCheck />
      <PalletJack />
      <Solid args={[0.9, 0.28, 0.18]} position={[-2.4, 0.35, 33.55]} color={palette.rubber} roughness={0.9} />
      <Solid args={[0.9, 0.28, 0.18]} position={[2.3, 0.35, 33.55]} color={palette.rubber} roughness={0.9} />
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[-1.5 + index * 0.42, 0.058, 29.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.9]} />
          <meshBasicMaterial color={index % 2 === 0 ? '#e2b340' : '#1b1e22'} />
        </mesh>
      ))}
    </group>
  )
}

function PackingCheck() {
  return (
    <group position={[-0.85, 0, 31.4]} rotation={[0, -0.2, 0]}>
      <Solid args={[0.68, 0.08, 0.45]} position={[0, 0.07, 0]} color="#263139" metalness={0.42} roughness={0.55} />
      <Solid args={[0.08, 1.12, 0.08]} position={[0, 0.65, 0.12]} color="#65757c" metalness={0.62} roughness={0.36} />
      <Solid args={[0.78, 0.06, 0.5]} position={[0, 1.19, 0]} color="#66767e" metalness={0.54} roughness={0.4} />
      <Solid args={[0.72, 0.018, 0.44]} position={[0, 1.23, 0]} color="#adb9b9" metalness={0.25} roughness={0.48} />
      <group position={[-0.2, 1.25, -0.02]}>
        <Solid args={[0.27, 0.015, 0.34]} color="#e8d8aa" roughness={0.84} />
        <Solid args={[0.22, 0.012, 0.28]} position={[0, 0.01, 0]} color="#f3f0e7" roughness={0.94} />
        <Solid args={[0.07, 0.02, 0.025]} position={[0, 0.025, -0.15]} color="#3c4950" metalness={0.45} roughness={0.4} />
        {[-0.08, -0.02, 0.04, 0.1].map((z) => (
          <Solid key={z} args={[0.16, 0.005, 0.01]} position={[0, 0.018, z]} color="#3d4a4e" roughness={0.8} />
        ))}
        <Solid args={[0.07, 0.005, 0.015]} position={[-0.04, 0.018, 0.115]} color="#4d875e" roughness={0.6} />
      </group>
      <group position={[0.2, 1.3, 0]} rotation={[0, -0.2, -0.25]}>
        <Solid args={[0.22, 0.11, 0.3]} color="#313d44" metalness={0.32} roughness={0.54} />
        <Solid args={[0.1, 0.2, 0.09]} position={[0.03, -0.13, 0.02]} color="#252e34" roughness={0.64} />
        <Solid args={[0.18, 0.07, 0.02]} position={[0, 0, -0.16]} color="#c8e0df" emissive="#668b8d" emissiveIntensity={0.3} roughness={0.35} />
        <Solid args={[0.16, 0.024, 0.024]} position={[0, 0.065, -0.07]} color={palette.caution} roughness={0.5} />
      </group>
      <Solid args={[0.42, 0.3, 0.055]} position={[0.18, 1.49, 0.14]} color="#36434b" metalness={0.45} roughness={0.42} />
      <Solid args={[0.33, 0.21, 0.015]} position={[0.18, 1.5, 0.105]} color="#a9cdd1" emissive="#628f95" emissiveIntensity={0.38} roughness={0.25} />
      <Solid args={[0.23, 0.015, 0.018]} position={[0.16, 1.55, 0.088]} color="#245369" emissive="#245369" emissiveIntensity={0.2} />
      <Solid args={[0.16, 0.013, 0.018]} position={[0.125, 1.51, 0.088]} color="#245369" emissive="#245369" emissiveIntensity={0.2} />
      <Solid args={[0.07, 0.018, 0.018]} position={[0.28, 1.45, 0.088]} color="#3f9b6b" emissive="#3f9b6b" emissiveIntensity={0.4} />
    </group>
  )
}

function PalletJack() {
  return (
    <group position={[0.1, 0, 31.45]} rotation={[0, 0.28, 0]}>
      {[-0.26, 0.26].map((x) => (
        <group key={x}>
          <Solid args={[0.1, 0.095, 1.32]} position={[x, 0.12, 0]} color={palette.caution} metalness={0.42} roughness={0.44} />
          <Solid args={[0.1, 0.06, 0.17]} position={[x, 0.12, 0.59]} color="#e4be5a" metalness={0.38} roughness={0.44} />
          <Cylinder args={[0.06, 0.06, 0.07, 16]} position={[x, 0.07, 0.48]} rotation={[0, 0, Math.PI / 2]} color={palette.rubber} roughness={0.78} />
        </group>
      ))}
      <Solid args={[0.7, 0.22, 0.35]} position={[0, 0.25, -0.7]} color={palette.caution} metalness={0.48} roughness={0.42} />
      {[-0.25, 0.25].map((x) => (
        <Cylinder key={x} args={[0.12, 0.12, 0.08, 20]} position={[x, 0.12, -0.92]} rotation={[0, 0, Math.PI / 2]} color={palette.rubber} roughness={0.8} />
      ))}
      <Cylinder args={[0.055, 0.055, 0.38, 16]} position={[0, 0.5, -0.92]} color="#6f7e85" metalness={0.62} roughness={0.36} />
      <Cylinder args={[0.038, 0.038, 0.88, 12]} position={[0, 1.07, -0.92]} rotation={[0.18, 0, 0]} color={palette.steelDark} metalness={0.64} roughness={0.34} />
      <group position={[0, 1.47, -0.94]}>
        <Solid args={[0.43, 0.07, 0.07]} color={palette.rubber} roughness={0.76} />
        {[-0.19, 0.19].map((x) => (
          <Solid key={x} args={[0.065, 0.19, 0.065]} position={[x, -0.08, 0]} color={palette.rubber} roughness={0.76} />
        ))}
      </group>
    </group>
  )
}

function Pallet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.36, 0, 0.36].map((x) => (
        <Solid key={x} args={[0.09, 0.14, 1.05]} position={[x, 0.07, 0]} color={palette.wood} roughness={0.86} metalness={0.02} />
      ))}
      {[-0.39, 0.39].map((z) => (
        <Solid key={z} args={[1.02, 0.055, 0.095]} position={[0, 0.075, z]} color="#805c39" roughness={0.86} metalness={0.02} />
      ))}
      {[-0.42, -0.21, 0, 0.21, 0.42].map((z) => (
        <Solid key={z} args={[1.02, 0.035, 0.11]} position={[0, 0.16, z]} color={palette.woodLight} roughness={0.8} metalness={0.02} />
      ))}
    </group>
  )
}

function Carton({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <group position={position}>
      <Solid args={size} position={[0, size[1] / 2, 0]} color={palette.carton} roughness={0.88} metalness={0.02} castShadow />
      <Solid args={[size[0] * 0.98, 0.008, 0.012]} position={[0, size[1] + 0.005, -size[2] / 2 + 0.01]} color="#8c6842" roughness={0.9} />
      <Solid args={[size[0] * 0.98, 0.008, 0.012]} position={[0, size[1] + 0.005, size[2] / 2 - 0.01]} color="#8c6842" roughness={0.9} />
      <Solid
        args={[size[0] * 0.1, size[1] + 0.01, size[2] + 0.012]}
        position={[0, size[1] / 2, 0]}
        color={palette.cartonDark}
        roughness={0.7}
        metalness={0.05}
      />
      <Solid args={[size[0] * 0.42, size[1] * 0.31, 0.008]} position={[size[0] * 0.19, size[1] * 0.55, -size[2] / 2 - 0.005]} color="#ece8d8" roughness={0.9} />
      {[0, 0.03, 0.065, 0.09, 0.14].map((x) => (
        <Solid key={x} args={[0.008, size[1] * 0.2, 0.009]} position={[size[0] * 0.03 + x, size[1] * 0.55, -size[2] / 2 - 0.013]} color="#333b40" roughness={0.9} />
      ))}
      <Solid args={[size[0] * 0.05, size[1] + 0.014, size[2] + 0.016]} position={[-size[0] * 0.28, size[1] / 2, 0]} color="#aab4ae" roughness={0.75} metalness={0.12} />
    </group>
  )
}
