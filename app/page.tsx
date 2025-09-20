'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterId, CHAR } from '../lib/characters';

export default function LandingPage() {
  const [selectedPersona, setSelectedPersona] = useState<CharacterId | null>(null);
  const router = useRouter();

  const handleStart = () => {
    if (selectedPersona) {
      localStorage.setItem('kairo.persona', selectedPersona);
      localStorage.removeItem('kairo.state');
      router.push('/play');
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedPersona}
          className={`w-full h-12 rounded-xl font-medium transition-colors ${
            selectedPersona
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Start training with selected persona"
        >
          Start Training
        </button>
      </div>
    </div>
  );
}
