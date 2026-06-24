"use client";

import React, { useState } from "react";
import {
  Activity,
  ScheduleDay,
  Assignment,
  UnscheduledActivity,
} from "../../libs/types";
import { distributeActivities } from "@/libs/schedularEngine";
import SchedulerSidebar from "@/components/SchedureSidebar";
import HorizontalCalendar from "@/components/ScheduleTable";
import { exportDynamicEngineToExcel } from "@/utils/excelExport";

export default function SchedulerPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Example seed input data
  const [userDays, setUserDays] = useState<ScheduleDay[]>([
    { date: "2026-07-06", maxCapacity: 1 },
    { date: "2026-07-07", maxCapacity: 1 },
    { date: "2026-07-08", maxCapacity: 1 },
    { date: "2026-07-09", maxCapacity: 1 },
    { date: "2026-07-10", maxCapacity: 1 },
    { date: "2026-07-13", maxCapacity: 1 },
    { date: "2026-07-14", maxCapacity: 1 },
  ]);
  const [totalDays, setTotalDays] = useState<number>(7); // Default to a standard week
  const generateDynamicDays = (startStr: string, lengthCount: number) => {
    if (!startStr) return;

    const baseDate = new Date(startStr);

    setUserDays((prev) => {
      return Array.from({ length: lengthCount }).map((_, index) => {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + index);

        const isoString = nextDate.toISOString().split("T")[0];
        const existingDay = prev.find((d) => d.date === isoString);

        return {
          date: isoString,
          maxCapacity: existingDay ? existingDay.maxCapacity : 2,
        };
      });
    });
  };

  const [activities, setActivities] = useState<Activity[]>([]);

  const [scheduleResult, setScheduleResult] = useState<{
    assignments: Assignment[];
    unscheduled: UnscheduledActivity[];
  }>({ assignments: [], unscheduled: [] });

  const handleGenerate = () => {
    const output = distributeActivities(activities, userDays);
    console.log(activities);
    console.log(scheduleResult.assignments);
    setScheduleResult(output);
    setIsSidebarOpen(false);
  };
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 relative">
      {/* 1. MOBILE BACKDROP GLASS SHIELD LAYER */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* 2. SIDEBAR PANELS DESIGN: Responsive Fixed Slide-out & Desktop Standard Anchor */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform lg:static lg:transform-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <SchedulerSidebar
          generateDynamicDays={generateDynamicDays}
          setTotalDays={setTotalDays}
          totalDays={totalDays}
          activities={activities}
          setActivities={setActivities}
          userDays={userDays}
          setUserDays={setUserDays}
          onGenerate={handleGenerate}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* 3. MAIN WORKSPACE APP PANEL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex flex-1 items-center gap-3">
            {/* Mobile Responsive Menu Control Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden focus:outline-hidden"
            >
              ☰
            </button>
            <h1 className="text-base lg:text-lg font-bold text-gray-900">
              Workspace Workspace
            </h1>
          </div>
          {/* EXCEL DOWNLOAD BUTTON */}
          <button
            onClick={() => exportDynamicEngineToExcel(userDays, scheduleResult)}
            disabled={scheduleResult.assignments.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs"
          >
            📊 Export Horizontal Excel
          </button>
          <div className="text-[11px] font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-500">
            v1.0-2026
          </div>
        </header>

        {/* Dynamic Display Board Target Layout View */}
        <section className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <HorizontalCalendar
            userDays={userDays}
            assignments={scheduleResult.assignments}
            unscheduled={scheduleResult.unscheduled}
          />
        </section>
      </main>
    </div>
  );
}
