"use client";

import React, { useEffect, useState } from "react";
import { Activity, ScheduleDay } from "@/types/types";

type ActiveTab = "craft" | "dayConfig" | "payload";
type RuleType = "none" | "gapDays" | "preferredDay" | "exclusiveFixedDate";

interface SchedulerSidebarProps {
  userDays: ScheduleDay[];
  setUserDays: React.Dispatch<React.SetStateAction<ScheduleDay[]>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  onGenerate: () => void;
  totalDays: number;
  setTotalDays: React.Dispatch<React.SetStateAction<number>>;
  generateDynamicDays: (startStr: string, lengthCount: number) => void;
  onClose?: () => void;
}

export default function SchedulerSidebar({
  userDays,
  setUserDays,
  activities,
  setActivities,
  onGenerate,
  totalDays,
  setTotalDays,
  generateDynamicDays,
  onClose,
}: SchedulerSidebarProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("craft");
  const [daysNeededValue, setDaysNeededValue] = useState<number>(1);
  const [hasDependency, setHasDependency] = useState<boolean>(false);
  const [dependencyTarget, setDependencyTarget] = useState<string>("");
  const [dependencyType, setDependencyType] = useState<"after" | "before">(
    "after",
  );
  const [startDate, setStartDate] = useState<string>("2026-07-06");
  const [isFillRemainingMode, setIsFillRemainingMode] =
    useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    activities[0] || null,
  );
  const [chosenRule, setChosenRule] = useState<RuleType>("none");
  const [inputValue, setInputValue] = useState<string>("0");
  useEffect(() => {
    if (!selectedActivity) return;

    setDaysNeededValue(selectedActivity.daysNeeded || 1);
    setIsFillRemainingMode(!!selectedActivity.fillRemaining);
    if (selectedActivity.dependsOnClient) {
      setHasDependency(true);
      setDependencyTarget(selectedActivity.dependsOnClient.clientName);
      setDependencyType(selectedActivity.dependsOnClient.type);
    } else {
      setHasDependency(false);
      const fallback = activities.find((a) => a.id !== selectedActivity.id);
      setDependencyTarget(fallback ? fallback.clientName : "");
      setDependencyType("after");
    }

    if (selectedActivity.gapDays !== undefined) {
      setChosenRule("gapDays");
      setInputValue(selectedActivity.gapDays.toString());
    } else if (selectedActivity.preferredDay !== undefined) {
      setChosenRule("preferredDay");
      setInputValue(selectedActivity.preferredDay.toString());
    } else if (selectedActivity.exclusiveFixedDate !== undefined) {
      setChosenRule("exclusiveFixedDate");
      setInputValue(selectedActivity.exclusiveFixedDate.toString());
    } else {
      setChosenRule("none");
      setInputValue("0");
    }
  }, [selectedActivity, activities]);
  const handleCreateNewClient = () => {
    const nameInput = prompt("Enter new client name:");
    if (!nameInput || nameInput.trim() === "") return;

    const newClient: Activity = {
      id: `act-${Date.now()}`,
      clientName: nameInput.trim(),
    };

    setActivities((prev) => [...prev, newClient]);
    setSelectedActivity(newClient);
    setIsDropdownOpen(false);
  };

  const handleInjectRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    const numericValue = parseInt(inputValue, 10) || 0;

    const updatedActivity = { ...selectedActivity };

    if (isFillRemainingMode) {
      updatedActivity.fillRemaining = true;
      delete updatedActivity.daysNeeded;
    } else {
      updatedActivity.daysNeeded = daysNeededValue;
      delete updatedActivity.fillRemaining;
    }

    if (hasDependency && dependencyTarget) {
      updatedActivity.dependsOnClient = {
        clientName: dependencyTarget,
        type: dependencyType, // "before" or "after"
      };
    } else {
      delete updatedActivity.dependsOnClient;
    }

    // 4. Process Optional Conditional Rule Modifiers
    // Clear old values first to prevent rule overlapping rulesets
    delete updatedActivity.gapDays;
    delete updatedActivity.preferredDay;
    delete updatedActivity.exclusiveFixedDate;

    if (chosenRule === "gapDays") {
      updatedActivity.gapDays = numericValue;
    } else if (chosenRule === "preferredDay") {
      updatedActivity.preferredDay = numericValue;
    } else if (chosenRule === "exclusiveFixedDate") {
      updatedActivity.exclusiveFixedDate = numericValue;
    }

    // 5. Update Master State Array in Parent (page.tsx)
    setActivities((prev) =>
      prev.map((act) =>
        act.id === selectedActivity.id ? updatedActivity : act,
      ),
    );

    // 6. Update local pointer reference SAFELY outside data mapping loops
    setSelectedActivity(updatedActivity);

    // 7. Reset optional parameters form state metrics for clean UX layout
    setChosenRule("none");
    setInputValue("0");
  };
  const handleApplyBulkCapacity = (bulkVolume: number) => {
    setUserDays((prev) =>
      prev.map((day) => ({
        ...day,
        maxCapacity: bulkVolume,
      })),
    );
  };
  return (
    <aside className="w-80 border-r border-gray-200 bg-gray-100 flex flex-col h-full overflow-hidden shadow-xl lg:shadow-none">
      {/* MOBILE DRAW CLOSING HEADER CONTROLS */}
      <div className="p-4 bg-gray-200 flex items-center justify-between lg:hidden border-b border-gray-300 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Navigation Settings
        </span>
        <button
          onClick={onClose}
          className="text-sm p-1 hover:text-red-500 font-bold"
        >
          ✕
        </button>
      </div>

      {/* 3 FOLDER SWITCHER TABS SYSTEM */}
      <div className="flex pt-3 px-3 bg-gray-200 gap-0.5 border-b border-gray-300 shrink-0">
        <button
          onClick={() => {
            setActiveTab("craft");
            setIsDropdownOpen(false);
          }}
          className={`flex-1 text-[11px] font-bold py-2 px-1 rounded-t-lg transition-colors border-t border-x ${
            activeTab === "craft"
              ? "bg-white text-blue-600 border-gray-300 shadow-xs"
              : "bg-gray-300/60 text-gray-500 border-transparent hover:bg-gray-300/40"
          }`}
        >
          📦 Craft
        </button>
        <button
          onClick={() => {
            setActiveTab("dayConfig");
            setIsDropdownOpen(false);
          }}
          className={`flex-1 text-[11px] font-bold py-2 px-1 rounded-t-lg transition-colors border-t border-x ${
            activeTab === "dayConfig"
              ? "bg-white text-blue-600 border-gray-300 shadow-xs"
              : "bg-gray-300/60 text-gray-500 border-transparent hover:bg-gray-300/40"
          }`}
        >
          📅 Days
        </button>
        <button
          onClick={() => {
            setActiveTab("payload");
            setIsDropdownOpen(false);
          }}
          className={`flex-1 text-[11px] font-bold py-2 px-1 rounded-t-lg transition-colors border-t border-x ${
            activeTab === "payload"
              ? "bg-white text-blue-600 border-gray-300 shadow-xs"
              : "bg-gray-300/60 text-gray-500 border-transparent hover:bg-gray-300/40"
          }`}
        >
          🔍 Payload ({activities.length})
        </button>
      </div>

      {/* MAIN DYNAMIC CONTENT BOX (FACES) */}
      <div className="flex-1 bg-white p-5 overflow-y-auto relative">
        {/* TAB 1: CRAFT FORM PANEL */}
        {activeTab === "craft" && (
          <form onSubmit={handleInjectRule} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Rule Blueprint Craft
              </h3>
              <p className="text-xs text-gray-400">
                Configure parameters and layout dependencies
              </p>
            </div>

            {/* CUSTOM SELECT DROPDOWN WITH COMPACT INLINE ACTIONS */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Target Client Profile
              </label>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-left flex justify-between items-center focus:outline-hidden focus:border-blue-500 shadow-xs"
              >
                <span className="font-semibold text-gray-700">
                  {selectedActivity
                    ? selectedActivity.clientName
                    : "-- Select a Client --"}
                </span>
                <span className="text-gray-400 text-[9px]">▼</span>
              </button>

              {/* FLOATING PANEL POPUP OVERLAY */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* ACTION 1: HEADER INSERT CONTROLS */}
                  <div className="p-1.5 border-b border-gray-100 bg-gray-50">
                    <button
                      type="button"
                      onClick={handleCreateNewClient}
                      className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold p-2 rounded-lg text-xs text-center transition"
                    >
                      ➕ Create New Client Profile
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto p-1 space-y-0.5">
                    {activities.length === 0 ? (
                      <div className="text-[11px] text-gray-400 italic text-center p-3">
                        No profiles available. Create one above!
                      </div>
                    ) : (
                      activities.map((act) => (
                        <div
                          key={act.id}
                          className={`flex items-center justify-between rounded-lg overflow-hidden group transition ${
                            selectedActivity?.id === act.id
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedActivity(act);
                              setIsDropdownOpen(false);
                              const fallback = activities.find(
                                (a) => a.id !== act.id,
                              );
                              if (fallback)
                                setDependencyTarget(fallback.clientName);
                            }}
                            className="flex-1 text-left px-3 py-2 text-xs font-medium focus:outline-hidden truncate"
                          >
                            {act.clientName}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              if (
                                confirm(
                                  `Are you sure you want to delete ${act.clientName}?`,
                                )
                              ) {
                                const filtered = activities.filter(
                                  (a) => a.id !== act.id,
                                );

                                if (selectedActivity?.id === act.id) {
                                  setSelectedActivity(
                                    filtered.length > 0 ? filtered[0] : null,
                                  );
                                }

                                setActivities(filtered);
                              }
                            }}
                            className={`px-2.5 py-2 text-xs font-bold transition-colors border-l ${
                              selectedActivity?.id === act.id
                                ? "border-blue-500/30 hover:bg-red-600 hover:text-white text-blue-200"
                                : "border-transparent text-gray-400 hover:text-red-600 hover:bg-gray-200"
                            }`}
                            title="Wipe Profile Record"
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Allocation Volume Logic
              </label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsFillRemainingMode(false)}
                  className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                    !isFillRemainingMode
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🔢 Fixed Days Count
                </button>
                <button
                  type="button"
                  onClick={() => setIsFillRemainingMode(true)}
                  className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                    isFillRemainingMode
                      ? "bg-white text-blue-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  ♾️ Fill Remaining
                </button>
              </div>

              {/* CONDITIONAL RENDER: STEPS STEPPER VS JUMBO CALLOUT STATEMENT */}
              {!isFillRemainingMode ? (
                <div className="animate-fadeIn space-y-1">
                  <div className="flex h-9 w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs focus-within:border-blue-500 transition">
                    <button
                      type="button"
                      onClick={() =>
                        setDaysNeededValue(Math.max(1, daysNeededValue - 1))
                      }
                      className="px-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 text-gray-600 font-bold text-xs select-none"
                    >
                      ➖
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={daysNeededValue}
                      onChange={(e) =>
                        setDaysNeededValue(
                          Math.max(1, parseInt(e.target.value, 10) || 1),
                        )
                      }
                      className="flex-1 text-center font-mono font-bold text-xs text-gray-700 bg-white focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDaysNeededValue(Math.min(31, daysNeededValue + 1))
                      }
                      className="px-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-gray-600 font-bold text-xs select-none"
                    >
                      ➕
                    </button>
                  </div>
                  <span className="block text-[9px] text-gray-400 italic">
                    Explicitly schedules this client for a fixed target number
                    of active days.
                  </span>
                </div>
              ) : (
                <div className="animate-fadeIn bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-3 text-center">
                  <span className="block text-xs font-bold text-blue-700 mb-0.5">
                    🚀 Autopilot Fill Mode Engaged
                  </span>
                  <p className="text-[10px] text-blue-600/80 leading-tight">
                    This profile will automatically absorb all remaining open
                    workspace slots across your configured month dynamically.
                  </p>
                </div>
              )}
            </div>

            {/* 3. DEPENDS ON CLIENT CONSTRAINTS SELECTION LOCKS */}
            <div
              className={`p-3 rounded-xl border transition ${
                hasDependency
                  ? "bg-blue-50/40 border-blue-200"
                  : "bg-gray-50/50 border-gray-100"
              }`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDependency}
                  onChange={() => setHasDependency(!hasDependency)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Setup Inter-Client Dependency
                </span>
              </label>

              <div
                className={`mt-3 space-y-2 transition-all duration-200 ${
                  hasDependency
                    ? "opacity-100 max-h-40"
                    : "opacity-30 max-h-0 overflow-hidden pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Target Constraint
                    </label>
                    <select
                      value={dependencyType}
                      onChange={(e) =>
                        setDependencyType(e.target.value as "after" | "before")
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-hidden"
                    >
                      <option value="after">Must be After</option>
                      <option value="before">Must be Before</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Reference Client
                    </label>
                    <select
                      value={dependencyTarget}
                      onChange={(e) => setDependencyTarget(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-hidden"
                    >
                      {activities
                        .filter((act) => act.id !== selectedActivity?.id)
                        .map((act) => (
                          <option key={act.id} value={act.clientName}>
                            {act.clientName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* 4. EXPOSED RULES CHECKLIST WRAPPER */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Rule Modifier Toggles
              </label>

              {/* GAP DAYS RESTITUTION */}
              <div
                className={`p-3 rounded-xl border transition ${
                  chosenRule === "gapDays"
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chosenRule === "gapDays"}
                    onChange={() => {
                      setChosenRule(
                        chosenRule === "gapDays" ? "none" : "gapDays",
                      );
                      setInputValue("0");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Gap Days Restitution
                  </span>
                </label>

                <div
                  className={`mt-2 transition-all duration-200 ${
                    chosenRule === "gapDays"
                      ? "opacity-100 max-h-20"
                      : "opacity-30 max-h-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <div className="text-[10px] text-gray-400 font-medium mb-1">
                    Minimum Distance Count (Days)
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    disabled={chosenRule !== "gapDays"}
                    value={chosenRule === "gapDays" ? inputValue : ""}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* PREFERRED WEEKDAY SYSTEM */}
              <div
                className={`p-3 rounded-xl border transition ${
                  chosenRule === "preferredDay"
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chosenRule === "preferredDay"}
                    onChange={() => {
                      setChosenRule(
                        chosenRule === "preferredDay" ? "none" : "preferredDay",
                      );
                      setInputValue("1");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Preferred Weekday
                  </span>
                </label>

                <div
                  className={`mt-2 transition-all duration-200 ${
                    chosenRule === "preferredDay"
                      ? "opacity-100 max-h-20"
                      : "opacity-30 max-h-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <div className="text-[10px] text-gray-400 font-medium mb-1">
                    Target Day (0=Sun, 1=Mon, 2=Tue...)
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    disabled={chosenRule !== "preferredDay"}
                    value={chosenRule === "preferredDay" ? inputValue : ""}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* EXCLUSIVE FIXED DATE LOCKOUT */}
              <div
                className={`p-3 rounded-xl border transition ${
                  chosenRule === "exclusiveFixedDate"
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chosenRule === "exclusiveFixedDate"}
                    onChange={() => {
                      setChosenRule(
                        chosenRule === "exclusiveFixedDate"
                          ? "none"
                          : "exclusiveFixedDate",
                      );
                      setInputValue("0");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Exclusive Fixed Lockout
                  </span>
                </label>

                <div
                  className={`mt-2 transition-all duration-200 ${
                    chosenRule === "exclusiveFixedDate"
                      ? "opacity-100 max-h-20"
                      : "opacity-30 max-h-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <div className="text-[10px] text-gray-400 font-medium mb-1">
                    Lockout Shift Param Value
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    disabled={chosenRule !== "exclusiveFixedDate"}
                    value={
                      chosenRule === "exclusiveFixedDate" ? inputValue : ""
                    }
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* MASTER INJECT SAVE CONTROLS */}
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-xl text-xs transition shadow-xs"
            >
              🚀 Save Client Configuration
            </button>
          </form>
        )}
        {/* TAB 2: DYNAMIC TIMELINE MATRIX CONFIG */}
        {activeTab === "dayConfig" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Timeline Matrix Setup
              </h3>
              <p className="text-xs text-gray-400">
                Establish your active calendar anchor and frame scale
              </p>
            </div>

            {/* TIMELINE SCOPE INPUTS */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  🗓️ Anchor Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    generateDynamicDays(e.target.value, totalDays);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold text-gray-700 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  ⏱️ Total Days Scope Length
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={totalDays}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setTotalDays(val);
                    generateDynamicDays(startDate, val);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold text-gray-700 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* NEW UTILITY: UNIVERSAL BULK CAPACITY SETTER */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                ⚡ Universal Day Capacity (Bulk Apply)
              </label>
              <div className="flex gap-1.5 justify-between">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleApplyBulkCapacity(num)}
                    className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-700 border border-gray-200 font-mono font-bold py-2 rounded-lg text-xs transition shadow-2xs"
                    title={`Set all matrix days capacity to ${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <span className="block text-[9px] text-gray-400 italic">
                Clicking a number instantly updates all daily slot limits across
                your calendar.
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* SCROLLABLE INDIVIDUAL SLIDERS LIST */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Fine-Tune Individual Days
              </label>

              <div className="max-h-52 overflow-y-auto pr-1 space-y-2">
                {userDays.map((day) => {
                  const dayLabel = new Date(day.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  );

                  return (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-2.5 border border-gray-100 rounded-xl text-xs bg-white hover:bg-gray-50 transition shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-gray-700 block text-xs">
                          {dayLabel}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono tracking-tighter">
                          {day.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={day.maxCapacity}
                          onChange={(e) => {
                            const cap = parseInt(e.target.value, 10);
                            setUserDays((prev) =>
                              prev.map((d) =>
                                d.date === day.date
                                  ? { ...d, maxCapacity: cap }
                                  : d,
                              ),
                            );
                          }}
                          className="w-20 h-1 accent-blue-600 cursor-pointer bg-gray-200 rounded-lg appearance-none transition"
                        />
                        <span className="font-mono font-bold bg-white text-gray-700 border border-gray-200 rounded-md w-7 py-0.5 text-center text-[10px] shadow-2xs">
                          {day.maxCapacity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* TAB 3: PAYLOAD OVERVIEW WITH INTEGRATED REMOVAL ACTIONS */}
        {activeTab === "payload" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Payload Inventory
              </h3>
              <p className="text-xs text-gray-400">
                Review or wipe individual active rule keys
              </p>
            </div>

            <div className="space-y-2">
              {activities.map((act) => {
                const hasModifiers =
                  act.gapDays ||
                  act.preferredDay !== undefined ||
                  act.exclusiveFixedDate !== undefined ||
                  act.dependsOnClient;

                return (
                  <div
                    key={act.id}
                    className="border border-gray-200 rounded-xl p-3 text-xs bg-white shadow-xs space-y-2.5"
                  >
                    {/* CARD HEADER */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-800 block">
                          {act.clientName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          ID: {act.id.slice(0, 5)}
                        </span>
                      </div>

                      {/* DISPLAY TRACK: DAYS NEEDED VOLUME INLINE CAPSULE */}
                      {act.fillRemaining ? (
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 font-bold px-2 py-0.5 rounded-md text-[10px] font-mono animate-pulse">
                          ♾️ Fill All Leftover
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded-md text-[10px] font-mono">
                          🔄 {act.daysNeeded || 1} day(s) req
                        </span>
                      )}
                    </div>

                    {/* INTERACTIVE RULE BADGES MATRIX LIST */}
                    <div className="flex flex-col gap-1.5">
                      {/* RELATION DEPENDENCY STATUS BADGE */}
                      {act.dependsOnClient && (
                        <div className="flex items-center justify-between bg-teal-50 text-teal-800 p-1.5 rounded-md border border-teal-100 text-[10px] font-medium">
                          <span className="truncate">
                            🔗 Must be{" "}
                            <span className="font-bold">
                              {act.dependsOnClient.type}
                            </span>{" "}
                            {act.dependsOnClient.clientName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivities((prev) =>
                                prev.map((a) => {
                                  if (a.id !== act.id) return a;
                                  const updated = { ...a };
                                  delete updated.dependsOnClient;
                                  return updated;
                                }),
                              );
                            }}
                            className="hover:text-red-600 font-bold px-1 text-[11px] ml-1"
                            title="Remove dependency"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* GAP DAYS BADGE */}
                      {act.gapDays && (
                        <div className="flex items-center justify-between bg-amber-50 text-amber-800 p-1.5 rounded-md border border-amber-100 text-[10px] font-medium">
                          <span>⏱️ Min Gap Time: {act.gapDays}d</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivities((prev) =>
                                prev.map((a) => {
                                  if (a.id !== act.id) return a;
                                  const updated = { ...a };
                                  delete updated.gapDays;
                                  return updated;
                                }),
                              );
                            }}
                            className="hover:text-red-600 font-bold px-1 text-[11px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* PREFERRED DAY BADGE */}
                      {act.preferredDay !== undefined && (
                        <div className="flex items-center justify-between bg-indigo-50 text-indigo-800 p-1.5 rounded-md border border-indigo-100 text-[10px] font-medium">
                          <span>
                            📅 Preferred Day Index: {act.preferredDay}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivities((prev) =>
                                prev.map((a) => {
                                  if (a.id !== act.id) return a;
                                  const updated = { ...a };
                                  delete updated.preferredDay;
                                  return updated;
                                }),
                              );
                            }}
                            className="hover:text-red-600 font-bold px-1 text-[11px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* EXCLUSIVE LOCK DATE BADGE */}
                      {act.exclusiveFixedDate !== undefined && (
                        <div className="flex items-center justify-between bg-purple-50 text-purple-800 p-1.5 rounded-md border border-purple-100 text-[10px] font-medium">
                          <span>
                            🔒 Exclusive Lock Day: {act.exclusiveFixedDate}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActivities((prev) =>
                                prev.map((a) => {
                                  if (a.id !== act.id) return a;
                                  const updated = { ...a };
                                  delete updated.exclusiveFixedDate;
                                  return updated;
                                }),
                              );
                            }}
                            className="hover:text-red-600 font-bold px-1 text-[11px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* RAW BASE CONDITION CASE */}
                      {!hasModifiers && (
                        <div className="text-[10px] text-gray-400 italic bg-gray-50/50 p-2 text-center rounded-lg border border-dashed border-gray-200">
                          Standard scheduling payload (No filter modifiers)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MASTER SCHEDULER ENGINE TRIGGER SUBMIT LINK FOOTER */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <button
          onClick={onGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider shadow-md transition transform active:scale-[0.98]"
        >
          ⚡ RUN SCHEDULER ENGINE
        </button>
      </div>
    </aside>
  );
}
