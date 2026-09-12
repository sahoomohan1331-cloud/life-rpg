"use client";

import { CharacterCard } from "@/components/dashboard/character-card";
import { AttributeTracks } from "@/components/dashboard/attribute-tracks";
import { TodayQuests } from "@/components/dashboard/today-quests";
import { MomentumHeatmap } from "@/components/dashboard/momentum-heatmap";
import { StudyRoom } from "@/components/room/study-room";
import type { Metadata } from "next";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-brown-deep">
        Dashboard
      </h1>

      {/* Top Row: Character + Room */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CharacterCard />
        <StudyRoom />
      </div>

      {/* Attributes */}
      <AttributeTracks />

      {/* Bottom Row: Today's Quests + Heatmap */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TodayQuests />
        <MomentumHeatmap />
      </div>
    </div>
  );
}
