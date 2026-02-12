"use client";

import type { Project } from "@/lib/types";

interface ReportPreviewProps {
  project: Project;
}

export function ReportPreview({ project }: ReportPreviewProps) {
  const { mou, reports, evidence, sroi } = project;
  const details = mou.projectDetails;
  const now = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Build executive summary
  const topKpi = reports.progressData.length > 0
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
      ? ` The analysis yields an SROI ratio of ${sroi.calculatedRatio}:1, indicating that every ₹1 invested generated ₹${sroi.calculatedRatio.toFixed(2)} in social value.`
      : ""
  }`;

  const verifiedCount = evidence.validationResults.filter(
    (v) => v.status === "verified"
  ).length;

  return (
    <div className="mx-auto max-w-[800px] space-y-0 overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* ====== Cover Page ====== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-12 py-16">
        {/* Geometric pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative space-y-6">
          <div className="inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium tracking-wider text-white/60 uppercase">
            Impact Assessment
          </div>
          <h1 className="font-heading text-[32px] font-bold leading-tight text-white">
            Impact Assessment Report
          </h1>
          <p className="text-lg font-medium text-teal">
            {details?.projectName ?? project.name}
          </p>
          <div className="space-y-1 pt-4 text-sm text-white/50">
            <p>Assessment Date: {now}</p>
            {details?.ngoName && <p>Implementing Partner: {details.ngoName}</p>}
            {details?.location && <p>Location: {details.location}</p>}
            {details?.duration && <p>Duration: {details.duration}</p>}
          </div>
        </div>
      </section>

      {/* ====== Executive Summary ====== */}
      <ReportSection title="Executive Summary" number={1}>
        <p className="leading-relaxed text-body">{executiveSummary}</p>

        {/* Quick stats row */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatCard
            label="KPIs Tracked"
            value={mou.kpis.length.toString()}
          />
          <StatCard
            label="Evidence Files"
            value={evidence.files.length.toString()}
          />
          <StatCard
            label="SROI Ratio"
            value={sroi.calculatedRatio ? `${sroi.calculatedRatio}:1` : "N/A"}
            highlight
          />
        </div>
      </ReportSection>

      {/* ====== Project Overview ====== */}
      <ReportSection title="Project Overview" number={2}>
        {details && (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Project Name", details.projectName],
                  ["NGO / Partner", details.ngoName],
                  ["Location", details.location],
                  ["Duration", details.duration],
                  ["Start Date", details.startDate],
                  [
                    "Total Budget",
                    details.totalBudget
                      ? `₹${details.totalBudget.toLocaleString()}`
                      : "—",
                  ],
                ].map(([label, val], i) => (
                  <tr
                    key={label}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                  >
                    <td className="px-4 py-2.5 font-medium text-dark">
                      {label}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{val || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mou.kpis.length > 0 && (
          <>
            <h4 className="mt-6 text-sm font-semibold text-dark">
              Key Performance Indicators ({mou.kpis.length})
            </h4>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-4 py-2.5 text-left font-medium">#</th>
                    <th className="px-4 py-2.5 text-left font-medium">KPI</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Target
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {mou.kpis.map((kpi, i) => (
                    <tr
                      key={kpi.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                    >
                      <td className="px-4 py-2 text-muted">{i + 1}</td>
                      <td className="px-4 py-2 text-dark">{kpi.name}</td>
                      <td className="px-4 py-2 text-right font-medium text-dark">
                        {kpi.targetValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-muted">{kpi.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ReportSection>

      {/* ====== Progress & Achievement ====== */}
      {reports.progressData.length > 0 && (
        <ReportSection title="Progress & Achievement" number={3}>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F172A] text-white">
                  <th className="px-4 py-2.5 text-left font-medium">KPI</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Target
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Actual
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">%</th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.progressData.map((pd, i) => (
                  <tr
                    key={pd.kpiId}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                  >
                    <td className="px-4 py-2 text-dark">{pd.kpiName}</td>
                    <td className="px-4 py-2 text-right text-muted">
                      {pd.targetValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-dark">
                      {pd.currentValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-dark">
                      {pd.percentageAchieved}%
                    </td>
                    <td className="px-4 py-2 text-center">
                      <StatusBadge status={pd.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Progress bars */}
          <div className="mt-6 space-y-3">
            {reports.progressData.map((pd) => (
              <div key={pd.kpiId}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-dark">{pd.kpiName}</span>
                  <span className="font-medium text-dark">
                    {pd.percentageAchieved}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-light-gray">
                  <div
                    className={`h-full rounded-full ${
                      pd.status === "on-track"
                        ? "bg-success"
                        : pd.status === "at-risk"
                          ? "bg-warning"
                          : "bg-danger"
                    }`}
                    style={{
                      width: `${Math.min(pd.percentageAchieved, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* ====== Evidence Summary ====== */}
      {evidence.files.length > 0 && (
        <ReportSection title="Evidence Summary" number={4}>
          <p className="mb-4 text-sm text-muted">
            {evidence.files.length} evidence file(s) collected across{" "}
            {evidence.files.filter((f) => f.fileType === "survey").length}{" "}
            survey(s),{" "}
            {evidence.files.filter((f) => f.fileType === "photo").length}{" "}
            photo(s), and{" "}
            {evidence.files.filter((f) => f.fileType === "document").length}{" "}
            document(s).
          </p>

          {evidence.validationResults.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-4 py-2.5 text-left font-medium">KPI</th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Reported
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Evidence
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Match
                    </th>
                    <th className="px-4 py-2.5 text-center font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.validationResults.map((vr, i) => (
                    <tr
                      key={vr.kpiId}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                    >
                      <td className="px-4 py-2 text-dark">{vr.kpiName}</td>
                      <td className="px-4 py-2 text-right text-muted">
                        {vr.reportedValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-dark">
                        {vr.evidenceValue?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-dark">
                        {vr.matchPercentage != null
                          ? `${vr.matchPercentage}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <ValidationBadge status={vr.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
              {verifiedCount} verified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
              {
                evidence.validationResults.filter(
                  (v) => v.status === "discrepancy"
                ).length
              }{" "}
              discrepancies
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted" />
              {
                evidence.validationResults.filter(
                  (v) => v.status === "no-evidence"
                ).length
              }{" "}
              no evidence
            </span>
          </div>
        </ReportSection>
      )}

      {/* ====== SROI Analysis ====== */}
      {sroi.calculatedRatio !== null && (
        <ReportSection title="SROI Analysis" number={5}>
          {/* Investment */}
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-[#F8FAFC] px-4 py-3">
            <span className="text-sm text-muted">Total Investment:</span>
            <span className="text-lg font-bold text-dark">
              ₹{sroi.investment.toLocaleString()}
            </span>
          </div>

          {/* Outcomes table */}
          {sroi.outcomes.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-4 py-2.5 text-left font-medium">
                      Outcome
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Achieved
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      Value (₹)
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sroi.outcomes.map((o, i) => (
                    <tr
                      key={o.kpiId}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                    >
                      <td className="px-4 py-2 text-dark">{o.kpiName}</td>
                      <td className="px-4 py-2 text-right text-muted">
                        {o.achievedValue.toLocaleString()} {o.unit}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-dark">
                        ₹{o.monetizedValue.toLocaleString()}
                      </td>
                      <td className="max-w-[200px] px-4 py-2 text-xs leading-tight text-muted">
                        {o.monetizationMethod || "—"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-[#F8FAFC] font-semibold">
                    <td className="px-4 py-2.5 text-dark">
                      Gross Outcome Value
                    </td>
                    <td />
                    <td className="px-4 py-2.5 text-right text-dark">
                      ₹
                      {sroi.outcomes
                        .reduce((s, o) => s + o.monetizedValue, 0)
                        .toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Adjustments */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-dark">
              Adjustment Factors
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Deadweight", value: sroi.adjustments.deadweight },
                { label: "Attribution", value: sroi.adjustments.attribution },
                { label: "Drop-off", value: sroi.adjustments.dropoff },
              ].map((adj) => (
                <div
                  key={adj.label}
                  className="rounded-lg border border-border px-4 py-3 text-center"
                >
                  <p className="text-xs text-muted">{adj.label}</p>
                  <p className="text-lg font-semibold text-dark">
                    {adj.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SROI Highlight Box */}
          <div className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 text-center">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.12) 0%, transparent 60%)",
              }}
            />
            <p className="text-sm font-medium text-white/60">
              Social Return on Investment
            </p>
            <p className="mt-2 font-heading text-[40px] font-bold leading-none text-[#F59E0B]">
              ₹{sroi.calculatedRatio.toFixed(2)}
            </p>
            <p className="mt-3 text-sm text-white/70">
              For every{" "}
              <span className="font-semibold text-white">₹1</span> invested,{" "}
              <span className="font-bold text-[#F59E0B]">
                ₹{sroi.calculatedRatio.toFixed(2)}
              </span>{" "}
              of social value was created
            </p>
          </div>
        </ReportSection>
      )}

      {/* ====== Conclusion ====== */}
      <ReportSection title="Conclusion" number={6} isLast>
        <p className="leading-relaxed text-body">
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
              ? `The SROI analysis demonstrates a return of ₹${sroi.calculatedRatio.toFixed(
                  2
                )} for every ₹1 invested, confirming the programme's positive social impact.`
              : "Further data collection will enable a comprehensive SROI calculation."
          }`}
        </p>
        <p className="mt-4 text-xs text-muted">
          Report generated on {now} using the GLAD CSR Impact Assessment
          Platform.
        </p>
      </ReportSection>
    </div>
  );
}

/* ---- Helper Components ---- */

function ReportSection({
  title,
  number,
  isLast,
  children,
}: {
  title: string;
  number: number;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`px-12 py-8 ${!isLast ? "border-b border-border" : ""}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-teal" />
        <h2 className="font-heading text-xl font-semibold text-dark">
          {number}. {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border px-4 py-3 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          highlight ? "text-[#D97706]" : "text-dark"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "on-track": "bg-success/10 text-success",
    "at-risk": "bg-warning/10 text-warning",
    behind: "bg-danger/10 text-danger",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status as keyof typeof styles] ?? "bg-muted/10 text-muted"
      }`}
    >
      {status}
    </span>
  );
}

function ValidationBadge({ status }: { status: string }) {
  const styles = {
    verified: "bg-success/10 text-success",
    discrepancy: "bg-warning/10 text-warning",
    "no-evidence": "bg-muted/10 text-muted",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status as keyof typeof styles] ?? "bg-muted/10 text-muted"
      }`}
    >
      {status}
    </span>
  );
}
