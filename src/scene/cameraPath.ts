import * as THREE from 'three'
import { clamp01 } from '../lib/smoothstep.ts'

const cameraKeys: Array<[number, number, number]> = [
  [-5.6, 3.2, -17.4],
  [-2.15, 2.2, -7.4],
  [-0.15, 1.84, -1.45],
  [0.4, 1.74, 4.7],
  [0.7, 1.7, 6.85],
  [-0.25, 1.68, 15.7],
  [0.1, 1.72, 20.8],
  [-0.5, 1.8, 22.7],
  [0.2, 1.62, 28.15],
]

const lookKeys: Array<[number, number, number]> = [
  [1.1, 2.95, 0.4],
  [0.45, 2.25, 2.4],
  [0.85, 1.72, 9.2],
  [2.7, 1.38, 9.5],
  [3.2, 1.28, 9.55],
  [2.65, 1.38, 18.85],
  [1.7, 1.22, 25.5],
  [1.5, 1.16, 25.65],
  [1.2, 0.92, 31.5],
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
