import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { smoothstep } from '../lib/smoothstep.ts'
import { cameraLook, cameraPosition, mobileCameraLook, mobileCameraPosition, progressToCurveT } from './cameraPath.ts'
import { Cmm } from './parts/Cmm.tsx'
import { CncMachine } from './parts/CncMachine.tsx'
import { DisplayRack } from './parts/DisplayRack.tsx'
import { DispatchDoor } from './parts/DispatchDoor.tsx'
import { Dressing } from './parts/Dressing.tsx'
import { FactoryLayout } from './parts/FactoryLayout.tsx'
import { RollUpDoor } from './parts/RollUpDoor.tsx'
import { Shell } from './parts/Shell.tsx'
import { Shipping } from './parts/Shipping.tsx'

type SceneProps = {
  progressRef: RefObject<number>
  compact: boolean
}

export function FactoryScene({ progressRef, compact }: SceneProps) {
  const visualProgressRef = useRef(0)
  const primed = useRef(false)
  const journeyRef = useRef<HTMLElement | null>(null)
  const lastSceneTick = useRef(-1)
  const lastDoorTick = useRef(-1)
  const lastScrollTarget = useRef(0)
  const renderCount = useRef(0)
  const profile = import.meta.env.DEV && new URLSearchParams(window.location.search).has('profile')
  useFrame(({ gl, invalidate }, delta) => {
    if (!primed.current) {
      visualProgressRef.current = progressRef.current
      primed.current = true
    } else {
      // A late frame must not jump the camera and shutter through the opening.
      const crossingEntrance = Math.min(progressRef.current, visualProgressRef.current) < 0.2
      const step = Math.abs(progressRef.current - lastScrollTarget.current) > 0.01
        ? Math.min(delta, 1 / 30)
        : Math.min(delta, crossingEntrance ? 0.1 : 0.35)
      visualProgressRef.current = THREE.MathUtils.damp(visualProgressRef.current, progressRef.current, 2.6, step)
      if (Math.abs(visualProgressRef.current - progressRef.current) < 0.0005) visualProgressRef.current = progressRef.current
    }
    lastScrollTarget.current = progressRef.current
    // Expose the actual rendered progress for visual regression checks.
    const journey = journeyRef.current ?? document.querySelector<HTMLElement>('[data-testid="journey"]')
    journeyRef.current = journey
    if (journey) {
      const sceneTick = Math.round(visualProgressRef.current * 1000)
      const doorTick = Math.round(smoothstep(0.035, 0.19, visualProgressRef.current) * 1000)
      if (sceneTick !== lastSceneTick.current) {
        journey.dataset.sceneProgress = (sceneTick / 1000).toFixed(3)
        lastSceneTick.current = sceneTick
      }
      if (doorTick !== lastDoorTick.current) {
        journey.dataset.doorOpen = (doorTick / 1000).toFixed(3)
        lastDoorTick.current = doorTick
      }
      if (profile) {
        journey.dataset.drawCalls = String(gl.info.render.calls)
        journey.dataset.renderCount = String(++renderCount.current)
      }
    }
    const active = Math.round(progressRef.current * 5)
    if (visualProgressRef.current !== progressRef.current || active === 2 || active === 4) invalidate()
  })
  return (
    <>
      <EnvironmentRig />
      <Sky progressRef={visualProgressRef} />
      <CameraRig progressRef={visualProgressRef} compact={compact} />
      <Lighting progressRef={visualProgressRef} compact={compact} />
      <Shell />
      <FactoryLayout />
      <DispatchDoor progressRef={visualProgressRef} z={22.32} openFrom={0.62} openUntil={0.79} />
      <DispatchDoor progressRef={visualProgressRef} z={28.72} openFrom={0.81} openUntil={0.96} />
      <RollUpDoor progressRef={visualProgressRef} />
      <CncMachine position={[3.15, 0, 9.45]} variant="mill" />
      <CncMachine position={[-3.25, 0, 12.55]} variant="lathe" rotation={[0, 0.4, 0]} />
      <DisplayRack position={[-3.15, 0, 18.85]} rotation={[0, -Math.PI / 2, 0]} />
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
          resolution={256}
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
    scene.environmentIntensity = 0.68
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

function CameraRig({ progressRef, compact }: SceneProps) {
  const primed = useRef(false)
  const lastTarget = useRef(Number.NaN)
  const lookCurrent = useMemo(() => new THREE.Vector3(), [])
  const position = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, invalidate }, delta) => {
    const target = progressToCurveT(progressRef.current)
    if (target === lastTarget.current && lookCurrent.distanceToSquared(look) < 0.00000001) return
    lastTarget.current = target
    if (!primed.current) {
      ;(compact ? mobileCameraPosition : cameraPosition).getPoint(target, position)
      ;(compact ? mobileCameraLook : cameraLook).getPoint(target, look)
      lookCurrent.copy(look)
      camera.position.copy(position)
      camera.lookAt(lookCurrent)
      primed.current = true
      return
    }
    ;(compact ? mobileCameraPosition : cameraPosition).getPoint(target, position)
    ;(compact ? mobileCameraLook : cameraLook).getPoint(target, look)
    camera.position.copy(position)
    lookCurrent.lerp(look, 1 - Math.exp(-Math.min(delta, 0.1) * 6))
    camera.lookAt(lookCurrent)
    if (lookCurrent.distanceToSquared(look) >= 0.00000001) invalidate()
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
  const sunIn = useRef(new THREE.Color('#9aafc2'))
  const sunOut = useRef(new THREE.Color('#ffd2a8'))
  const hemiIn = useRef(new THREE.Color('#b7c2cc'))
  const hemiOut = useRef(new THREE.Color('#c5d4e2'))
  const groundIn = useRef(new THREE.Color('#626a70'))
  const groundOut = useRef(new THREE.Color('#6e5b46'))
  const fogIn = useRef(new THREE.Color('#3b434a'))
  const fogOut = useRef(new THREE.Color('#e3d3bc'))
  const lastProgress = useRef(Number.NaN)
  const { scene, gl } = useThree()

  useFrame(() => {
    const progress = progressRef.current
    if (progress === lastProgress.current) return
    lastProgress.current = progress
    const inside = smoothstep(0.1, 0.42, progress)
    const depth = smoothstep(0.05, 0.32, progress)
    const open = smoothstep(0.04, 0.2, progress)
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.35, 0.88, inside)
      sun.current.color.copy(sunOut.current).lerp(sunIn.current, inside)
    }
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(0.58, 0.92, inside)
      hemi.current.color.copy(hemiOut.current).lerp(hemiIn.current, inside)
      hemi.current.groundColor.copy(groundOut.current).lerp(groundIn.current, inside)
    }
    if (door.current) door.current.intensity = open * THREE.MathUtils.lerp(9, 3.2, inside)
    if (cnc.current) cnc.current.intensity = 5 + smoothstep(0.1, 0.34, progress) * (compact ? 5 : 8)
    if (rack.current) rack.current.intensity = smoothstep(0.38, 0.58, progress) * (compact ? 9 : 18)
    if (cmm.current) cmm.current.intensity = 2 + smoothstep(0.55, 0.78, progress) * (compact ? 15 : 12)
    if (ship.current) ship.current.intensity = 2 + smoothstep(0.72, 0.92, progress) * (compact ? 14 : 10)
    const fog = scene.fog
    if (fog instanceof THREE.Fog) {
      fog.color.copy(fogOut.current).lerp(fogIn.current, depth)
      fog.near = THREE.MathUtils.lerp(28, 11, depth)
      fog.far = THREE.MathUtils.lerp(76, 34, depth)
    }
    gl.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.28, inside)
  })

  return (
    <>
      <fog attach="fog" args={['#e3d3bc', 28, 84]} />
      <ambientLight color="#c7d3dc" intensity={0.34} />
      <hemisphereLight ref={hemi} args={['#c5d4e2', '#6e5b46', 0.62]} />
      <directionalLight
        ref={sun}
        position={[14, 18, -10]}
        intensity={2.65}
        color="#ffd2a8"
        castShadow={!compact}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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
      <spotLight
        ref={rack}
        position={[-0.4, 4.5, 17.2]}
        angle={0.7}
        penumbra={0.7}
        distance={14}
        decay={2}
        color="#ffd6a0"
        intensity={0}
      >
        <object3D attach="target" position={[-2.1, -3.2, 1.6]} />
      </spotLight>
      <pointLight ref={cmm} position={[0.2, 3.3, 24.2]} color="#dceeff" distance={12} decay={2} intensity={0} />
      <pointLight ref={ship} position={[0.6, 3.1, 30.2]} color="#ffd0a0" distance={12} decay={2} intensity={0} />
    </>
  )
}

function Sky({ progressRef }: { progressRef: RefObject<number> }) {
  const lastProgress = useRef(Number.NaN)
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
    if (progressRef.current === lastProgress.current) return
    lastProgress.current = progressRef.current
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
