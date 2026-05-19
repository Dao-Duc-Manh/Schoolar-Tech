interface GPAOverviewCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  tone?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
}

const toneClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
  neutral: 'bg-surface-container text-on-surface',
};

export function GPAOverviewCard({ title, value, subtitle, icon, tone = 'neutral' }: GPAOverviewCardProps) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5 shadow-sm">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${toneClasses[tone]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">{title}</p>
      <p className="mt-1 text-3xl font-black text-on-surface tracking-tight">{value}</p>
      {subtitle && <p className="mt-2 text-xs text-on-surface-variant">{subtitle}</p>}
    </div>
  );
}
