'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BadgeModal from '../../components/BadgeModal';
import ProgressRing from '../../components/ProgressRing';
import BiasIndicator from '../../components/BiasIndicator';
import SecurityHeader from '../../components/SecurityHeader';
import SecurityCard from '../../components/SecurityCard';
import ThreatIndicator from '../../components/ThreatIndicator';
import { tierFromXP } from '../../lib/engine-v2';
import { CharacterId, CHAR } from '../../lib/characters';
import { AchievementManager } from '../../lib/achievements';

interface GameResult {
  xp: number;
  bias: Record<string, number>;
  badges: { tier: string; xp: number }[];
  events: {
    nodeId: string;
    choiceId: string;
    xp: number;
    bias: string[];
    ts: number;
    severity: 'good'|'caution'|'bad';
  }[];
}

export default function DebriefPage() {
  const [result, setResult] = useState<GameResult | null>(null);
  const [persona, setPersona] = useState<CharacterId | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badge, setBadge] = useState<{ tier: string; xp: number } | null>(null);
  const [achievementManager] = useState(() => new AchievementManager());
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);

  useEffect(() => {
    const resultData = localStorage.getItem('kairo.result');
    const personaId = localStorage.getItem('kairo.persona') as CharacterId;
    
    if (!resultData || !personaId) {
      window.location.href = '/';
      return;
    }

    const parsedResult = JSON.parse(resultData);
    setResult(parsedResult);
    setPersona(personaId);

    // Clear the result data
    localStorage.removeItem('kairo.result');
    localStorage.removeItem('kairo.state');

    // Show badge if earned
    const earnedBadge = tierFromXP(parsedResult.xp, parsedResult.badges);
    if (earnedBadge) {
      setBadge(earnedBadge);
      setShowBadgeModal(true);
    }

    // Load achievements
    setUnlockedAchievements(achievementManager.getUnlockedAchievements());
  }, []);

  const getBiasTips = () => {
    if (!result) return [];
    
    const tips = [];
    if (result.bias.authority_bias > 0) {
      tips.push("Authority Bias: Always verify requests from executives through independent channels");
    }
    if (result.bias.present_bias > 0) {
      tips.push("Present Bias: Don't let urgency override security procedures");
    }
    if (result.bias.confirmation_bias > 0) {
      tips.push("Confirmation Bias: Seek evidence that contradicts your initial assumptions");
    }
    if (result.bias.overconfidence > 0) {
      tips.push("Overconfidence: Even experienced professionals can be targeted");
    }
    
    return tips;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'good': return '✅';
      case 'caution': return '⚠️';
      case 'bad': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  if (!result || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Results</h2>
          <p className="text-slate-300">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  const personaInfo = CHAR[persona];
  const biasTips = getBiasTips();
  const successRate = Math.round((result.events.filter(e => e.severity === 'good').length / result.events.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SecurityHeader 
        title="Training Complete" 
        subtitle={`Well done, ${personaInfo.name}!`}
        level={successRate >= 80 ? 'low' : successRate >= 60 ? 'medium' : 'high'}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SecurityCard title="Performance Score" icon="📊" variant="success">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{result.xp}</div>
              <div className="text-slate-600 font-medium">Total XP</div>
            </div>
          </SecurityCard>
          
          <SecurityCard title="Decisions Made" icon="🎯" variant="default">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-800 mb-2">{result.events.length}</div>
              <div className="text-slate-600 font-medium">Total Decisions</div>
            </div>
          </SecurityCard>
          
          <SecurityCard title="Success Rate" icon="🏆" variant={successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'danger'}>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{successRate}%</div>
              <div className="text-slate-600 font-medium">Success Rate</div>
            </div>
          </SecurityCard>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bias Analysis */}
          <SecurityCard title="Bias Analysis" icon="🧠" variant="warning">
            <div className="space-y-4">
              {Object.entries(result.bias).length > 0 ? (
                Object.entries(result.bias).map(([biasType, count]) => (
                  <BiasIndicator
                    key={biasType}
                    biasType={biasType}
                    count={count}
                    isActive={count > 0}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-slate-600 font-medium">No biases detected!</p>
                  <p className="text-slate-500 text-sm">Excellent decision-making</p>
                </div>
              )}
            </div>
          </SecurityCard>

          {/* Achievements */}
          <SecurityCard title="Achievements" icon="🏆" variant="default">
            <div className="space-y-3">
              {unlockedAchievements.length > 0 ? (
                unlockedAchievements.slice(0, 4).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{achievement.name}</div>
                      <div className="text-sm text-slate-600">{achievement.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      achievement.rarity === 'common' ? 'bg-slate-200 text-slate-800' :
                      achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                      achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-slate-600 font-medium">No achievements yet</p>
                  <p className="text-slate-500 text-sm">Keep training to unlock badges</p>
                </div>
              )}
            </div>
          </SecurityCard>
        </div>

        {/* Decision Timeline */}
        <SecurityCard title="Decision Timeline" icon="📈" variant="default" className="mb-8">
          <div className="space-y-4">
            {result.events.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <div className="text-2xl">
                  {getSeverityIcon(event.severity)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">
                    Decision {index + 1}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatTimestamp(event.ts)} • {event.xp > 0 ? '+' : ''}{event.xp} XP
                  </div>
                </div>
                <div className="text-right">
                  {event.bias.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.bias.map((bias, idx) => (
                        <span key={idx} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                          {bias}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SecurityCard>

        {/* Bias Tips */}
        {biasTips.length > 0 && (
          <SecurityCard title="Improvement Tips" icon="💡" variant="warning" className="mb-8">
            <div className="space-y-3">
              {biasTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-500 text-lg">💡</span>
                  <p className="text-slate-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </SecurityCard>
        )}

        {/* Actions */}
        <div className="text-center">
          <Link
            href="/play"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">🔄</span>
            <span>Play Again</span>
          </Link>
        </div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && badge && (
        <BadgeModal
          isOpen={true}
          onClose={() => setShowBadgeModal(false)}
          tier={badge.tier}
          xp={badge.xp}
          reason={`Earned ${badge.tier} badge for ${badge.xp} XP`}
        />
      )}
    </div>
  );
}