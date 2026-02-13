"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICard } from "./KPICard";
import type { KPI } from "@/lib/types";

const CATEGORIES: { key: KPI["category"]; label: string; description: string; dot: string }[] = [
  { key: "output", label: "Outputs", description: "Activities and deliverables", dot: "bg-teal" },
  { key: "outcome", label: "Outcomes", description: "Immediate results and changes", dot: "bg-success" },
  { key: "impact", label: "Impact", description: "Long-term systemic change", dot: "bg-gold" },
];

interface KPIListProps {
  kpis: KPI[];
  isLocked: boolean;
  onUpdate: (kpis: KPI[]) => void;
}

function generateId() {
  return `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function KPIList({ kpis, isLocked, onUpdate }: KPIListProps) {
  const grouped = useMemo(() => {
    const map = new Map<KPI["category"], KPI[]>();
    for (const kpi of kpis) {
      const list = map.get(kpi.category) ?? [];
      list.push(kpi);
      map.set(kpi.category, list);
    }
    return map;
  }, [kpis]);

  const handleUpdateKPI = useCallback(
    (updated: KPI) => {
      onUpdate(kpis.map((k) => (k.id === updated.id ? updated : k)));
    },
    [kpis, onUpdate]
  );

  const handleDeleteKPI = useCallback(
    (id: string) => {
      onUpdate(kpis.filter((k) => k.id !== id));
    },
    [kpis, onUpdate]
  );

  const handleAddKPI = useCallback(() => {
    const newKPI: KPI = {
      id: generateId(),
      name: "",
      targetValue: 0,
      unit: "count",
      targetDate: null,
      category: "output",
    };
    onUpdate([...kpis, newKPI]);
  }, [kpis, onUpdate]);

  return (
    <div className="rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-teal" strokeWidth={1.5} />
          <h3 className="font-heading text-sm font-semibold text-dark">
            Key Performance Indicators
          </h3>
          <span className="rounded-full bg-light-gray px-2 py-0.5 text-xs font-medium text-muted">
            {kpis.length}
          </span>
        </div>
        {!isLocked && (
          <Button variant="outline" size="sm" onClick={handleAddKPI}>
            <Plus className="h-3.5 w-3.5" />
            Add KPI
          </Button>
        )}
      </div>

      {/* KPI grid */}
      <div className="p-4">
        {kpis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-10 w-10 text-slate-300" strokeWidth={1} />
            <p className="mt-3 text-sm font-medium text-dark">No KPIs yet</p>
            <p className="mt-1 text-xs text-muted">
              {isLocked
                ? "No KPIs were extracted from the document"
                : "Add KPIs manually or re-upload the MoU document"}
            </p>
            {!isLocked && (
              <Button variant="outline" size="sm" onClick={handleAddKPI} className="mt-4">
                <Plus className="h-3.5 w-3.5" />
                Add First KPI
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {CATEGORIES.map((cat) => {
              const items = grouped.get(cat.key);
              if (!items || items.length === 0) return null;
              return (
                <div key={cat.key}>
                  {/* Category header */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${cat.dot}`} />
                    <h4 className="text-sm font-semibold text-dark">{cat.label}</h4>
                    <span className="rounded-full bg-light-gray px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      {items.length}
                    </span>
                    <span className="text-xs text-muted">{cat.description}</span>
                  </div>
                  {/* Cards grid */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <AnimatePresence initial={false}>
                      {items.map((kpi) => (
                        <motion.div
                          key={kpi.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <KPICard
                            kpi={kpi}
                            isLocked={isLocked}
                            onUpdate={handleUpdateKPI}
                            onDelete={() => handleDeleteKPI(kpi.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
