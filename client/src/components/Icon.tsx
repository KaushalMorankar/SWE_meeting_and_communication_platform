import { HugeiconsIcon } from '@hugeicons/react';
import { CSSProperties, ReactNode } from 'react';

interface IconProps {
  icon: any;
  size?: number;
  className?: string;
  style?: CSSProperties;
  [key: string]: any;
}

/**
 * Wrapper around HugeiconsIcon for consistent usage with size, className, and style (e.g. color).
 */
export default function Icon({ icon, size = 24, className, style, ...rest }: IconProps) {
  if (icon == null || !Array.isArray(icon)) {
    return null;
  }
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={style?.color ?? 'currentColor'}
      className={className}
      {...rest}
    />
  );
}
