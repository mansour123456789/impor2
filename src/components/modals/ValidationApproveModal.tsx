import React from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ValidationApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ValidationApproveModal: React.FC<ValidationApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer la validation des métrés',
  description = 'Êtes-vous sûr de vouloir valider les quantitatifs de cette phase ? Les montants seront figés pour la suite du chiffrage.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEFFF1] text-[#16A148]">
          <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl bg-[#16A148] px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
          >
            Confirmer la validation
          </button>
        </div>
      </div>
    </div>
  );
};
