"use client";

import { Check } from "lucide-react";
import type { Project } from "@/lib/types";

const STAGES = [
  { num: 1, label: "MoU Upload" },
  { num: 2, label: "Reports" },
  { num: 3, label: "Evidence" },
  { num: 4, label: "SROI" },
  { num: 5, label: "Report" },
] as const;

const STAGE_COLORS: Record<number, string> = {
  1: "bg-stage-1",
  2: "bg-stage-2",
  3: "bg-stage-3",
  4: "bg-stage-4",
  5: "bg-stage-5",
};

const STAGE_BORDER_COLORS: Record<number, string> = {
  1: "border-stage-1",
  2: "border-stage-2",
  3: "border-stage-3",
  4: "border-stage-4",
  5: "border-stage-5",
};

interface StageStepperProps {
  project: Project;
  onGoToStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
}

function isStageComplete(project: Project, stageNum: number): boolean {
  const key = `stage${stageNum}Complete` as keyof typeof project.stageStatus;
  return project.stageStatus[key];
}

export function StageStepper({ project, onGoToStage }: StageStepperProps) {
  return (
    <div className="border-b border-border bg-white py-5">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6">
        {STAGES.map((stage, i) => {
          const completed = isStageComplete(project, stage.num);
          const isCurrent = project.currentStage === stage.num;
          const isLocked =
            !completed && !isCurrent && stage.num > project.currentStage;
          const isClickable = !isLocked;

          return (
            <div key={stage.num} className="flex items-center flex-1 last:flex-initial">
              {/* Stage circle + label */}
              <button
                onClick={() => isClickable && onGoToStage(stage.num as 1 | 2 | 3 | 4 | 5)}
                disabled={isLocked}
                className={`flex flex-col items-center gap-1.5 group ${
                  isClickable ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    completed
                      ? "bg-success text-white"
                      : isCurrent
                        ? `${STAGE_COLORS[stage.num]} text-white shadow-md`
                        : "border-2 border-slate-300 bg-white text-slate-400"
                  } ${
                    isCurrent ? "ring-4 ring-offset-2 ring-opacity-30 " + STAGE_BORDER_COLORS[stage.num].replace("border-", "ring-") : ""
                  }`}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stage.num
                  )}
                </div>
                <span
                  className={`text-[13px] hidden md:block ${
                    completed || isCurrent
                      ? "font-semibold text-dark"
                      : "font-normal text-slate-400"
                  }`}
                >
                  {stage.label}
                </span>
              </button>

              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-0.5 w-full ${
                      completed
                        ? "bg-success"
                        : isCurrent
                          ? "bg-gradient-to-r from-success to-slate-300"
                          : "border-t-2 border-dashed border-slate-300"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
