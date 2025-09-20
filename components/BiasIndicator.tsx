'use client';

interface BiasIndicatorProps {
  biasType: string;
  count: number;
  isActive: boolean;
}

export default function BiasIndicator({ biasType, count, isActive }: BiasIndicatorProps) {
  const getBiasInfo = (type: string) => {
    const biasMap: Record<string, { color: string; icon: string; label: string }> = {
      overconfidence: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🎯', label: 'Overconfidence' },
      authority_bias: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '👑', label: 'Authority Bias' },
      present_bias: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏰', label: 'Present Bias' },
      confirmation_bias: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🔍', label: 'Confirmation Bias' },
      curiosity_bias: { color: 'bg-pink-100 text-pink-800 border-pink-200', icon: '🔗', label: 'Curiosity Bias' },
      alert_fatigue: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🚨', label: 'Alert Fatigue' },
      optimism_bias: { color: 'bg-green-100 text-green-800 border-green-200', icon: '☀️', label: 'Optimism Bias' },
      status_quo: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📊', label: 'Status Quo' },
      bandwagon_effect: { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: '👥', label: 'Bandwagon Effect' }
    };
    
    return biasMap[type] || { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '🧠', label: type };
  };

  const biasInfo = getBiasInfo(biasType);

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
      isActive 
        ? `${biasInfo.color} scale-105 shadow-md` 
        : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
      <span className="text-lg">{biasInfo.icon}</span>
      <span className="text-sm font-medium">{biasInfo.label}</span>
      {count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive ? 'bg-white bg-opacity-50' : 'bg-slate-200'
        }`}>
          {count}
        </span>
      )}
    </div>
  );
}
