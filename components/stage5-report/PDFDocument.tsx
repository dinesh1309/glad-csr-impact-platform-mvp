"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Project } from "@/lib/types";

/* ---- Styles ---- */

const navy = "#0F172A";
const navyMid = "#1E293B";
const teal = "#0891B2";
const gold = "#D97706";
const gray = "#64748B";
const border = "#E2E8F0";
const lightBg = "#F8FAFC";
const white = "#FFFFFF";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#334155",
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
  },
  /* Cover page */
  cover: {
    backgroundColor: navy,
    marginTop: -40,
    marginHorizontal: -50,
    paddingHorizontal: 50,
    paddingTop: 80,
    paddingBottom: 60,
  },
  coverBadge: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  coverTitle: {
    color: white,
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  coverProject: {
    color: teal,
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 24,
  },
  coverMeta: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9,
    lineHeight: 1.8,
  },
  /* Sections */
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: navy,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: teal,
  },
  sectionNumber: {
    color: teal,
    marginRight: 6,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#334155",
    marginBottom: 10,
  },
  /* Tables */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: navy,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: white,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: border,
  },
  tableRowAlt: {
    backgroundColor: lightBg,
  },
  tableCell: {
    fontSize: 9,
    paddingVertical: 5,
    paddingHorizontal: 8,
    color: "#334155",
  },
  tableCellBold: {
    fontFamily: "Helvetica-Bold",
    color: navy,
  },
  /* Stats row */
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 8,
    color: gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: navy,
  },
  statHighlight: {
    color: gold,
  },
  /* Adjustments */
  adjRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  adjBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
  },
  adjLabel: { fontSize: 8, color: gray },
  adjValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: navy },
  /* SROI highlight */
  sroiBox: {
    backgroundColor: navy,
    borderRadius: 8,
    padding: 24,
    marginTop: 16,
    alignItems: "center",
  },
  sroiLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 6,
  },
  sroiValue: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: gold,
    marginBottom: 6,
  },
  sroiSub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.65)",
  },
  /* Progress bar */
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 3,
    marginBottom: 8,
  },
  /* Footer */
  footer: {
    position: "absolute",
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: gray,
  },
  /* Badge */
  badge: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  /* Investment callout */
  investmentBox: {
    backgroundColor: lightBg,
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
});

const statusColors: Record<string, { bg: string; text: string }> = {
  "on-track": { bg: "#ECFDF5", text: "#059669" },
  "at-risk": { bg: "#FFFBEB", text: "#D97706" },
  behind: { bg: "#FEF2F2", text: "#DC2626" },
  verified: { bg: "#ECFDF5", text: "#059669" },
  discrepancy: { bg: "#FFFBEB", text: "#D97706" },
  "no-evidence": { bg: "#F1F5F9", text: "#64748B" },
};

/* ---- Document Component ---- */

export function PDFReport({ project }: { project: Project }) {
  const { mou, reports, evidence, sroi } = project;
  const details = mou.projectDetails;
  const now = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const topKpi =
    reports.progressData.length > 0
      ? reports.progressData.reduce((best, pd) =>
          pd.percentageAchieved > best.percentageAchieved ? pd : best
        )
      : null;

  const executiveSummary = `This impact assessment evaluates the ${
    details?.projectName ?? project.name
  } project${details?.ngoName ? ` implemented by ${details.ngoName}` : ""}${
    details?.location ? ` in ${details.location}` : ""
  }. ${
    topKpi
      ? `The programme achieved ${topKpi.percentageAchieved}% of its ${topKpi.kpiName} target, reaching ${topKpi.currentValue.toLocaleString()} ${topKpi.unit}.`
      : ""
  }${
    sroi.calculatedRatio
      ? ` The analysis yields an SROI ratio of ${sroi.calculatedRatio}:1, indicating that every ₹1 invested generated Rs.${sroi.calculatedRatio.toFixed(2)} in social value.`
      : ""
  }`;

  const verifiedCount = evidence.validationResults.filter(
    (v) => v.status === "verified"
  ).length;

  return (
    <Document>
      {/* ---- Page 1: Cover + Executive Summary + Overview ---- */}
      <Page size="A4" style={s.page}>
        {/* Cover */}
        <View style={s.cover}>
          <Text style={s.coverBadge}>Impact Assessment</Text>
          <Text style={s.coverTitle}>Impact Assessment Report</Text>
          <Text style={s.coverProject}>
            {details?.projectName ?? project.name}
          </Text>
          <Text style={s.coverMeta}>
            {`Assessment Date: ${now}\n`}
            {details?.ngoName ? `Implementing Partner: ${details.ngoName}\n` : ""}
            {details?.location ? `Location: ${details.location}\n` : ""}
            {details?.duration ? `Duration: ${details.duration}` : ""}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={{ marginTop: 24 }}>
          <Text style={s.sectionTitle}>
            <Text style={s.sectionNumber}>1.</Text> Executive Summary
          </Text>
          <Text style={s.bodyText}>{executiveSummary}</Text>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statLabel}>KPIs Tracked</Text>
              <Text style={s.statValue}>{mou.kpis.length}</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statLabel}>Evidence Files</Text>
              <Text style={s.statValue}>{evidence.files.length}</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statLabel}>SROI Ratio</Text>
              <Text style={[s.statValue, s.statHighlight]}>
                {sroi.calculatedRatio
                  ? `${sroi.calculatedRatio}:1`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Project Overview */}
        <View style={{ marginTop: 8 }}>
          <Text style={s.sectionTitle}>
            <Text style={s.sectionNumber}>2.</Text> Project Overview
          </Text>
          {details && (
            <View>
              {[
                ["Project Name", details.projectName],
                ["NGO / Partner", details.ngoName],
                ["Location", details.location],
                ["Duration", details.duration],
                ["Start Date", details.startDate],
                [
                  "Total Budget",
                  details.totalBudget
                    ? `Rs.${details.totalBudget.toLocaleString()}`
                    : "-",
                ],
              ].map(([label, val], i) => (
                <View
                  key={i}
                  style={[
                    s.tableRow,
                    i % 2 !== 0 ? s.tableRowAlt : {},
                  ]}
                >
                  <Text style={[s.tableCell, s.tableCellBold, { width: "40%" }]}>
                    {label}
                  </Text>
                  <Text style={[s.tableCell, { width: "60%" }]}>
                    {val || "-"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <PageFooter now={now} project={project} />
      </Page>

      {/* ---- Page 2: KPIs + Progress ---- */}
      {(mou.kpis.length > 0 || reports.progressData.length > 0) && (
        <Page size="A4" style={s.page}>
          {/* KPI Table */}
          {mou.kpis.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: navy, marginBottom: 8 }}>
                Key Performance Indicators ({mou.kpis.length})
              </Text>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderCell, { width: "8%" }]}>#</Text>
                <Text style={[s.tableHeaderCell, { width: "52%" }]}>KPI</Text>
                <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "right" }]}>
                  Target
                </Text>
                <Text style={[s.tableHeaderCell, { width: "20%" }]}>Unit</Text>
              </View>
              {mou.kpis.map((kpi, i) => (
                <View
                  key={i}
                  style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { width: "8%", color: gray }]}>
                    {i + 1}
                  </Text>
                  <Text style={[s.tableCell, { width: "52%" }]}>{kpi.name}</Text>
                  <Text
                    style={[
                      s.tableCell,
                      s.tableCellBold,
                      { width: "20%", textAlign: "right" },
                    ]}
                  >
                    {kpi.targetValue.toLocaleString()}
                  </Text>
                  <Text style={[s.tableCell, { width: "20%", color: gray }]}>
                    {kpi.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Progress & Achievement */}
          {reports.progressData.length > 0 && (
            <View>
              <Text style={s.sectionTitle}>
                <Text style={s.sectionNumber}>3.</Text> Progress & Achievement
              </Text>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderCell, { width: "35%" }]}>KPI</Text>
                <Text style={[s.tableHeaderCell, { width: "15%", textAlign: "right" }]}>
                  Target
                </Text>
                <Text style={[s.tableHeaderCell, { width: "15%", textAlign: "right" }]}>
                  Actual
                </Text>
                <Text style={[s.tableHeaderCell, { width: "15%", textAlign: "right" }]}>
                  %
                </Text>
                <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "center" }]}>
                  Status
                </Text>
              </View>
              {reports.progressData.map((pd, i) => (
                <View key={i}>
                  <View style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
                    <Text style={[s.tableCell, { width: "35%" }]}>
                      {pd.kpiName}
                    </Text>
                    <Text style={[s.tableCell, { width: "15%", textAlign: "right", color: gray }]}>
                      {pd.targetValue.toLocaleString()}
                    </Text>
                    <Text style={[s.tableCell, s.tableCellBold, { width: "15%", textAlign: "right" }]}>
                      {pd.currentValue.toLocaleString()}
                    </Text>
                    <Text style={[s.tableCell, s.tableCellBold, { width: "15%", textAlign: "right" }]}>
                      {pd.percentageAchieved}%
                    </Text>
                    <View style={{ width: "20%", justifyContent: "center", alignItems: "center", paddingVertical: 5 }}>
                      <Text
                        style={[
                          s.badge,
                          {
                            backgroundColor: statusColors[pd.status]?.bg ?? "#F1F5F9",
                            color: statusColors[pd.status]?.text ?? gray,
                          },
                        ]}
                      >
                        {pd.status}
                      </Text>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View style={[s.progressBarBg, { marginHorizontal: 8 }]}>
                    <View
                      style={{
                        height: 6,
                        borderRadius: 3,
                        width: `${Math.min(pd.percentageAchieved, 100)}%`,
                        backgroundColor:
                          statusColors[pd.status]?.text ?? gray,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          <PageFooter now={now} project={project} />
        </Page>
      )}

      {/* ---- Page 3: Evidence + SROI ---- */}
      <Page size="A4" style={s.page}>
        {/* Evidence Summary */}
        {evidence.files.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={s.sectionTitle}>
              <Text style={s.sectionNumber}>4.</Text> Evidence Summary
            </Text>
            <Text style={s.bodyText}>
              {evidence.files.length} evidence file(s) collected across{" "}
              {evidence.files.filter((f) => f.fileType === "survey").length}{" "}
              survey(s),{" "}
              {evidence.files.filter((f) => f.fileType === "photo").length}{" "}
              photo(s), and{" "}
              {evidence.files.filter((f) => f.fileType === "document").length}{" "}
              document(s).
            </Text>

            {evidence.validationResults.length > 0 && (
              <View>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { width: "30%" }]}>KPI</Text>
                  <Text style={[s.tableHeaderCell, { width: "17%", textAlign: "right" }]}>
                    Reported
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "17%", textAlign: "right" }]}>
                    Evidence
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "16%", textAlign: "right" }]}>
                    Match
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "center" }]}>
                    Status
                  </Text>
                </View>
                {evidence.validationResults.map((vr, i) => (
                  <View
                    key={i}
                    style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}
                  >
                    <Text style={[s.tableCell, { width: "30%" }]}>
                      {vr.kpiName}
                    </Text>
                    <Text style={[s.tableCell, { width: "17%", textAlign: "right", color: gray }]}>
                      {vr.reportedValue.toLocaleString()}
                    </Text>
                    <Text style={[s.tableCell, s.tableCellBold, { width: "17%", textAlign: "right" }]}>
                      {vr.evidenceValue?.toLocaleString() ?? "-"}
                    </Text>
                    <Text style={[s.tableCell, { width: "16%", textAlign: "right" }]}>
                      {vr.matchPercentage != null ? `${vr.matchPercentage}%` : "-"}
                    </Text>
                    <View style={{ width: "20%", justifyContent: "center", alignItems: "center", paddingVertical: 5 }}>
                      <Text
                        style={[
                          s.badge,
                          {
                            backgroundColor: statusColors[vr.status]?.bg ?? "#F1F5F9",
                            color: statusColors[vr.status]?.text ?? gray,
                          },
                        ]}
                      >
                        {vr.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SROI Analysis */}
        {sroi.calculatedRatio !== null && (
          <View>
            <Text style={s.sectionTitle}>
              <Text style={s.sectionNumber}>5.</Text> SROI Analysis
            </Text>

            <View style={s.investmentBox}>
              <Text style={{ fontSize: 9, color: gray }}>
                Total Investment:
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: navy }}>
                Rs.{sroi.investment.toLocaleString()}
              </Text>
            </View>

            {/* Outcomes table */}
            {sroi.outcomes.length > 0 && (
              <View>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { width: "30%" }]}>
                    Outcome
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "right" }]}>
                    Achieved
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "right" }]}>
                    Value (Rs.)
                  </Text>
                  <Text style={[s.tableHeaderCell, { width: "30%" }]}>
                    Method
                  </Text>
                </View>
                {sroi.outcomes.map((o, i) => (
                  <View
                    key={i}
                    style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}
                  >
                    <Text style={[s.tableCell, { width: "30%" }]}>
                      {o.kpiName}
                    </Text>
                    <Text style={[s.tableCell, { width: "20%", textAlign: "right", color: gray }]}>
                      {o.achievedValue.toLocaleString()} {o.unit}
                    </Text>
                    <Text style={[s.tableCell, s.tableCellBold, { width: "20%", textAlign: "right" }]}>
                      Rs.{o.monetizedValue.toLocaleString()}
                    </Text>
                    <Text style={[s.tableCell, { width: "30%", fontSize: 7, color: gray }]}>
                      {o.monetizationMethod || "-"}
                    </Text>
                  </View>
                ))}
                {/* Total row */}
                <View style={[s.tableRow, { backgroundColor: lightBg }]}>
                  <Text style={[s.tableCell, s.tableCellBold, { width: "50%" }]}>
                    Gross Outcome Value
                  </Text>
                  <Text style={[s.tableCell, s.tableCellBold, { width: "20%", textAlign: "right" }]}>
                    Rs.
                    {sroi.outcomes
                      .reduce((sum, o) => sum + o.monetizedValue, 0)
                      .toLocaleString()}
                  </Text>
                  <Text style={[s.tableCell, { width: "30%" }]} />
                </View>
              </View>
            )}

            {/* Adjustments */}
            <View style={s.adjRow}>
              {[
                { label: "Deadweight", value: sroi.adjustments.deadweight },
                { label: "Attribution", value: sroi.adjustments.attribution },
                { label: "Drop-off", value: sroi.adjustments.dropoff },
              ].map((adj, i) => (
                <View key={i} style={s.adjBox}>
                  <Text style={s.adjLabel}>{adj.label}</Text>
                  <Text style={s.adjValue}>{adj.value}%</Text>
                </View>
              ))}
            </View>

            {/* SROI highlight */}
            <View style={s.sroiBox}>
              <Text style={s.sroiLabel}>Social Return on Investment</Text>
              <Text style={s.sroiValue}>
                Rs.{sroi.calculatedRatio.toFixed(2)}
              </Text>
              <Text style={s.sroiSub}>
                For every Rs.1 invested, Rs.{sroi.calculatedRatio.toFixed(2)} of
                social value was created
              </Text>
            </View>
          </View>
        )}

        {/* Conclusion */}
        <View style={{ marginTop: 24 }}>
          <Text style={s.sectionTitle}>
            <Text style={s.sectionNumber}>6.</Text> Conclusion
          </Text>
          <Text style={s.bodyText}>
            {`The ${details?.projectName ?? project.name} project ${
              reports.progressData.length > 0
                ? `tracked ${reports.progressData.length} key performance indicators, with ${
                    reports.progressData.filter((p) => p.status === "on-track")
                      .length
                  } achieving on-track status`
                : "has been assessed"
            }. ${
              evidence.files.length > 0
                ? `Field evidence comprising ${evidence.files.length} file(s) was collected and validated${
                    verifiedCount > 0
                      ? `, with ${verifiedCount} indicator(s) independently verified`
                      : ""
                  }. `
                : ""
            }${
              sroi.calculatedRatio
                ? `The SROI analysis demonstrates a return of Rs.${sroi.calculatedRatio.toFixed(
                    2
                  )} for every Rs.1 invested, confirming the programme's positive social impact.`
                : "Further data collection will enable a comprehensive SROI calculation."
            }`}
          </Text>
          <Text style={{ fontSize: 8, color: gray, marginTop: 8 }}>
            Report generated on {now} using the GLAD CSR Impact Assessment
            Platform.
          </Text>
        </View>

        <PageFooter now={now} project={project} />
      </Page>
    </Document>
  );
}

function PageFooter({ now, project }: { now: string; project: Project }) {
  return (
    <View style={s.footer} fixed>
      <Text>GLAD CSR Impact Assessment Platform</Text>
      <Text>{project.name} — {now}</Text>
    </View>
  );
}
