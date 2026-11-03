import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

export function Dressing() {
  const rootRef = useStaticGeometryBatches()
  return (
    <group ref={rootRef}>
      <Solid args={[0.7, 1.35, 0.42]} position={[-5.15, 0.72, 7.4]} color={palette.machinePanel} metalness={0.45} roughness={0.5} castShadow />
      {[0.35, 0.62, 0.9, 1.16].map((y) => (
        <Solid key={y} args={[0.62, 0.02, 0.44]} position={[-5.15, y, 7.4]} color={palette.brassDeep} metalness={0.5} roughness={0.45} />
      ))}
      <Cylinder args={[0.09, 0.09, 0.55]} position={[-6.15, 0.4, 2.6]} color="#9a3030" roughness={0.45} metalness={0.25} />
      <Cylinder args={[0.11, 0.11, 0.06]} position={[-6.15, 0.7, 2.6]} color={palette.rubber} roughness={0.7} metalness={0.1} />
      <Solid args={[0.55, 0.7, 0.3]} position={[-5.4, 0.4, 14.2]} color="#2a3138" metalness={0.4} roughness={0.55} />
      <Solid args={[0.9, 1.1, 0.08]} position={[6.55, 1.5, 6]} color={palette.caution} roughness={0.55} metalness={0.15} />
      <Solid args={[0.55, 0.08, 0.09]} position={[6.55, 1.72, 5.95]} color={palette.machine} />
    </group>
  )
}
