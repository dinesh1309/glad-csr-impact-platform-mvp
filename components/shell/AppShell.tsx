"use client";

import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { AIStatusIndicator } from "./AIStatusIndicator";
import { StageStepper } from "./StageStepper";
import { StageContainer } from "./StageContainer";
import { MoUUpload } from "@/components/stage1-mou/MoUUpload";
import { ReportUpload } from "@/components/stage2-progress/ReportUpload";
import { EvidenceUpload } from "@/components/stage3-evidence/EvidenceUpload";

export function AppShell() {
  const project = useStore((s) => s.getActiveProject());
  const goToDashboard = useStore((s) => s.goToDashboard);
  const goToStage = useStore((s) => s.goToStage);
  const nextStage = useStore((s) => s.nextStage);
  const prevStage = useStore((s) => s.prevStage);
  const directionRef = useRef(1);

  if (!project) return null;

  const handleGoToStage = (stage: 1 | 2 | 3 | 4 | 5) => {
    directionRef.current = stage > project.currentStage ? 1 : -1;
    goToStage(stage);
  };

  const handleNext = () => {
    directionRef.current = 1;
    nextStage();
  };

  const handlePrev = () => {
    directionRef.current = -1;
    prevStage();
  };

  // Stage completion checks for enabling "Continue"
  const canContinue: Record<number, boolean> = {
    1: project.mou.isConfirmed,
    2: project.reports.progressData.length > 0,
    3: project.evidence.files.length > 0,
    4: project.sroi.calculatedRatio !== null,
    5: false,
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Projects</span>
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-heading text-base font-semibold text-white truncate max-w-[40%]">
            {project.name}
          </h1>
          <AIStatusIndicator />
        </div>
      </header>

      {/* Stage Stepper */}
      <StageStepper project={project} onGoToStage={handleGoToStage} />

      {/* Stage Content */}
      <StageContainer
        stageNumber={project.currentStage}
        onBack={project.currentStage > 1 ? handlePrev : undefined}
        onContinue={project.currentStage < 5 ? handleNext : undefined}
        canContinue={canContinue[project.currentStage]}
        direction={directionRef.current}
      >
        {project.currentStage === 1 ? (
          <MoUUpload />
        ) : project.currentStage === 2 ? (
          <ReportUpload />
        ) : project.currentStage === 3 ? (
          <EvidenceUpload />
        ) : (
          <StagePlaceholder stage={project.currentStage} />
        )}
      </StageContainer>
    </div>
  );
}

function StagePlaceholder({ stage }: { stage: number }) {
  const labels = {
    1: "MoU Upload",
    2: "Progress Reports",
    3: "Field Evidence",
    4: "SROI Calculation",
    5: "Report Generation",
  };
  const colors = {
    1: "border-stage-1 text-stage-1",
    2: "border-stage-2 text-stage-2",
    3: "border-stage-3 text-stage-3",
    4: "border-stage-4 text-stage-4",
    5: "border-stage-5 text-stage-5",
  };

  return (
    <div
      className={`flex min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed ${colors[stage as keyof typeof colors]}`}
    >
      <div className="text-center">
        <p className="text-lg font-semibold">
          {labels[stage as keyof typeof labels]}
        </p>
        <p className="mt-1 text-sm text-muted">
          This module will be built in Step {stage + 3}
        </p>
      </div>
    </div>
  );
}
