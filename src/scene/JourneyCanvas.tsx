import { memo, useEffect, useState, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { FactoryScene } from './FactoryScene.tsx'
import styles from './JourneyCanvas.module.css'

type JourneyCanvasProps = {
  progressRef: RefObject<number>
}

function JourneyCanvas({ progressRef }: JourneyCanvasProps) {
  const compact = useCompact()
  return (
    <div className={styles.frame} data-testid="factory-canvas">
      <Canvas
        className={styles.canvas}
        dpr={compact ? [1, 1.5] : [1, 2]}
        shadows={!compact}
        camera={{ fov: 38, near: 0.1, far: 180, position: [-5.6, 3.2, -17.4] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <FactoryScene progressRef={progressRef} compact={compact} />
      </Canvas>
    </div>
  )
}

function useCompact() {
  const query = '(max-width: 760px)'
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setCompact(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return compact
}

export default memo(JourneyCanvas)
