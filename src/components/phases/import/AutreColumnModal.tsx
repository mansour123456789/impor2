import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface AutreColumnModalProps {
  isOpen: boolean;
  colLetter: string;
  currentName?: string;
  onClose: () => void;
  onConfirm: (colLetter: string, colName: string) => void;
}

export const AutreColumnModal: React.FC<AutreColumnModalProps> = ({
  isOpen,
  colLetter,
  currentName = '',
  onClose,
  onConfirm,
}) => {
  const [inputVal, setInputVal] = useState(currentName);

  useEffect(() => {
    setInputVal(currentName);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onConfirm(colLetter, inputVal.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Colonne personnalisée ({colLetter})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Définissez un libellé pour cette colonne libre
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nom de la colonne
            </label>
            <input
              type="text"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ex: Fournisseur, CCTP, Localisation, Note..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#1B4591] focus:outline-none focus:ring-2 focus:ring-[#1B4591]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">Suggestions :</span>
            {['Fournisseur', 'Réf CCTP', 'Localisation', 'Commentaire', 'Sous-traitant'].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setInputVal(sug)}
                className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4591] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#163a7a] disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
