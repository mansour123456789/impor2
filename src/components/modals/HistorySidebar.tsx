import React from 'react';
import { X, History, Clock, CheckCircle2, AlertCircle, FileSpreadsheet, Edit3, Trash2 } from 'lucide-react';
import { ProjectHistoryEvent } from '../../types/dpgf';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  events: ProjectHistoryEvent[];
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, events }) => {
  if (!isOpen) return null;

  const getEventBadge = (type: ProjectHistoryEvent['type']) => {
    switch (type) {
      case 'validation':
        return 'bg-[#EEFFF1] text-[#16A148] border-emerald-200';
      case 'rejet':
        return 'bg-[#FDEDED] text-[#DC2827] border-red-200';
      case 'import':
        return 'bg-[#EFF6FF] text-[#1B4591] border-blue-200';
      case 'chiffrage':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 dark:bg-slate-900">
          
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <History className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Historique des Actions
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Timeline Content */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6 space-y-6">
            <div className="relative border-l-2 border-slate-200 pl-4 space-y-6 dark:border-slate-800">
              {events.map((evt) => (
                <div key={evt.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#1B4591] dark:border-slate-900" />

                  {/* Event box */}
                  <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getEventBadge(
                          evt.type
                        )}`}
                      >
                        {evt.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{evt.relativeTime}</span>
                    </div>

                    <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                      {evt.action}
                    </h4>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {evt.details}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Par</span>
                      <strong className="text-slate-600 dark:text-slate-300">{evt.user}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
