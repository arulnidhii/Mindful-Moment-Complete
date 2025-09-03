import { AdvisorEvent, AdvisorItem, Period, Tip } from './advisorTypes'

export type Template = {
  id:string; kind:string; periods:Period[];
  title:(p:any)=>string;
  variants: ((p:any)=>string)[];
  tips:(p:any)=>Tip[];
}

export const DAY_TEMPLATES:Template[]=[
  { id:'day_trend_stress_up', kind:'trend', periods:['day'], title:p=>'Daytime stress nudged up',
    variants:[ p=>`Looks like stress ticked up ${p.deltaPct}. It often follows later bedtimes this week.`,
               p=>`A small rise in daytime stress ${p.deltaPct}. Your evenings ended a bit later than usual.`,
               p=>`Stress is a touch higher ${p.deltaPct}. Late nights may be part of it.`],
    tips:p=> [ {id:'winddown', text:'If it’s past 11pm, dim lights and put the phone away for 20 minutes.'},
               {id:'prep', text:'Set out tomorrow’s clothes before 10:30 pm to ease the morning.'} ] },
  { id:'day_corr_walk_afternoon', kind:'corr', periods:['day'], title:p=>'Walks help afternoons',
    variants:[ p=>`Afternoons dip, but short walks flip the trend on most days.`,
               p=>`When a walk happens, afternoon mood jumps about ${p.effect}.`,
               p=>`A 10‑minute walk often turns around post‑3pm slumps.`],
    tips:p=> [ {id:'walk10', text:'If mood dips after 3 pm, take a 10‑minute daylight walk before screens.'} ] },
  { id:'day_rhythm_best_window', kind:'rhythm', periods:['day'], title:p=>'Best hours today',
    variants:[ p=>`Your best focus window was ${p.window}.`, p=>`You felt best around ${p.window}.`, p=>`${p.window} brought your easiest momentum.`],
    tips:p=> [ {id:'plan1', text:'Plan one meaningful task in that window tomorrow.'} ] },
  { id:'day_adherence_low', kind:'adherence', periods:['day'], title:p=>'Light day is okay',
    variants:[ p=>`Fewer check‑ins today. Showing up still counts.`, p=>`A quieter day—thanks for checking in.`],
    tips:p=> [ {id:'afterlunch', text:'Try one quick check‑in after lunch tomorrow.'} ] },
]

export const WEEK_TEMPLATES:Template[]=[
  { id:'week_summary_delta', kind:'trend', periods:['week'], title:p=>'This week at a glance',
    variants:[ p=>`Your average mood was ${p.avg} (${p.deltaSign}${p.deltaAbs} vs last week).`,
               p=>`This week landed ${p.deltaSign}${p.deltaAbs} vs last week; you logged ${p.n} times.`,
               p=>`Compared with last week, mood moved ${p.deltaSign}${p.deltaAbs}.`],
    tips:p=> [ {id:'protect_best', text:`Protect your best window ${p.bestWindow} with a no‑meeting block.`} ] },
  { id:'week_top_booster', kind:'corr', periods:['week'], title:p=>'Top booster this week',
    variants:[ p=>`${p.booster} showed the strongest lift on tough days.`, p=>`Most helpful: ${p.booster}.`],
    tips:p=> [ {id:'schedule_booster', text:`Schedule ${p.booster} once in your lower‑energy slot.`} ] },
  { id:'week_emerging_drainer', kind:'corr', periods:['week'], title:p=>'New drainer noticed',
    variants:[ p=>`${p.drainer} cropped up more than usual.`, p=>`A small pattern: ${p.drainer} days trend lower.`],
    tips:p=> [ {id:'buffer', text:`Add a 5‑minute buffer before/after ${p.drainer} to decompress.`} ] },
  { id:'week_rhythm', kind:'rhythm', periods:['week'], title:p=>'Your rhythm',
    variants:[ p=>`Best hours: ${p.bestWindow}. Best day: ${p.bestDOW}.`, p=>`${p.bestDOW} was your easiest day; ${p.bestWindow} stayed strong.`],
    tips:p=> [ {id:'schedule_tough', text:'Put one tough task into your best window next week.'} ] },
  { id:'week_streak', kind:'celebration', periods:['week'], title:p=>'Small wins add up',
    variants:[ p=>`You kept a ${p.streak}‑day streak.`, p=>`Consistency showed up—${p.streak} days logged.`],
    tips:p=> [ {id:'keep_light', text:'Keep it light—aim for one small win tomorrow.'} ] },
]

export const MONTH_TEMPLATES:Template[]=[
  { id:'month_summary_delta', kind:'trend', periods:['month'], title:p=>`${p.monthName} in summary`,
    variants:[ p=>`Average mood ${p.avg} (${p.deltaSign}${p.deltaAbs} vs last month); ${p.n} check‑ins.`,
               p=>`${p.n} check‑ins. Mood moved ${p.deltaSign}${p.deltaAbs} vs last month.`],
    tips:p=> [ {id:'carry_forward', text:'Carry one habit that worked into the new month.'} ] },
  { id:'month_top2_boosters', kind:'corr', periods:['month'], title:p=>'What helped most',
    variants:[ p=>`${p.b1} and ${p.b2} lifted most days.`, p=>`Most helpful combo: ${p.b1} + ${p.b2}.`],
    tips:p=> [ {id:'plan_pair', text:`Plan ${p.b1} and ${p.b2} once each in the first week.`} ] },
  { id:'month_emerging_drainer', kind:'corr', periods:['month'], title:p=>'Keep an eye on',
    variants:[ p=>`${p.drainer} showed up more often than before.`, p=>`${p.drainer} seems linked with lower days this month.`],
    tips:p=> [ {id:'micro_buffer', text:`Add a small recovery buffer around ${p.drainer}.`} ] },
  { id:'month_rhythm', kind:'rhythm', periods:['month'], title:p=>'Your pattern map',
    variants:[ p=>`Best weekday: ${p.bestDOW}. Best hours: ${p.bestWindow}.`, p=>`${p.bestWindow} stayed strong; ${p.bestDOW} led the pack.`],
    tips:p=> [ {id:'protect_block', text:'Protect one 60‑min no‑phone block in that window.'} ] },
]

export const ALL_TEMPLATES=[...DAY_TEMPLATES,...WEEK_TEMPLATES,...MONTH_TEMPLATES]
export { EXTENDED_TEMPLATES } from './templates_extended'


