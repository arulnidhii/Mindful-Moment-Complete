import { Action, ActionType } from './advisorTypes';
import { useUserStore } from '@/store/userStore';

// Generate actions based on template id, payload, and local state
export function generateActionsFor(templateId: string, payload: any, opts?: { context?: 'self'|'partner' }): Action[] | undefined {
  try{
    const phone = (useUserStore.getState() as any).partnerPhoneNumber as string | null;
    const actions: Action[] = [];

    // Category 1: Reactive support
    if (templateId === 'day_trend_stress_up') {
      if (phone) {
        actions.push(
          { label: 'Call Partner', type: 'phone', url: `tel:${phone}` },
          { label: 'Message Partner', type: 'whatsapp', url: `whatsapp://send?phone=${phone}&text=${encodeURIComponent('Hey, thinking of you.')}` },
        )
      } else {
        actions.push(
          { label: 'Call Partner', type: 'phone', url: 'tel:' },
          { label: 'Message Partner', type: 'sms', url: 'sms:' },
        )
      }
    }
    if (templateId === 'week_emerging_drainer') {
      const text = `Saw you had a stressful ${payload?.drainer || 'day'}. Want to talk about it?`;
      if (phone) {
        actions.push({ label: 'Ask about their day', type: 'sms', url: `sms:${phone}?body=${encodeURIComponent(text)}` })
      } else {
        actions.push({ label: 'Ask about their day', type: 'sms', url: `sms:?body=${encodeURIComponent(text)}` })
      }
    }

    // Category 2: Proactive planning
    if (templateId === 'week_top_booster') {
      const booster = payload?.booster || 'Nature';
      const label = opts?.context==='partner' ? `Plan ${booster} time together` : `Schedule time for ${booster}`;
      const title = encodeURIComponent(`Weekend ${booster}`);
      const details = encodeURIComponent("Let's do our weekly booster!");
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
      actions.push({ label, type: 'calendar', url })
      // Maps suggestions
      const mapsQuery = encodeURIComponent(({
        nature: 'park near me',
        exercise: 'gym near me',
        social: 'coffee shop near me',
        reading: 'library near me',
        meditation: 'meditation center near me',
        music: 'live music venue near me',
        hobby: 'hobby store near me',
      } as Record<string,string>)[booster] || `${booster} near me`)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
      const label2 = opts?.context==='partner' ? `Find a ${booster} spot for you both` : `Find ${booster} nearby`
      actions.push({ label: label2, type: 'maps', url: mapsUrl })
    }
    if (templateId === 'week_rhythm') {
      const label = 'Block this time for us';
      // For simplicity, leave dates unspecified; opening the template lets user pick time
      const title = encodeURIComponent('Protected Us Time');
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}`;
      actions.push({ label, type: 'calendar', url })
    }

    // Category 3: Individual self-care
    if (templateId === 'month_top2_boosters' || templateId === 'week_top_booster') {
      // already covered by week_top_booster; keep minimal
    }
    if (templateId === 'day_trend_stress_up') {
      // Suggest a wind down reminder at 22:30
      const label = 'Set 10:30 PM Wind Down Reminder'
      const url = 'myapp://set-reminder?hour=22&minute=30&label=Wind+Down'
      actions.push({ label, type: 'reminder', url })
    }

    // Prep for Drainer: simple calendar buffer
    if (templateId === 'week_emerging_drainer') {
      const dr = String(payload?.drainer || 'stress');
      const label = opts?.context==='partner' ? `Add a short decompress buffer for both of you` : `Add a short decompress buffer`;
      const title = encodeURIComponent(`Decompress buffer after ${dr}`);
      const details = encodeURIComponent('5-10 minutes to reset and breathe.');
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
      actions.push({ label, type: 'calendar', url })
    }


    // Additional drainer specific labels (quick wins)
    if (templateId === 'week_emerging_drainer') {
      const dr = String(payload?.drainer || '')
      const map: Record<string,{ title:string; details:string }> = {
        work_stress: { title: 'Add 5‑min decompress buffer', details: 'A quick reset between meetings.' },
        screen_time: { title: 'Plan a 3 PM reset', details: 'Short walk, stretch or water break.' },
        commute: { title: 'Add 10‑min post‑commute buffer', details: 'Transition time to settle in.' },
      }
      const preset = map[dr]
      if(preset){
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(preset.title)}&details=${encodeURIComponent(preset.details)}`
        actions.push({ label: preset.title, type: 'calendar', url })
      }
    }


    return actions.length>0? actions: undefined
  }catch(e){
    // In non-hook contexts, just return undefined safely
    return undefined
  }
}

