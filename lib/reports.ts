import { format } from "date-fns"
import { adjudicated, confusion, modelScores, pct, roc, scores } from "./metrics"
import { MODELS, type DB, type Report } from "./types"

export function buildReport(db: DB, kind: Report["kind"]): string {
  const adj = adjudicated(db.scans)
  const c = confusion(adj)
  const s = scores(c)
  const date = format(new Date(), "d MMMM yyyy")
  const pending = db.scans.filter((x) => x.status !== "validated").length

  const header = `*Generated ${date} from ${db.patients.length} patients and ${db.scans.length} MRI studies (${adj.length} adjudicated).*\n\n`

  if (kind === "AI performance") {
    const rows = MODELS.map((m) => {
      const ms = modelScores(adj, m)
      return `| ${m} | ${pct(ms.accuracy)} | ${pct(ms.sensitivity)} | ${pct(ms.specificity)} | ${roc(adj, m).auc.toFixed(3)} |`
    }).join("\n")
    return (
      `# AI Performance Report\n\n${header}## Ensemble (${db.settings.activeModelVersion})\n\n` +
      `- Accuracy: **${pct(s.accuracy)}**\n- Sensitivity: **${pct(s.sensitivity)}**\n- Specificity: **${pct(s.specificity)}**\n- F1: **${s.f1.toFixed(3)}**\n` +
      `- Confusion: TP ${c.tp}, FP ${c.fp}, TN ${c.tn}, FN ${c.fn}\n\n` +
      `## Individual backbones\n\n| Model | Accuracy | Sensitivity | Specificity | AUC |\n|---|---|---|---|---|\n${rows}\n\n` +
      `## Notes\n\n- ${c.fn} missed stroke(s) require case-level review.\n- ${db.annotations.filter((a) => a.forRetraining).length} expert corrections are queued for retraining.\n`
    )
  }

  if (kind === "Site comparison") {
    const rows = db.sites
      .map((site) => {
        const pts = db.patients.filter((p) => p.site === site)
        const ids = new Set(pts.map((p) => p.id))
        const sc = adj.filter((x) => ids.has(x.patientId))
        const ss = scores(confusion(sc))
        const fu = pts.filter((p) => p.mrs90 !== undefined).length
        return `| ${site} | ${pts.length} | ${sc.length} | ${sc.length ? pct(ss.accuracy) : "—"} | ${pts.length ? pct(fu / pts.length, 0) : "—"} |`
      })
      .join("\n")
    return (
      `# Site Comparison\n\n${header}| Site | Patients | Adjudicated scans | AI accuracy | 90-day follow-up |\n|---|---|---|---|---|\n${rows}\n\n` +
      `Sites with fewer than 5 adjudicated scans should be interpreted with caution.\n`
    )
  }

  // Cohort summary / Interim analysis
  const isch = db.patients.filter((p) => db.scans.some((x) => x.patientId === p.id && (x.expertValidation?.finalLabel ?? x.radiologistReview?.finalLabel) === "Ischemic stroke"))
  const meanAge = db.patients.reduce((a, p) => a + p.age, 0) / (db.patients.length || 1)
  const male = db.patients.filter((p) => p.sex === "Male").length / (db.patients.length || 1)
  const meanNihss = db.patients.reduce((a, p) => a + p.nihssAdmission, 0) / (db.patients.length || 1)
  const withMrs = db.patients.filter((p) => p.mrs90 !== undefined)
  const good = withMrs.filter((p) => p.mrs90! <= 2).length / (withMrs.length || 1)
  const title = kind === "Interim analysis" ? "Interim Analysis" : "Cohort Summary"
  return (
    `# ${title}\n\n${header}## Cohort\n\n- Patients enrolled: **${db.patients.length}** across ${db.sites.length} sites\n` +
    `- Mean age: **${meanAge.toFixed(1)}** years; male: **${pct(male)}**\n- Mean admission NIHSS: **${meanNihss.toFixed(1)}**\n` +
    `- Confirmed ischemic stroke: **${isch.length}** patients\n- 90-day good outcome (mRS 0–2): **${pct(good)}** of ${withMrs.length} with follow-up\n\n` +
    `## AI detection\n\n- Accuracy **${pct(s.accuracy)}**, sensitivity **${pct(s.sensitivity)}**, specificity **${pct(s.specificity)}** on ${adj.length} adjudicated scans.\n` +
    `- ${pending} scans are still in the review pipeline.\n\n` +
    `## Next steps\n\n- Complete validation of pending studies.\n- Chase missing 90-day mRS follow-up.\n`
  )
}

/** Tiny, safe markdown renderer for report previews (headings, lists, tables, bold/italic). */
export function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
  const lines = md.split("\n")
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const l = lines[i]
    if (/^#{1,3} /.test(l)) {
      const level = l.match(/^#+/)![0].length
      const cls = ["", "text-2xl font-bold mt-2 mb-3", "text-lg font-semibold mt-5 mb-2", "font-semibold mt-4 mb-1"][level]
      out.push(`<h${level} class="${cls}">${inline(l.replace(/^#+ /, ""))}</h${level}>`)
      i++
    } else if (/^- /.test(l)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i])) items.push(`<li>${inline(lines[i++].slice(2))}</li>`)
      out.push(`<ul class="list-disc pl-6 space-y-1 my-2">${items.join("")}</ul>`)
    } else if (/^\|/.test(l)) {
      const rows: string[][] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i++].split("|").slice(1, -1).map((c) => c.trim())
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells)
      }
      const [head, ...body] = rows
      out.push(
        `<div class="overflow-x-auto my-3"><table class="w-full text-sm border"><thead class="bg-muted"><tr>${head.map((h) => `<th class="border px-2 py-1 text-left">${inline(h)}</th>`).join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td class="border px-2 py-1">${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      )
    } else if (l.trim() === "") {
      i++
    } else {
      out.push(`<p class="my-2">${inline(l)}</p>`)
      i++
    }
  }
  return out.join("\n")
}
