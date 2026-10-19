# Stroke AI Study – demo platform v1.0

Research website and role-based platform for the study *Computer-aided Detection and Classification of Ischemic Strokes from MRI Images in LMIC*. Everything runs in the browser on dummy data, so it can be demoed without a backend.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Expert reviewer (doctor) | doctor@example.com | doctor123 |
| Radiologist | radiologist@example.com | radio123 |
| Data entry | dataentry@example.com | data123 |
| Analyst | analyst@example.com | analyst123 |
| Administrator | admin@example.com | admin123 |

The login page also has one-click buttons for each role.

## End-to-end flow

1. **Data entry** → *Data Entry Forms*: register a patient → *Upload MRI* (sample study or your own PNG/JPG).
2. The simulated AI analyses the scan after a few seconds (heatmap, confidence, lesion volume, per-model probabilities).
3. **Radiologist** → *AI Predictions*: accept or reject; *MRI Analysis*: window/level, zoom, draw lesion annotations; *Case Reviews*: discuss with colleagues.
4. **Doctor** → *AI Review*: final validation of radiologist-reviewed cases; annotate corrections for retraining, compare models, record outcomes.
5. **Analyst**: statistics, AI performance (confusion matrix, ROC, threshold explorer), trends, and reports generated from the live data (downloadable as Markdown/CSV).
6. **Admin**: create/suspend users (new accounts can sign in), edit the role permission matrix (enforced immediately), change AI/workflow settings, view the audit log and inquiries from the public contact form.

Tip: sign in as two roles in two browser tabs. Data is shared between tabs and updates live.

## How data works

- All data lives in the browser's `localStorage` (`lib/store.tsx`) and is seeded from `lib/seed.ts` (42 fictional patients across 8 LMIC sites).
- *Reset demo data* in the user menu restores the original dataset.
- AI predictions are **simulated** (`lib/ai.ts`); no real model is called.
- DICOM files can't be decoded in the browser demo. Upload exported PNG/JPG slices instead.

## Images

Real MRI images from Wikimedia Commons under open licences. See [IMAGE_SOURCES.md](IMAGE_SOURCES.md) for authors, licences and changes.
