import { BarChart3, FileText, Target, TrendingUp, Upload } from "lucide-react";

const stages = [
  { num: 1, label: "MoU Upload", icon: Upload, color: "bg-stage-1" },
  { num: 2, label: "Reports", icon: FileText, color: "bg-stage-2" },
  { num: 3, label: "Evidence", icon: Target, color: "bg-stage-3" },
  { num: 4, label: "SROI", icon: TrendingUp, color: "bg-stage-4" },
  { num: 5, label: "Report", icon: BarChart3, color: "bg-stage-5" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-offwhite">
      {/* Navy Header */}
      <header className="sticky top-0 z-50 h-16 bg-navy border-b border-white/10">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white font-heading">
              CSR Impact Assessment
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-muted animate-pulse" />
            AI: Connecting...
          </div>
        </div>
      </header>

      {/* Landing Content */}
      <main className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Hero */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            Platform Ready
          </div>
          <h2 className="mb-3 text-[28px] font-bold leading-tight tracking-[-0.02em] text-dark font-heading">
            CSR Impact Assessment Platform
          </h2>
          <p className="mb-12 max-w-lg text-base text-muted">
            Digitize your CSR impact assessment workflow — from MoU upload to
            SROI report generation. Manage multiple projects from a single
            dashboard.
          </p>

          {/* Stage Pipeline Preview */}
          <div className="mb-12 flex items-center gap-3">
            {stages.map((stage, i) => (
              <div key={stage.num} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stage.color} text-white shadow-sm`}
                  >
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {stage.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div className="mb-6 h-0.5 w-8 bg-border" />
                )}
              </div>
            ))}
          </div>

          {/* Design Token Test Cards */}
          <div className="grid w-full max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-2 text-2xl font-bold text-teal font-heading">
                5
              </div>
              <div className="text-sm text-muted">Assessment Stages</div>
            </div>
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-2 text-2xl font-bold text-gold font-heading">
                SROI
              </div>
              <div className="text-sm text-muted">Live Calculation</div>
            </div>
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="mb-2 text-2xl font-bold text-stage-5 font-heading">
                PDF
              </div>
              <div className="text-sm text-muted">Report Generation</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
