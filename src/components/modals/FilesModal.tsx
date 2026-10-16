import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, Upload, Search, Check } from 'lucide-react';
import { ProjectFile } from '../../types/dpgf';

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ProjectFile[];
  onUploadFile: (newFile: ProjectFile) => void;
}

export const FilesModal: React.FC<FilesModalProps> = ({ isOpen, onClose, files, onUploadFile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = files.filter((f) => {
    const matchCat = selectedCategory === 'all' || f.categorie === selectedCategory;
    const matchSearch = f.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECF4FF] text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Fichiers & Documents du Projet
              </h3>
              <p className="text-xs text-slate-500">
                Consultez et téléchargez les pièces écrites et graphiques du marché
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="my-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Toutes les catégories</option>
            <option value="DPGF Excel">DPGF Excel</option>
            <option value="CCTP">CCTP</option>
            <option value="Plans Béton">Plans Béton</option>
            <option value="Rapport Géotechnique">Rapport Géotechnique</option>
            <option value="DCE">DCE</option>
          </select>
        </div>

        {/* Files List */}
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="flex items-center gap-3">
                {file.type === 'xlsx' ? (
                  <FileSpreadsheet className="h-6 w-6 text-[#16A148]" />
                ) : (
                  <FileText className="h-6 w-6 text-[#1B4591] dark:text-sky-400" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{file.nom}</p>
                  <p className="text-[11px] text-slate-400">
                    {file.categorie} • {file.taille} • Ajouté le {file.dateAjout}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Téléchargement de ${file.nom}...`)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#1B4591] hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Télécharger</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer / Upload new file */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-400">Total : {files.length} fichiers attachés</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1B4591] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#163a7a]"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
