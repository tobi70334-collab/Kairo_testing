'use client';

import { CharacterId, CHAR } from '../lib/characters';

interface SceneHeaderProps {
  title: string;
  personaId: CharacterId;
  step: number;
  totalSteps: number;
  xp: number;
  progressPercent: number;
}

export default function SceneHeader({ title, personaId, step, totalSteps, xp, progressPercent }: SceneHeaderProps) {
  const persona = CHAR[personaId];
  
  const getAvatarFallback = () => {
    const initials = persona.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const bgColor = persona.theme === 'emerald' ? 'bg-emerald-500' : 
                   persona.theme === 'rose' ? 'bg-rose-500' : 'bg-slate-500';
    
    return (
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xs`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      {/* Progress bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500">
        <div 
          className="h-full bg-slate-200 transition-all duration-300"
          style={{ width: `${100 - progressPercent}%`, marginLeft: 'auto' }}
        />
      </div>
      
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {persona.avatar ? (
                <img 
                  src={persona.avatar} 
                  alt={persona.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                getAvatarFallback()
              )}
              <span className="text-sm font-medium text-slate-700">{persona.name}</span>
            </div>
            <div className="text-sm text-slate-500">
              Step {step} of {totalSteps}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-slate-700">
              {xp} XP
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
      </div>
    </div>
  );
}
