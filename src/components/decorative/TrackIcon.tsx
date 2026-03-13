import type { TrackId } from '../../types';

interface TrackIconProps {
  trackId: TrackId;
  size?: number;
  color?: string;
  className?: string;
}

function LotusIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Center petal - pointing up */}
      <path
        d="M32 6C28 16 26 24 26 32C26 40 28 46 32 54C36 46 38 40 38 32C38 24 36 16 32 6Z"
        fill={color}
        opacity={0.9}
      />
      {/* Left petal */}
      <path
        d="M28 40C20 36 14 34 10 36C14 28 20 22 28 20C26 26 26 34 28 40Z"
        fill={color}
        opacity={0.55}
      />
      {/* Right petal */}
      <path
        d="M36 40C44 36 50 34 54 36C50 28 44 22 36 20C38 26 38 34 36 40Z"
        fill={color}
        opacity={0.55}
      />
      {/* Far left petal */}
      <path
        d="M22 44C14 42 8 42 4 44C8 36 14 32 22 30C20 36 20 40 22 44Z"
        fill={color}
        opacity={0.3}
      />
      {/* Far right petal */}
      <path
        d="M42 44C50 42 56 42 60 44C56 36 50 32 42 30C44 36 44 40 42 44Z"
        fill={color}
        opacity={0.3}
      />
      {/* Center dot */}
      <circle cx={32} cy={30} r={3} fill={color} opacity={0.7} />
    </svg>
  );
}

function DharmaWheelIcon({ size, color }: { size: number; color: string }) {
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx={32} cy={32} r={26} stroke={color} strokeWidth={2.5} opacity={0.8} />
      <circle cx={32} cy={32} r={10} stroke={color} strokeWidth={2} opacity={0.6} />
      <circle cx={32} cy={32} r={4} fill={color} opacity={0.9} />
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <path
            key={angle}
            d={`M${32 + 10 * Math.cos(rad)} ${32 + 10 * Math.sin(rad)} L${32 + 26 * Math.cos(rad)} ${32 + 26 * Math.sin(rad)}`}
            stroke={color}
            strokeWidth={1.8}
            opacity={0.5}
          />
        );
      })}
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`rim-${angle}`}
            cx={32 + 26 * Math.cos(rad)}
            cy={32 + 26 * Math.sin(rad)}
            r={2.5}
            fill={color}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
}

function SacredFlameIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M32 4C32 4 18 22 18 38C18 46 24.3 52 32 52C39.7 52 46 46 46 38C46 22 32 4 32 4Z"
        fill={color}
        opacity={0.3}
      />
      <path
        d="M32 12C32 12 22 26 22 36C22 42 26.5 46 32 46C37.5 46 42 42 42 36C42 26 32 12 32 12Z"
        fill={color}
        opacity={0.5}
      />
      <path
        d="M32 20C32 20 26 30 26 36C26 39.3 28.7 42 32 42C35.3 42 38 39.3 38 36C38 30 32 20 32 20Z"
        fill={color}
        opacity={0.8}
      />
      <path
        d="M32 28C32 28 29 33 29 36C29 37.7 30.3 39 32 39C33.7 39 35 37.7 35 36C35 33 32 28 32 28Z"
        fill={color}
        opacity={0.4}
      />
      <line x1={20} y1={56} x2={44} y2={56} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <circle cx={32} cy={56} r={1.5} fill={color} opacity={0.5} />
    </svg>
  );
}

export function TrackIcon({ trackId, size = 32, color = '#D4763C', className }: TrackIconProps) {
  const icon = (() => {
    switch (trackId) {
      case 'vachanamrut':
        return <LotusIcon size={size} color={color} />;
      case 'gita':
        return <DharmaWheelIcon size={size} color={color} />;
      case 'upanishad':
        return <SacredFlameIcon size={size} color={color} />;
      default:
        return <LotusIcon size={size} color={color} />;
    }
  })();

  return className ? <span className={className}>{icon}</span> : icon;
}
