/**
 * Seed Data PDF Generator
 * Generates realistic progress reports based on the AICTE-CSRBOX MoU
 * Run: node docs/seed-data/generate-pdfs.js
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname);

function createHeader(doc, title, subtitle) {
  // Navy header bar
  doc.rect(0, 0, 612, 80).fill("#0F172A");
  doc.fontSize(22).fillColor("#FFFFFF").text(title, 50, 22, { width: 512 });
  doc.fontSize(11).fillColor("#94A3B8").text(subtitle, 50, 52, { width: 512 });
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
  const colWidths = [30, 180, 70, 70, 80, 82];
  const headers = ["#", "KPI", "Target", "Achieved", "% Complete", "Status"];

  // Table header
  let y = doc.y;
  doc.rect(startX, y, 512, 22).fill("#0891B2");
  let x = startX;
  headers.forEach((h, i) => {
    doc.fontSize(9).fillColor("#FFFFFF").text(h, x + 5, y + 6, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });
  y += 22;

  // Table rows
  kpis.forEach((kpi, idx) => {
    const rowColor = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    doc.rect(startX, y, 512, 20).fill(rowColor);

    const pct = Math.round((kpi.achieved / kpi.target) * 100);
    let status, statusColor;
    if (pct >= 80) { status = "On Track"; statusColor = "#059669"; }
    else if (pct >= 50) { status = "At Risk"; statusColor = "#D97706"; }
    else { status = "Behind"; statusColor = "#DC2626"; }

    const row = [String(idx + 1), kpi.name, String(kpi.target.toLocaleString()), String(kpi.achieved.toLocaleString()), `${pct}%`, status];
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

function createParagraph(doc, text) {
  doc.fontSize(10).fillColor("#334155").text(text, 50, doc.y, { width: 512, lineGap: 3 });
  doc.moveDown(0.5);
}

// ============================================================
// REPORT 1: 6-Month Progress Report (March 2026)
// ============================================================
function generateReport1() {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  const stream = fs.createWriteStream(path.join(outDir, "CPFU_Progress_Report_6Month_Mar2026.pdf"));
  doc.pipe(stream);

  createHeader(doc, "CPFU Progress Report", "Period: September 2025 — March 2026 (6 Months) | Submitted to AICTE");

  // Executive Summary
  createSectionHeader(doc, "1. Executive Summary");
  createParagraph(doc,
    "This report presents the progress of the CSR Projects Facilitation Unit (CPFU) established under the MoU between All India Council for Technical Education (AICTE) and CSRBOX Group, signed on 12th September 2025. The CPFU has completed its first six months of operations with significant milestones achieved across student engagement, institutional partnerships, and innovation programs."
  );
  createParagraph(doc,
    "Key highlights: 85,000 students engaged through various programs, 2 Centres of Excellence inaugurated, 1 national hackathon (Smart India Hackathon) successfully conducted with 800+ participants from 200+ institutions, and 7 corporate partners onboarded for CSR-funded education initiatives."
  );

  // Project Details
  createSectionHeader(doc, "2. Project Details");
  createParagraph(doc, "Project Name: CSR Projects Facilitation Unit (CPFU) & Industry-Academia Connect");
  createParagraph(doc, "Implementing Organization: CSRBOX Group (Renalysis Consultants Pvt Ltd)");
  createParagraph(doc, "Partner: All India Council for Technical Education (AICTE)");
  createParagraph(doc, "Location: AICTE Headquarters, Nelson Mandela Marg, New Delhi-110070");
  createParagraph(doc, "MoU Duration: 3 Years (September 2025 — September 2028)");
  createParagraph(doc, "Reporting Period: September 2025 — March 2026");
  createParagraph(doc, "Total Project Investment: Rs. 2,50,00,000 (Two Crore Fifty Lakh)");

  // KPI Progress
  createSectionHeader(doc, "3. Key Performance Indicators — Progress Summary");

  const kpis = [
    { name: "CSR Fellows Deployed at AICTE", target: 2, achieved: 2 },
    { name: "Student Engagement/Outreach", target: 200000, achieved: 85000 },
    { name: "Centres of Excellence Established", target: 5, achieved: 2 },
    { name: "National Hackathons Conducted", target: 3, achieved: 1 },
    { name: "Capacity-Building Workshops", target: 12, achieved: 5 },
    { name: "Corporate Partnerships Mobilized", target: 15, achieved: 7 },
    { name: "Internship Placements Facilitated", target: 5000, achieved: 1800 },
    { name: "Institutions Receiving CSR Interventions", target: 50, achieved: 18 },
    { name: "Industry-Academia Collaborations", target: 10, achieved: 3 },
    { name: "Impact Reports Submitted", target: 4, achieved: 1 },
  ];

  createKPITable(doc, kpis);

  // Activities
  doc.addPage();
  createSectionHeader(doc, "4. Key Activities Undertaken");

  createParagraph(doc, "4.1 CSR Fellows Deployment");
  createParagraph(doc,
    "Two CSR Fellows — Ms. Priya Mehta and Mr. Arjun Rao — were deployed at AICTE Headquarters on 1st October 2025. They have been working with AICTE departments to coordinate CPFU initiatives, manage corporate outreach, and facilitate inter-institutional programs."
  );

  createParagraph(doc, "4.2 Smart India Hackathon 2025");
  createParagraph(doc,
    "The CPFU contributed to organizing the Smart India Hackathon held on 10th December 2025, with 200 teams from 150+ AICTE-approved institutions participating. Problem statements were sourced from 12 corporate partners across Smart City, Healthcare, Agriculture, and Education domains. The event was conducted in hybrid mode across 8 nodal centers."
  );

  createParagraph(doc, "4.3 Centres of Excellence");
  createParagraph(doc,
    "Two Centres of Excellence have been established: (1) CoE in AI & Machine Learning at NIT Surat with support from TCS Foundation, inaugurated November 2025; (2) CoE in IoT & Embedded Systems at JNTU Hyderabad with support from Wipro Foundation, inaugurated January 2026. Each CoE includes R&D lab facilities, faculty training programs, and industry mentorship."
  );

  createParagraph(doc, "4.4 Faculty Development Workshops");
  createParagraph(doc,
    "Five capacity-building workshops were conducted: AI & ML Fundamentals (Delhi, Nov 15), Sustainability in Tech (Pune, Nov 22), IoT for Social Good (Calicut, Nov 28), Green Tech Innovation (Bangalore, Jan 12), and Innovation Management & IPR (Chandigarh, Jan 20). Total faculty participation: 142 across 45 institutions."
  );

  createParagraph(doc, "4.5 Student Outreach & Internship Drive");
  createParagraph(doc,
    "The CSR Industry Connect internship drive was launched on 20th October 2025 across 15 cities, reaching 85,000 students through campus visits, webinars, and AICTE's digital channels. 1,800 students have been placed in CSR-aligned internships with partner organizations including Tata Trusts, Infosys Foundation, and Reliance Foundation."
  );

  // Challenges
  createSectionHeader(doc, "5. Challenges & Mitigation");
  createParagraph(doc,
    "1. Institutional Coordination: Initial delays in getting SPOCs designated at AICTE departments. Resolved by February 2026 with 8 SPOCs now active. 2. Corporate Onboarding: Longer-than-expected CSR budget approval cycles from potential partners. Mitigation: Shifted to a pipeline model with staggered engagement. 3. Regional Coverage: North and South zones well-covered; East and West need more attention in the next quarter."
  );

  // Next Steps
  createSectionHeader(doc, "6. Plan for Next 6 Months (Apr 2026 — Sep 2026)");
  createParagraph(doc,
    "1. Establish 2 additional Centres of Excellence (targeting Eastern and Western regions). 2. Conduct 2 additional national hackathons (Innovation Showcase East & North). 3. Scale student outreach to 200,000 cumulative. 4. Onboard 8 additional corporate partners. 5. Launch Project-Based Learning (PBL) pilot in 20 institutions. 6. Complete mid-term impact assessment."
  );

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#64748B").text(
    "This report is submitted as per Clause 10 of the MoU dated 12th September 2025.",
    50, doc.y, { width: 512, align: "center" }
  );
  doc.moveDown(1);
  doc.fontSize(9).text(
    "Prepared by: CSRBOX Group — CSR Projects Facilitation Unit | Date: 31st March 2026",
    50, doc.y, { width: 512, align: "center" }
  );

  doc.end();
  return new Promise((resolve) => stream.on("finish", resolve));
}

// ============================================================
// REPORT 2: 12-Month Progress Report (September 2026)
// ============================================================
function generateReport2() {
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  const stream = fs.createWriteStream(path.join(outDir, "CPFU_Progress_Report_12Month_Sep2026.pdf"));
  doc.pipe(stream);

  createHeader(doc, "CPFU Annual Progress Report", "Period: September 2025 — September 2026 (12 Months) | Submitted to AICTE");

  // Executive Summary
  createSectionHeader(doc, "1. Executive Summary");
  createParagraph(doc,
    "This annual report covers the first full year of operations of the CSR Projects Facilitation Unit (CPFU) under the AICTE-CSRBOX Group MoU. The CPFU has achieved strong progress across all key performance indicators, with notable acceleration in the second half of the year."
  );
  createParagraph(doc,
    "Key achievements: 165,000 students engaged (82.5% of annual target), 4 Centres of Excellence operational, 3 national hackathons conducted with 2,400+ participants, 12 corporate partnerships secured generating Rs. 1.8 Crore in CSR commitments, and 3,500 internship placements. The program has demonstrated a meaningful model for CSR-driven technical education improvement at national scale."
  );

  // Project Details
  createSectionHeader(doc, "2. Project Details");
  createParagraph(doc, "Project Name: CSR Projects Facilitation Unit (CPFU) & Industry-Academia Connect");
  createParagraph(doc, "Implementing Organization: CSRBOX Group (Renalysis Consultants Pvt Ltd)");
  createParagraph(doc, "Partner: All India Council for Technical Education (AICTE)");
  createParagraph(doc, "Location: AICTE Headquarters, Nelson Mandela Marg, New Delhi-110070");
  createParagraph(doc, "MoU Duration: 3 Years (September 2025 — September 2028)");
  createParagraph(doc, "Reporting Period: September 2025 — September 2026 (Year 1)");
  createParagraph(doc, "Total Project Investment: Rs. 2,50,00,000 (Two Crore Fifty Lakh)");
  createParagraph(doc, "CSR Funds Mobilized in Year 1: Rs. 1,80,00,000 (One Crore Eighty Lakh)");

  // KPI Progress
  createSectionHeader(doc, "3. Key Performance Indicators — Annual Progress");

  const kpis = [
    { name: "CSR Fellows Deployed at AICTE", target: 2, achieved: 2 },
    { name: "Student Engagement/Outreach", target: 200000, achieved: 165000 },
    { name: "Centres of Excellence Established", target: 5, achieved: 4 },
    { name: "National Hackathons Conducted", target: 3, achieved: 3 },
    { name: "Capacity-Building Workshops", target: 12, achieved: 9 },
    { name: "Corporate Partnerships Mobilized", target: 15, achieved: 12 },
    { name: "Internship Placements Facilitated", target: 5000, achieved: 3500 },
    { name: "Institutions Receiving CSR Interventions", target: 50, achieved: 35 },
    { name: "Industry-Academia Collaborations", target: 10, achieved: 6 },
    { name: "Impact Reports Submitted", target: 4, achieved: 2 },
  ];

  createKPITable(doc, kpis);

  // Q3-Q4 Activities
  doc.addPage();
  createSectionHeader(doc, "4. Activities — Second Half (April — September 2026)");

  createParagraph(doc, "4.1 Additional Centres of Excellence");
  createParagraph(doc,
    "Two new CoEs were established in the second half: (3) CoE in Renewable Energy & Sustainability at NIT Durgapur with support from Adani Foundation, inaugurated May 2026; (4) CoE in Cybersecurity at COEP Pune with support from Infosys Foundation, inaugurated July 2026. Total CoEs operational: 4 out of 5 target."
  );

  createParagraph(doc, "4.2 Innovation Showcase Hackathons");
  createParagraph(doc,
    "Two additional hackathons were conducted: Innovation Showcase East (Kolkata, January 2026, 300 participants from 10 states) and Innovation Showcase North (Chandigarh, February 2026, 250 participants from 6 states). Combined with the Smart India Hackathon, total hackathon participants reached 2,400+ from 350+ institutions."
  );

  createParagraph(doc, "4.3 Workshop Program Expansion");
  createParagraph(doc,
    "Four additional workshops were conducted in the second half: Data Analytics for Impact (Kolkata, Feb 8), Project-Based Learning Methods (Chennai, Apr 15), Entrepreneurship & Innovation (Mumbai, Jun 20), and CSR Strategy for Institutions (Delhi, Aug 10). Year total: 9 workshops, 310+ faculty from 85 institutions."
  );

  createParagraph(doc, "4.4 Student Outreach Scale-Up");
  createParagraph(doc,
    "Student outreach intensified with digital campaigns through AICTE channels, reaching 80,000 additional students in the second half. Cumulative: 165,000 students across 200+ institutions in 25 states. Internship placements grew to 3,500 with 5 new corporate partners joining the program."
  );

  createParagraph(doc, "4.5 Corporate Partnerships");
  createParagraph(doc,
    "Five additional corporate partners onboarded: Adani Foundation, L&T Technology Services, HCL Foundation, Tech Mahindra Foundation, and Bajaj Finserv CSR. Total: 12 active partners contributing Rs. 1.8 Crore toward CPFU initiatives. Key focus areas: skilling programs, lab infrastructure, and innovation challenges."
  );

  // Financial Summary
  createSectionHeader(doc, "5. Financial Summary (Year 1)");
  createParagraph(doc, "Total Project Budget (3-Year): Rs. 2,50,00,000");
  createParagraph(doc, "Year 1 Allocation: Rs. 85,00,000");
  createParagraph(doc, "Year 1 Expenditure: Rs. 78,50,000");
  createParagraph(doc, "CSR Funds Mobilized from Partners: Rs. 1,80,00,000");
  createParagraph(doc, "Total Impact Value Generated: Rs. 2,58,50,000");

  // Challenges
  createSectionHeader(doc, "6. Challenges & Lessons Learned");
  createParagraph(doc,
    "1. Regional Imbalance: Eastern and Northeastern regions remain underserved. Plan: Dedicated outreach campaign in Q1 Year 2. 2. Workshop Attendance: Faculty participation lower in summer months due to exam schedules. Plan: Shift to hybrid format. 3. Internship Quality: Need stronger monitoring mechanisms. Plan: Deploy real-time dashboard (in development). 4. 5th CoE Delayed: AICTE approval for Central region CoE pending. Expected by December 2026."
  );

  // Year 2 Plan
  createSectionHeader(doc, "7. Year 2 Plan (October 2026 — September 2027)");
  createParagraph(doc,
    "1. Achieve 300,000 cumulative student engagement. 2. Establish 5th CoE and begin planning for 3 additional. 3. Scale internship program to 8,000 cumulative placements. 4. Conduct 4 hackathons including international innovation showcase. 5. Launch real-time CPFU monitoring dashboard. 6. Expand to 80+ institutions. 7. Mobilize Rs. 3 Crore in additional CSR funding. 8. Publish first Annual Impact Report with SROI analysis."
  );

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#64748B").text(
    "This report is submitted as per Clause 10 of the MoU dated 12th September 2025.",
    50, doc.y, { width: 512, align: "center" }
  );
  doc.moveDown(1);
  doc.fontSize(9).text(
    "Prepared by: CSRBOX Group — CSR Projects Facilitation Unit | Date: 30th September 2026",
    50, doc.y, { width: 512, align: "center" }
  );

  doc.end();
  return new Promise((resolve) => stream.on("finish", resolve));
}

// Run
async function main() {
  console.log("Generating seed data PDFs...\n");

  await generateReport1();
  console.log("  Created: CPFU_Progress_Report_6Month_Mar2026.pdf");

  await generateReport2();
  console.log("  Created: CPFU_Progress_Report_12Month_Sep2026.pdf");

  console.log("\nDone! Files saved to docs/seed-data/");
}

main().catch(console.error);
