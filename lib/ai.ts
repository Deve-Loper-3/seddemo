import { findSample } from "./images"
import type { AIPrediction, IschemicSubtype, ModelName, Sequence } from "./types"

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Rng = () => number

export const pick = <T,>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]
export const between = (rng: Rng, min: number, max: number) => min + rng() * (max - min)
export const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d

const SUBTYPES: IschemicSubtype[] = ["Large vessel occlusion", "Cardioembolic", "Lacunar (small vessel)", "Watershed"]

export const ACTIVE_MODEL_VERSION = "StrokeNet v2.3 (ensemble)"

/**
 * Simulated inference. For bundled sample images the "truth" is known, so the model is
 * right most of the time (with a small, deliberate error rate so metrics look realistic).
 * For user-uploaded images, the result is random but plausible.
 */
export function simulatePrediction(opts: {
  image: string
  sequence: Sequence
  rng?: Rng
  at?: string
  modelVersion?: string
}): AIPrediction {
  const rng = opts.rng ?? Math.random
  const sample = findSample(opts.image)
  let truthIschemic: boolean
  if (sample) truthIschemic = sample.finding !== "normal"
  else truthIschemic = rng() < (opts.sequence === "DWI" || opts.sequence === "ADC" ? 0.7 : 0.45)

  const correct = rng() < 0.9
  const predIschemic = correct ? truthIschemic : !truthIschemic
  const confidence = correct ? between(rng, 0.84, 0.99) : between(rng, 0.55, 0.8)

  const lesion =
    predIschemic && sample?.lesion
      ? {
          x: sample.lesion.x + between(rng, -0.015, 0.015),
          y: sample.lesion.y + between(rng, -0.015, 0.015),
          r: sample.lesion.r * between(rng, 0.9, 1.15),
        }
      : predIschemic
        ? { x: between(rng, 0.3, 0.7), y: between(rng, 0.3, 0.65), r: between(rng, 0.06, 0.12) }
        : undefined

  const pIsch = predIschemic ? confidence : 1 - confidence
  const modelProbs = {} as Record<ModelName, number>
  ;(["ResNet50", "EfficientNet-B4", "DenseNet121"] as ModelName[]).forEach((m, i) => {
    const jitter = [0.06, 0.03, 0.05][i]
    modelProbs[m] = round(Math.min(0.995, Math.max(0.01, pIsch + between(rng, -jitter, jitter))), 3)
  })

  return {
    label: predIschemic ? "Ischemic stroke" : "No acute stroke",
    subtype: predIschemic
      ? sample?.src.includes("basal-ganglia")
        ? "Lacunar (small vessel)"
        : pick(rng, SUBTYPES)
      : undefined,
    confidence: round(confidence, 3),
    region: predIschemic ? (sample?.region ?? pick(rng, ["Left MCA territory", "Right MCA territory", "Posterior circulation", "Left corona radiata"])) : "—",
    volumeMl: predIschemic ? round(between(rng, 3, 85), 1) : 0,
    lesion,
    modelProbs,
    segmentationDice: predIschemic
      ? { "U-Net": round(between(rng, 0.68, 0.82), 2), "nnU-Net": round(between(rng, 0.76, 0.9), 2) }
      : { "U-Net": 0, "nnU-Net": 0 },
    modelVersion: opts.modelVersion ?? ACTIVE_MODEL_VERSION,
    createdAt: opts.at ?? new Date().toISOString(),
  }
}
