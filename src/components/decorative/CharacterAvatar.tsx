interface CharacterAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const AVATAR_PALETTES: [string, string][] = [
  ['#D4763C', '#E89A6A'],
  ['#8B6DB0', '#B08DD4'],
  ['#4A8B6F', '#6DB08D'],
  ['#B08D4A', '#D4B06D'],
  ['#6D8BB0', '#8DA8D4'],
  ['#B06D6D', '#D48D8D'],
  ['#6D6DB0', '#8D8DD4'],
  ['#8B8B46', '#ADAD6D'],
];

function getAvatarColors(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function CharacterAvatar({ name, size = 44, className }: CharacterAvatarProps) {
  const [colorStart, colorEnd] = getAvatarColors(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38;
  const gradientId = `avatar-${name.replace(/\s/g, '')}`;

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill={`url(#${gradientId})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize,
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </span>
      </div>
    </div>
  );
}
