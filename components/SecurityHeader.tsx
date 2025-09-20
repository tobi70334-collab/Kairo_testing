'use client';

interface SecurityHeaderProps {
  title: string;
  subtitle?: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
}

export default function SecurityHeader({ title, subtitle, level, progress = 0 }: SecurityHeaderProps) {
  const getLevelColor = () => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-500 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-500 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-500 bg-red-100 border-red-200';
    }
  };

  const getLevelIcon = () => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-slate-300 text-lg">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`px-4 py-2 rounded-lg border-2 flex items-center space-x-2 ${getLevelColor()}`}>
              <span className="text-xl">{getLevelIcon()}</span>
              <span className="font-semibold uppercase text-sm">{level} Risk</span>
            </div>
            
            {progress > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-slate-300 text-sm">Progress</span>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-slate-300 text-sm font-mono">{progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
