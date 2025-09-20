'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterId, CHAR } from '../lib/characters';

interface Scenario {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  xpRange: string;
  estimatedTime: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'beginner-phishing',
    title: 'Beginner: Suspicious Email',
    difficulty: 'beginner',
    description: 'Learn to identify basic phishing attempts and practice safe email handling.',
    xpRange: '5-25 XP',
    estimatedTime: '3-5 min'
  },
  {
    id: 'wire-transfer-mirage',
    title: 'Intermediate: Wire Transfer Mirage',
    difficulty: 'intermediate',
    description: 'Navigate a realistic BEC scenario with time pressure and evidence analysis.',
    xpRange: '10-40 XP',
    estimatedTime: '5-8 min'
  },
  {
    id: 'intermediate-ceo',
    title: 'Intermediate: CEO Impersonation',
    difficulty: 'intermediate',
    description: 'Handle executive impersonation attempts with proper verification procedures.',
    xpRange: '10-40 XP',
    estimatedTime: '4-7 min'
  },
  {
    id: 'advanced-multichannel',
    title: 'Advanced: Multi-Channel Attack',
    difficulty: 'advanced',
    description: 'Defend against sophisticated attacks using multiple communication channels.',
    xpRange: '15-55 XP',
    estimatedTime: '6-10 min'
  },
  {
    id: 'expert-sophisticated',
    title: 'Expert: Sophisticated BEC',
    difficulty: 'expert',
    description: 'Master complex attacks with red herrings and compromised accounts.',
    xpRange: '20-70 XP',
    estimatedTime: '8-12 min'
  }
];

export default function LandingPage() {
  const [selectedPersona, setSelectedPersona] = useState<CharacterId | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const router = useRouter();

  const handleStart = () => {
    if (selectedPersona && selectedScenario) {
      localStorage.setItem('kairo.persona', selectedPersona);
      localStorage.setItem('kairo.scenario', selectedScenario);
      localStorage.removeItem('kairo.state');
      router.push('/play');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🟠';
      case 'expert': return '🔴';
      default: return '⚪';
    }
  };

  const getAvatarFallback = (personaId: CharacterId) => {
    const persona = CHAR[personaId];
    const initials = persona.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const bgColor = persona.theme === 'emerald' ? 'bg-emerald-500' : 'bg-slate-500';
    
    return (
      <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-lg`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">KAIRO Lite v2</h1>
          <p className="text-lg text-slate-600">
            Immersive, bias-aware phishing and BEC training
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
            Choose your persona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {(['acct', 'pm'] as CharacterId[]).map((personaId) => {
              const persona = CHAR[personaId];
              const isSelected = selectedPersona === personaId;
              
              return (
                <button
                  key={personaId}
                  onClick={() => setSelectedPersona(personaId)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {persona.avatar ? (
                        <img 
                          src={persona.avatar} 
                          alt={persona.name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        getAvatarFallback(personaId)
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {persona.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {personaId === 'acct' 
                          ? 'Handle financial transactions and approvals'
                          : 'Manage projects and vendor relationships'
                        }
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
            Select a training scenario
          </h2>
          
          <div className="space-y-3">
            {SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario === scenario.id;
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getDifficultyIcon(scenario.difficulty)}</span>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {scenario.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {scenario.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>💎 {scenario.xpRange}</span>
                        <span>⏱️ {scenario.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedPersona || !selectedScenario}
          className={`w-full h-12 rounded-xl font-medium transition-colors ${
            selectedPersona && selectedScenario
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Start training with selected persona and scenario"
        >
          {!selectedPersona ? 'Select a persona' : !selectedScenario ? 'Select a scenario' : 'Start Training'}
        </button>
      </div>
    </div>
  );
}
