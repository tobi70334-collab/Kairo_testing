'use client';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  xp: number;
  reason: string;
}

export default function BadgeModal({ isOpen, onClose, tier, xp, reason }: BadgeModalProps) {
  if (!isOpen) return null;

  const getBadgeIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      default:
        return '🏆';
    }
  };

  const getBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'text-amber-600';
      case 'silver':
        return 'text-slate-500';
      case 'gold':
        return 'text-yellow-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">
          {getBadgeIcon(tier)}
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${getBadgeColor(tier)}`}>
          {tier} Badge Earned!
        </h2>
        
        <div className="text-lg font-semibold text-slate-700 mb-2">
          {xp} XP
        </div>
        
        <p className="text-slate-600 mb-6">
          {reason}
        </p>
        
        <button
          onClick={onClose}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          aria-label="Close badge modal"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
