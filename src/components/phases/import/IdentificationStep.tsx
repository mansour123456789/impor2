import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  RotateCcw,
  Type,
  FileText,
  Trash2,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react';
import { SheetConfig, columnNumberToLetters, autoDetectSheetConfig } from '../../../utils/dpgfParser';
import { AutreColumnModal } from './AutreColumnModal';

interface IdentificationStepProps {
  fileName: string;
  selectedSheets: string[];
  activeSheet: string;
  onSelectActiveSheet: (sheet: string) => void;
  sheetLotMap: Record<string, string>;
  sheetConfigs: Record<string, SheetConfig>;
  onUpdateSheetConfig: (sheet: string, config: SheetConfig) => void;
  rawSheetsData: Record<string, (string | number)[][]>;
  onPrev: () => void;
  onParseAndProceed: () => void;
}

export const IdentificationStep: React.FC<IdentificationStepProps> = ({
  fileName,
  selectedSheets,
  activeSheet,
  onSelectActiveSheet,
  sheetLotMap,
  sheetConfigs,
  onUpdateSheetConfig,
  rawSheetsData,
  onPrev,
  onParseAndProceed,
}) => {
  const [openDropdownCol, setOpenDropdownCol] = useState<string | null>(null);
  const [autreModalCol, setAutreModalCol] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close column dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownCol(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeRows = rawSheetsData[activeSheet] || [];
  const currentConfig =
    sheetConfigs[activeSheet] || autoDetectSheetConfig(activeSheet, activeRows);

  const isRecap =
    activeSheet.toUpperCase().includes('RECAP') ||
    sheetLotMap[activeSheet] === 'RECAP';

  // Helper to update current sheet config
  const updateConfig = (patch: Partial<SheetConfig>) => {
    const updated = { ...currentConfig, ...patch };
    onUpdateSheetConfig(activeSheet, updated);
  };

  // Assign column
  const handleAssignColumn = (colLetter: string, field: string) => {
    setOpenDropdownCol(null);
    if (isRecap) {
      if (field === 'recap_lot') updateConfig({ colRecapLot: colLetter });
      else if (field === 'recap_ht') updateConfig({ colRecapHt: colLetter });
      else if (field === 'recap_tva') updateConfig({ colRecapTva: colLetter });
      else if (field === 'recap_ttc') updateConfig({ colRecapTtc: colLetter });
      else if (field === 'clear') {
        const p: Partial<SheetConfig> = {};
        if (currentConfig.colRecapLot === colLetter) p.colRecapLot = '';
        if (currentConfig.colRecapHt === colLetter) p.colRecapHt = '';
        if (currentConfig.colRecapTva === colLetter) p.colRecapTva = '';
        if (currentConfig.colRecapTtc === colLetter) p.colRecapTtc = '';
        updateConfig(p);
      }
    } else {
      if (field === 'designation') updateConfig({ colDesignation: colLetter });
      else if (field === 'nom') updateConfig({ colNom: colLetter });
      else if (field === 'unite') updateConfig({ colUnite: colLetter });
      else if (field === 'qte') updateConfig({ colQte: colLetter });
      else if (field === 'pu') updateConfig({ colPu: colLetter });
      else if (field === 'prixTotal') updateConfig({ colPrixTotal: colLetter });
      else if (field === 'autre') {
        setAutreModalCol(colLetter);
      } else if (field === 'clear') {
        const p: Partial<SheetConfig> = {};
        if (currentConfig.colDesignation === colLetter) p.colDesignation = '';
        if (currentConfig.colNom === colLetter) p.colNom = '';
        if (currentConfig.colUnite === colLetter) p.colUnite = '';
        if (currentConfig.colQte === colLetter) p.colQte = '';
        if (currentConfig.colPu === colLetter) p.colPu = '';
        if (currentConfig.colPrixTotal === colLetter) p.colPrixTotal = '';
        if (currentConfig.autreColonnes[colLetter]) {
          const nextAutre = { ...currentConfig.autreColonnes };
          delete nextAutre[colLetter];
          p.autreColonnes = nextAutre;
        }
        updateConfig(p);
      }
    }
  };

  // Get field mapped to a column letter
  const getMappedColumnInfo = (colLetter: string) => {
    if (isRecap) {
      if (currentConfig.colRecapLot === colLetter)
        return { label: 'NOM DU LOT', color: 'bg-blue-600 text-white', tint: 'bg-blue-500/10 text-blue-900 font-medium' };
      if (currentConfig.colRecapHt === colLetter)
        return { label: 'TOTAL HT', color: 'bg-purple-600 text-white', tint: 'bg-purple-500/10 text-purple-900 font-bold' };
      if (currentConfig.colRecapTva === colLetter)
        return { label: 'TVA', color: 'bg-orange-500 text-white', tint: 'bg-orange-500/10 text-orange-900' };
      if (currentConfig.colRecapTtc === colLetter)
        return { label: 'TOTAL TTC', color: 'bg-emerald-600 text-white', tint: 'bg-emerald-500/10 text-emerald-900 font-bold' };
      return null;
    }

    if (currentConfig.colDesignation === colLetter)
      return { label: 'DÉSIGNATION', color: 'bg-blue-600 text-white', tint: 'bg-blue-500/10 text-blue-900 font-medium' };
    if (currentConfig.colNom === colLetter)
      return { label: 'CODE / N°', color: 'bg-cyan-600 text-white', tint: 'bg-cyan-500/10 text-cyan-900 font-mono' };
    if (currentConfig.colUnite === colLetter)
      return { label: 'UNITÉ', color: 'bg-emerald-600 text-white', tint: 'bg-emerald-500/10 text-emerald-900 font-semibold' };
    if (currentConfig.colQte === colLetter)
      return { label: 'QUANTITÉ', color: 'bg-amber-500 text-white', tint: 'bg-amber-500/10 text-amber-950 font-mono' };
    if (currentConfig.colPu === colLetter)
      return { label: 'PRIX UNITAIRE', color: 'bg-orange-500 text-white', tint: 'bg-orange-500/10 text-orange-950 font-mono' };
    if (currentConfig.colPrixTotal === colLetter)
      return { label: 'TOTAL HT', color: 'bg-purple-600 text-white', tint: 'bg-purple-500/10 text-purple-950 font-mono font-bold' };
    if (currentConfig.autreColonnes && currentConfig.autreColonnes[colLetter])
      return {
        label: currentConfig.autreColonnes[colLetter].toUpperCase(),
        color: 'bg-indigo-600 text-white',
        tint: 'bg-indigo-500/10 text-indigo-950 font-medium',
      };

    return null;
  };

  const headerRowInt = parseInt(currentConfig.headerRow, 10);
  const footerRowInt = currentConfig.footerRow ? parseInt(currentConfig.footerRow, 10) : null;

  // Maximum columns across rows
  const maxCols = Math.min(
    26,
    Math.max(
      8,
      ...(activeRows.slice(0, 30).map((r) => r.length) || [8])
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1B4591] sm:text-2xl dark:text-sky-400">
            Identification des colonnes
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Sélectionner les feuilles, définir la ligne d'en-tête des colonnes et identifier les colonnes à extraire.
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

      {/* Sheet Tabs Bar matching frontend-intern */}
      {selectedSheets.length > 0 && (
        <div className="rounded-2xl border border-[#1B4591]/15 bg-[#ECF4FF] p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex flex-wrap gap-2.5">
            {selectedSheets.map((sheet) => {
              const isActive = activeSheet === sheet;
              const assigned = sheetLotMap[sheet];
              let displayLabel = sheet;
              if (assigned === 'RECAP') displayLabel = `${sheet} : Récap`;
              else if (assigned && assigned !== 'NEW') {
                const clean = assigned.replace(/^LOT\s*\d+\s*[:-]?\s*/i, '');
                displayLabel = `${sheet} : ${clean}`;
              }

              return (
                <button
                  key={sheet}
                  type="button"
                  onClick={() => onSelectActiveSheet(sheet)}
                  className={`rounded-xl border-2 px-4 py-2 text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'border-[#1B4591] bg-white text-[#1B4591] shadow-md dark:border-sky-400 dark:bg-slate-900 dark:text-sky-300'
                      : 'border-transparent bg-white/70 text-slate-700 hover:border-[#1B4591]/30 hover:bg-white dark:bg-slate-800 dark:text-slate-300'
                  }`}
                  title={sheet}
                >
                  <span className="line-clamp-1">{displayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Table Preview Card matching frontend-intern */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Card Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Aperçu & Sélection directe{' '}
              <span className="text-[#1B4591] dark:text-sky-400">
                ({activeSheet} {sheetLotMap[activeSheet] ? `· ${sheetLotMap[activeSheet]}` : ''})
              </span>
            </h4>
          </div>

          <div className="flex items-center gap-3">
            {headerRowInt > 0 && (
              <span className="rounded-lg bg-[#ECF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1B4591] dark:bg-slate-800 dark:text-sky-300">
                En-tête : Ligne {headerRowInt}
              </span>
            )}
            {footerRowInt && (
              <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:bg-red-950 dark:text-red-300">
                Fin : Ligne {footerRowInt}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const refreshed = autoDetectSheetConfig(activeSheet, activeRows);
                onUpdateSheetConfig(activeSheet, refreshed);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Auto-détecter
            </button>
          </div>
        </div>

        {/* Column Mapping Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="font-semibold text-slate-400">Colonnes configurées :</span>
          {isRecap ? (
            <>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-200">
                Nom du Lot : Col {currentConfig.colRecapLot || '—'}
              </span>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 font-bold text-purple-700 border border-purple-200">
                Total HT : Col {currentConfig.colRecapHt || '—'}
              </span>
            </>
          ) : (
            <>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-200">
                Désignation : Col {currentConfig.colDesignation || '—'}
              </span>
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700 border border-cyan-200">
                Code/N° : Col {currentConfig.colNom || '—'}
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                Unité : Col {currentConfig.colUnite || '—'}
              </span>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-700 border border-amber-200">
                Quantité : Col {currentConfig.colQte || '—'}
              </span>
              <span className="rounded-md bg-orange-50 px-2 py-0.5 font-bold text-orange-700 border border-orange-200">
                PU : Col {currentConfig.colPu || '—'}
              </span>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 font-bold text-purple-700 border border-purple-200">
                Total HT : Col {currentConfig.colPrixTotal || '—'}
              </span>
              {Object.entries(currentConfig.autreColonnes || {}).map(([col, name]) => (
                <span
                  key={col}
                  className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 border border-indigo-200"
                >
                  {name} : Col {col}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Scrollable Excel Table View */}
        <div className="relative overflow-x-auto rounded-xl border border-slate-200 shadow-inner max-h-[560px] dark:border-slate-800">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header with Dropdown Actions */}
            <thead className="sticky top-0 z-30 bg-[#F8FAFC] shadow-sm backdrop-blur dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {/* Tête control */}
                <th className="w-12 border-r border-slate-200 p-2 text-center text-[10px] font-bold text-slate-500 dark:border-slate-800">
                  Tête
                </th>
                {/* Fin control */}
                <th className="w-12 border-r border-slate-200 p-2 text-center text-[10px] font-bold text-red-600 dark:border-slate-800">
                  Fin
                </th>
                {/* Row number */}
                <th className="w-12 border-r border-slate-200 p-2 text-center text-[10px] font-bold text-slate-400 dark:border-slate-800">
                  #
                </th>

                {/* Column letters with assignment dropdowns */}
                {Array.from({ length: maxCols }).map((_, cIdx) => {
                  const colLetter = columnNumberToLetters(cIdx);
                  const mapped = getMappedColumnInfo(colLetter);
                  const isMenuOpen = openDropdownCol === colLetter;

                  return (
                    <th
                      key={colLetter}
                      className={`relative border-r border-slate-200 p-1 text-center font-bold min-w-[130px] dark:border-slate-800 ${
                        mapped ? 'bg-[#ECF4FF]/70 dark:bg-slate-800/80' : 'bg-slate-50/50 dark:bg-slate-900'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownCol(isMenuOpen ? null : colLetter);
                        }}
                        className={`flex h-8 w-full items-center justify-between rounded-lg px-2 text-xs transition-all ${
                          mapped
                            ? `${mapped.color} shadow-sm font-extrabold`
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-[#1B4591] hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate text-[10px]">
                          {mapped ? mapped.label : `Col ${colLetter}`}
                        </span>
                        <ChevronDown className="h-3 w-3 shrink-0 ml-1 opacity-70" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-11 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 text-left font-normal animate-in fade-in duration-150"
                        >
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Assigner Colonne {colLetter}
                          </div>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          {isRecap ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'recap_lot')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 dark:text-slate-200"
                              >
                                <Type className="h-3.5 w-3.5 text-blue-600" />
                                <span>Nom du Lot</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'recap_ht')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-purple-100 text-[10px] font-black text-purple-700 flex items-center justify-center">Σ</span>
                                <span>Total HT</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'recap_tva')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-orange-100 text-[10px] font-black text-orange-700 flex items-center justify-center">%</span>
                                <span>TVA</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'recap_ttc')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-emerald-100 text-[10px] font-black text-emerald-700 flex items-center justify-center">€</span>
                                <span>Total TTC</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'designation')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 dark:text-slate-200"
                              >
                                <Type className="h-3.5 w-3.5 text-blue-600" />
                                <span>Désignation</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'nom')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-900 dark:text-slate-200"
                              >
                                <FileText className="h-3.5 w-3.5 text-cyan-600" />
                                <span>Nom / Libellé (Code)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'unite')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-emerald-100 text-[10px] font-black text-emerald-700 flex items-center justify-center">U</span>
                                <span>Unité</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'qte')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-amber-100 text-[10px] font-black text-amber-700 flex items-center justify-center">#</span>
                                <span>Quantité</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'pu')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-orange-100 text-[10px] font-black text-orange-700 flex items-center justify-center">€</span>
                                <span>Prix Unitaire HT</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'prixTotal')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-900 dark:text-slate-200"
                              >
                                <span className="h-4 w-4 rounded bg-purple-100 text-[10px] font-black text-purple-700 flex items-center justify-center">Σ</span>
                                <span>Total HT</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignColumn(colLetter, 'autre')}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Autre (colonne libre)</span>
                              </button>
                            </>
                          )}

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            type="button"
                            onClick={() => handleAssignColumn(colLetter, 'clear')}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Désassigner</span>
                          </button>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body with Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeRows.map((row, rIdx) => {
                const rowNum = rIdx + 1;
                const isHeader = headerRowInt === rowNum;
                const isFooter = footerRowInt === rowNum;
                const isAboveHeader = headerRowInt > 0 && rowNum < headerRowInt;
                const isBelowFooter = footerRowInt !== null && rowNum > footerRowInt;

                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors ${
                      isHeader
                        ? 'bg-[#1B4591] text-white font-bold sticky z-20 shadow-[inset_0_0_0_2px_#1B4591]'
                        : isFooter
                        ? 'bg-red-600 text-white font-bold shadow-[inset_0_0_0_2px_#dc2626]'
                        : isAboveHeader || isBelowFooter
                        ? 'bg-slate-50/60 opacity-40 hover:opacity-100 dark:bg-slate-900/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Tête selector */}
                    <td
                      className={`border-r border-slate-200 p-1 text-center dark:border-slate-800 ${
                        isHeader ? 'bg-[#1B4591]' : 'bg-slate-50/50 dark:bg-slate-900'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => updateConfig({ headerRow: String(rowNum) })}
                        title={isHeader ? "Ligne d'en-tête actuelle" : "Définir comme ligne d'en-tête"}
                        className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          isHeader
                            ? 'border-white bg-white'
                            : 'border-slate-300 hover:border-[#1B4591]'
                        }`}
                      >
                        {isHeader && <div className="h-1.5 w-1.5 rounded-full bg-[#1B4591]" />}
                      </button>
                    </td>

                    {/* Fin selector */}
                    <td
                      className={`border-r border-slate-200 p-1 text-center dark:border-slate-800 ${
                        isFooter ? 'bg-red-600' : 'bg-red-50/20'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => updateConfig({ footerRow: isFooter ? null : String(rowNum) })}
                        title={isFooter ? 'Dernière ligne à importer' : 'Définir comme dernière ligne'}
                        className={`mx-auto flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                          isFooter
                            ? 'border-white bg-white'
                            : 'border-red-300 hover:border-red-500'
                        }`}
                      >
                        {isFooter && <div className="h-1.5 w-1.5 rounded-full bg-red-600" />}
                      </button>
                    </td>

                    {/* Row Number */}
                    <td
                      className={`border-r border-slate-200 p-2 text-center text-[10px] font-mono dark:border-slate-800 ${
                        isHeader
                          ? 'bg-[#1B4591] text-white font-bold'
                          : isFooter
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {isHeader ? 'EN-TÊTE' : isFooter ? 'FIN' : rowNum}
                    </td>

                    {/* Cells */}
                    {Array.from({ length: maxCols }).map((_, cIdx) => {
                      const colLetter = columnNumberToLetters(cIdx);
                      const mapped = getMappedColumnInfo(colLetter);
                      const cellVal = row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '';

                      return (
                        <td
                          key={colLetter}
                          className={`min-w-[130px] max-w-[280px] border-r border-slate-200 p-2 truncate text-xs dark:border-slate-800 ${
                            isHeader
                              ? 'text-white font-bold'
                              : isFooter
                              ? 'text-white font-semibold'
                              : mapped
                              ? mapped.tint
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title={cellVal}
                        >
                          {cellVal || <span className="opacity-25">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Autre column */}
      <AutreColumnModal
        isOpen={autreModalCol !== null}
        colLetter={autreModalCol || ''}
        currentName={autreModalCol ? currentConfig.autreColonnes[autreModalCol] || '' : ''}
        onClose={() => setAutreModalCol(null)}
        onConfirm={(col, name) => {
          updateConfig({
            autreColonnes: {
              ...currentConfig.autreColonnes,
              [col]: name,
            },
          });
        }}
      />

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
          onClick={onParseAndProceed}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1B4591] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#163a7a] active:scale-[0.99]"
        >
          <span>Analyser et classer</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
