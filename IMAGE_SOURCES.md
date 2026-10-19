# Image Sources & Licences

All images bundled in `public/images/` were downloaded from Wikimedia Commons. Author and licence details were checked against each file's description page on 2026-10-19.

The MRI images show real anonymised scans and are used as **demo data only**. Patient names, IDs, AI predictions and clinical values attached to them in the app are fictional.

## MRI images (`public/images/mri/`)

| Local file | Original file | Author | Licence | Changes |
|---|---|---|---|---|
| `dwi-aca-infarct.jpg` | [Unilateraler Anteriorinfarkt 70M - MR DWI ADC TOF - 001.jpg](https://commons.wikimedia.org/wiki/File:Unilateraler_Anteriorinfarkt_70M_-_MR_DWI_ADC_TOF_-_001.jpg) | Hellerhoff | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Cropped to the left (DWI) panel |
| `adc-aca-infarct.jpg` | Same as above | Hellerhoff | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Cropped to the middle (ADC) panel |
| `mra-tof.jpg` | Same as above | Hellerhoff | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Cropped to the right (TOF-MRA) panel |
| `dwi-mca-infarct.jpg` | [DWI MRI of a cerebral infarction.jpg](https://commons.wikimedia.org/wiki/File:DWI_MRI_of_a_cerebral_infarction.jpg) | Hellerhoff; DWI image isolated by Mikael Häggström | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | None |
| `dwi-basal-ganglia-infarct.jpg` | [Cerebral infarction after 4 hours on DWI MRI.jpg](https://commons.wikimedia.org/wiki/File:Cerebral_infarction_after_4_hours_on_DWI_MRI.jpg) | Jian-Min Shen, Xian-Wu Xia, Wu-Gen Kang, Jian-Jun Yuan, Liang Sheng | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | None |
| `t2-normal-axial.jpg` | [Normal axial T2-weighted MR image of the brain.jpg](https://commons.wikimedia.org/wiki/File:Normal_axial_T2-weighted_MR_image_of_the_brain.jpg) | Novaksean | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | None |
| `t1-normal-axial.png` | [T1-weighted-MRI.png](https://commons.wikimedia.org/wiki/File:T1-weighted-MRI.png) | Mim.cis | Public domain (medical imaging) | None |
| `t1-sagittal.jpg` | [MRI head side.jpg](https://commons.wikimedia.org/wiki/File:MRI_head_side.jpg) | TheBrain (en.wikipedia) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) / GFDL 1.2+ | None |
| `t1-sagittal-2.jpg` | [MRI brain.jpg](https://commons.wikimedia.org/wiki/File:MRI_brain.jpg) | Unknown | Public domain (medical imaging) | None |

## Site illustrations (`public/images/site/`)

| Local file | Original file | Author | Licence | Changes |
|---|---|---|---|---|
| `ischemic-stroke-diagram.jpg` | [Stroke ischemic.jpg](https://commons.wikimedia.org/wiki/File:Stroke_ischemic.jpg) | National Heart, Lung, and Blood Institute (NIH) | Public domain (US federal government work) | None |

## Obligations

- **CC BY / CC BY-SA images** require attribution. The app credits each image where it is displayed and on the landing page's *Image credits* section.
- **CC BY-SA** also requires that modified versions (the three crops above) are shared under the same licence.
- Lesion overlays and heatmaps drawn on top of these images in the app are generated at runtime and do not modify the image files.

## Not included

Stock photos (e.g. clinicians at workstations) were not downloaded: Unsplash blocks scripted downloads. To add some, place them in `public/images/site/` and record them in this file.
