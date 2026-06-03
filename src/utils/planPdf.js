/**
 * Dependency-free "Download PDF" for a saved AI trip plan.
 * Opens a print-styled window matching the MAFTRAVEL look and triggers the
 * browser's native print dialog → the user picks "Save as PDF".
 *
 * Plan shape: { id, savedAt, formData:{destination,days,budget,travelers},
 *   itineraries:[{day,title,activities:[{time,activity,description,cost}],meals,accommodation}],
 *   meta:{summary,budgetBreakdown:{accommodation,food,activities,transport,total},tips,source} }
 */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function downloadPlanPdf(plan) {
  if (!plan) return false;

  const dest      = plan.formData?.destination || plan.meta?.destination || 'Trip plan';
  const days      = plan.itineraries?.length || plan.formData?.days || 0;
  const budget    = Number(plan.formData?.budget) || 0;
  const travelers = plan.formData?.travelers || plan.formData?.pax || 1;
  const bb        = plan.meta?.budgetBreakdown || {};
  const total     = bb.total;
  const summary   = plan.meta?.summary || '';
  const tips      = Array.isArray(plan.meta?.tips) ? plan.meta.tips : [];
  const savedAt   = plan.savedAt ? new Date(plan.savedAt).toLocaleDateString() : '';

  const daysHtml = (plan.itineraries || []).map((d) => {
    const acts = (d.activities || []).map((a) => `
        <tr>
          <td class="t">${esc(a.time || '')}</td>
          <td><strong>${esc(a.activity || '')}</strong>${a.description ? `<div class="desc">${esc(a.description)}</div>` : ''}</td>
          <td class="c">${a.cost != null && a.cost !== '' ? '$' + esc(a.cost) : ''}</td>
        </tr>`).join('');
    const meals = d.meals
      ? `<div class="meals">🍽 ${['breakfast', 'lunch', 'dinner']
          .map((m) => (d.meals[m] ? `<span><b>${m}:</b> ${esc(d.meals[m])}</span>` : ''))
          .filter(Boolean).join(' &nbsp;·&nbsp; ')}</div>`
      : '';
    const acc = d.accommodation ? `<div class="acc">🏨 ${esc(d.accommodation)}</div>` : '';
    return `
      <section class="day">
        <h2><span class="num">${esc(d.day || '')}</span> ${esc(d.title || 'Day ' + (d.day || ''))}</h2>
        ${acts ? `<table>${acts}</table>` : ''}
        ${meals}${acc}
      </section>`;
  }).join('');

  const breakdownHtml = total != null ? `
      <section class="day budget">
        <h2>Budget breakdown</h2>
        <table>
          ${['accommodation', 'food', 'activities', 'transport']
            .map((k) => (bb[k] != null ? `<tr><td style="text-transform:capitalize">${k}</td><td class="c">$${esc(bb[k])}</td></tr>` : ''))
            .join('')}
          <tr class="total"><td>Total</td><td class="c">$${esc(total)}</td></tr>
        </table>
      </section>` : '';

  const tipsHtml = tips.length ? `
      <section class="day tips">
        <h2>Travel tips</h2>
        <ul>${tips.map((tp) => `<li>${esc(tp)}</li>`).join('')}</ul>
      </section>` : '';

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(dest)} — MAFTRAVEL plan</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;margin:0;background:#f5f5f5}
  .wrap{max-width:760px;margin:0 auto;padding:28px}
  .hero{background:linear-gradient(135deg,#001026,#002250 55%,#003580);color:#fff;border-radius:18px;padding:26px 28px;margin-bottom:22px}
  .brand{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#f5b942;font-weight:800}
  .hero h1{margin:8px 0 12px;font-size:30px;line-height:1.05}
  .meta{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:rgba(255,255,255,.88);font-weight:600}
  .summary{font-size:14px;color:#444;line-height:1.65;margin:0 4px 20px}
  .day{background:#fff;border:1px solid #e7e7e7;border-radius:14px;padding:16px 18px;margin-bottom:14px;page-break-inside:avoid}
  .day h2{font-size:17px;margin:0 0 10px;display:flex;align-items:center;gap:10px}
  .num{display:inline-flex;width:26px;height:26px;border-radius:8px;background:#f5b942;color:#002250;align-items:center;justify-content:center;font-size:13px;font-weight:900}
  table{width:100%;border-collapse:collapse}
  td{padding:6px 8px;font-size:13px;border-bottom:1px solid #f0f0f0;vertical-align:top}
  td.t{white-space:nowrap;color:#0071c2;font-weight:700;width:60px}
  td.c{text-align:right;white-space:nowrap;font-weight:700;color:#003580;width:72px}
  .desc{color:#777;font-size:12px;margin-top:2px}
  .meals,.acc{font-size:12px;color:#555;margin-top:8px}
  .budget .total td{font-weight:900;color:#002250;border-top:2px solid #002250;border-bottom:0}
  .tips ul{margin:0;padding-left:18px}.tips li{font-size:13px;margin-bottom:5px}
  .foot{margin-top:24px;text-align:center;font-size:11px;color:#9ca3af}
  @media print{.no-print{display:none}body{background:#fff}.wrap{padding:0}}
</style></head><body>
  <div class="wrap">
    <div class="hero">
      <div class="brand">✦ MAFTRAVEL · AI Trip Plan</div>
      <h1>${esc(dest)}</h1>
      <div class="meta">
        <span>📅 ${esc(days)} days</span>
        ${budget ? `<span>💰 Budget $${budget.toLocaleString()}</span>` : ''}
        <span>👤 ${esc(travelers)} traveler(s)</span>
        ${savedAt ? `<span>🕑 Saved ${esc(savedAt)}</span>` : ''}
      </div>
    </div>
    ${summary ? `<p class="summary">${esc(summary)}</p>` : ''}
    ${daysHtml}
    ${breakdownHtml}
    ${tipsHtml}
    <div class="foot">Generated by MAFTRAVEL · Your AI travel companion</div>
    <p class="no-print" style="text-align:center;margin-top:18px">
      <button onclick="window.print()" style="background:#f5b942;border:0;padding:11px 24px;border-radius:10px;font-weight:800;font-size:14px;cursor:pointer;color:#002250">Save as PDF</button>
    </p>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print()},450)}<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

export default downloadPlanPdf;
