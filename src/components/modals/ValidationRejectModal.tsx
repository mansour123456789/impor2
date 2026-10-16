import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ValidationRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
}

export const ValidationRejectModal: React.FC<ValidationRejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Motif du refus de validation',
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Veuillez spécifier la raison du refus (obligatoire) :
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Quantités du radier non conformes aux plans béton armé ind. C..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="rounded-xl bg-[#DC2827] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
            >
              Confirmer le refus
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
