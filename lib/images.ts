import type { Lesion, Sequence } from "./types"

export type SampleImage = {
  src: string
  title: string
  sequence: Sequence
  finding: "ischemic" | "normal" | "angiography"
  region?: string
  lesion?: Lesion // hand-placed over the visible infarct
  credit: string
  source: string
}

// Real, openly licensed images from Wikimedia Commons (see /#credits on the landing page).
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    src: "/images/mri/dwi-aca-infarct.jpg",
    title: "DWI – acute left ACA territory infarct",
    sequence: "DWI",
    finding: "ischemic",
    region: "Left ACA territory (medial frontal)",
    lesion: { x: 0.53, y: 0.37, r: 0.09 },
    credit: "Hellerhoff, Wikimedia Commons (CC BY-SA 4.0)",
    source: "https://commons.wikimedia.org/wiki/File:Unilateraler_Anteriorinfarkt_70M_-_MR_DWI_ADC_TOF_-_001.jpg",
  },
  {
    src: "/images/mri/adc-aca-infarct.jpg",
    title: "ADC map – restricted diffusion, left ACA territory",
    sequence: "ADC",
    finding: "ischemic",
    region: "Left ACA territory (medial frontal)",
    lesion: { x: 0.57, y: 0.37, r: 0.09 },
    credit: "Hellerhoff, Wikimedia Commons (CC BY-SA 4.0)",
    source: "https://commons.wikimedia.org/wiki/File:Unilateraler_Anteriorinfarkt_70M_-_MR_DWI_ADC_TOF_-_001.jpg",
  },
  {
    src: "/images/mri/dwi-mca-infarct.jpg",
    title: "DWI – acute right MCA territory infarct",
    sequence: "DWI",
    finding: "ischemic",
    region: "Right MCA territory (fronto-parietal)",
    lesion: { x: 0.26, y: 0.53, r: 0.13 },
    credit: "Hellerhoff / Mikael Häggström, Wikimedia Commons (CC BY-SA 3.0)",
    source: "https://commons.wikimedia.org/wiki/File:DWI_MRI_of_a_cerebral_infarction.jpg",
  },
  {
    src: "/images/mri/dwi-basal-ganglia-infarct.jpg",
    title: "DWI – infarct ~4 h after onset, left basal ganglia",
    sequence: "DWI",
    finding: "ischemic",
    region: "Left basal ganglia / insula",
    lesion: { x: 0.68, y: 0.36, r: 0.13 },
    credit: "Shen J-M et al., Wikimedia Commons (CC BY 2.0)",
    source: "https://commons.wikimedia.org/wiki/File:Cerebral_infarction_after_4_hours_on_DWI_MRI.jpg",
  },
  {
    src: "/images/mri/mra-tof.jpg",
    title: "TOF-MRA – circle of Willis (ACA branch)",
    sequence: "MRA",
    finding: "angiography",
    region: "Left anterior cerebral artery",
    lesion: { x: 0.5, y: 0.26, r: 0.07 },
    credit: "Hellerhoff, Wikimedia Commons (CC BY-SA 4.0)",
    source: "https://commons.wikimedia.org/wiki/File:Unilateraler_Anteriorinfarkt_70M_-_MR_DWI_ADC_TOF_-_001.jpg",
  },
  {
    src: "/images/mri/t2-normal-axial.jpg",
    title: "T2 axial – normal brain",
    sequence: "T2",
    finding: "normal",
    credit: "Novaksean, Wikimedia Commons (CC BY-SA 4.0)",
    source: "https://commons.wikimedia.org/wiki/File:Normal_axial_T2-weighted_MR_image_of_the_brain.jpg",
  },
  {
    src: "/images/mri/t1-normal-axial.png",
    title: "T1 axial – normal brain",
    sequence: "T1",
    finding: "normal",
    credit: "Mim.cis, Wikimedia Commons (public domain)",
    source: "https://commons.wikimedia.org/wiki/File:T1-weighted-MRI.png",
  },
  {
    src: "/images/mri/t1-sagittal.jpg",
    title: "T1 sagittal – normal brain",
    sequence: "T1",
    finding: "normal",
    credit: "TheBrain, Wikimedia Commons (CC BY-SA 3.0)",
    source: "https://commons.wikimedia.org/wiki/File:MRI_head_side.jpg",
  },
  {
    src: "/images/mri/t1-sagittal-2.jpg",
    title: "T1 sagittal – normal brain (midline)",
    sequence: "T1",
    finding: "normal",
    credit: "Wikimedia Commons (public domain)",
    source: "https://commons.wikimedia.org/wiki/File:MRI_brain.jpg",
  },
]

export const SITE_IMAGES = [
  {
    src: "/images/site/ischemic-stroke-diagram.jpg",
    title: "Ischemic stroke mechanism",
    credit: "National Heart, Lung, and Blood Institute (NIH), public domain",
    source: "https://commons.wikimedia.org/wiki/File:Stroke_ischemic.jpg",
  },
]

export function findSample(src: string) {
  return SAMPLE_IMAGES.find((s) => s.src === src)
}
