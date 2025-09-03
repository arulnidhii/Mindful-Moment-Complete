import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function ActionIcon({ type, color, size=18 }: { type: string; color: string; size?: number }){
  const name = (
    type==='phone'? 'call':
    type==='sms'? 'sms':
    type==='whatsapp'? 'whatsapp':
    type==='calendar'? 'event':
    type==='maps'? 'place':
    type==='reminder'? 'notifications':
    'bolt'
  ) as any
  return <MaterialIcons name={name} size={size} color={color} />
}

