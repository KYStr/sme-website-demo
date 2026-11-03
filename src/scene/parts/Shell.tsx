import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'
import { useStaticGeometryBatches } from '../useStaticGeometryBatches.ts'

const height = 6.4
const depth = 34
const wall = 0.24
const doorHalf = 2.4
const doorH = 3.55

export function Shell() {
  const rootRef = useStaticGeometryBatches()
  return (
    <group ref={rootRef}>
      <Ground />
      <Building />
      <FacadeSign />
      <Interior />
    </group>
  )
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 8]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={palette.floorOut} roughness={0.95} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -7.2]} receiveShadow>
        <planeGeometry args={[24, 15]} />
        <meshStandardMaterial color={palette.apron} roughness={0.88} metalness={0.08} />
      </mesh>
      <ExteriorYard />
      <ApproachTicks />
      <Cylinder args={[0.12, 0.14, 0.85]} position={[-3.7, 0.42, -2.55]} color={palette.claddingDeep} />
      <Cylinder args={[0.14, 0.14, 0.06]} position={[-3.7, 0.88, -2.55]} color={palette.brass} metalness={0.8} roughness={0.32} />
      <Cylinder args={[0.12, 0.14, 0.85]} position={[3.7, 0.42, -2.55]} color={palette.claddingDeep} />
      <Cylinder args={[0.14, 0.14, 0.06]} position={[3.7, 0.88, -2.55]} color={palette.brass} metalness={0.8} roughness={0.32} />
    </group>
  )
}

function ExteriorYard() {
  return (
    <group>
      {[-12.4, -7.4, -2.4].map((z) => (
        <Solid key={z} args={[24, 0.006, 0.03]} position={[0, 0.019, z]} color="#4c5458" roughness={0.94} />
      ))}
      {[-9.3, 9.3].map((x) => (
        <Solid key={x} args={[0.07, 0.007, 12.4]} position={[x, 0.023, -7.2]} color="#d5b35b" roughness={0.88} />
      ))}
      <Solid args={[0.55, 0.015, 8.1]} position={[6.1, 0.026, -9.2]} color="#9ba3a2" roughness={0.88} />
      <Solid args={[0.55, 0.015, 8.1]} position={[-6.1, 0.026, -9.2]} color="#9ba3a2" roughness={0.88} />
      <Solid args={[2.6, 0.035, 0.4]} position={[0, 0.035, -1.4]} color="#495159" roughness={0.88} />
      {[-1.12, -0.56, 0, 0.56, 1.12].map((x) => (
        <Solid key={x} args={[0.04, 0.012, 0.33]} position={[x, 0.057, -1.4]} color="#222a2e" roughness={0.9} />
      ))}
      <Solid args={[9.2, 0.12, 0.28]} position={[-11.9, 0.08, -0.2]} color="#7a7e7d" roughness={0.92} />
      <Solid args={[8.6, 0.12, 0.28]} position={[11.9, 0.08, -0.2]} color="#7a7e7d" roughness={0.92} />
      <Solid args={[6.4, 3.2, 9.5]} position={[-18.8, 1.6, 1.4]} color="#343b40" roughness={0.76} />
      <Solid args={[3.15, 2.45, 0.06]} position={[-18.6, 1.26, -3.38]} color="#677279" metalness={0.35} roughness={0.57} />
      {Array.from({ length: 8 }, (_, index) => (
        <Solid key={index} args={[3.12, 0.03, 0.075]} position={[-18.6, 0.24 + index * 0.29, -3.44]} color="#273139" metalness={0.52} roughness={0.46} />
      ))}
      <Solid args={[1.15, 0.48, 0.06]} position={[-21.3, 2.48, -3.39]} color="#b4c5c5" emissive="#769397" emissiveIntensity={0.55} roughness={0.35} />
      <Solid args={[0.45, 0.08, 0.12]} position={[-16.2, 2.78, -3.43]} color="#e0d3a5" emissive={palette.warm} emissiveIntensity={0.9} roughness={0.3} />
      <Solid args={[6.6, 3.8, 11.2]} position={[19, 1.9, 2.4]} color="#3c4246" roughness={0.74} />
      {[1.5, 4.5, 7.5].map((z) => (
        <group key={z}>
          <Solid args={[0.08, 0.82, 1.85]} position={[15.66, 2.6, z]} color="#91a6ac" emissive="#5d7981" emissiveIntensity={0.68} roughness={0.36} />
          <Solid args={[0.095, 0.045, 1.92]} position={[15.59, 3.03, z]} color="#b5a37a" metalness={0.42} roughness={0.48} />
        </group>
      ))}
      <Solid args={[3.5, 2.8, 0.07]} position={[18.6, 1.48, -3.25]} color="#78848b" metalness={0.36} roughness={0.54} />
      {Array.from({ length: 9 }, (_, index) => (
        <Solid key={index} args={[3.45, 0.035, 0.078]} position={[18.6, 0.2 + index * 0.3, -3.31]} color="#303b43" metalness={0.5} roughness={0.5} />
      ))}
      <Solid args={[1.5, 0.5, 0.06]} position={[22, 2.63, -3.25]} color="#abc3c4" emissive="#789a9d" emissiveIntensity={0.6} roughness={0.36} />
      <Solid args={[0.45, 0.08, 0.12]} position={[16.4, 3.05, -3.28]} color="#e0d3a5" emissive={palette.warm} emissiveIntensity={0.9} roughness={0.3} />
      <Solid args={[6.9, 0.16, 11.6]} position={[19, 3.88, 2.4]} color="#262d32" metalness={0.22} roughness={0.62} />
    </group>
  )
}

function ApproachTicks() {
  return (
    <group>
      {Array.from({ length: 11 }, (_, index) => {
        const major = index % 2 === 0
        return (
          <mesh key={index} position={[-4.35, 0.03, -1.15 - index * 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[major ? 0.42 : 0.24, 0.025]} />
            <meshStandardMaterial color={palette.brass} emissive={palette.brassDeep} emissiveIntensity={0.25} roughness={0.4} metalness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

function Building() {
  const pierW = 7 - doorHalf
  const pierX = doorHalf + pierW / 2
  const lintelH = height - doorH
  return (
    <group>
      <Solid args={[15.1, 0.32, 35.3]} position={[0, -0.1, 16.7]} color={palette.plinth} roughness={0.9} metalness={0.08} />
      <Solid args={[pierW, height, wall]} position={[-pierX, height / 2, wall / 2]} color={palette.cladding} castShadow />
      <Solid args={[pierW, height, wall]} position={[pierX, height / 2, wall / 2]} color={palette.cladding} castShadow />
      <Solid
        args={[doorHalf * 2, lintelH, wall]}
        position={[0, doorH + lintelH / 2, wall / 2]}
        color={palette.cladding}
        castShadow
      />
      <Solid args={[wall, height, depth]} position={[-7 + wall / 2, height / 2, depth / 2]} color={palette.cladding} castShadow />
      <Solid args={[wall, height, depth]} position={[7 - wall / 2, height / 2, depth / 2]} color={palette.claddingDeep} castShadow />
      <Solid args={[14, height, wall]} position={[0, height / 2, depth - wall / 2]} color={palette.claddingDeep} />
      <Solid args={[15.05, 0.28, 35.6]} position={[0, height + 0.08, 16.65]} color={palette.roof} metalness={0.48} roughness={0.46} castShadow />
      <Solid args={[15.05, 0.045, 0.08]} position={[0, height - 0.02, -0.98]} color={palette.brass} metalness={0.82} roughness={0.28} />
      <Solid args={[4.35, 0.05, 0.05]} position={[-4.75, doorH + 0.08, -0.03]} color={palette.brass} metalness={0.8} roughness={0.3} />
      <Solid args={[4.35, 0.05, 0.05]} position={[4.75, doorH + 0.08, -0.03]} color={palette.brass} metalness={0.8} roughness={0.3} />
      <Solid args={[0.055, 0.055, depth]} position={[-7.05, doorH + 0.04, depth / 2]} color={palette.brass} metalness={0.8} roughness={0.3} />
      <Solid args={[5.3, 0.07, 1.35]} position={[0, doorH + 0.12, -0.62]} color={palette.claddingDeep} metalness={0.5} roughness={0.4} />
      <Solid args={[5.15, 0.42, 0.46]} position={[0, doorH + 0.28, -0.08]} color="#1a1e23" metalness={0.4} roughness={0.5} />
      <PierJoints />
      <SideRibs />
      <Clerestory />
      <SideWindows />
    </group>
  )
}

function PierJoints() {
  const xs = [-6.2, -5.15, -4.1, 4.1, 5.15, 6.2]
  return (
    <group>
      {xs.map((x) => (
        <Solid key={x} args={[0.045, height - 0.4, 0.03]} position={[x, height / 2, -0.01]} color={palette.joint} roughness={0.7} metalness={0.2} />
      ))}
    </group>
  )
}

function SideRibs() {
  return (
    <group>
      {Array.from({ length: 16 }, (_, index) => {
        const z = 1.1 + index * 2.05
        return (
          <Solid
            key={z}
            args={[0.07, 5.5, 0.1]}
            position={[-7.05, 2.9, z]}
            color={palette.claddingDeep}
            metalness={0.45}
            roughness={0.5}
          />
        )
      })}
    </group>
  )
}

function Clerestory() {
  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => {
        const x = -2.05 + index * 0.82
        return (
          <Solid
            key={x}
            args={[0.62, 0.32, 0.04]}
            position={[x, 5.95, -0.02]}
            color="#ffd7ae"
            emissive={palette.warm}
            emissiveIntensity={0.85}
            roughness={0.2}
            metalness={0.05}
          />
        )
      })}
    </group>
  )
}

function SideWindows() {
  return (
    <group>
      {Array.from({ length: 7 }, (_, index) => {
        const z = 2.4 + index * 4.4
        return (
          <Solid
            key={z}
            args={[0.04, 1.15, 1.5]}
            position={[-7.04, 3.55, z]}
            color="#102026"
            emissive={palette.warm}
            emissiveIntensity={0.18}
            roughness={0.12}
            metalness={0.2}
          />
        )
      })}
    </group>
  )
}

function FacadeSign() {
  const map = useSignTexture()
  if (!map) return null
  return (
    <mesh position={[0, 4.72, -0.045]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[4.6, 1.22]} />
      <meshStandardMaterial map={map} roughness={0.55} metalness={0.22} />
    </mesh>
  )
}

function useSignTexture() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 280
    const context = canvas.getContext('2d')
    if (!context) return null
    context.fillStyle = '#171b1f'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#d4b06a'
    context.lineWidth = 8
    context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
    context.fillStyle = '#d4b06a'
    context.fillRect(16, 16, canvas.width - 32, 8)
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = '#f3efe6'
    context.font = '700 112px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
    context.fillText('精睿精密', 512, 118)
    context.fillStyle = '#d4b06a'
    context.font = '500 36px Outfit, "Segoe UI", sans-serif'
    context.fillText('FINEFORM  ·  台中示意', 512, 198)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [])

  useEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => {
      if (!alive || !map) return
      const image = map.image as HTMLCanvasElement
      const context = image.getContext('2d')
      if (!context) return
      context.clearRect(0, 0, image.width, image.height)
      context.fillStyle = '#171b1f'
      context.fillRect(0, 0, image.width, image.height)
      context.strokeStyle = '#d4b06a'
      context.lineWidth = 8
      context.strokeRect(16, 16, image.width - 32, image.height - 32)
      context.fillStyle = '#d4b06a'
      context.fillRect(16, 16, image.width - 32, 8)
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = '#f3efe6'
      context.font = '700 112px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
      context.fillText('精睿精密', 512, 118)
      context.fillStyle = '#d4b06a'
      context.font = '500 36px Outfit, "Segoe UI", sans-serif'
      context.fillText('FINEFORM  ·  台中示意', 512, 198)
      map.needsUpdate = true
    })
    return () => {
      alive = false
    }
  }, [map])

  useEffect(() => () => map?.dispose(), [map])
  return map
}

function Interior() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 17.15]} receiveShadow>
        <planeGeometry args={[13.4, 33.2]} />
        <meshStandardMaterial color={palette.floorIn} roughness={0.86} metalness={0.06} />
      </mesh>
      <Solid args={[0.018, 0.004, 29]} position={[0, 0.052, 17.2]} color="#8d7344" metalness={0.25} roughness={0.62} />
      {Array.from({ length: 14 }, (_, index) => (
        <Solid
          key={index}
          args={[index % 4 === 0 ? 0.16 : 0.08, 0.004, 0.012]}
          position={[0.12, 0.054, 2.4 + index * 2]}
          color="#8d7344"
          metalness={0.2}
          roughness={0.6}
        />
      ))}
      {Array.from({ length: 8 }, (_, index) => (
        <Solid key={index} args={[13.2, 0.14, 0.12]} position={[0, 6.12, 2.4 + index * 4]} color={palette.roof} metalness={0.4} roughness={0.5} />
      ))}
      <Solid args={[0.18, 0.1, 30]} position={[-2.4, 5.85, 17]} color="#2a3036" metalness={0.5} roughness={0.45} />
      {[9.4, 18.8, 31.2].map((z) => (
        <Solid
          key={z}
          args={[1.5, 0.07, 0.38]}
          position={[1.6, 5.78, z]}
          color="#3a2a18"
          emissive={palette.warm}
          emissiveIntensity={1.35}
          roughness={0.3}
        />
      ))}
      <Solid args={[1.2, 0.07, 0.42]} position={[1.3, 5.78, 25.5]} color="#d5e2ef" emissive={palette.cool} emissiveIntensity={1.15} roughness={0.25} />
      {[5.2, 13.2, 22.4, 29.2].map((z) => (
        <group key={z}>
          <Cylinder args={[0.14, 0.16, 5.7]} position={[-5.35, 2.85, z]} color={palette.claddingDeep} metalness={0.45} roughness={0.48} />
          <Cylinder args={[0.2, 0.2, 0.08]} position={[-5.35, 0.08, z]} color={palette.brass} metalness={0.75} roughness={0.35} />
          <Cylinder args={[0.14, 0.16, 5.7]} position={[5.35, 2.85, z]} color={palette.claddingDeep} metalness={0.45} roughness={0.48} />
          <Cylinder args={[0.2, 0.2, 0.08]} position={[5.35, 0.08, z]} color={palette.brass} metalness={0.75} roughness={0.35} />
        </group>
      ))}
    </group>
  )
}
