'use client';

interface ThreatIndicatorProps {
  type: 'phishing' | 'bec' | 'social_engineering' | 'malware' | 'insider_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  count?: number;
}

export default function ThreatIndicator({ type, severity, isActive, count = 0 }: ThreatIndicatorProps) {
  const getThreatInfo = () => {
    const threatMap = {
      phishing: { icon: '🎣', label: 'Phishing', color: 'blue' },
      bec: { icon: '💼', label: 'BEC Attack', color: 'purple' },
      social_engineering: { icon: '🎭', label: 'Social Engineering', color: 'orange' },
      malware: { icon: '🦠', label: 'Malware', color: 'red' },
      insider_threat: { icon: '👤', label: 'Insider Threat', color: 'gray' }
    };
    return threatMap[type];
  };

  const getSeverityStyles = () => {
    switch (severity) {
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'high': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'critical': return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const threatInfo = getThreatInfo();

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
      isActive 
        ? `${getSeverityStyles()} scale-105 shadow-md` 
        : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
      <span className="text-lg">{threatInfo.icon}</span>
      <span className="text-sm font-medium">{threatInfo.label}</span>
      {count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive ? 'bg-white bg-opacity-50' : 'bg-slate-200'
        }`}>
          {count}
        </span>
      )}
      <div className={`w-2 h-2 rounded-full ${
        isActive ? 'bg-current animate-pulse' : 'bg-slate-300'
      }`} />
    </div>
  );
}
