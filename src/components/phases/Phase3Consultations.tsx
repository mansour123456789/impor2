import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SubcontractorConsultation } from '../../types/dpgf';

interface Phase3ConsultationsProps {
  consultations: SubcontractorConsultation[];
  onOpenNewConsultation: () => void;
  onRetainOffer: (id: string) => void;
}

export const Phase3Consultations: React.FC<Phase3ConsultationsProps> = ({
  consultations,
  onOpenNewConsultation,
  onRetainOffer,
}) => {
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = consultations.filter((c) => {
    const matchLot = selectedLotFilter === 'all' || c.lotId === selectedLotFilter;
    const matchSearch =
      c.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lotName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLot && matchSearch;
  });

  const getStatusBadge = (status: SubcontractorConsultation['statut']) => {
    switch (status) {
      case 'Retenu':
        return 'bg-[#EEFFF1] text-[#16A148] border-emerald-300';
      case 'En négociation':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Rejeté':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-[#EFF6FF] text-[#1B4591] border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Consultations Lancées
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[#1B4591] dark:text-sky-400">
              {consultations.length}
            </span>
            <span className="text-xs text-slate-400">entreprises contactées</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Offres Reçues & Analysées
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[#16A148]">
              {consultations.filter((c) => c.statut !== 'En attente').length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% conformes CCTP</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gain Négociation vs Budget
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-emerald-600">
              -80 000 €
            </span>
            <span className="text-xs text-slate-400">(-2.4% sur Gros Œuvre)</span>
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Lot Filter Dropdown */}
          <select
            value={selectedLotFilter}
            onChange={(e) => setSelectedLotFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Tous les lots du projet</option>
            <option value="lot-01">LOT 01 - Terrassements & VRD</option>
            <option value="lot-02">LOT 02 - Gros Œuvre & Béton Armé</option>
            <option value="lot-03">LOT 03 - Façades & Menuiseries</option>
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Chercher entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewConsultation}
          className="inline-flex items-center gap-2 rounded-full bg-[#1B4591] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#163a7a]"
        >
          <Plus className="h-4 w-4" />
          <span>Lancer une consultation sous-traitant</span>
        </button>

      </div>

      {/* Consultations Comparative Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B4591] text-white">
              <tr>
                <th className="px-4 py-3 font-bold">Entreprise / Sous-traitant</th>
                <th className="px-4 py-3 font-bold">Lot Associé</th>
                <th className="px-4 py-3 font-bold">Contact & Téléphone</th>
                <th className="px-4 py-3 font-bold">Montant Devis HT</th>
                <th className="px-4 py-3 font-bold">Écart vs Budget</th>
                <th className="px-4 py-3 font-bold">Délai</th>
                <th className="px-4 py-3 font-bold">Score Technique</th>
                <th className="px-4 py-3 font-bold">Statut</th>
                <th className="px-4 py-3 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.entreprise}
                    </div>
                    <span className="text-[11px] text-slate-400">Reçu le {item.dateReponse}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.lotName}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    <div>{item.contact}</div>
                    <div className="text-[11px] text-slate-400">{item.telephone}</div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-sm font-extrabold text-[#1B4591] dark:text-sky-400">
                    {item.montantDevisHT.toLocaleString('fr-FR')} € HT
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                        item.ecartPourcentage <= 0
                          ? 'bg-[#EEFFF1] text-[#16A148]'
                          : 'bg-[#FDEDED] text-[#DC2827]'
                      }`}
                    >
                      {item.ecartPourcentage <= 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {item.ecartPourcentage > 0 ? '+' : ''}
                      {item.ecartPourcentage}%
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {item.delaiSemaines} sem.
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-200">
                    ⭐ {item.scoreTechnique} / 10
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(
                        item.statut
                      )}`}
                    >
                      {item.statut}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    {item.statut !== 'Retenu' ? (
                      <button
                        type="button"
                        onClick={() => onRetainOffer(item.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#1B4591] shadow-xs hover:bg-[#ECF4FF] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400"
                      >
                        Retenir l'offre
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A148]">
                        <CheckCircle2 className="h-4 w-4" /> Offre choisie
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
