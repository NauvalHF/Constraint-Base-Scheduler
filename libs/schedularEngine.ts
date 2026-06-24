import type {
  Activity,
  ScheduleDay,
  Rule,
  RuleContext,
  RuleResult,
  EngineState,
  ScheduleResult,
  UnscheduledActivity,
} from "@/libs/types";
import { defaultRules } from "./rules";

export function checkPlacement(
  context: RuleContext,
  rules: Rule[],
): RuleResult {
  for (const rule of rules) {
    if (!rule.appliesTo(context.activity)) continue;
    const result = rule.validate(context);
    if (!result.valid) return result;
  }
  return { valid: true };
}

function activityWeight(a: Activity): number {
  let w = 0;
  if (typeof a.exclusiveFixedDate === "number") {
    w += 4000; // pins one day AND reserves it from everyone else — most restrictive
  }
  if (typeof a.preferredDay === "number") {
    w += 3000; // pins one day, but shareable
  }
  if (Array.isArray(a.exclusiveDays) && a.exclusiveDays.length > 0) {
    w += 1000 - a.exclusiveDays.length; // fewer allowed days = heavier
  }
  if (typeof a.gapDays === "number") {
    w += 100 + a.gapDays;
  }
  if (typeof a.daysNeeded === "number" && a.daysNeeded > 1) {
    w += 200 + a.daysNeeded;
  }
  if (a.fillRemaining) {
    w -= 500;
  }
  return w;
}

function byConstraintWeight(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => activityWeight(b) - activityWeight(a));
}

function resolveClientOrder(activities: Activity[]): {
  order: string[];
  unresolved: Set<string>;
} {
  const clients = new Set(activities.map((a) => a.clientName));

  const dependsOn = new Map<string, Set<string>>();
  for (const a of activities) {
    if (a.dependsOnClient) {
      const set = dependsOn.get(a.clientName) ?? new Set<string>();
      set.add(a.dependsOnClient.clientName);
      dependsOn.set(a.clientName, set);
    }
  }
  const dependents = new Map<string, string[]>();
  for (const [client, deps] of dependsOn) {
    for (const dep of deps) {
      const arr = dependents.get(dep) ?? [];
      arr.push(client);
      dependents.set(dep, arr);
    }
  }

  const remainingDeps = new Map<string, number>();
  for (const c of clients) {
    remainingDeps.set(c, (dependsOn.get(c) ?? new Set()).size);
  }

  const clientWeight = (client: string): number => {
    const clientActivities = activities.filter((a) => a.clientName === client);
    return Math.max(0, ...clientActivities.map(activityWeight));
  };

  const order: string[] = [];
  const ready = new Set<string>(
    [...clients].filter((c) => remainingDeps.get(c) === 0),
  );

  while (ready.size > 0) {
    let next: string | null = null;
    let bestWeight = -Infinity;
    for (const c of ready) {
      const w = clientWeight(c);
      if (w > bestWeight) {
        bestWeight = w;
        next = c;
      }
    }

    const chosen = next as string;
    ready.delete(chosen);
    order.push(chosen);

    for (const dependent of dependents.get(chosen) ?? []) {
      const remaining = (remainingDeps.get(dependent) ?? 0) - 1;
      remainingDeps.set(dependent, remaining);
      if (remaining === 0) ready.add(dependent);
    }
  }

  const unresolved = new Set([...clients].filter((c) => !order.includes(c)));
  return { order, unresolved };
}
function placeActivity(
  activity: Activity,
  sortedDays: ScheduleDay[],
  state: EngineState,
  rules: Rule[],
): { placed: boolean; reason: string } {
  let lastReason = "No day in the schedule satisfies this activity's rules";

  for (const day of sortedDays) {
    const result = checkPlacement(
      { activity, day, state, allDays: sortedDays },
      rules,
    );

    if (result.valid) {
      state.assignments.push({
        activityId: activity.id,
        clientName: activity.clientName,
        date: day.date,
      });
      state.dayCounts[day.date] = (state.dayCounts[day.date] ?? 0) + 1;
      for (const rule of rules) {
        if (rule.appliesTo(activity) && rule.onAssign) {
          rule.onAssign({ activity, day, state, allDays: sortedDays });
        }
      }

      return { placed: true, reason: "" };
    }

    if (result.reason) lastReason = result.reason;
  }

  return { placed: false, reason: lastReason };
}
function placeWithDaysNeeded(
  activity: Activity,
  sortedDays: ScheduleDay[],
  state: EngineState,
  rules: Rule[],
  unscheduled: UnscheduledActivity[],
): void {
  const target =
    typeof activity.daysNeeded === "number" && activity.daysNeeded > 1
      ? activity.daysNeeded
      : 1;

  for (let i = 0; i < target; i++) {
    const clone: Activity =
      i === 0 ? activity : { ...activity, id: `${activity.id}-fill-${i}` };

    const { placed, reason } = placeActivity(clone, sortedDays, state, rules);

    if (!placed) {
      unscheduled.push({
        activity: clone,
        reason: `Instance ${i + 1} of ${target}: ${reason}`,
      });
    }
  }
}
function placeWithFillRemaining(
  activity: Activity,
  sortedDays: ScheduleDay[],
  state: EngineState,
  rules: Rule[],
  unscheduled: UnscheduledActivity[],
): void {
  const maxIterations = sortedDays.reduce((sum, d) => sum + d.maxCapacity, 0);
  let count = 0;

  while (count < maxIterations) {
    const clone: Activity =
      count === 0
        ? activity
        : { ...activity, id: `${activity.id}-fill-${count}` };

    const { placed, reason } = placeActivity(clone, sortedDays, state, rules);

    if (!placed) {
      if (count === 0) {
        // Not even one instance fit — that's worth reporting
        unscheduled.push({ activity, reason });
      }
      break;
    }
    count++;
  }
}
export function distributeActivities(
  activities: Activity[],
  days: ScheduleDay[],
  rules: Rule[] = defaultRules,
): ScheduleResult {
  const sortedDays = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const state: EngineState = {
    assignments: [],
    dayCounts: {},
    dayExclusiveOwner: {},
  };
  const unscheduled: UnscheduledActivity[] = [];

  const { order: clientOrder, unresolved } = resolveClientOrder(activities);

  for (const activity of activities) {
    if (unresolved.has(activity.clientName)) {
      unscheduled.push({
        activity,
        reason: `Could not resolve scheduling order for ${activity.clientName} — check for a circular dependency or a dependsOnClient referencing a client with no activities`,
      });
    }
  }

  const activitiesByClient = new Map<string, Activity[]>();
  for (const a of activities) {
    if (unresolved.has(a.clientName)) continue;
    const arr = activitiesByClient.get(a.clientName) ?? [];
    arr.push(a);
    activitiesByClient.set(a.clientName, arr);
  }

  for (const client of clientOrder) {
    const clientActivities = byConstraintWeight(
      activitiesByClient.get(client) ?? [],
    );
    for (const activity of clientActivities) {
      if (!activity.fillRemaining) {
        placeWithDaysNeeded(activity, sortedDays, state, rules, unscheduled);
      }
    }
  }
  const fillQueue = clientOrder.flatMap((client) =>
    (activitiesByClient.get(client) ?? []).filter((a) => a.fillRemaining),
  );

  if (fillQueue.length > 0) {
    const placedCounts = new Map<string, number>(
      fillQueue.map((a) => [a.id, 0]),
    );
    const neverPlaced = new Set<string>(fillQueue.map((a) => a.id));

    const maxIterations = sortedDays.reduce((sum, d) => sum + d.maxCapacity, 0);
    let totalPlaced = 0;

    while (totalPlaced < maxIterations) {
      let placedThisRound = 0;

      for (const activity of fillQueue) {
        const count = placedCounts.get(activity.id) ?? 0;
        const clone: Activity =
          count === 0
            ? activity
            : { ...activity, id: `${activity.id}-fill-${count}` };

        const { placed, reason } = placeActivity(
          clone,
          sortedDays,
          state,
          rules,
        );

        if (placed) {
          placedCounts.set(activity.id, count + 1);
          neverPlaced.delete(activity.id);
          placedThisRound++;
          totalPlaced++;
        } else if (count === 0 && !placed) {
          placedCounts.set(activity.id, -1); // sentinel: tried, never fit
          (activity as any).__lastReason = reason;
        }
      }

      if (placedThisRound === 0) break;
    }

    // Report any fillRemaining activity that never got even one slot
    for (const activity of fillQueue) {
      if (neverPlaced.has(activity.id)) {
        unscheduled.push({
          activity,
          reason:
            (activity as any).__lastReason ??
            "No day in the schedule satisfies this activity's rules",
        });
      }
    }
  }

  return { assignments: state.assignments, unscheduled };
}
