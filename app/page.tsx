'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterId, CHAR } from '../lib/characters';
import SecurityHeader from '../components/SecurityHeader';
import SecurityCard from '../components/SecurityCard';

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
    id: 'escalating-bec',
    title: 'Escalating BEC Attack Simulation',
    difficulty: 'progressive',
    description: 'Experience a sophisticated multi-stage BEC attack that escalates based on your decisions. Test your bias awareness through 5 escalating decision points.',
    xpRange: '10-80 XP',
    estimatedTime: '8-15 min'
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
      case 'progressive': return 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'progressive': return '⚡';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SecurityHeader 
        title="KAIRO Lite v2" 
        subtitle="Advanced Cybersecurity Training Platform"
        level="high"
      />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Cybersecurity Training</h1>
              <p className="text-slate-300 text-lg">Bias-Aware Phishing & BEC Simulation</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SecurityCard title="Real-time Threat Detection" icon="🔍" variant="success">
              <p className="text-slate-600 text-sm">Advanced behavioral analysis and bias detection</p>
            </SecurityCard>
            <SecurityCard title="Progressive Escalation" icon="⚡" variant="warning">
              <p className="text-slate-600 text-sm">Dynamic scenarios that adapt to your decisions</p>
            </SecurityCard>
            <SecurityCard title="Cognitive Bias Training" icon="🧠" variant="default">
              <p className="text-slate-600 text-sm">Learn to identify and overcome decision biases</p>
            </SecurityCard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Persona Selection */}
          <SecurityCard title="Select Your Role" icon="👤" className="h-fit">
            <div className="space-y-4">
              {(['acct', 'pm'] as CharacterId[]).map((personaId) => {
                const persona = CHAR[personaId];
                const isSelected = selectedPersona === personaId;
                
                return (
                  <button
                    key={personaId}
                    onClick={() => setSelectedPersona(personaId)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {persona.avatar ? (
                          <img 
                            src={persona.avatar} 
                            alt={persona.name}
                            className="w-12 h-12 rounded-full"
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
          </SecurityCard>

          {/* Scenario Selection */}
          <SecurityCard title="Training Scenario" icon="🎯" className="h-fit">
            <div className="space-y-4">
              {SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario === scenario.id;
                
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getDifficultyIcon(scenario.difficulty)}</span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {scenario.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {scenario.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <span>💎</span>
                        <span>{scenario.xpRange}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{scenario.estimatedTime}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </SecurityCard>
        </div>

        {/* Start Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleStart}
            disabled={!selectedPersona || !selectedScenario}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${
              selectedPersona && selectedScenario
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!selectedPersona ? 'Select a role' : !selectedScenario ? 'Select a scenario' : '🚀 Start Training'}
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Social Engineering</h3>
            <p className="text-slate-400 text-sm">Test your ability to resist manipulation tactics</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Bias Detection</h3>
            <p className="text-slate-400 text-sm">Identify and overcome cognitive biases</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Analytics</h3>
            <p className="text-slate-400 text-sm">Detailed performance analysis and insights</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Achievements</h3>
            <p className="text-slate-400 text-sm">Unlock badges and track progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}