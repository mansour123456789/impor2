import React, { useState } from 'react';
import { X, Plus, Box } from 'lucide-react';
import { LotItem, OuvrageItem } from '../../types/dpgf';

interface AddOuvrageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: LotItem[];
  onAddOuvrage: (lotId: string, blocId: string, ouvrage: OuvrageItem) => void;
}

export const AddOuvrageModal: React.FC<AddOuvrageModalProps> = ({
  isOpen,
  onClose,
  lots,
  onAddOuvrage,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const activeLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const [selectedBlocId, setSelectedBlocId] = useState<string>(activeLot?.blocs[0]?.id || '');

  const [code, setCode] = useState('2.1.4');
  const [designation, setDesignation] = useState('');
  const [unite, setUnite] = useState('m²');
  const [quantite, setQuantite] = useState<number>(100);
  const [prixUnitaireHT, setPrixUnitaireHT] = useState<number>(85);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation.trim()) return;

    const totalHT = quantite * prixUnitaireHT;
    const coeff = activeLot?.coefficientVente || 1.25;

    const newOuvrage: OuvrageItem = {
      id: `ouv-${Date.now()}`,
      code,
      designation,
      unite,
      quantite,
      prixUnitaireHT,
      montantHT: totalHT,
      isExpanded: true,
      statut: 'VALIDE',
      articles: [
        {
          id: `art-${Date.now()}-1`,
          code: `${code}.a`,
          designation: `${designation} (Fourniture & Pose)`,
          unite,
          quantite,
          prixUnitaireHT,
          montantHT: totalHT,
          tva: activeLot?.tva || 20,
          coeffVente: coeff,
          prixVenteHT: totalHT * coeff,
          typeArticle: 'materiau',
          statut: 'VALIDE',
        },
      ],
    };

    onAddOuvrage(selectedLotId, selectedBlocId, newOuvrage);
    setDesignation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ajouter un nouvel Ouvrage</h3>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lot de rattachement
              </label>
              <select
                value={selectedLotId}
                onChange={(e) => {
                  setSelectedLotId(e.target.value);
                  const found = lots.find((l) => l.id === e.target.value);
                  if (found && found.blocs.length > 0) {
                    setSelectedBlocId(found.blocs[0].id);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bloc de rattachement
              </label>
              <select
                value={selectedBlocId}
                onChange={(e) => setSelectedBlocId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                {activeLot?.blocs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.titre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code Ouvrage
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Désignation de l'ouvrage
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Voiles béton C25/30 épaisseur 20cm"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unité
              </label>
              <select
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="ml">ml</option>
                <option value="kg">kg</option>
                <option value="u">u</option>
                <option value="ens">ens</option>
                <option value="fft">fft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantité
              </label>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prix Unitaire HT (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={prixUnitaireHT}
                onChange={(e) => setPrixUnitaireHT(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#F0F7FF] p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Montant estimé ligne : <strong>{(quantite * prixUnitaireHT).toLocaleString('fr-FR')} € HT</strong>
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
              Ajouter l'Ouvrage
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
