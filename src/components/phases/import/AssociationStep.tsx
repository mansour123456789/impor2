import React from 'react';
import { ArrowLeft, ArrowRight, FileSpreadsheet, CheckSquare, Square, Layers } from 'lucide-react';

export interface LotOption {
  id: string;
  code?: string;
  label: string;
}

export const DEFAULT_DPGF_LOTS: LotOption[] = [
  { id: 'RECAP', label: '★ RECAP (feuille récapitulatif)' },
  { id: '00', code: 'LOT 00', label: '00 - DEPOLLUTION – DESAMIANTAGE - DEPLOMBAGE' },
  { id: '01', code: 'LOT 01', label: '01 - CURAGE' },
  { id: '02', code: 'LOT 02', label: '02 - INSTALLATIONS DE CHANTIER – FONDATIONS - GROS ŒUVRE – CHARPENTE BOIS' },
  { id: '03', code: 'LOT 03', label: '03 - COUVERTURE' },
  { id: '04', code: 'LOT 04', label: '04 - TRAITEMENT DES FAÇADES' },
  { id: '05', code: 'LOT 05', label: '05 - MENUISERIES EXTERIEURES - OCCULTATIONS' },
  { id: '06', code: 'LOT 06', label: '06 - METALLERIE' },
  { id: '07', code: 'LOT 07', label: '07 - MENUISERIES INTERIEURES' },
  { id: '08', code: 'LOT 08', label: '08 - CLOISONS - DOUBLAGE - FAUX PLAFONDS' },
  { id: '09', code: 'LOT 09', label: '09 - REVETEMENTS DE SOL - FAÏENCES' },
  { id: '10', code: 'LOT 10', label: '10 - PEINTURE' },
  { id: '11', code: 'LOT 11', label: '11 - ASCENSEUR' },
  { id: '12', code: 'LOT 12', label: '12 - PLOMBERIE - CHAUFFAGE - VENTILATION' },
  { id: '13', code: 'LOT 13', label: '13 - COURANTS FORTS / COURANTS FAIBLES' },
  { id: '14', code: 'LOT 14', label: '14 - AMENAGEMENTS EXTERIEURS' },
];

interface AssociationStepProps {
  fileName: string;
  availableSheets: string[];
  selectedSheets: string[];
  onToggleSheet: (sheet: string) => void;
  onSelectAllSheets: (select: boolean) => void;
  onSelectGoOnly: () => void;
  sheetLotMap: Record<string, string>;
  onChangeSheetMapping: (sheet: string, lotLabel: string) => void;
  rawSheetsData: Record<string, (string | number)[][]>;
  allowMultipleLotsPerFile: boolean;
  onToggleAllowMultipleLots: (val: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const AssociationStep: React.FC<AssociationStepProps> = ({
  fileName,
  availableSheets,
  selectedSheets,
  onToggleSheet,
  onSelectAllSheets,
  onSelectGoOnly,
  sheetLotMap,
  onChangeSheetMapping,
  rawSheetsData,
  allowMultipleLotsPerFile,
  onToggleAllowMultipleLots,
  onPrev,
  onNext,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1B4591] sm:text-2xl dark:text-sky-400">
            Association des lots
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Associer chaque feuille au lot correspondant afin d'organiser les données du projet.
          </p>
        </div>

        {fileName && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <img src="/xlsx_icon.png" alt="" className="h-5 w-5 object-contain" />
            <span className="max-w-[240px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
              {fileName}
            </span>
          </div>
        )}
      </div>

      {/* Info notice checkbox */}
      <div className="flex items-center space-x-2.5 rounded-xl border border-blue-100 bg-[#ECF4FF]/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
        <input
          type="checkbox"
          id="allow-multiple-lots"
          checked={allowMultipleLotsPerFile}
          onChange={(e) => onToggleAllowMultipleLots(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#1B4591] focus:ring-[#1B4591]"
        />
        <label
          htmlFor="allow-multiple-lots"
          className="cursor-pointer text-xs font-medium text-[#1B4591] dark:text-sky-300"
        >
          Permettre l'importation de plusieurs lots depuis une même feuille (déverrouille les feuilles déjà importées)
        </label>
      </div>

      {/* Quick selection bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectAllSheets(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <CheckSquare className="h-3.5 w-3.5 text-[#1B4591]" />
            Tout cocher ({availableSheets.length})
          </button>
          <button
            type="button"
            onClick={() => onSelectAllSheets(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Square className="h-3.5 w-3.5" />
            Tout décocher
          </button>
          <button
            type="button"
            onClick={onSelectGoOnly}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-[#1B4591] hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-sky-300"
          >
            <Layers className="h-3.5 w-3.5" />
            Gros Œuvre uniquement
          </button>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {selectedSheets.length} feuille{selectedSheets.length > 1 ? 's' : ''} sélectionnée{selectedSheets.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid of Sheet Cards matching frontend-intern */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableSheets.map((sheet) => {
          const isSelected = selectedSheets.includes(sheet);
          const isRecap = sheet.toUpperCase().includes('RECAP');
          const rowCount = rawSheetsData[sheet]?.length || 0;

          return (
            <div
              key={sheet}
              onClick={() => onToggleSheet(sheet)}
              className={`relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#1B4591] bg-[#ECF4FF] shadow-sm ring-1 ring-[#1B4591]/20 dark:border-sky-500 dark:bg-slate-800'
                  : 'border-slate-200 bg-white hover:border-[#1B4591]/40 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSheet(sheet);
                    }}
                    className="h-4 w-4 rounded border-[#BFC7D6] text-[#1B4591] focus:ring-[#1B4591]"
                  />
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
                    <span
                      className={`truncate text-sm font-bold ${
                        isSelected
                          ? 'text-[#1B4591] dark:text-sky-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                      title={sheet}
                    >
                      {sheet}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isRecap
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rowCount} lignes
                </span>
              </div>

              {/* Lot Association Dropdown if Selected */}
              {isSelected ? (
                <div className="w-full pt-1" onClick={(e) => e.stopPropagation()}>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Associer au lot :
                  </label>
                  <select
                    value={sheetLotMap[sheet] || ''}
                    onChange={(e) => onChangeSheetMapping(sheet, e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#1B4591] focus:border-[#1B4591] focus:outline-none focus:ring-2 focus:ring-[#1B4591]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
                  >
                    <option value="RECAP">★ RECAP (feuille récapitulatif)</option>
                    <optgroup label="Lots du projet DPGF :">
                      {DEFAULT_DPGF_LOTS.filter((l) => l.id !== 'RECAP').map((l) => (
                        <option key={l.id} value={l.label}>
                          {l.label}
                        </option>
                      ))}
                    </optgroup>
                    <option value="NEW">+ Créer un nouveau lot</option>
                  </select>
                </div>
              ) : (
                <p className="pl-7 text-xs text-slate-400 dark:text-slate-500">
                  Choisir le lot correspondant.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom navigation buttons matching frontend-intern */}
      <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1B4591] bg-white px-6 py-2.5 text-xs font-bold text-[#1B4591] shadow-sm hover:bg-[#ECF4FF] dark:bg-slate-800 dark:text-sky-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </button>
        <button
          type="button"
          disabled={selectedSheets.length === 0}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1B4591] px-7 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#163a7a] active:scale-[0.99] disabled:opacity-50"
        >
          <span>Suivant : Identifier les colonnes</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
