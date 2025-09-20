'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BadgeModal from '../../components/BadgeModal';
import ProgressRing from '../../components/ProgressRing';
import BiasIndicator from '../../components/BiasIndicator';
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
      // Redirect to home if no result
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

    // Get top two bias keys (excluding debias_ prefixed ones)
    const biasEntries = Object.entries(result.bias)
      .filter(([key]) => !key.startsWith('debias_'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    const biasTips: Record<string, string[]> = {
      overconfidence: [
        "Pause and verify sender domains",
        "Ask for a second check above 5k EUR"
      ],
      authority_bias: [
        "Voice confirm urgent CEO requests out of band"
      ],
      alert_fatigue: [
        "Treat high severity alerts as tasks, not popups"
      ],
      present_bias: [
        "Slow down when a timer is used as pressure"
      ],
      confirmation_bias: [
        "Verify using a separate, trusted channel"
      ],
      curiosity_bias: [
        "Do not click portals from email; go direct"
      ]
    };

    return biasEntries.map(([biasKey, count]) => ({
      bias: biasKey,
      count,
      tips: biasTips[biasKey] || ["Consider this bias in future decisions"]
    }));
  };

  const getSeverityIcon = (severity: 'good'|'caution'|'bad') => {
    switch (severity) {
      case 'good':
        return '✅';
      case 'caution':
        return '⚠️';
      case 'bad':
        return '❌';
      default:
        return '•';
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  if (!result || !persona) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const personaInfo = CHAR[persona];
  const biasTips = getBiasTips();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Training Complete</h1>
            <p className="text-slate-600 mb-4">
              Well done, {personaInfo.name}!
            </p>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{result.xp}</div>
                <div className="text-sm text-slate-500">XP Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">{result.events.length}</div>
                <div className="text-sm text-slate-500">Decisions Made</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Hero */}
        {badge && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white text-center">
            <div className="text-6xl mb-4">
              {badge.tier === 'Bronze' ? '🥉' : badge.tier === 'Silver' ? '🥈' : '🥇'}
            </div>
            <h2 className="text-2xl font-bold mb-2">{badge.tier} Badge Earned!</h2>
            <p className="text-emerald-100">
              You've demonstrated strong security awareness
            </p>
          </div>
        )}

        {/* Bias Tips */}
        {biasTips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Bias Insights</h3>
            <div className="space-y-4">
              {biasTips.map(({ bias, count, tips }) => (
                <div key={bias} className="border-l-4 border-amber-400 pl-4">
                  <h4 className="font-medium text-slate-900 capitalize mb-2">
                    {bias.replace(/_/g, ' ')} ({count} instances)
                  </h4>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-sm text-slate-600">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total XP</span>
                <span className="text-2xl font-bold text-emerald-600">{result.xp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Decisions Made</span>
                <span className="text-xl font-semibold text-slate-800">{result.events.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Success Rate</span>
                <span className="text-xl font-semibold text-slate-800">
                  {Math.round((result.events.filter(e => e.severity === 'good').length / result.events.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Bias Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Bias Analysis</h3>
            <div className="space-y-3">
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
                <p className="text-slate-500 text-sm">No biases detected</p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievements</h3>
            <div className="space-y-2">
              {unlockedAchievements.length > 0 ? (
                unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-sm text-slate-700">{achievement.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No achievements yet</p>
              )}
              {unlockedAchievements.length > 3 && (
                <p className="text-xs text-slate-500">+{unlockedAchievements.length - 3} more</p>
              )}
            </div>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Decision Timeline</h3>
          <div className="space-y-3">
            {result.events.map((event, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-lg">
                  {getSeverityIcon(event.severity)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    Decision {index + 1}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatTimestamp(event.ts)} • {event.xp > 0 ? '+' : ''}{event.xp} XP
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  {event.bias.length > 0 && (
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                      {event.bias.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <Link
            href="/play"
            className="inline-block w-full md:w-auto h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl px-8 transition-colors"
            aria-label="Play again"
          >
            Play Again
          </Link>
        </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        tier={badge?.tier || ''}
        xp={badge?.xp || 0}
        reason="You've demonstrated strong security awareness"
      />
    </div>
  );
}
