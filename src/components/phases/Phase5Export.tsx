import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';
import { LotItem, ProjectInfo } from '../../types/dpgf';
import { exportDpgfToExcel } from '../../utils/excelExport';

interface Phase5ExportProps {
  project: ProjectInfo;
  lots: LotItem[];
}

export const Phase5Export: React.FC<Phase5ExportProps> = ({ project, lots }) => {
  const [activeTab, setActiveTab] = useState<string>('recap');
  const [previewMode, setPreviewMode] = useState<'client' | 'interne'>('client');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportExcel = () => {
    exportDpgfToExcel(project, lots, previewMode === 'client');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FAE9] text-[#16A148]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1B4591] dark:text-sky-400">
                Export & Finalisation de la DPGF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Générez le classeur Excel officiel (.xlsx) ou la version PDF pour soumission au Maître d'Ouvrage.
              </p>
            </div>
          </div>
        </div>

        {/* Big Download Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#1B4591] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#163a7a] active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Télécharger Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-[#EEFFF1] p-4 text-xs font-bold text-[#16A148] shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <span>Classeur Excel généré et téléchargé avec succès sur votre poste !</span>
        </div>
      )}

      {/* Preview Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'recap'
                ? 'bg-[#1B4591] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            00_RÉCAPITULATIF
          </button>
          {lots.map((lot, idx) => (
            <button
              key={lot.id}
              type="button"
              onClick={() => setActiveTab(lot.id)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === lot.id
                  ? 'bg-[#1B4591] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {lot.code}
            </button>
          ))}
        </div>

        {/* Client vs Internal Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setPreviewMode('client')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              previewMode === 'client'
                ? 'bg-[#1B4591] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue Client (Prix de vente)
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('interne')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              previewMode === 'interne'
                ? 'bg-[#1B4591] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue Interne (Déboursé sec)
          </button>
        </div>

      </div>

      {/* Spreadsheet Preview Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Preview: Recap Sheet */}
        {activeTab === 'recap' ? (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-[#1B4591] dark:text-sky-400">
                RÉCAPITULATIF GÉNÉRAL TOUS CORPS D'ÉTAT
              </h3>
              <p className="text-xs text-slate-500">
                Projet : {project.name} • Maître d'Ouvrage : {project.client}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B4591] text-white">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">N° Lot</th>
                    <th className="px-4 py-2.5 font-bold">Désignation du Lot</th>
                    {previewMode === 'interne' && (
                      <th className="px-4 py-2.5 font-bold">Déboursé Sec HT</th>
                    )}
                    <th className="px-4 py-2.5 font-bold">Montant HT (€)</th>
                    <th className="px-4 py-2.5 font-bold">TVA (20%)</th>
                    <th className="px-4 py-2.5 font-bold">Total TTC (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
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
                    const lotVente = lotDebourse * lot.coefficientVente;
                    const lotTVA = lotVente * 0.20;
                    const lotTTC = lotVente + lotTVA;

                    return (
                      <tr key={lot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-[#1B4591] dark:text-sky-400">
                          {lot.code}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                          {lot.titre}
                        </td>
                        {previewMode === 'interne' && (
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {Math.round(lotDebourse).toLocaleString('fr-FR')} €
                          </td>
                        )}
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {Math.round(lotVente).toLocaleString('fr-FR')} €
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {Math.round(lotTVA).toLocaleString('fr-FR')} €
                        </td>
                        <td className="px-4 py-3 font-mono font-extrabold text-[#16A148]">
                          {Math.round(lotTTC).toLocaleString('fr-FR')} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#F0F7FF] font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                  <tr>
                    <td colSpan={previewMode === 'interne' ? 3 : 2} className="px-4 py-3 text-right">
                      TOTAL GÉNÉRAL DU MARCHÉ :
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#1B4591] dark:text-sky-400">
                      4 685 000 € HT
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-500">
                      937 000 €
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#16A148]">
                      5 622 000 € TTC
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          /* Preview: Specific Lot Sheet */
          <div className="p-6 space-y-4">
            {(() => {
              const currentLot = lots.find((l) => l.id === activeTab);
              if (!currentLot) return null;
              return (
                <>
                  <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-[#1B4591] dark:text-sky-400">
                      {currentLot.code} - {currentLot.titre}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1B4591] text-white">
                        <tr>
                          <th className="px-3 py-2 font-bold">Code</th>
                          <th className="px-3 py-2 font-bold">Désignation</th>
                          <th className="px-3 py-2 font-bold">Unité</th>
                          <th className="px-3 py-2 font-bold">Quantité</th>
                          <th className="px-3 py-2 font-bold">P.U. HT</th>
                          <th className="px-3 py-2 font-bold">Montant HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentLot.blocs.map((bloc) => (
                          <React.Fragment key={bloc.id}>
                            <tr className="bg-[#EFF6FF] font-bold dark:bg-slate-800">
                              <td className="px-3 py-2">{bloc.code}</td>
                              <td colSpan={4} className="px-3 py-2">{bloc.titre}</td>
                              <td className="px-3 py-2 font-mono">
                                {Math.round(bloc.totalHT * currentLot.coefficientVente).toLocaleString('fr-FR')} €
                              </td>
                            </tr>
                            {bloc.ouvrages.map((ouv) => (
                              <React.Fragment key={ouv.id}>
                                <tr className="bg-slate-50/60 font-semibold dark:bg-slate-800/40">
                                  <td className="px-3 py-1.5 pl-6 font-mono text-slate-500">{ouv.code}</td>
                                  <td className="px-3 py-1.5">{ouv.designation}</td>
                                  <td className="px-3 py-1.5">{ouv.unite}</td>
                                  <td className="px-3 py-1.5">{ouv.quantite}</td>
                                  <td className="px-3 py-1.5">{ouv.prixUnitaireHT} €</td>
                                  <td className="px-3 py-1.5 font-mono">
                                    {Math.round(ouv.montantHT * currentLot.coefficientVente).toLocaleString('fr-FR')} €
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>

    </div>
  );
};
