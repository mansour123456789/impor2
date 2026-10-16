import React from 'react';
import { X, TrendingUp, Layers, CheckCircle2, FileDown, Upload, Building } from 'lucide-react';
import { ProjectInfo, LotItem } from '../../types/dpgf';

interface ProjectSummaryPanelProps {
  project: ProjectInfo;
  lots: LotItem[];
  onClose: () => void;
  onNavigatePhase: (phase: 'import' | 'export') => void;
}

export const ProjectSummaryPanel: React.FC<ProjectSummaryPanelProps> = ({
  project,
  lots,
  onClose,
  onNavigatePhase,
}) => {
  const totalDebourseSec = lots.reduce((sum, lot) => {
    return (
      sum +
      lot.blocs.reduce((bSum, b) => {
        return (
          bSum +
          b.ouvrages.reduce((oSum, o) => {
            return oSum + o.articles.reduce((aSum, a) => aSum + a.montantHT, 0);
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const totalVenteHT = lots.reduce((sum, lot) => {
    return (
      sum +
      lot.blocs.reduce((bSum, b) => {
        return (
          bSum +
          b.ouvrages.reduce((oSum, o) => {
            return (
              oSum +
              o.articles.reduce((aSum, a) => aSum + a.prixVenteHT, 0)
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const montantTVA = totalVenteHT * 0.20;
  const montantTTC = totalVenteHT + montantTVA;

  return (
    <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6 dark:border-slate-800 dark:bg-slate-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider dark:text-white">
            Récapitulatif Financier
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

      {/* Figures */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Total Déboursé Sec :</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {Math.round(totalDebourseSec).toLocaleString('fr-FR')} € HT
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Marge Brute Estimée :</span>
          <span className="font-mono font-bold text-[#16A148]">
            +{Math.round(totalVenteHT - totalDebourseSec).toLocaleString('fr-FR')} €
          </span>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">Total Prix de Vente HT :</span>
          <span className="font-mono text-[#1B4591] dark:text-sky-400">
            {Math.round(totalVenteHT).toLocaleString('fr-FR')} €
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">TVA (20.0%) :</span>
          <span className="font-mono text-slate-500">
            {Math.round(montantTVA).toLocaleString('fr-FR')} €
          </span>
        </div>

        <div className="rounded-xl bg-[#F0F7FF] p-3 text-center dark:bg-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Montant Total Offre TTC</span>
          <p className="mt-0.5 font-mono text-lg font-black text-[#1B4591] dark:text-sky-400">
            {Math.round(montantTTC).toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {/* Lots breakdown */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Répartition par Lot :
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs [scrollbar-width:thin]">
          {lots.map((lot) => {
            const lotDebourse = lot.blocs.reduce(
              (sum, b) =>
                sum +
                b.ouvrages.reduce(
                  (oSum, o) =>
                    oSum + o.articles.reduce((aSum, a) => aSum + a.montantHT, 0),
                  0
                ),
              0
            );
            return (
              <div
                key={lot.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"
              >
                <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                  {lot.code}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {Math.round(lotDebourse).toLocaleString('fr-FR')} €
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onNavigatePhase('import')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#1B4591] hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Upload className="h-3.5 w-3.5 text-[#1B4591]" />
          <span>Mettre à jour la DPGF</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigatePhase('export')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4591] py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#163a7a]"
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>Exporter le devis</span>
        </button>
      </div>

    </div>
  );
};
