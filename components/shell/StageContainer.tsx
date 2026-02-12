"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STAGE_TITLES: Record<number, { title: string; description: string }> = {
  1: {
    title: "MoU Upload & KPI Extraction",
    description:
      "Upload your Memorandum of Understanding to extract project details and KPIs.",
  },
  2: {
    title: "Progress Report Matching",
    description:
      "Upload progress reports to track KPI achievement over time.",
  },
  3: {
    title: "Field Evidence Validation",
    description:
      "Upload field evidence to validate your reported progress data.",
  },
  4: {
    title: "SROI Calculation",
    description:
      "Calculate the Social Return on Investment from your project outcomes.",
  },
  5: {
    title: "Impact Report Generation",
    description:
      "Generate a professional PDF report summarizing your CSR impact.",
  },
};

interface StageContainerProps {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  direction?: number; // 1 = forward, -1 = backward
}

export function StageContainer({
  stageNumber,
  children,
  onBack,
  onContinue,
  canContinue = false,
  direction = 1,
}: StageContainerProps) {
  const { title, description } = STAGE_TITLES[stageNumber];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-heading text-[22px] font-semibold text-dark">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <span className="rounded-full bg-light-gray px-3 py-1 text-xs font-medium text-muted">
          Stage {stageNumber} of 5
        </span>
      </div>

      {/* Stage content with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stageNumber}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="min-h-[400px]"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-end gap-3">
        {stageNumber > 1 && onBack && (
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {stageNumber < 5 && onContinue && (
          <Button onClick={onContinue} disabled={!canContinue}>
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
