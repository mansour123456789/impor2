import React from 'react';
import { ProjectPhase } from '../../types/dpgf';
import { StepNumberEllipses, StepEllipseVariant } from './StepNumberEllipses';

const PHASES: { id: ProjectPhase; label: string }[] = [
  { id: 'import', label: 'Import DPGF' },
  { id: 'metres', label: 'Métrés' },
  { id: 'consultation', label: 'Consultations' },
  { id: 'chiffrage', label: 'Chiffrage' },
  { id: 'export', label: 'Export DPGF' },
];

interface ProjectStepperProps {
  currentPhase: ProjectPhase;
  onPhaseChange: (phase: ProjectPhase) => void;
}

export const ProjectStepper: React.FC<ProjectStepperProps> = ({ currentPhase, onPhaseChange }) => {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  const getConnectorClass = (index: number) => {
    if (index + 1 < currentIndex) {
      return 'border-solid border-[#16A148]';
    }
    if (index === currentIndex - 1 && currentIndex > 0) {
      return 'border-dashed border-[#16A148]';
    }
    return 'border-dashed border-[#BFC7D6]';
  };

  return (
    <div className="flex w-full items-center justify-between gap-1 px-2 py-2">
      {PHASES.map((phase, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const stepNumber = index + 1;

        const variant: StepEllipseVariant = isActive
          ? 'active'
          : isCompleted
          ? 'completed'
          : 'upcoming';

        return (
          <React.Fragment key={phase.id}>
            <button
              type="button"
              className="group flex min-w-0 flex-1 flex-col items-center gap-2 border-0 bg-transparent p-0 cursor-pointer transition-all hover:opacity-90 focus-visible:outline-none"
              onClick={() => onPhaseChange(phase.id)}
            >
              <StepNumberEllipses number={stepNumber} variant={variant} />
              <span
                className={`text-center text-xs font-semibold leading-tight transition-colors sm:text-sm ${
                  isActive
                    ? 'text-[#1B4591] font-bold'
                    : isCompleted
                    ? 'text-[#16A148]'
                    : 'text-[#6D7A91] group-hover:text-slate-800'
                }`}
              >
                {phase.label}
              </span>
            </button>

            {index < PHASES.length - 1 && (
              <div
                className={`mb-5 hidden h-0 w-6 shrink-0 border-t-2 sm:block sm:w-10 md:w-16 lg:w-24 ${getConnectorClass(
                  index
                )}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
