import Svg, { G, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  /** colour of the inner highlight stroke on filled drops */
  accent?: string;
  variant?: 'filled' | 'outline';
  strokeWidth?: number;
}

const DROP_PATH =
  'M12 2.4c-.3 0-.6.15-.78.4C9.5 5.2 5 11.3 5 15.1 5 19 8.13 22 12 22s7-3 7-6.9c0-3.8-4.5-9.9-6.22-12.3A.96.96 0 0 0 12 2.4Z';

/** Blood drop with the curved highlight used throughout LifeLink. */
export function BloodDropIcon({ size = 24, color = '#fff', accent = '#C41E3A', variant = 'filled', strokeWidth = 2 }: IconProps) {
  if (variant === 'outline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={DROP_PATH} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <Path d="M15.2 15.6a3.4 3.4 0 0 1-2.9 2.9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={DROP_PATH} fill={color} />
      <Path d="M15.2 15.6a3.4 3.4 0 0 1-2.9 2.9" stroke={accent} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

/** Solid house with a cut-out door (active Home tab). */
export function HomeFilledIcon({ size = 24, color = '#C41E3A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.6 2.55a2.2 2.2 0 0 1 2.8 0l7 5.9c.5.42.8 1.04.8 1.7V19.8A2.2 2.2 0 0 1 19 22h-3.6v-6.2a1.6 1.6 0 0 0-1.6-1.6h-3.6a1.6 1.6 0 0 0-1.6 1.6V22H5a2.2 2.2 0 0 1-2.2-2.2v-9.65c0-.66.3-1.28.8-1.7l7-5.9Z"
        fill={color}
      />
    </Svg>
  );
}

/** Rounded six-armed medical star (hospital symbol). */
export function MedicalIcon({ size = 24, color = '#fff', variant = 'filled', strokeWidth = 1.8 }: IconProps) {
  const arms = [0, 60, 120];
  if (variant === 'outline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <G>
          {arms.map((deg) => (
            <Rect
              key={deg}
              x={9.6}
              y={2.6}
              width={4.8}
              height={18.8}
              rx={2.2}
              stroke={color}
              strokeWidth={strokeWidth}
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </G>
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {arms.map((deg) => (
        <Rect key={deg} x={9.5} y={2} width={5} height={20} rx={2.4} fill={color} transform={`rotate(${deg} 12 12)`} />
      ))}
    </Svg>
  );
}
