import * as THREE from 'three'
import { clamp01 } from '../lib/smoothstep.ts'

const cameraKeys: Array<[number, number, number]> = [
  [-5.6, 3.2, -17.4],
  [-2.15, 2.2, -7.4],
  [0.05, 1.82, -2.35],
  [0.35, 1.78, 4.9],
  [-0.35, 1.95, 4.55],
  [0.8, 1.78, 16.0],
  [0.2, 1.9, 19.6],
  [-0.9, 1.98, 21.75],
  [-0.7, 2.08, 26.2],
]

const lookKeys: Array<[number, number, number]> = [
  [1.1, 2.95, 0.4],
  [0.4, 2.2, 2.2],
  [1.1, 1.55, 8.2],
  [2.7, 1.35, 9.2],
  [2.7, 1.4, 9.35],
  [-1.5, 1.25, 18.9],
  [0.2, 1.35, 25.55],
  [1.45, 1.55, 25.6],
  [-0.2, 0.55, 31.7],
]

function makeCurve(keys: Array<[number, number, number]>) {
  return new THREE.CatmullRomCurve3(
    keys.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'centripetal',
    0.2,
  )
}

export const cameraPosition = makeCurve(cameraKeys)
export const cameraLook = makeCurve(lookKeys)

// The narrow viewport needs a straighter view into each object. The walk
// remains inside the clear centre aisle while the gaze alternates sides.
const mobileCameraKeys = cameraKeys.map((key) => [...key] as [number, number, number])
mobileCameraKeys[5] = [0.35, 1.76, 16.15]
mobileCameraKeys[7] = [-0.9, 1.94, 20.9]
mobileCameraKeys[8] = [-0.7, 1.92, 26.2]
const mobileLookKeys = lookKeys.map((key) => [...key] as [number, number, number])
mobileLookKeys[5] = [-2.65, 0.95, 18.85]
mobileLookKeys[7] = [1.5, 1.55, 25.55]
mobileLookKeys[8] = [-0.5, 0.32, 30.8]

export const mobileCameraPosition = makeCurve(mobileCameraKeys)
export const mobileCameraLook = makeCurve(mobileLookKeys)

const stationPointIndex = [0, 2, 4, 5, 7, 8]
const lastIndex = cameraKeys.length - 1
export const stationCurveT = stationPointIndex.map((index) => index / lastIndex)

export function progressToCurveT(progress: number) {
  const spans = stationCurveT.length - 1
  const x = clamp01(progress) * spans
  const i = Math.min(spans - 1, Math.floor(x >= spans ? spans - 1 : x))
  const f = x >= spans ? 1 : x - i
  const from = stationCurveT[i] ?? 0
  const to = stationCurveT[i + 1] ?? 1
  return from + (to - from) * f
}
