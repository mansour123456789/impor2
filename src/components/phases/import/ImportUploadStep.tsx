import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, ArrowRight, FileSpreadsheet, Sparkles, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface ImportUploadStepProps {
  onFileLoaded: (
    fileName: string,
    sheets: string[],
    rawSheetsData: Record<string, (string | number)[][]>
  ) => void;
  currentFileName?: string;
  isMultipleFiles: boolean;
  onToggleMultipleFiles: (val: boolean) => void;
  onNext: () => void;
}

export const ImportUploadStep: React.FC<ImportUploadStepProps> = ({
  onFileLoaded,
  currentFileName,
  isMultipleFiles,
  onToggleMultipleFiles,
  onNext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse workbook buffer
  const processWorkbookBuffer = (buffer: ArrayBuffer, fileName: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheets = wb.SheetNames;
      if (!sheets || sheets.length === 0) {
        throw new Error('Le classeur Excel ne contient aucune feuille.');
      }

      const rawSheetsData: Record<string, (string | number)[][]> = {};
      for (const name of sheets) {
        const ws = wb.Sheets[name];
        rawSheetsData[name] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: '',
        }) as (string | number)[][];
      }

      onFileLoaded(fileName, sheets, rawSheetsData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error reading excel file:', err);
      setErrorMessage(err.message || 'Erreur lors de la lecture du fichier Excel');
      setLoading(false);
    }
  };

  // 1-Click Load the project file "2.1- AE- Annexe 1 AE DPGF (1).xlsx"
  const handleLoadOfficialDpgf = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Try both public paths
      let res = await fetch('/2.1- AE- Annexe 1 AE DPGF (1).xlsx');
      if (!res.ok) {
        res = await fetch('/dpgf_annexe1.xlsx');
      }
      if (!res.ok) {
        throw new Error('Impossible de charger le fichier DPGF depuis le serveur.');
      }
      const arrayBuffer = await res.arrayBuffer();
      processWorkbookBuffer(arrayBuffer, '2.1- AE- Annexe 1 AE DPGF (1).xlsx');
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erreur lors du chargement de l'annexe DPGF");
      setLoading(false);
    }
  };

  // Handle uploaded file from drag & drop or file picker
  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage('Format non supporté. Veuillez sélectionner un fichier .xlsx ou .xls');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        processWorkbookBuffer(buffer, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Erreur lors de la lecture du fichier sélectionné');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECF4FF] text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1B4591] sm:text-2xl dark:text-sky-400">
            Import de la DPGF
          </h3>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Importer le fichier DPGF afin de démarrer automatiquement le projet de chiffrage.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left side: Information and 1-Click Load */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-4 pt-2">
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8EAFF] text-[#0394D7]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Import rapide
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Glissez-déposez votre fichier en quelques secondes avec scan instantané des feuilles.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6EAFD] text-[#2B66D0]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Fichier sécurisé
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vos documents restent protégés et analysés localement en toute confidentialité.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6FAE9] text-[#16A148]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Analyse assistée
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Détection automatique de la ligne d'en-tête, des lots et de la structure tarifaire.
                </p>
              </div>
            </div>
          </div>

          {/* Dedicated 1-Click Project File Loader */}
          <div className="rounded-2xl border-2 border-dashed border-[#1B4591]/30 bg-[#ECF4FF]/70 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/xlsx_icon.png" alt="Excel" className="h-8 w-8 object-contain" />
                <div>
                  <h4 className="text-xs font-bold text-[#1B4591] dark:text-sky-300">
                    Fichier DPGF du projet
                  </h4>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    2.1- AE- Annexe 1 AE DPGF (1).xlsx
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#1B4591]/10 px-2.5 py-1 text-[10px] font-bold text-[#1B4591] dark:bg-sky-950 dark:text-sky-300">
                16 Feuilles
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ce classeur DCE comprend la feuille RECAP globale et l'ensemble des lots BTP (Gros Œuvre, Plomberie, Électricité, etc.).
            </p>

            <button
              type="button"
              onClick={handleLoadOfficialDpgf}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4591] px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#163a7a] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement et analyse du fichier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Charger l'Annexe 1 AE DPGF (1-Click)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right side: Dropzone matching frontend-intern */}
        <div className="flex flex-col items-center justify-center text-center">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer.files);
              if (droppedFiles.length > 0) {
                handleFile(droppedFiles[0]);
              }
            }}
            className={`group relative flex h-72 w-72 items-center justify-center rounded-full transition-all duration-300 ${
              isDragging ? 'scale-105' : ''
            }`}
          >
            {/* Concentric ellipses matching frontend-intern */}
            <div className="absolute inset-0 rounded-full bg-[#ECF4FF]/70 dark:bg-slate-800/40" />
            <div className="absolute inset-4 rounded-full bg-[#D8EAFF]/80 dark:bg-slate-800/70" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#D8EAFF] to-[#A7D3FF] shadow-inner transition-transform duration-200 hover:scale-105 focus:outline-none"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
                <FileSpreadsheet className="h-8 w-8 text-[#1B4591]" />
              </div>
              <span className="mt-2 text-xs font-bold text-[#1B4591]">
                Glissez ou cliquez
              </span>
              <span className="text-[10px] text-slate-500">
                .xlsx, .xls jusqu'à 50 Mo
              </span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) handleFile(files[0]);
            }}
          />

          <div className="mt-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="multiple-files-checkbox"
              checked={isMultipleFiles}
              onChange={(e) => onToggleMultipleFiles(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1B4591] focus:ring-[#1B4591]"
            />
            <label
              htmlFor="multiple-files-checkbox"
              className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Mon DPGF est réparti sur plusieurs fichiers.
            </label>
          </div>

          {currentFileName && (
            <div className="mt-6 flex w-full max-w-md items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-3 truncate">
                <img src="/xlsx_icon.png" alt="" className="h-6 w-6 object-contain" />
                <div className="text-left truncate">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {currentFileName}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    ✓ Fichier analysé avec succès
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#1B4591] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#163a7a]"
              >
                Suivant <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
