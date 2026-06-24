export interface DependencyRef {
  clientName: string;
  type: "before" | "after";
}

export interface Activity {
  id: string;
  clientName: string;
  gapDays?: number;
  exclusiveDays?: number[];
  preferredDay?: number;
  exclusiveFixedDate?: number;
  dependsOnClient?: DependencyRef;
  daysNeeded?: number;
  [key: string]: unknown;
}

export interface ScheduleDay {
  date: string;
  maxCapacity: number;
}

export interface Assignment {
  activityId: string;
  clientName: string;
  date: string;
}

export interface UnscheduledActivity {
  activity: Activity;
  reason: string;
}

export interface ScheduleResult {
  assignments: Assignment[];
  unscheduled: UnscheduledActivity[];
}

export interface EngineState {
  assignments: Assignment[];
  dayCounts: Record<string, number>;
  dayExclusiveOwner: Record<string, string>;
}

export interface RuleContext {
  activity: Activity;
  day: ScheduleDay;
  state: EngineState;
  allDays: ScheduleDay[];
}

export interface RuleResult {
  valid: boolean;
  reason?: string;
}
export interface Rule {
  name: string;
  appliesTo: (activity: Activity) => boolean;
  validate: (context: RuleContext) => RuleResult;
  onAssign?: (context: RuleContext) => void;
}
