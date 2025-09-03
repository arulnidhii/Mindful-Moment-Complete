import { Template } from './templates'
import { pickTone } from './tone'

export const DAY_MORE:Template[]=[
  { id:'day_micro_reset', kind:'selfcare', periods:['day'], title:p=>'Micro reset',
    variants:[ p=>`Take a 60‑second reset: ${pickTone('warm','nudge')}`,
               p=>`Tiny reset: breathe + stretch. ${pickTone('warm','nudge')}` ],
    tips:p=> [ {id:'reset', text:'Stand up, roll shoulders, slow breath x4.'} ] },
  { id:'day_energy_boost', kind:'celebration', periods:['day'], title:p=>'Energy uplifts',
    variants:[ p=>`That helped today: ${p.booster||'a small walk'}. ${pickTone('warm','praise')}`,
               p=>`Nice lift from ${p.booster||'fresh air'}. ${pickTone('warm','praise')}`],
    tips:p=> [ {id:'repeat', text:'Try it again tomorrow in your dip window.'} ] },
]

export const WEEK_MORE:Template[]=[
  { id:'week_win_recap', kind:'celebration', periods:['week'], title:p=>'Wins this week',
    variants:[ p=>`Kept momentum ${p.streak||''} days. ${pickTone('coach','praise')}`,
               p=>`Small wins added up. ${pickTone('warm','praise')}` ],
    tips:p=> [ {id:'one_more', text:'Pick one win to repeat next week.'} ] },
  { id:'week_focus_block', kind:'selfcare', periods:['week'], title:p=>'Protect one focus block',
    variants:[ p=>`Guard ${p.bestWindow||'your best hours'} with no meetings. ${pickTone('crisp','nudge')}` ],
    tips:p=> [ {id:'calendar', text:'Create a recurring 45‑min block.'} ] },
  { id:'week_partner_celebration', kind:'celebration', periods:['week'], title:p=>'Celebrate together',
    variants:[ p=>`You both logged ${p.entries||'moments'} this week. ${pickTone('warm','praise')}`,
               p=>`Shared rhythm building. ${pickTone('warm','praise')}` ],
    tips:p=> [ {id:'together', text:'Share one win with your partner tonight.'} ] },
  { id:'week_partner_support', kind:'selfcare', periods:['week'], title:p=>'Support each other',
    variants:[ p=>`Notice when ${p.partnerName||'your partner'} needs a boost. ${pickTone('warm','nudge')}`,
               p=>`Gentle support goes both ways. ${pickTone('warm','nudge')}` ],
    tips:p=> [ {id:'support', text:'Send a quick encouraging message.'} ] },
]

export const MONTH_MORE:Template[]=[
  { id:'month_theme', kind:'trend', periods:['month'], title:p=>'Month theme',
    variants:[ p=>`This month leaned ${p.deltaSign||''}${p.deltaAbs||''}. ${pickTone('coach','nudge')}` ],
    tips:p=> [ {id:'carry', text:'Carry one habit that worked into the next month.'} ] },
  { id:'month_anchor_habit', kind:'selfcare', periods:['month'], title:p=>'Anchor one tiny habit',
    variants:[ p=>`Pick one 2‑min habit to anchor. ${pickTone('warm','nudge')}` ],
    tips:p=> [ {id:'habit', text:'After coffee, write one line in journal.'} ] },
  { id:'month_partner_growth', kind:'trend', periods:['month'], title:p=>'Growing together',
    variants:[ p=>`You've both been consistent this month. ${pickTone('warm','praise')}`,
               p=>`Shared commitment to mindfulness. ${pickTone('warm','praise')}` ],
    tips:p=> [ {id:'reflect', text:"Share what you've learned about each other."} ] },
  { id:'month_partner_ritual', kind:'selfcare', periods:['month'], title:p=>'Create a ritual',
    variants:[ p=>`Consider a weekly check-in ritual. ${pickTone('warm','nudge')}`,
               p=>`Small shared moments add up. ${pickTone('warm','nudge')}` ],
    tips:p=> [ {id:'ritual', text:'Sunday evening: 5 minutes sharing wins.'} ] },
]

export const EXTENDED_TEMPLATES=[...DAY_MORE,...WEEK_MORE,...MONTH_MORE]

