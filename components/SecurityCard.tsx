'use client';

interface SecurityCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  className?: string;
}

export default function SecurityCard({ title, icon, children, variant = 'default', className = '' }: SecurityCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'success':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className={`rounded-xl border-2 shadow-lg ${getVariantStyles()} ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconStyles()}`}>
            <span className="text-xl">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
