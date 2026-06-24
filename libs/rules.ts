import type { DependencyRef, Rule } from "@/libs/types";

/** Every day has a capacity, so this rule always applies. */
export const capacityRule: Rule = {
  name: "capacity",
  appliesTo: () => true,
  validate: ({ day, state }) => {
    const used = state.dayCounts[day.date] ?? 0;
    if (used >= day.maxCapacity) {
      return {
        valid: false,
        reason: `${day.date} is at capacity (${day.maxCapacity})`,
      };
    }
    return { valid: true };
  },
};

/** Keeps a minimum number of days between activities belonging to the same client. */
export const gapDaysRule: Rule = {
  name: "gapDays",
  appliesTo: (activity) =>
    typeof activity.gapDays === "number" && activity.gapDays > 0,
  validate: ({ activity, day, state }) => {
    const gap = activity.gapDays as number;
    const candidateTime = new Date(day.date).getTime();

    const tooClose = state.assignments.some((a) => {
      if (a.clientName !== activity.clientName) return false;
      const diffDays =
        Math.abs(candidateTime - new Date(a.date).getTime()) / 86_400_000;
      return diffDays < gap;
    });

    if (tooClose) {
      return {
        valid: false,
        reason: `Needs at least ${gap} day(s) gap from another ${activity.clientName} activity`,
      };
    }
    return { valid: true };
  },
};

/** Restricts an activity to specific weekdays. */
export const exclusiveDaysRule: Rule = {
  name: "exclusiveDays",
  appliesTo: (activity) =>
    Array.isArray(activity.exclusiveDays) &&
    (activity.exclusiveDays as number[]).length > 0,
  validate: ({ activity, day }) => {
    const allowed = activity.exclusiveDays as number[];
    const weekday = new Date(day.date).getDay();
    if (!allowed.includes(weekday)) {
      return {
        valid: false,
        reason: `${day.date} is not an allowed weekday for this activity`,
      };
    }
    return { valid: true };
  },
};

/**
 * Pins an activity to one required weekday. Unlike exclusiveFixedDateRule
 * below, this does NOT reserve the day — other clients can still be placed
 * there if capacity allows. capacityRule still applies normally alongside this.
 */
export const preferredDayRule: Rule = {
  name: "preferredDay",
  appliesTo: (activity) => typeof activity.preferredDay === "number",
  validate: ({ activity, day }) => {
    const requiredWeekday = activity.preferredDay as number;
    const weekday = new Date(day.date).getDay();
    if (weekday !== requiredWeekday) {
      return {
        valid: false,
        reason: `${day.date} is not this activity's required day`,
      };
    }
    return { valid: true };
  },
};
export const exclusiveFixedDateRule: Rule = {
  name: "exclusiveFixedDate",
  appliesTo: (activity) => typeof activity.exclusiveFixedDate === "number",
  validate: ({ activity, day }) => {
    const requiredWeekday = activity.exclusiveFixedDate as number;
    const weekday = new Date(day.date).getDay();
    if (weekday !== requiredWeekday) {
      return {
        valid: false,
        reason: `${day.date} is not this activity's required exclusive day`,
      };
    }
    return { valid: true };
  },
  onAssign: ({ activity, day, state }) => {
    state.dayExclusiveOwner[day.date] = activity.clientName;
  },
};

export const exclusiveFixedDateBlockRule: Rule = {
  name: "exclusiveFixedDateBlock",
  appliesTo: () => true,
  validate: ({ activity, day, state }) => {
    const owner = state.dayExclusiveOwner[day.date];
    if (owner && owner !== activity.clientName) {
      return {
        valid: false,
        reason: `${day.date} is exclusively reserved for ${owner}`,
      };
    }
    return { valid: true };
  },
};

export const dependencyDayRule: Rule = {
  name: "dependencyDay",
  appliesTo: (activity) => !!activity.dependsOnClient,
  validate: ({ activity, day, state }) => {
    const dep = activity.dependsOnClient as DependencyRef;

    const refDates = state.assignments
      .filter((a) => a.clientName === dep.clientName)
      .map((a) => new Date(a.date).getTime())
      .sort((a, b) => a - b);

    if (refDates.length === 0) {
      return {
        valid: false,
        reason: `${dep.clientName} has no scheduled activity for this dependency to attach to`,
      };
    }

    const candidate = new Date(day.date).getTime();
    const oneDay = 86_400_000;

    if (dep.type === "after") {
      const latest = refDates[refDates.length - 1];
      if (candidate !== latest + oneDay) {
        return {
          valid: false,
          reason: `Must be the day immediately after ${dep.clientName}'s last activity`,
        };
      }
    } else {
      const earliest = refDates[0];
      if (candidate !== earliest - oneDay) {
        return {
          valid: false,
          reason: `Must be the day immediately before ${dep.clientName}'s first activity`,
        };
      }
    }

    return { valid: true };
  },
};

export const oncePerDayPerClientRule: Rule = {
  name: "oncePerDayPerClient",
  appliesTo: () => true,
  validate: ({ activity, day, state }) => {
    const alreadyOnDay = state.assignments.some(
      (a) => a.clientName === activity.clientName && a.date === day.date,
    );
    if (alreadyOnDay) {
      return {
        valid: false,
        reason: `${activity.clientName} is already scheduled on ${day.date}`,
      };
    }
    return { valid: true };
  },
};

export const defaultRules: Rule[] = [
  capacityRule,
  oncePerDayPerClientRule,
  gapDaysRule,
  exclusiveDaysRule,
  preferredDayRule,
  exclusiveFixedDateRule,
  exclusiveFixedDateBlockRule,
  dependencyDayRule,
];
