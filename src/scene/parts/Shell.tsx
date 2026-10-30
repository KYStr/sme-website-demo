import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from '../palette.ts'
import { Cylinder, Solid } from '../solids.tsx'

const height = 6.4
const depth = 34
const wall = 0.24
const doorHalf = 2.4
const doorH = 3.55

export function Shell() {
  return (
    <group>
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
      <GroundGrid />
      <ApproachTicks />
      <Cylinder args={[0.12, 0.14, 0.85]} position={[-3.7, 0.42, -2.55]} color={palette.claddingDeep} />
      <Cylinder args={[0.14, 0.14, 0.06]} position={[-3.7, 0.88, -2.55]} color={palette.brass} metalness={0.8} roughness={0.32} />
      <Cylinder args={[0.12, 0.14, 0.85]} position={[3.7, 0.42, -2.55]} color={palette.claddingDeep} />
      <Cylinder args={[0.14, 0.14, 0.06]} position={[3.7, 0.88, -2.55]} color={palette.brass} metalness={0.8} roughness={0.32} />
    </group>
  )
}

function GroundGrid() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color('#9ec3d2') } },
        vertexShader: `
          varying vec3 vW;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vW = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: `
          varying vec3 vW;
          uniform vec3 uColor;
          void main() {
            if (vW.z > 0.15 && abs(vW.x) < 7.35) discard;
            vec2 cell = abs(fract(vW.xz) - 0.5);
            float minor = min(cell.x, cell.y);
            vec2 majorCell = abs(fract(vW.xz / 5.0) - 0.5);
            float major = min(majorCell.x, majorCell.y);
            float alpha = smoothstep(0.04, 0.0, minor) * 0.34;
            alpha += smoothstep(0.018, 0.0, major) * 0.4;
            float fade = 1.0 - smoothstep(6.0, 30.0, length(vW.xz));
            if (alpha * fade < 0.03) discard;
            gl_FragColor = vec4(uColor, alpha * fade);
          }
        `,
      }),
    [],
  )

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -4]}>
      <planeGeometry args={[64, 36]} />
      <primitive object={material} attach="material" />
    </mesh>
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
      <Solid args={[14.5, 0.055, 0.06]} position={[0, doorH + 0.04, -0.04]} color={palette.brass} metalness={0.8} roughness={0.3} />
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
        <meshStandardMaterial color={palette.floorIn} roughness={0.72} metalness={0.18} />
      </mesh>
      <Solid args={[0.08, 0.012, 30.5]} position={[0, 0.055, 17.4]} color={palette.brass} metalness={0.75} roughness={0.35} emissive={palette.brassDeep} emissiveIntensity={0.15} />
      {Array.from({ length: 15 }, (_, index) => (
        <Solid
          key={index}
          args={[index % 5 === 0 ? 0.28 : 0.16, 0.008, 0.02]}
          position={[0.2, 0.058, 2.2 + index * 2]}
          color={palette.brass}
          metalness={0.7}
          roughness={0.4}
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
      {[8.2, 16.4, 24.2].map((z) => (
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
