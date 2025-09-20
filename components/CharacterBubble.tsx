'use client';

import { ReactNode } from 'react';
import { CharacterId, CHAR } from '../lib/characters';

interface CharacterBubbleProps {
  actorId: CharacterId;
  name?: string;
  children: ReactNode;
}

export default function CharacterBubble({ actorId, name, children }: CharacterBubbleProps) {
  const character = CHAR[actorId];
  const displayName = name || character.name;
  const isLeftAligned = actorId !== 'impostor';
  const isSystem = actorId === 'system';

  const getThemeClasses = () => {
    switch (character.theme) {
      case 'emerald':
        return 'bg-emerald-100 border-emerald-200 text-emerald-900';
      case 'rose':
        return 'bg-rose-100 border-rose-200 text-rose-900';
      case 'slate':
        return 'bg-slate-100 border-slate-200 text-slate-900';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-900';
    }
  };

  const getAvatarFallback = () => {
    const initials = character.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const bgColor = character.theme === 'emerald' ? 'bg-emerald-500' : 
                   character.theme === 'rose' ? 'bg-rose-500' : 'bg-slate-500';
    
    return (
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm`}>
        {initials}
      </div>
    );
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-2xl">
          <div className="text-center mb-2">
            <span className="text-sm font-medium text-slate-600">{displayName}</span>
          </div>
          <div className={`px-4 py-3 rounded-2xl border-2 ${getThemeClasses()} text-center`}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex my-4 ${isLeftAligned ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start space-x-3 max-w-2xl ${isLeftAligned ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        <div className="flex-shrink-0">
          {character.avatar ? (
            <img 
              src={character.avatar} 
              alt={displayName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            getAvatarFallback()
          )}
        </div>
        <div className="flex flex-col">
          <div className={`text-sm font-medium text-slate-600 mb-1 ${isLeftAligned ? 'text-left' : 'text-right'}`}>
            {displayName}
          </div>
          <div className={`px-4 py-3 rounded-2xl border-2 ${getThemeClasses()} ${isLeftAligned ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
