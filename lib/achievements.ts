export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'security' | 'bias' | 'speed' | 'streak' | 'scenario';
  requirement: {
    type: 'xp' | 'scenarios' | 'streak' | 'bias_avoided' | 'perfect_score';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Security Achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first scenario',
    icon: '👶',
    category: 'scenario',
    requirement: { type: 'scenarios', value: 1 },
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'security_master',
    name: 'Security Master',
    description: 'Complete all scenarios without falling for any attacks',
    icon: '🛡️',
    category: 'security',
    requirement: { type: 'scenarios', value: 5 },
    rarity: 'legendary',
    unlocked: false
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieve a perfect score in any scenario',
    icon: '💯',
    category: 'scenario',
    requirement: { type: 'perfect_score', value: 1 },
    rarity: 'epic',
    unlocked: false
  },

  // Bias Achievements
  {
    id: 'bias_breaker',
    name: 'Bias Breaker',
    description: 'Avoid 10 cognitive bias traps',
    icon: '🧠',
    category: 'bias',
    requirement: { type: 'bias_avoided', value: 10 },
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'authority_skeptic',
    name: 'Authority Skeptic',
    description: 'Never fall for authority bias',
    icon: '👑',
    category: 'bias',
    requirement: { type: 'bias_avoided', value: 5 },
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'time_pressure_master',
    name: 'Time Pressure Master',
    description: 'Make good decisions under time pressure',
    icon: '⏰',
    category: 'bias',
    requirement: { type: 'bias_avoided', value: 3 },
    rarity: 'epic',
    unlocked: false
  },

  // Speed Achievements
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: 'Complete a scenario in under 2 minutes',
    icon: '⚡',
    category: 'speed',
    requirement: { type: 'xp', value: 50 },
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'lightning_reflexes',
    name: 'Lightning Reflexes',
    description: 'Complete 3 scenarios in under 5 minutes each',
    icon: '⚡⚡',
    category: 'speed',
    requirement: { type: 'scenarios', value: 3 },
    rarity: 'epic',
    unlocked: false
  },

  // Streak Achievements
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Get 5 consecutive good decisions',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 5 },
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Get 10 consecutive good decisions',
    icon: '🚀',
    category: 'streak',
    requirement: { type: 'streak', value: 10 },
    rarity: 'legendary',
    unlocked: false
  },

  // XP Achievements
  {
    id: 'xp_collector',
    name: 'XP Collector',
    description: 'Earn 100 total XP',
    icon: '💎',
    category: 'scenario',
    requirement: { type: 'xp', value: 100 },
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'xp_master',
    name: 'XP Master',
    description: 'Earn 500 total XP',
    icon: '💎💎',
    category: 'scenario',
    requirement: { type: 'xp', value: 500 },
    rarity: 'epic',
    unlocked: false
  }
];

export class AchievementManager {
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private unlockedAchievements: string[] = [];

  constructor() {
    this.loadProgress();
  }

  checkAchievements(gameStats: {
    totalXP: number;
    scenariosCompleted: number;
    currentStreak: number;
    biasAvoided: number;
    perfectScores: number;
  }): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;
      const { type, value } = achievement.requirement;

      switch (type) {
        case 'xp':
          shouldUnlock = gameStats.totalXP >= value;
          break;
        case 'scenarios':
          shouldUnlock = gameStats.scenariosCompleted >= value;
          break;
        case 'streak':
          shouldUnlock = gameStats.currentStreak >= value;
          break;
        case 'bias_avoided':
          shouldUnlock = gameStats.biasAvoided >= value;
          break;
        case 'perfect_score':
          shouldUnlock = gameStats.perfectScores >= value;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.unlockedAchievements.push(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    this.saveProgress();
    return newlyUnlocked;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-slate-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-slate-500';
    }
  }

  private loadProgress(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kairo.achievements');
      if (saved) {
        this.unlockedAchievements = JSON.parse(saved);
        this.achievements.forEach(achievement => {
          if (this.unlockedAchievements.includes(achievement.id)) {
            achievement.unlocked = true;
          }
        });
      }
    }
  }

  private saveProgress(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kairo.achievements', JSON.stringify(this.unlockedAchievements));
    }
  }
}
