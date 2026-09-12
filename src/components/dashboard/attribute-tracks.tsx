"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Heart, Wrench } from "lucide-react";
import type { ApiResponse, AttributeWithProgress } from "@/types";

const ATTR_CONFIG = {
  WISDOM: { icon: BookOpen, color: "bg-amber-warm", label: "Wisdom" },
  VITALITY: { icon: Heart, color: "bg-ember-light", label: "Vitality" },
  CRAFT: { icon: Wrench, color: "bg-green-muted", label: "Craft" },
} as const;

export function AttributeTracks() {
  const { data: attributes, isLoading } = useQuery({
    queryKey: ["attributes"],
    queryFn: async (): Promise<AttributeWithProgress[]> => {
      const res = await fetch("/api/attributes");
      const json: ApiResponse<AttributeWithProgress[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      return json.data!;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 skeleton-pulse rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-24 skeleton-pulse rounded-[4px] mb-2" />
                <div className="h-2.5 skeleton-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-brown-deep mb-4">Attributes</h2>
      <div className="space-y-4">
        {attributes?.map((attr) => {
          const config = ATTR_CONFIG[attr.name];
          const Icon = config.icon;
          return (
            <div key={attr.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-warm/15 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-brown-dark" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-brown-dark">{config.label}</span>
                  <span className="text-xs text-brown-soft font-mono">
                    Lv.{attr.level} · {attr.xp}/{attr.xpToNextLevel}
                  </span>
                </div>
                <div className="h-2 bg-amber-warm/15 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${config.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(attr.xpProgress * 100, 100)}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
