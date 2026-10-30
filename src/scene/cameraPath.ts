import * as THREE from 'three'
import { clamp01 } from '../lib/smoothstep.ts'

const cameraKeys: Array<[number, number, number]> = [
  [-5.6, 3.2, -17.4],
  [-2.15, 2.2, -7.4],
  [0.05, 1.82, -2.35],
  [0.35, 1.78, 4.9],
  [-0.35, 1.95, 4.55],
  [-0.7, 1.74, 15.15],
  [-0.2, 1.9, 19.6],
  [-1.15, 2.08, 20.35],
  [-1.45, 2.12, 26.35],
]

const lookKeys: Array<[number, number, number]> = [
  [1.1, 2.95, 0.4],
  [0.4, 2.2, 2.2],
  [1.1, 1.55, 8.2],
  [2.7, 1.35, 9.2],
  [2.7, 1.4, 9.35],
  [2.35, 1.32, 18.9],
  [1.5, 1.05, 25.55],
  [1.45, 0.9, 25.6],
  [0.95, 0.72, 31.15],
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
