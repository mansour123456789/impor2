import React from 'react';
import { Check } from 'lucide-react';

const ACTIVE_OUTER = '#CDD6FB';
const ACTIVE_INNER = '#1B4591';
const COMPLETED_OUTER = '#C8EBD4';
const COMPLETED_INNER = '#16A148';
const INACTIVE_OUTER = '#BFC7D6';
const INACTIVE_INNER = '#6D7A91';

export type StepEllipseVariant = 'active' | 'completed' | 'upcoming';

interface StepNumberEllipsesProps {
  number: number;
  variant?: StepEllipseVariant;
  className?: string;
  size?: 'md' | 'lg';
}

export const StepNumberEllipses: React.FC<StepNumberEllipsesProps> = ({
  number,
  variant = 'upcoming',
  className = '',
  size = 'lg',
}) => {
  const outer =
    variant === 'active'
      ? ACTIVE_OUTER
      : variant === 'completed'
      ? COMPLETED_OUTER
      : INACTIVE_OUTER;

  const inner =
    variant === 'active'
      ? ACTIVE_INNER
      : variant === 'completed'
      ? COMPLETED_INNER
      : INACTIVE_INNER;

  const outerSize = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const innerSize = size === 'lg' ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-[10px]';
  const checkSize = size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';

  return (
    <div className={`relative flex shrink-0 items-center justify-center ${outerSize} ${className}`}>
      <div className="absolute inset-0 rounded-full transition-colors duration-200" style={{ backgroundColor: outer }} />
      <span
        className={`relative flex items-center justify-center rounded-full font-bold text-white shadow-sm transition-all duration-200 ${innerSize}`}
        style={{ backgroundColor: inner }}
      >
        {variant === 'completed' ? <Check className={checkSize} strokeWidth={3} /> : number}
      </span>
    </div>
  );
};
