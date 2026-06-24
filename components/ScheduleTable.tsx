"use client";

import React, { useState } from "react";
import { ScheduleDay, Assignment } from "@/types/types";

interface ScheduleTableProps {
  userDays: ScheduleDay[];
  assignments: Assignment[];
  unscheduled: { activity: any; reason: string }[];
}

export default function ScheduleTable({
  userDays,
  assignments,
  unscheduled,
}: ScheduleTableProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  if (!userDays || userDays.length === 0) {
    return (
      <div className="text-gray-400 italic text-xs">
        No active timeline data found.
      </div>
    );
  }

  const firstDayDate = new Date(userDays[0].date);

  const paddingCellsNeeded = firstDayDate.getDay();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-5 w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
      {/* 1. ACTIONS VIEW CONTROLLERS */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Operational Timeline Board
          </h2>
          <p className="text-xs text-gray-400">
            View and track assignment matrix layouts
          </p>
        </div>

        {/* PILL MODE SELECTOR TOGGLE */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "week"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Weekly Row
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "month"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly Grid
          </button>
        </div>
      </div>

      {/* 2. RENDER THE CORRESPONDING VISUAL MATRIX */}
      {viewMode === "week" ? (
        /* --- STANDARD HORIZONTAL WEEK ROW VIEW --- */
        <div className="flex gap-3 overflow-x-auto pb-2">
          {userDays.slice(0, 7).map((day) => {
            const dayAssignments = assignments.filter(
              (asm) => asm.date === day.date,
            );
            const label = new Date(day.date).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
            });

            return (
              <div
                key={day.date}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-w-[140px] flex-1"
              >
                <span className="font-bold text-xs text-gray-700 block mb-2">
                  {label}
                </span>
                <div className="space-y-1">
                  {dayAssignments.map((asm) => (
                    <div
                      key={asm.activityId}
                      className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] p-1.5 rounded-md font-medium truncate"
                    >
                      {asm.clientName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- BRAND NEW CALENDAR MONTH MODE GRID --- */
        <div className="space-y-2">
          {/* GRID LABELS ROW HEADERS */}
          <div className="grid grid-cols-7 gap-2.5 text-center">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* MASTER MONTH DISPLAY GRID SECTIONS */}
          <div className="grid grid-cols-7 gap-2.5">
            {/* INJECT GREY DISABLED PADDING CELLS */}
            {Array.from({ length: paddingCellsNeeded }).map((_, index) => (
              <div
                key={`pad-${index}`}
                className="bg-gray-50/70 border border-dashed border-gray-100 rounded-xl min-h-[110px] opacity-40 pointer-events-none"
              />
            ))}

            {/* DYNAMIC MONTH DAYS GENERATED CELL SLOTS */}
            {userDays.map((day) => {
              const dayAssignments = assignments.filter(
                (asm) => asm.date === day.date,
              );
              const dateNumber = new Date(day.date).getDate();

              return (
                <div
                  key={day.date}
                  className="bg-white border border-gray-200 rounded-xl p-2.5 min-h-[110px] flex flex-col justify-between hover:border-blue-300 transition group shadow-2xs"
                >
                  {/* CELL TOP BADGE INFO */}
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-gray-400 group-hover:text-blue-600 transition">
                      {dateNumber}
                    </span>
                    <span className="text-[8px] px-1 bg-gray-100 rounded text-gray-400 font-mono">
                      cap:{day.maxCapacity}
                    </span>
                  </div>

                  {/* STACKED INTERACTIVE ASSIGNMENTS LIST ROWS */}
                  <div className="flex-1 mt-2 space-y-1 overflow-y-auto max-h-[64px] scrollbar-none">
                    {dayAssignments.map((asm) => (
                      <div
                        key={asm.activityId}
                        className="bg-blue-50/70 text-blue-700 border border-blue-100 text-[9px] px-1.5 py-0.5 rounded font-medium truncate"
                        title={asm.clientName}
                      >
                        {asm.clientName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ERROR LOGS AT FOOTER */}
      {unscheduled.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-rose-800">
            ⚠️ Allocation Unscheduled Alert Log
          </h4>
          <ul className="space-y-0.5">
            {unscheduled.map((u, i) => (
              <li key={i} className="text-[10px] text-rose-600 font-medium">
                • <strong>{u.activity.clientName}</strong>: {u.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
