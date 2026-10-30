type SolidProps = {
  args: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  castShadow?: boolean
  receiveShadow?: boolean
  opacity?: number
  transparent?: boolean
}

export function Solid({
  args,
  position,
  rotation,
  color,
  roughness = 0.62,
  metalness = 0.34,
  emissive = '#000000',
  emissiveIntensity = 0,
  castShadow = false,
  receiveShadow = false,
  opacity = 1,
  transparent = false,
}: SolidProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent={transparent || opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}

type CylinderProps = {
  args: [number, number, number, number?]
  position?: [number, number, number]
  rotation?: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  castShadow?: boolean
}

export function Cylinder({
  args,
  position,
  rotation,
  color,
  roughness = 0.42,
  metalness = 0.62,
  emissive = '#000000',
  emissiveIntensity = 0,
  castShadow = false,
}: CylinderProps) {
  const [radiusTop, radiusBottom, height, segments = 20] = args
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}
