import { AdvisorEvent } from './advisorTypes'

export const clamp=(x:number,a=0,b=1)=> Math.max(a, Math.min(b,x))
export function zScore(x:number, mean:number, sd:number){ return sd>0? (x-mean)/sd : 0 }
export function expDecay(hours:number, halfLifeHrs:number){ return Math.pow(0.5, hours/halfLifeHrs) }

export function salienceScore(ev:AdvisorEvent & { magnitudeZ?:number; confidence?:number; novelty?:number; hoursOld?:number }):number{
  const m = clamp((ev as any).magnitudeZ ?? 0)
  const c = clamp((ev as any).confidence ?? 0)
  const n = clamp((ev as any).novelty ?? 0)
  const f = expDecay((ev as any).hoursOld ?? 0, 48)
  return 0.4*m + 0.3*c + 0.2*n + 0.1*f
}

