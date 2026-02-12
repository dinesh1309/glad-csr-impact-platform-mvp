/**
 * Seed Data PDF Generator — Quick Heal Foundation
 * Earn & Learn: Cyber Security Awareness Campaign
 * Run: node docs/seed-data/Quickheal-foundation/generate-qhf-pdfs.js
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname);

function createHeader(doc, title, subtitle) {
  doc.rect(0, 0, 612, 80).fill("#0F172A");
  doc.fontSize(20).fillColor("#FFFFFF").text(title, 50, 22, { width: 512 });
  doc.fontSize(10).fillColor("#94A3B8").text(subtitle, 50, 50, { width: 512 });
  doc.moveDown(3);
  doc.fillColor("#334155");
}

function createSectionHeader(doc, text) {
  doc.moveDown(0.5);
  doc.rect(50, doc.y, 512, 28).fill("#F1F5F9");
  doc.fontSize(12).fillColor("#0F172A").text(text, 60, doc.y + 7, { width: 492 });
  doc.moveDown(1.8);
  doc.fillColor("#334155");
}

function createKPITable(doc, kpis) {
  const startX = 50;
  const colWidths = [30, 200, 70, 70, 70, 72];
  const headers = ["#", "KPI", "Target", "Achieved", "% Done", "Status"];

  let y = doc.y;
  doc.rect(startX, y, 512, 22).fill("#0891B2");
  let x = startX;
  headers.forEach((h, i) => {
    doc.fontSize(9).fillColor("#FFFFFF").text(h, x + 5, y + 6, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });
  y += 22;

  kpis.forEach((kpi, idx) => {
    const rowColor = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    doc.rect(startX, y, 512, 20).fill(rowColor);

    const pct = Math.round((kpi.achieved / kpi.target) * 100);
    let status, statusColor;
    if (pct >= 80) { status = "On Track"; statusColor = "#059669"; }
    else if (pct >= 50) { status = "At Risk"; statusColor = "#D97706"; }
    else { status = "Behind"; statusColor = "#DC2626"; }

    const row = [String(idx + 1), kpi.name, String(kpi.target), String(kpi.achieved), `${pct}%`, status];
    x = startX;
    row.forEach((val, i) => {
      const color = i === 5 ? statusColor : "#334155";
      doc.fontSize(8.5).fillColor(color).text(val, x + 5, y + 5, { width: colWidths[i] - 10 });
      x += colWidths[i];
    });
    y += 20;
  });

  doc.y = y + 10;
  doc.fillColor("#334155");
}

function p(doc, text) {
  doc.fontSize(10).fillColor("#334155").text(text, 50, doc.y, { width: 512, lineGap: 3 });
  doc.moveDown(0.5);
}

// ============================================================
// REPORT 1: Mid-Project Report (Week 8 — July 2022)
// ============================================================
function generateMidReport() {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  const stream = fs.createWriteStream(path.join(outDir, "QHF_Progress_Report_Week8_Jul2022.pdf"));
  doc.pipe(stream);

  createHeader(doc,
    "Earn & Learn Progress Report — Week 8",
    "Period: May — July 2022 | Quick Heal Foundation × RSM Latur"
  );

  createSectionHeader(doc, "1. Executive Summary");
  p(doc,
    "This mid-project report covers the first eight weeks of the Earn & Learn: Cyber Security Awareness Campaign conducted by Quick Heal Foundation in collaboration with Rajarshi Shahu Mahavidyalaya (Autonomous), Latur. The campaign has completed volunteer training, mock sessions, and is now in the active presentation delivery phase."
  );
  p(doc,
    "Key highlights: 45 student volunteers trained, 8 mock/demo sessions completed, 156 presentations delivered across 22 schools in the Latur district reaching 4,680 school children, and 2,340 leaflet downloads recorded."
  );

  createSectionHeader(doc, "2. Project Details");
  p(doc, "Project Name: Earn & Learn: Cyber Security Awareness Campaign");
  p(doc, "CSR Company: Quick Heal Technologies Ltd");
  p(doc, "Implementing Partner: Quick Heal Foundation (QHF)");
  p(doc, "Institute: Rajarshi Shahu Mahavidyalaya (Autonomous), Latur");
  p(doc, "Location: Latur, Maharashtra");
  p(doc, "MoU Duration: 1 year (May 2022 — May 2023)");
  p(doc, "Reporting Period: May 2022 — July 2022 (Week 1–8)");

  createSectionHeader(doc, "3. Key Performance Indicators — Progress");

  const kpis = [
    { name: "Student Volunteers Recruited", target: 60, achieved: 45 },
    { name: "Volunteer Training Sessions", target: 5, achieved: 5 },
    { name: "Mock/Demo Sessions Completed", target: 10, achieved: 8 },
    { name: "Presentations Delivered to Schools", target: 300, achieved: 156 },
    { name: "School Children Reached", target: 9000, achieved: 4680 },
    { name: "Leaflet Downloads", target: 6000, achieved: 2340 },
    { name: "Faculty Coordinators Appointed", target: 5, achieved: 4 },
    { name: "M&E Reports Submitted", target: 3, achieved: 1 },
  ];

  createKPITable(doc, kpis);

  createSectionHeader(doc, "4. Activities Undertaken");

  p(doc, "4.1 Volunteer Recruitment & Training (Week 1–2)");
  p(doc,
    "45 IT/CS students were selected as volunteers from the BCA and B.Sc. (CS) departments. Five comprehensive training sessions were conducted covering: (1) Cyber security fundamentals, (2) Public speaking and presentation skills, (3) Confidence building and team dynamics, (4) Leaflet and material usage guidelines, and (5) School engagement protocols. Training was delivered by QHF trainers and faculty coordinators."
  );

  p(doc, "4.2 Mock & Demo Sessions (Week 2–3)");
  p(doc,
    "8 mock presentations were conducted within the college premises. Each volunteer team (3 members) presented to fellow students and faculty, receiving feedback. 2 additional demo sessions were held at nearby schools (ZP School Latur, KV Latur) to pilot the approach. QHF coordinator approved all teams for field deployment by end of Week 3."
  );

  p(doc, "4.3 School Presentations (Week 4–8)");
  p(doc,
    "156 presentations have been delivered across 22 schools in Latur district. Each presentation covers: password safety, social media risks, online fraud awareness, and safe browsing habits. Average audience per session: 30 school children (classes 6–10). Schools covered include government schools (15), aided schools (5), and private schools (2). Volunteer teams rotate across different schools to maximize coverage."
  );

  doc.addPage();
  p(doc, "4.4 Leaflet Distribution & Downloads");
  p(doc,
    "Cyber security awareness leaflets (designed by QHF) are distributed at each presentation. QR codes on leaflets link to digital versions. 2,340 digital downloads recorded via QHF tracking portal. Physical leaflets distributed: approximately 4,500."
  );

  createSectionHeader(doc, "5. Challenges");
  p(doc,
    "1. Volunteer attrition: 5 of the initial 50 recruits dropped out due to exam commitments. Replacement volunteers being identified. 2. School access during exams: June was a slow month due to school examination schedules. Presentation pace increased in July. 3. Rural connectivity: Some schools in rural areas have poor internet, affecting leaflet download tracking. QHF is providing offline tracking forms."
  );

  createSectionHeader(doc, "6. Plan for Remaining Period (Week 9–14)");
  p(doc,
    "1. Recruit 15 additional volunteers to reach target of 60. 2. Complete remaining 144 presentations (targeting 20 per week). 3. Intensify leaflet download campaign with school WhatsApp groups. 4. Submit Week 12 M&E report. 5. Begin preparation for final conclave (Week 21). 6. Complete all payment documentation for stipend disbursement."
  );

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#64748B").text(
    "Prepared by: Prof. Jyoti Mashalkar (Faculty Coordinator) | Reviewed by: Mr. Ajay Shirke (QHF Program Manager)",
    50, doc.y, { width: 512, align: "center" }
  );
  doc.moveDown(0.5);
  doc.fontSize(9).text(
    "Date: 15th July 2022 | Report submitted as per MoU Clause 2, Annexure A",
    50, doc.y, { width: 512, align: "center" }
  );

  doc.end();
  return new Promise((resolve) => stream.on("finish", resolve));
}

// ============================================================
// REPORT 2: Final Report (Week 14 — October 2022)
// ============================================================
function generateFinalReport() {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  const stream = fs.createWriteStream(path.join(outDir, "QHF_Final_Report_Week14_Oct2022.pdf"));
  doc.pipe(stream);

  createHeader(doc,
    "Earn & Learn Final Progress Report",
    "Period: May — October 2022 (Week 1–14) | Quick Heal Foundation × RSM Latur"
  );

  createSectionHeader(doc, "1. Executive Summary");
  p(doc,
    "This final progress report covers the complete execution phase of the Earn & Learn: Cyber Security Awareness Campaign. The project has successfully achieved or exceeded most targets, with 58 active volunteers delivering 312 presentations across 38 schools, reaching 9,360 school children in Latur district."
  );
  p(doc,
    "The campaign achieved a 104% target on presentations delivered, 104% on school children reached, and 92% on leaflet downloads. Student volunteers demonstrated significant improvement in public speaking, team coordination, and cyber security knowledge. The project is now in the report submission and conclave preparation phase."
  );

  createSectionHeader(doc, "2. Project Details");
  p(doc, "Project Name: Earn & Learn: Cyber Security Awareness Campaign");
  p(doc, "CSR Company: Quick Heal Technologies Ltd");
  p(doc, "Implementing Partner: Quick Heal Foundation (QHF)");
  p(doc, "Institute: Rajarshi Shahu Mahavidyalaya (Autonomous), Latur");
  p(doc, "Location: Latur, Maharashtra");
  p(doc, "MoU Duration: 1 year (May 2022 — May 2023)");
  p(doc, "Reporting Period: May 2022 — October 2022 (Week 1–14)");
  p(doc, "Total Stipend Budget: Rs. 2,23,200 (312 presentations × Rs. 600 + faculty monitoring)");

  createSectionHeader(doc, "3. Key Performance Indicators — Final Status");

  const kpis = [
    { name: "Student Volunteers Recruited", target: 60, achieved: 58 },
    { name: "Volunteer Training Sessions", target: 5, achieved: 5 },
    { name: "Mock/Demo Sessions Completed", target: 10, achieved: 10 },
    { name: "Presentations Delivered to Schools", target: 300, achieved: 312 },
    { name: "School Children Reached", target: 9000, achieved: 9360 },
    { name: "Leaflet Downloads", target: 6000, achieved: 5520 },
    { name: "Faculty Coordinators Appointed", target: 5, achieved: 5 },
    { name: "M&E Reports Submitted", target: 3, achieved: 3 },
  ];

  createKPITable(doc, kpis);

  createSectionHeader(doc, "4. Detailed Activities (Week 9–14)");

  p(doc, "4.1 Intensified School Outreach (Week 9–12)");
  p(doc,
    "Presentation delivery accelerated to 25+ sessions per week. 156 additional presentations were delivered across 16 new schools, bringing the total to 312 presentations in 38 schools. Coverage expanded to rural talukas including Ausa, Nilanga, and Udgir. Government schools constituted 65% of total coverage, ensuring reach to underserved communities."
  );

  p(doc, "4.2 Volunteer Performance");
  p(doc,
    "58 volunteers remained active through the project (97% retention from the 60-target). Top-performing team: Team Cybershield (Sneha Patil, Rohit Jadhav, Priya Kamble) — 28 presentations. All volunteers who completed 5+ presentations are eligible for stipend of Rs. 600 per presentation. 52 volunteers qualified for stipend disbursement."
  );

  doc.addPage();
  p(doc, "4.3 Leaflet & Digital Engagement");
  p(doc,
    "5,520 digital leaflet downloads recorded (92% of target). Physical distribution: approximately 8,000 leaflets. WhatsApp group campaign in Week 10–12 boosted digital downloads by 40%. QHF cyber safety quiz conducted online — 1,200 school children participated."
  );

  p(doc, "4.4 Faculty Coordination & M&E");
  p(doc,
    "5 faculty coordinators (1 per 10 teams) actively monitored all presentations. Each coordinator submitted weekly status reports. 3 formal M&E reports submitted to QHF as per schedule. Coordinator Prof. Jyoti Mashalkar served as institutional SPoC, ensuring smooth logistics and school permissions."
  );

  createSectionHeader(doc, "5. Impact Assessment");
  p(doc,
    "Pre-post survey of 500 school children (sample) showed: 72% improvement in identifying phishing attempts, 65% improvement in password hygiene awareness, 58% increase in knowledge about social media privacy settings. Volunteer self-assessment: 85% reported improved public speaking skills, 78% reported improved confidence in professional settings."
  );

  createSectionHeader(doc, "6. Financial Summary");
  p(doc, "Stipend for 52 qualifying volunteers (312 presentations × Rs. 600): Rs. 1,87,200");
  p(doc, "Faculty monitoring fee (312 presentations × Rs. 200): Rs. 62,400");
  p(doc, "Total disbursement to Institute: Rs. 2,49,600");
  p(doc, "Training & material cost (borne by QHF): Rs. 85,000");
  p(doc, "Total project cost: Rs. 3,34,600");

  createSectionHeader(doc, "7. Next Steps");
  p(doc,
    "1. Stipend payment verification and disbursement (November 2022). 2. Final conclave planning — scheduled for Week 21 (January 2023). 3. Best volunteer awards and recognition. 4. Documentation for QHTL CSR annual report. 5. Evaluation of MoU extension for Year 2."
  );

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#64748B").text(
    "Prepared by: Prof. Jyoti Mashalkar (Faculty Coordinator) | Reviewed by: Mr. Ajay Shirke (QHF Program Manager)",
    50, doc.y, { width: 512, align: "center" }
  );
  doc.moveDown(0.5);
  doc.fontSize(9).text(
    "Date: 20th October 2022 | Final M&E report as per MoU Annexure A",
    50, doc.y, { width: 512, align: "center" }
  );

  doc.end();
  return new Promise((resolve) => stream.on("finish", resolve));
}

// Run
async function main() {
  console.log("Generating Quick Heal Foundation seed data PDFs...\n");

  await generateMidReport();
  console.log("  Created: QHF_Progress_Report_Week8_Jul2022.pdf");

  await generateFinalReport();
  console.log("  Created: QHF_Final_Report_Week14_Oct2022.pdf");

  console.log("\nDone! Files saved to docs/seed-data/Quickheal-foundation/");
}

main().catch(console.error);
