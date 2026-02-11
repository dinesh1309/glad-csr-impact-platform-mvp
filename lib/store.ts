import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Project,
  AppView,
  MoUData,
  ReportsData,
  EvidenceData,
  SROIData,
  ReportData,
  StageStatus,
  AdjustmentFactors,
} from "./types";

// ----- Default Data Factories -----

const defaultStageStatus: StageStatus = {
  stage1Complete: false,
  stage2Complete: false,
  stage3Complete: false,
  stage4Complete: false,
  stage5Complete: false,
};

const defaultMoU: MoUData = {
  fileName: null,
  uploadedAt: null,
  projectDetails: null,
  kpis: [],
  isConfirmed: false,
};

const defaultReports: ReportsData = {
  files: [],
  progressData: [],
};

const defaultEvidence: EvidenceData = {
  files: [],
  validationResults: [],
};

const defaultAdjustments: AdjustmentFactors = {
  deadweight: 15,
  attribution: 20,
  dropoff: 10,
};

const defaultSROI: SROIData = {
  investment: 0,
  outcomes: [],
  adjustments: defaultAdjustments,
  calculatedRatio: null,
};

const defaultReport: ReportData = {
  generatedAt: null,
};

function createProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    ngoName: null,
    createdAt: now,
    updatedAt: now,
    currentStage: 1,
    stageStatus: { ...defaultStageStatus },
    mou: { ...defaultMoU },
    reports: { ...defaultReports },
    evidence: { ...defaultEvidence },
    sroi: { ...defaultSROI, adjustments: { ...defaultAdjustments } },
    report: { ...defaultReport },
  };
}

// ----- Store Interface -----

interface AppStore {
  // Top-level state
  projects: Project[];
  activeProjectId: string | null;
  view: AppView;

  // Project management
  createProject: (name: string) => string; // returns project ID
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  goToDashboard: () => void;

  // Active project helpers
  getActiveProject: () => Project | null;
  updateActiveProject: (updater: (project: Project) => Project) => void;

  // Stage navigation (operates on active project)
  goToStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  nextStage: () => void;
  prevStage: () => void;

  // Reset
  resetProject: (id: string) => void;
}

// ----- Store Implementation -----

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      view: "dashboard",

      createProject: (name: string) => {
        const project = createProject(name);
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
          view: "project",
        }));
        return project.id;
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
          view: state.activeProjectId === id ? "dashboard" : state.view,
        }));
      },

      openProject: (id: string) => {
        set({ activeProjectId: id, view: "project" });
      },

      goToDashboard: () => {
        set({ activeProjectId: null, view: "dashboard" });
      },

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId) ?? null;
      },

      updateActiveProject: (updater) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...updater(p), updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      goToStage: (stage) => {
        const project = get().getActiveProject();
        if (!project) return;

        // Can only go to stages <= current + 1 (if previous is complete)
        const maxAllowed = project.currentStage + 1;
        if (stage > maxAllowed || stage < 1 || stage > 5) return;

        get().updateActiveProject((p) => ({
          ...p,
          currentStage: stage as 1 | 2 | 3 | 4 | 5,
        }));
      },

      nextStage: () => {
        const project = get().getActiveProject();
        if (!project || project.currentStage >= 5) return;
        const next = (project.currentStage + 1) as 1 | 2 | 3 | 4 | 5;
        get().goToStage(next);
      },

      prevStage: () => {
        const project = get().getActiveProject();
        if (!project || project.currentStage <= 1) return;
        const prev = (project.currentStage - 1) as 1 | 2 | 3 | 4 | 5;
        get().goToStage(prev);
      },

      resetProject: (id: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            return {
              ...p,
              currentStage: 1 as const,
              stageStatus: { ...defaultStageStatus },
              mou: { ...defaultMoU },
              reports: { ...defaultReports },
              evidence: { ...defaultEvidence },
              sroi: { ...defaultSROI, adjustments: { ...defaultAdjustments } },
              report: { ...defaultReport },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: "csr-impact-store",
      // Don't persist blobs or large transient data
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        view: state.view,
      }),
    }
  )
);
