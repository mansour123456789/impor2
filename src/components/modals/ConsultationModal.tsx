import React, { useState } from 'react';
import { X, Truck, Send } from 'lucide-react';
import { SubcontractorConsultation, LotItem } from '../../types/dpgf';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: LotItem[];
  onAddConsultation: (consultation: SubcontractorConsultation) => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  lots,
  onAddConsultation,
}) => {
  const [entreprise, setEntreprise] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[1]?.id || lots[0]?.id || '');
  const [montantDevisHT, setMontantDevisHT] = useState<number>(2600000);
  const [delaiSemaines, setDelaiSemaines] = useState<number>(24);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise.trim()) return;

    const lot = lots.find((l) => l.id === selectedLotId);

    const newConsult: SubcontractorConsultation = {
      id: `consult-${Date.now()}`,
      lotId: selectedLotId,
      lotName: lot ? `${lot.code} - ${lot.titre}` : 'Gros Œuvre',
      entreprise,
      contact,
      email,
      telephone,
      dateEnvoi: new Date().toLocaleDateString('fr-FR'),
      dateReponse: new Date().toLocaleDateString('fr-FR'),
      montantDevisHT,
      budgetEstimeHT: 2660000,
      ecartPourcentage: Math.round(((montantDevisHT - 2660000) / 2660000) * 100 * 10) / 10,
      delaiSemaines,
      statut: 'Reçu',
      scoreTechnique: 9.0,
      commentaire: 'Offre reçue via la plateforme Eco-Pilot.',
    };

    onAddConsultation(newConsult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nouvelle Consultation Sous-traitant
            </h3>
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
              Entreprise sous-traitante / Partenaire
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Eiffage Construction, Bouygues..."
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contact référent
              </label>
              <input
                type="text"
                placeholder="Ex : Jean Dupont"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Téléphone
              </label>
              <input
                type="text"
                placeholder="+33 1 40 00 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lot concerné
              </label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
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
                Montant Offre HT (€)
              </label>
              <input
                type="number"
                value={montantDevisHT}
                onChange={(e) => setMontantDevisHT(parseFloat(e.target.value))}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4591] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#163a7a]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enregistrer l'offre</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
