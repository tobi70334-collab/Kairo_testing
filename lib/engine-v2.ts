export interface EventItem {
  nodeId: string;
  choiceId: string;
  xp: number;
  bias: string[];
  ts: number;
  severity: 'good'|'caution'|'bad';
}

export interface GameState {
  nodeId: string;
  xp: number;
  bias: Record<string, number>;
  steps: number;
  streak: number;
  events: EventItem[];
}

export interface ChoiceEffects {
  xp?: number;
  bias?: string[];
  feedback?: string;
  severity?: 'good'|'caution'|'bad';
}

export interface Badge {
  tier: string;
  xp: number;
}

export function applyChoiceV2(state: GameState, effects: ChoiceEffects): GameState {
  const newState = { ...state };
  
  // Add XP with streak bonus
  let xpGain = effects.xp || 0;
  if (effects.severity === 'good' && state.streak > 0) {
    xpGain += 2; // +2 XP streak bonus
  }
  newState.xp += xpGain;
  
  // Update bias counts
  if (effects.bias) {
    effects.bias.forEach(biasKey => {
      newState.bias[biasKey] = (newState.bias[biasKey] || 0) + 1;
    });
  }
  
  // Update streak
  if (effects.severity === 'good') {
    newState.streak += 1;
  } else {
    newState.streak = 0;
  }
  
  // Add event
  const event: EventItem = {
    nodeId: state.nodeId,
    choiceId: '', // Will be set by caller
    xp: xpGain,
    bias: effects.bias || [],
    ts: Date.now(),
    severity: effects.severity || 'caution'
  };
  newState.events.push(event);
  
  newState.steps += 1;
  
  return newState;
}

export function tierFromXP(xp: number, badges: Badge[]): Badge | undefined {
  const sortedBadges = badges.sort((a, b) => b.xp - a.xp);
  return sortedBadges.find(badge => xp >= badge.xp);
}

export function tickTimer(currentNode: any, elapsedMs: number): ChoiceEffects | null {
  if (currentNode.timerSec && elapsedMs > currentNode.timerSec * 1000) {
    return {
      xp: -5,
      bias: ['present_bias'],
      feedback: 'Time expired',
      severity: 'caution'
    };
  }
  return null;
}
