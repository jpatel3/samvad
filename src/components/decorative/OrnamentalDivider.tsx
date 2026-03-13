interface OrnamentalDividerProps {
  width?: number;
  color?: string;
  className?: string;
}

export function OrnamentalDivider({ width = 120, color, className }: OrnamentalDividerProps) {
  const accentColor = color ?? '#D4763C';

  return (
    <div className={`flex items-center justify-center my-4 ${className ?? ''}`}>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <svg width={width} height={20} viewBox={`0 0 ${width} 20`}>
        <path
          d={`M${width / 2} 2 L${width / 2 + 8} 10 L${width / 2} 18 L${width / 2 - 8} 10 Z`}
          fill={accentColor}
          opacity={0.3}
        />
        <circle cx={width / 2} cy={10} r={2.5} fill={accentColor} opacity={0.6} />
        <circle cx={width / 2 - 18} cy={10} r={1.5} fill={accentColor} opacity={0.3} />
        <circle cx={width / 2 - 28} cy={10} r={1} fill={accentColor} opacity={0.2} />
        <circle cx={width / 2 + 18} cy={10} r={1.5} fill={accentColor} opacity={0.3} />
        <circle cx={width / 2 + 28} cy={10} r={1} fill={accentColor} opacity={0.2} />
      </svg>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
