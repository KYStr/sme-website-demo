import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

type BatchEntry = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  size: THREE.Vector3
  matrix: THREE.Matrix4
  shape: 'box' | 'cylinder'
  cylinder?: [number, number, number, number, boolean, number, number]
}

// The walls and fixtures do not move. Draw matching finishes and primitive
// shapes as instances instead of issuing one GPU draw call per small part.
export function useStaticGeometryBatches() {
  const rootRef = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('no-batch')) return
    const root = rootRef.current
    if (!root) return
    root.updateWorldMatrix(true, true)
    const inverseRoot = root.matrixWorld.clone().invert()
    const groups = new Map<string, BatchEntry[]>()

    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      for (let parent = object.parent; parent && parent !== root; parent = parent.parent) {
        if (parent.userData.dynamic) return
      }
      if (!(object.material instanceof THREE.MeshStandardMaterial)) return
      const material = object.material
      // Transparent panes need independent depth sorting while the camera moves.
      if (material.transparent || material.map || material.alphaMap || material.normalMap) return
      let shape: BatchEntry['shape']
      let size: THREE.Vector3
      let shapeKey: string
      let cylinder: BatchEntry['cylinder']
      if (object.geometry instanceof THREE.BoxGeometry) {
        const box = object.geometry.parameters
        shape = 'box'
        shapeKey = 'box'
        size = new THREE.Vector3(box.width, box.height, box.depth)
      } else if (object.geometry instanceof THREE.CylinderGeometry) {
        const part = object.geometry.parameters
        const radius = Math.max(part.radiusTop, part.radiusBottom)
        if (radius <= 0) return
        cylinder = [part.radiusTop / radius, part.radiusBottom / radius, part.radialSegments, part.heightSegments, part.openEnded, part.thetaStart, part.thetaLength]
        shape = 'cylinder'
        shapeKey = `cylinder|${cylinder.join('|')}`
        size = new THREE.Vector3(radius, part.height, radius)
      } else return
      const matrix = inverseRoot.clone().multiply(object.matrixWorld)
      const z = object.getWorldPosition(new THREE.Vector3()).z
      const region = z < 0 ? 0 : z < 7 ? 1 : z < 16 ? 2 : z < 22 ? 3 : z < 29 ? 4 : 5
      const finish = [
        region,
        shapeKey,
        material.color.getHexString(),
        material.emissive.getHexString(),
        material.roughness,
        material.metalness,
        material.emissiveIntensity,
        material.opacity,
        material.transparent,
        object.castShadow,
        object.receiveShadow,
      ].join('|')
      const entries = groups.get(finish) ?? []
      entries.push({ mesh: object, size, matrix, shape, cylinder })
      groups.set(finish, entries)
    })

    const instances: THREE.InstancedMesh[] = []
    for (const entries of groups.values()) {
      if (entries.length < 2) continue
      const first = entries[0]!
      const geometry = first.shape === 'box'
        ? new THREE.BoxGeometry(1, 1, 1)
        : new THREE.CylinderGeometry(first.cylinder![0], first.cylinder![1], 1, first.cylinder![2], first.cylinder![3], first.cylinder![4], first.cylinder![5], first.cylinder![6])
      const batch = new THREE.InstancedMesh(geometry, first.mesh.material, entries.length)
      batch.castShadow = first.mesh.castShadow
      batch.receiveShadow = first.mesh.receiveShadow
      batch.instanceMatrix.setUsage(THREE.StaticDrawUsage)
      entries.forEach(({ mesh, size, matrix }, index) => {
        batch.setMatrixAt(index, matrix.multiply(new THREE.Matrix4().makeScale(size.x, size.y, size.z)))
        mesh.visible = false
      })
      batch.instanceMatrix.needsUpdate = true
      batch.computeBoundingSphere()
      root.add(batch)
      instances.push(batch)
    }

    return () => {
      instances.forEach((batch) => {
        root.remove(batch)
        batch.geometry.dispose()
      })
      groups.forEach((entries) => entries.forEach(({ mesh }) => { mesh.visible = true }))
    }
  }, [])

  return rootRef
}
