export type CharacterId = 'acct'|'pm'|'impostor'|'system';

export const CHAR = {
  acct: { id:'acct', name:'Senior Accountant', avatar:'/characters/acct.svg', theme:'emerald' },
  pm: { id:'pm', name:'Project Manager', avatar:'/characters/pm.svg', theme:'emerald' },
  impostor: { id:'impostor', name:'Impostor', avatar:'/characters/impostor.svg', theme:'rose' },
  system: { id:'system', name:'System', avatar:'', theme:'slate' }
} as const;
