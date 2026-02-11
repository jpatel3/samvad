import { Card } from '../common/Card';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <Card key={i} className="text-center">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <p className="text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">
            {stat.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
