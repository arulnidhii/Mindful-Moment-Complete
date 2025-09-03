export type Period = 'day'|'week'|'month'
export type Kind = 'trend'|'corr'|'rhythm'|'adherence'|'celebration'|'selfcare'

export interface Entry { t:number; mood:number; boosters?:string[]; drainers?:string[]; note?:string }
export interface PeriodAgg {
  period: Period; start:number; end:number; n:number; avg:number;
  topBooster?:string; topDrainer?:string; bestHour?:[number,number]; bestDOW?:number;
  deltas?: { avgDelta:number; nDelta:number };
  novelty?: { emergingBoosters:string[]; emergingDrainers:string[] };
}

export interface AdvisorEvent { id:string; kind:Kind; score:number; payload:any }
export interface Tip { id:string; text:string; arm?:string }

// Agentic action types for actionable insights
export type ActionType = 'phone' | 'sms' | 'whatsapp' | 'calendar' | 'maps' | 'reminder'
export interface Action {
  label: string
  type: ActionType
  url: string
}

export interface AdvisorItem { id:string; createdAt:number; period:Period; title:string; text:string; tips:Tip[]; actions?: Action[] }
