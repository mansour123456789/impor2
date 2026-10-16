import React, { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';
import { LotItem } from '../../types/dpgf';

interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLot: (newLot: LotItem) => void;
  nextLotNumber: number;
}

export const AddLotModal: React.FC<AddLotModalProps> = ({
  isOpen,
  onClose,
  onAddLot,
  nextLotNumber,
}) => {
  const [code, setCode] = useState(`LOT 0${nextLotNumber}`);
  const [titre, setTitre] = useState('');
  const [tva, setTva] = useState(20);
  const [coeffVente, setCoeffVente] = useState(1.25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    const newLot: LotItem = {
      id: `lot-${Date.now()}`,
      code,
      titre,
      tva,
      coefficientVente: coeffVente,
      statutValidation: 'EN_ATTENTE',
      blocs: [
        {
          id: `bloc-${Date.now()}-1`,
          code: `${nextLotNumber}.1`,
          titre: `Bloc principal - ${titre}`,
          isExpanded: true,
          totalHT: 0,
          ouvrages: [],
        },
      ],
    };

    onAddLot(newLot);
    setTitre('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Créer un nouveau Lot</h3>
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
              Code du Lot
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Titre / Désignation du Lot
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Électricité, CVC ou Peintures"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Taux TVA (%)
              </label>
              <input
                type="number"
                value={tva}
                onChange={(e) => setTva(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Coeff. de Vente
              </label>
              <input
                type="number"
                step="0.01"
                value={coeffVente}
                onChange={(e) => setCoeffVente(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#1B4591] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#163a7a]"
            >
              Créer le Lot
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
