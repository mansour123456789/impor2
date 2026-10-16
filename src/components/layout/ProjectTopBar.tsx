import React from 'react';
import { Building2, Clock, FileText, History, PanelLeftClose, PanelLeft, RefreshCw } from 'lucide-react';
import { ProjectInfo } from '../../types/dpgf';

interface ProjectTopBarProps {
  project: ProjectInfo;
  onOpenFiles: () => void;
  onOpenHistory: () => void;
  summaryOpen: boolean;
  onToggleSummary: () => void;
  onSwitchProjectDemo: () => void;
}

export const ProjectTopBar: React.FC<ProjectTopBarProps> = ({
  project,
  onOpenFiles,
  onOpenHistory,
  summaryOpen,
  onToggleSummary,
  onSwitchProjectDemo,
}) => {
  const getBadgeStyle = (status: ProjectInfo['status']) => {
    switch (status) {
      case 'Validé':
      case 'Terminé':
        return 'bg-[#EEFFF1] text-[#16A148] border-emerald-300';
      case 'En cours':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-[#FFF4F2] text-[#FE7448] border-[#FFD9D0]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1B4591] sm:text-3xl dark:text-sky-400">
              {project.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold shadow-sm ${getBadgeStyle(
                project.status
              )}`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
          )}
        </div>

        {/* Demo switcher */}
        <button
          type="button"
          onClick={onSwitchProjectDemo}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-[#1B4591] hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Basculer entre le projet Hôtel et la Buanderie Chevilly-Larue"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Basculer projet démo</span>
        </button>
      </div>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-5">
          {/* Client */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Building2 className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
            <span>{project.client}</span>
          </div>

          <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
            <span>{project.deadline}</span>
          </div>

          {/* Team Initials */}
          {project.teamMembers && project.teamMembers.length > 0 && (
            <>
              <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />
              <div className="flex -space-x-2">
                {project.teamMembers.map((initials, idx) => (
                  <span
                    key={idx}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1B4591] text-xs font-bold text-white shadow-sm ring-1 ring-slate-100 dark:border-slate-900"
                  >
                    {initials}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons Right */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSummary}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {summaryOpen ? (
              <>
                <PanelLeftClose className="h-3.5 w-3.5" />
                <span>Masquer Récapitulatif</span>
              </>
            ) : (
              <>
                <PanelLeft className="h-3.5 w-3.5" />
                <span>Afficher Récapitulatif</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenFiles}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileText className="h-3.5 w-3.5 text-[#1B4591]" />
            <span>Fichiers</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B4591] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#163a7a]"
          >
            <History className="h-3.5 w-3.5" />
            <span>Historique</span>
          </button>
        </div>
      </div>
    </div>
  );
};
