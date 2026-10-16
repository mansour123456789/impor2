import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  ChevronRight,
  Layers,
  ArrowRight,
  Filter,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  Hash,
  CornerDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import { StagingTreeNode, NodeRole, ResourceType } from '../../types/dpgf';

export interface SmartCandidateLine {
  node: StagingTreeNode;
  index: number;
  isAutoDetected: boolean;
  checked: boolean;
  targetRole: NodeRole;
  targetLevel: number;
  reason: string;
}

interface SmartSubLinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNode: StagingTreeNode;
  targetLevel: number;
  targetRole: NodeRole;
  allLinesBelow: StagingTreeNode[];
  onConfirm: (
    parentNode: StagingTreeNode,
    parentTargetLevel: number,
    parentTargetRole: NodeRole,
    selectedChildren: { node: StagingTreeNode; level: number; role: NodeRole }[]
  ) => void;
  onApplySingleOnly: (parentNode: StagingTreeNode, targetLevel: number, targetRole: NodeRole) => void;
}

/**
 * Normalizes code and designation to extract structured WBS numbers
 * e.g. "2.3", "2.3.1", "2-3", "2.3 - Libelle"
 */
export function extractWbsNumbering(codeStr?: string, designationStr?: string): {
  normalized: string;
  parts: number[];
  depth: number;
  prefix: string;
} | null {
  const cleanCode = (codeStr || '').trim().replace(/[-_]/g, '.');
  let match = cleanCode.match(/^(\d+(?:\.\d+)*)/);

  if (!match) {
    const cleanDesig = (designationStr || '').trim().replace(/[-_]/g, '.');
    match = cleanDesig.match(/^(\d+(?:\.\d+)*)/);
  }

  if (!match) return null;

  const normalized = match[1];
  const parts = normalized
    .split('.')
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n));

  if (parts.length === 0) return null;

  return {
    normalized,
    parts,
    depth: parts.length,
    prefix: normalized + '.',
  };
}

export const SmartSubLinesModal: React.FC<SmartSubLinesModalProps> = ({
  isOpen,
  onClose,
  parentNode,
  targetLevel,
  targetRole,
  allLinesBelow,
  onConfirm,
  onApplySingleOnly,
}) => {
  // Determine standard default child role & level according to parent target role
  const getDefaultChildRoleAndLevel = (pRole: NodeRole, pLevel: number): { role: NodeRole; level: number } => {
    switch (pRole) {
      case 'ZONE':
        return { role: 'BLOC', level: 3 };
      case 'BLOC':
      case 'CHAPITRE':
        return { role: 'OUVRAGE', level: 4 };
      case 'OUVRAGE':
        return { role: 'ARTICLE', level: 5 };
      case 'ARTICLE':
        return { role: 'COMPONENT_ART', level: 7 };
      case 'ENSEMBLE':
        return { role: 'COMPONENT_ENS', level: 7 };
      default:
        return { role: 'ARTICLE', level: 5 };
    }
  };

  const defaultChildConfig = useMemo(
    () => getDefaultChildRoleAndLevel(targetRole, targetLevel),
    [targetRole, targetLevel]
  );

  const [activeChildRole, setActiveChildRole] = useState<NodeRole>(defaultChildConfig.role);
  const [activeChildLevel, setActiveChildLevel] = useState<number>(defaultChildConfig.level);
  const [candidates, setCandidates] = useState<SmartCandidateLine[]>([]);
  const [boundaryInfo, setBoundaryInfo] = useState<{ code: string; desig: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllBeyondBoundary, setShowAllBeyondBoundary] = useState(false);

  // Initialize and run the Smart Detection Algorithm
  useEffect(() => {
    if (!isOpen || !parentNode) return;

    const parentWbs = extractWbsNumbering(parentNode.code, parentNode.designation);
    const initialCandidates: SmartCandidateLine[] = [];
    let detectedBoundary: { code: string; desig: string } | null = null;
    const initialChildRole = defaultChildConfig.role;
    const initialChildLevel = defaultChildConfig.level;

    for (let i = 0; i < allLinesBelow.length; i++) {
      const line = allLinesBelow[i];

      // Stop condition on major delimiters like other LOT or PROJECT
      if (line.role === 'LOT' || line.role === 'PROJECT') {
        detectedBoundary = {
          code: line.code || 'LOT',
          desig: line.designation || 'Délimiteur de Lot/Projet',
        };
        break;
      }

      const childWbs = extractWbsNumbering(line.code, line.designation);

      if (parentWbs && childWbs) {
        // Check if child is at the SAME level or HIGHER level as the parent (e.g., 2.4 vs 2.3)
        // User rule: "par exemple 2.3 est un ouvrage il va sélectionner jusqu'à 2.4 le même niveau et cocher 2.3.1"
        const isSameOrHigherLevelSibling =
          childWbs.depth <= parentWbs.depth &&
          childWbs.normalized !== parentWbs.normalized &&
          !childWbs.normalized.startsWith(parentWbs.prefix);

        if (isSameOrHigherLevelSibling) {
          // Boundary reached! e.g. line 2.4 when parent is 2.3
          detectedBoundary = {
            code: line.code || childWbs.normalized,
            desig: line.designation,
          };
          if (!showAllBeyondBoundary) {
            break;
          }
        }

        // Sub-line check: starts with "2.3." (e.g. 2.3.1, 2.3.2, 2.3.1.1)
        const isSubNumber = childWbs.normalized.startsWith(parentWbs.prefix);

        initialCandidates.push({
          node: line,
          index: i,
          isAutoDetected: isSubNumber,
          checked: isSubNumber,
          targetRole: initialChildRole,
          targetLevel: initialChildLevel,
          reason: isSubNumber
            ? `Sous-numérotation détectée (${childWbs.normalized} sous ${parentWbs.normalized})`
            : 'Ligne située dans le bloc',
        });
      } else {
        // Fallback for lines without dot-notation
        const hasContent = (line.quantite && line.quantite > 0) || (line.unitPrice && line.unitPrice > 0);
        initialCandidates.push({
          node: line,
          index: i,
          isAutoDetected: false,
          checked: !!hasContent,
          targetRole: initialChildRole,
          targetLevel: initialChildLevel,
          reason: hasContent ? 'Ligne avec métré / prix détectée' : 'Ligne consécutive',
        });
      }
    }

    setCandidates(initialCandidates);
    setBoundaryInfo(detectedBoundary);
    setActiveChildRole(initialChildRole);
    setActiveChildLevel(initialChildLevel);
  }, [isOpen, parentNode, targetRole, targetLevel, allLinesBelow, showAllBeyondBoundary, defaultChildConfig]);

  if (!isOpen) return null;

  // Toggle single candidate check
  const handleToggleCheck = (index: number) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c))
    );
  };

  // Toggle all check
  const handleCheckAll = (value: boolean) => {
    setCandidates((prev) => prev.map((c) => ({ ...c, checked: value })));
  };

  // Reset to auto-detected only
  const handleResetToAuto = () => {
    setCandidates((prev) =>
      prev.map((c) => ({
        ...c,
        checked: c.isAutoDetected,
        targetRole: activeChildRole,
        targetLevel: activeChildLevel,
      }))
    );
  };

  // Change bulk child role
  const handleChangeBulkChildRole = (role: NodeRole, lvl: number) => {
    setActiveChildRole(role);
    setActiveChildLevel(lvl);
    setCandidates((prev) =>
      prev.map((c) =>
        c.checked
          ? { ...c, targetRole: role, targetLevel: lvl }
          : c
      )
    );
  };

  // Change individual candidate role
  const handleIndividualRoleChange = (index: number, role: NodeRole, lvl: number) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, targetRole: role, targetLevel: lvl } : c))
    );
  };

  // Confirm and apply
  const handleConfirm = () => {
    const selected = candidates
      .filter((c) => c.checked)
      .map((c) => ({
        node: c.node,
        level: c.targetLevel,
        role: c.targetRole,
      }));

    onConfirm(parentNode, targetLevel, targetRole, selected);
    onClose();
  };

  // Apply to single line only
  const handleSingleOnly = () => {
    onApplySingleOnly(parentNode, targetLevel, targetRole);
    onClose();
  };

  // Filtered view
  const filteredCandidates = candidates.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.node.code || '').toLowerCase().includes(term) ||
      (c.node.designation || '').toLowerCase().includes(term)
    );
  });

  const checkedCount = candidates.filter((c) => c.checked).length;
  const autoCount = candidates.filter((c) => c.isAutoDetected).length;

  const parentWbs = extractWbsNumbering(parentNode.code, parentNode.designation);

  const getRoleBadgeStyle = (r: NodeRole) => {
    switch (r) {
      case 'ZONE':
        return 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 font-black';
      case 'BLOC':
      case 'CHAPITRE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
      case 'OUVRAGE':
        return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300';
      case 'ARTICLE':
        return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300';
      case 'ENSEMBLE':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
      case 'COMPONENT_ENS':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';
      case 'COMPONENT_ART':
        return 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950 dark:text-pink-300';
      case 'NOTE':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 px-6 py-4 dark:border-slate-800 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1B4591] to-sky-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Assistant Intelligent de Rattachement Hiérarchique
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950/80 dark:text-sky-300">
                  Détection Auto WBS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identifie automatiquement les sous-lignes en bas de la ligne sélectionnée jusqu'au prochain élément de même niveau.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PARENT ELEMENT SUMMARY CARD */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col items-center justify-center rounded-xl bg-white px-3 py-1.5 border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">N° / Code</span>
                <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                  {parentNode.code || 'Sans code'}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Élément parent sélectionné :</span>
                  <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold ${getRoleBadgeStyle(targetRole)}`}>
                    Pos {targetLevel} · {targetRole}
                  </span>
                </div>
                <h4 className="truncate font-bold text-slate-900 text-sm sm:text-base dark:text-white">
                  {parentNode.designation}
                </h4>
              </div>
            </div>

            {/* Smart Detection Info Capsule */}
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 border border-blue-200/80 shadow-xs dark:bg-slate-800/90 dark:border-blue-900/40">
              <Sparkles className="h-4 w-4 text-sky-500 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {autoCount} sous-lignes détectées
                </span>
                {parentWbs && boundaryInfo && (
                  <span className="text-slate-400 ml-1">
                    (de <span className="font-mono font-bold text-blue-600 dark:text-sky-400">{parentWbs.normalized}</span> jusqu'à <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{boundaryInfo.code}</span>)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS STRIP: ROLE SELECTION & SEARCH & BULK TOGGLES */}
        <div className="border-b border-slate-200 p-4 sm:px-6 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick role proposal pills for children */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Rattacher les sous-lignes en tant que :
              </span>
              {[
                { role: 'BLOC' as NodeRole, lvl: 3, label: 'BLOC (Pos 3)' },
                { role: 'OUVRAGE' as NodeRole, lvl: 4, label: 'OUVRAGE (Pos 4)' },
                { role: 'ARTICLE' as NodeRole, lvl: 5, label: 'ARTICLE (Pos 5)' },
                { role: 'ENSEMBLE' as NodeRole, lvl: 6, label: 'ENSEMBLE (Pos 6)' },
                { role: 'COMPONENT_ART' as NodeRole, lvl: 7, label: 'COMPOSANT / ART (Pos 7)' },
                { role: 'COMPONENT_ENS' as NodeRole, lvl: 7, label: 'COMPOSANT / ENS (Pos 7)' },
                { role: 'NOTE' as NodeRole, lvl: 8, label: 'NOTE * (Pos 8)' },
              ].map((item) => {
                const isActive = activeChildRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleChangeBulkChildRole(item.role, item.lvl)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#1B4591] text-white shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Quick selection check/uncheck buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCheckAll(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <CheckSquare className="h-3.5 w-3.5" /> Tout cocher
              </button>
              <button
                type="button"
                onClick={() => handleCheckAll(false)}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <Square className="h-3.5 w-3.5" /> Tout décocher
              </button>
              <button
                type="button"
                onClick={handleResetToAuto}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-800 dark:text-sky-300"
                title="Cocher uniquement les sous-lignes détectées intelligemment par le WBS"
              >
                <Sparkles className="h-3.5 w-3.5" /> Détection auto ({autoCount})
              </button>
            </div>
          </div>

          {/* Search bar inside candidates */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer parmi les lignes en bas..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* CANDIDATES TABLE LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Aucune ligne détectée en bas de cet élément
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Toutes les lignes suivantes appartiennent déjà à un autre lot ou atteignent la fin du document.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="py-2.5 pl-2 pr-3 w-10 text-center">Inclus</th>
                  <th className="py-2.5 px-3 w-28">N° / Code</th>
                  <th className="py-2.5 px-3">Désignation & Libellé</th>
                  <th className="py-2.5 px-3 w-20 text-center">Unité</th>
                  <th className="py-2.5 px-3 w-24 text-right">Quantité</th>
                  <th className="py-2.5 px-3 w-24 text-right">P.U. HT</th>
                  <th className="py-2.5 px-3 w-36 text-center">Rôle attribué</th>
                  <th className="py-2.5 pl-3 pr-2 w-48 text-right">Statut détection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCandidates.map((c) => {
                  const node = c.node;
                  const isChecked = c.checked;

                  return (
                    <tr
                      key={node.id}
                      onClick={() => handleToggleCheck(c.index)}
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 pl-2 pr-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleCheck(c.index)}
                          className={`flex h-5 w-5 mx-auto items-center justify-center rounded-md border transition-colors ${
                            isChecked
                              ? 'bg-[#1B4591] border-[#1B4591] text-white shadow-xs'
                              : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Code */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {node.code || '—'}
                      </td>

                      {/* Designation */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className={`line-clamp-2 ${isChecked ? 'text-slate-900 dark:text-white font-semibold' : ''}`}>
                            {node.designation}
                          </span>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-mono">
                        {node.unit || '—'}
                      </td>

                      {/* Quantite */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                        {node.quantite !== undefined ? node.quantite.toLocaleString('fr-FR') : '—'}
                      </td>

                      {/* Prix Unitaire */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                        {node.unitPrice !== undefined
                          ? `${node.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                          : '—'}
                      </td>

                      {/* Child Role Selector */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.targetRole}
                          onChange={(e) => {
                            const newRole = e.target.value as NodeRole;
                            let newLvl = 5;
                            if (newRole === 'OUVRAGE') newLvl = 4;
                            else if (newRole === 'ARTICLE') newLvl = 5;
                            else if (newRole === 'ENSEMBLE') newLvl = 6;
                            else if (newRole === 'COMPONENT_ART' || newRole === 'COMPONENT_ENS') newLvl = 7;
                            else if (newRole === 'NOTE') newLvl = 8;
                            handleIndividualRoleChange(c.index, newRole, newLvl);
                          }}
                          className={`rounded-lg border px-2 py-1 text-[11px] font-bold focus:outline-none ${getRoleBadgeStyle(c.targetRole)}`}
                        >
                          <option value="ARTICLE">Pos 5 · ARTICLE</option>
                          <option value="OUVRAGE">Pos 4 · OUVRAGE</option>
                          <option value="ENSEMBLE">Pos 6 · ENSEMBLE</option>
                          <option value="COMPONENT_ART">Pos 7 · COMPOSANT / ART</option>
                          <option value="COMPONENT_ENS">Pos 7 · COMPOSANT / ENS</option>
                          <option value="NOTE">Pos 8 · NOTE *</option>
                        </select>
                      </td>

                      {/* Reason & Auto detection badge */}
                      <td className="py-2.5 pl-3 pr-2 text-right">
                        {c.isAutoDetected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <Sparkles className="h-3 w-3" /> Auto {node.code}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Manuel
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* DELIMITER CARD IF BOUNDARY REACHED (e.g. 2.4 reached) */}
          {boundaryInfo && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Limite de niveau atteinte : <strong className="font-mono">{boundaryInfo.code}</strong> {boundaryInfo.desig.substring(0, 40)}... (Élément de même niveau)
                </span>
              </div>

              {!showAllBeyondBoundary && (
                <button
                  type="button"
                  onClick={() => setShowAllBeyondBoundary(true)}
                  className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-xs border border-amber-200 hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-700"
                >
                  Afficher les lignes suivantes au-delà
                </button>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {checkedCount} sous-lignes sélectionnées
            </span>
            <span className="text-xs text-slate-400">
              sur {candidates.length} lignes disponibles
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSingleOnly}
              className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-blue-950/50 transition-colors"
              title="Classer uniquement la ligne parente sans modifier les sous-lignes"
            >
              Appliquer à {parentNode.code || 'cette ligne'} seul (sans sous-lignes)
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1B4591] to-blue-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-blue-600/20 hover:from-[#163a7a] hover:to-blue-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Valider et rattacher ({checkedCount} sous-lignes)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
