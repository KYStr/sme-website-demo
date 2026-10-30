import { palette } from '../palette.ts'
import { Solid } from '../solids.tsx'

export function Shipping() {
  return (
    <group>
      <Pallet position={[-0.15, 0, 30.7]} />
      <Carton position={[-0.15, 0.18, 30.7]} size={[0.72, 0.48, 0.55]} />
      <Carton position={[-0.05, 0.66, 30.65]} size={[0.48, 0.34, 0.4]} />
      <Pallet position={[1.85, 0, 31.45]} />
      <Carton position={[1.85, 0.18, 31.45]} size={[0.86, 0.42, 0.62]} />
      <Solid args={[0.28, 0.28, 0.22]} position={[2.15, 0.74, 31.4]} color={palette.carton} roughness={0.88} metalness={0.02} castShadow />
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

function Pallet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.36, 0, 0.36].map((x) => (
        <Solid key={x} args={[0.09, 0.14, 1.05]} position={[x, 0.07, 0]} color={palette.wood} roughness={0.86} metalness={0.02} />
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
      <Solid
        args={[size[0] * 0.1, size[1] + 0.01, size[2] + 0.012]}
        position={[0, size[1] / 2, 0]}
        color={palette.cartonDark}
        roughness={0.7}
        metalness={0.05}
      />
    </group>
  )
}
