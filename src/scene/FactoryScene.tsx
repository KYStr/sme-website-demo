import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { smoothstep } from '../lib/smoothstep.ts'
import { cameraLook, cameraPosition, progressToCurveT } from './cameraPath.ts'
import { Cmm } from './parts/Cmm.tsx'
import { CncMachine } from './parts/CncMachine.tsx'
import { DisplayRack } from './parts/DisplayRack.tsx'
import { Dressing } from './parts/Dressing.tsx'
import { RollUpDoor } from './parts/RollUpDoor.tsx'
import { Shell } from './parts/Shell.tsx'
import { Shipping } from './parts/Shipping.tsx'

type SceneProps = {
  progressRef: RefObject<number>
  compact: boolean
}

export function FactoryScene({ progressRef, compact }: SceneProps) {
  return (
    <>
      <EnvironmentRig />
      <Sky progressRef={progressRef} />
      <CameraRig progressRef={progressRef} />
      <Lighting progressRef={progressRef} compact={compact} />
      <Shell />
      <RollUpDoor progressRef={progressRef} />
      <CncMachine position={[3.15, 0, 9.45]} variant="mill" />
      <CncMachine position={[-3.25, 0, 12.55]} variant="lathe" rotation={[0, 0.4, 0]} />
      <DisplayRack position={[2.55, 0, 18.85]} />
      <Cmm position={[1.45, 0, 25.55]} />
      <Shipping />
      <Dressing />
      {compact ? null : (
        <ContactShadows
          position={[0, 0.02, 8]}
          opacity={0.28}
          scale={40}
          blur={2.2}
          far={8}
          frames={1}
          resolution={512}
          color="#07080a"
        />
      )}
    </>
  )
}

function EnvironmentRig() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    scene.environment = target.texture
    scene.environmentIntensity = 0.46
    return () => {
      room.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      target.texture.dispose()
      pmrem.dispose()
      if (scene.environment === target.texture) scene.environment = null
    }
  }, [gl, scene])

  return null
}

function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const damped = useRef(0)
  const primed = useRef(false)
  const lookCurrent = useMemo(() => new THREE.Vector3(), [])
  const position = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }, delta) => {
    const target = progressToCurveT(progressRef.current)
    if (!primed.current) {
      damped.current = target
      cameraPosition.getPoint(target, position)
      cameraLook.getPoint(target, look)
      lookCurrent.copy(look)
      camera.position.copy(position)
      camera.lookAt(lookCurrent)
      primed.current = true
      return
    }
    damped.current = THREE.MathUtils.damp(damped.current, target, 3.4, delta)
    cameraPosition.getPoint(damped.current, position)
    cameraLook.getPoint(damped.current, look)
    camera.position.copy(position)
    lookCurrent.lerp(look, 1 - Math.exp(-delta * 6))
    camera.lookAt(lookCurrent)
  })

  return null
}

function Lighting({ progressRef, compact }: SceneProps) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const door = useRef<THREE.PointLight>(null)
  const cnc = useRef<THREE.PointLight>(null)
  const rack = useRef<THREE.SpotLight>(null)
  const cmm = useRef<THREE.PointLight>(null)
  const ship = useRef<THREE.PointLight>(null)
  const { scene, gl } = useThree()

  useFrame(() => {
    const progress = progressRef.current
    const inside = smoothstep(0.12, 0.48, progress)
    const open = smoothstep(0.04, 0.2, progress)
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.65, 0.28, inside)
      sun.current.color.set('#ffd2a8').lerp(new THREE.Color('#9aafc2'), inside)
    }
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(0.62, 0.22, inside)
      hemi.current.color.set('#c5d4e2').lerp(new THREE.Color('#66717c'), inside)
      hemi.current.groundColor.set('#6e5b46').lerp(new THREE.Color('#241c16'), inside)
    }
    if (door.current) door.current.intensity = open * THREE.MathUtils.lerp(7.5, 1.4, inside)
    if (cnc.current) cnc.current.intensity = smoothstep(0.18, 0.4, progress) * (compact ? 4.5 : 7.5)
    if (rack.current) rack.current.intensity = smoothstep(0.4, 0.62, progress) * 14
    if (cmm.current) cmm.current.intensity = smoothstep(0.62, 0.82, progress) * 6.5
    if (ship.current) ship.current.intensity = smoothstep(0.78, 0.96, progress) * 6
    const fog = scene.fog
    if (fog instanceof THREE.Fog) {
      fog.color.set('#e3d3bc').lerp(new THREE.Color('#121518'), inside)
      fog.near = THREE.MathUtils.lerp(28, 7, inside)
      fog.far = THREE.MathUtils.lerp(84, 36, inside)
    }
    gl.toneMappingExposure = THREE.MathUtils.lerp(1.06, 1.18, inside)
  })

  return (
    <>
      <fog attach="fog" args={['#e3d3bc', 28, 84]} />
      <hemisphereLight ref={hemi} args={['#c5d4e2', '#6e5b46', 0.62]} />
      <directionalLight
        ref={sun}
        position={[14, 18, -10]}
        intensity={2.65}
        color="#ffd2a8"
        castShadow={!compact}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={2}
        shadow-camera-far={70}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={18}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0004}
      >
        <object3D attach="target" position={[-14, -16, 24]} />
      </directionalLight>
      <pointLight ref={door} position={[0, 2.2, 1.4]} color="#ffb15e" distance={16} decay={2} intensity={0} />
      <pointLight ref={cnc} position={[2.4, 3.5, 8.6]} color="#ffc48a" distance={11} decay={2} intensity={0} />
      {compact ? null : (
        <>
          <spotLight
            ref={rack}
            position={[0.4, 4.5, 17.2]}
            angle={0.55}
            penumbra={0.65}
            distance={12}
            decay={2}
            color="#ffc48a"
            intensity={0}
          >
            <object3D attach="target" position={[2.1, -3.2, 1.6]} />
          </spotLight>
          <pointLight ref={cmm} position={[0.2, 3.3, 24.2]} color="#d5e7ff" distance={9} decay={2} intensity={0} />
          <pointLight ref={ship} position={[0.6, 3.1, 30.2]} color="#ffbf80" distance={9} decay={2} intensity={0} />
        </>
      )}
    </>
  )
}

function Sky({ progressRef }: { progressRef: RefObject<number> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new THREE.Color('#8ea8ba') },
          uBottom: { value: new THREE.Color('#ead8c0') },
          uMix: { value: 0 },
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uMix;
          void main() {
            float h = clamp(normalize(vPos).y * 0.55 + 0.32, 0.0, 1.0);
            vec3 day = mix(uBottom, uTop, smoothstep(0.05, 0.85, h));
            vec3 indoors = vec3(0.07, 0.075, 0.085);
            gl_FragColor = vec4(mix(day, indoors, uMix), 1.0);
          }
        `,
      }),
    [],
  )

  useFrame(() => {
    const uniform = material.uniforms.uMix
    if (uniform) uniform.value = smoothstep(0.16, 0.5, progressRef.current)
  })

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh scale={80}>
      <sphereGeometry args={[1, 32, 18]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
