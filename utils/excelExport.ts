import * as XLSX from "xlsx";
import { Assignment, ScheduleDay } from "@/types/types";

interface NewScheduleResult {
  assignments: Assignment[];
  unscheduled: { activity: any; reason: string }[];
}

export function exportDynamicEngineToExcel(
  userDays: ScheduleDay[],
  result: NewScheduleResult,
) {
  const { assignments, unscheduled } = result;

  let maxRowsNeeded = 0;

  const columnsData = userDays.map((day) => {
    const formattedHeader = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const dayAssignments = assignments.filter((asm) => asm.date === day.date);

    if (dayAssignments.length > maxRowsNeeded) {
      maxRowsNeeded = dayAssignments.length;
    }

    return {
      header: formattedHeader,
      labels: dayAssignments.map((asm) => asm.clientName),
    };
  });

  const rows: Record<string, string>[] = [];
  const loopCount = maxRowsNeeded === 0 ? 1 : maxRowsNeeded;

  for (let r = 0; r < loopCount; r++) {
    const cellRow: Record<string, string> = {};

    columnsData.forEach((col) => {
      cellRow[col.header] = col.labels[r] || "-";
    });

    rows.push(cellRow);
  }

  if (unscheduled.length > 0) {
    rows.push({});

    rows.push({
      [columnsData[0].header]:
        "⚠️ UNSCHEDULED ALERTS / CONSTRAINTS FAILURE LOG",
    });

    unscheduled.forEach((item) => {
      rows.push({
        [columnsData[0].header]: `Client: ${item.activity.clientName}`,
        [columnsData[1].header]: `Reason: ${item.reason}`,
      });
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Engine Master Output");

  XLSX.writeFile(
    workbook,
    `schedule-report-${result.assignments.length}-slots.xlsx`,
  );
}
