import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  Pencil,
  Trash2,
  Copy,
  Search,
  Filter,
  Check,
  Building,
  TrendingUp,
  Ruler,
  Calculator,
  AlertTriangle,
  FileSpreadsheet,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  LotItem,
  BlocItem,
  OuvrageItem,
  ArticleItem,
  MetreDimensionLine,
  CalcMode,
  InclusionMode,
  StagingTreeNode,
  NodeRole,
} from '../../types/dpgf';
import {
  MOCK_METRE_LINES_RADIER,
  MOCK_METRE_LINES_VOILES,
} from '../../data/mockCivilEngineeringTree';
import { SmartSubLinesModal } from '../modals/SmartSubLinesModal';

// 8-position definition for lines in Phase 2
export const LEVEL_DEFINITIONS: {
  level: number;
  key: string;
  label: string;
  shortLabel: string;
  role: NodeRole;
  badgeClass: string;
  rulerClass: string;
}[] = [
  {
    level: 1,
    key: '1',
    label: 'Ligne standard (Même niveau)',
    shortLabel: 'LIGNE',
    role: 'LIGNE',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    rulerClass: 'border-slate-300 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  },
  {
    level: 2,
    key: '2',
    label: 'Zone / Bâtiment (En haut · Contient Blocs & Ouvrages)',
    shortLabel: 'ZONE',
    role: 'ZONE',
    badgeClass: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200',
    rulerClass: 'border-indigo-300 hover:bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300',
  },
  {
    level: 3,
    key: '3',
    label: 'Bloc / Chapitre',
    shortLabel: 'BLOC',
    role: 'BLOC',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300',
    rulerClass: 'border-purple-300 hover:bg-purple-100 text-purple-700 dark:border-purple-800 dark:text-purple-300',
  },
  {
    level: 4,
    key: '4',
    label: 'Ouvrage',
    shortLabel: 'OUVRAGE',
    role: 'OUVRAGE',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
    rulerClass: 'border-emerald-300 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
  },
  {
    level: 5,
    key: '5',
    label: 'Article',
    shortLabel: 'ARTICLE',
    role: 'ARTICLE',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300',
    rulerClass: 'border-sky-300 hover:bg-sky-100 text-sky-700 dark:border-sky-800 dark:text-sky-300',
  },
  {
    level: 6,
    key: '6',
    label: 'Ensemble',
    shortLabel: 'ENSEMBLE',
    role: 'ENSEMBLE',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
    rulerClass: 'border-amber-300 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:text-amber-300',
  },
  {
    level: 7,
    key: '7',
    label: 'Composant (Déboursé)',
    shortLabel: 'COMPOSANT',
    role: 'COMPONENT_ART',
    badgeClass: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300',
    rulerClass: 'border-orange-300 hover:bg-orange-100 text-orange-700 dark:border-orange-800 dark:text-orange-300',
  },
  {
    level: 8,
    key: '*',
    label: 'Note / Titre informatif',
    shortLabel: 'NOTE *',
    role: 'NOTE',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
    rulerClass: 'border-rose-300 hover:bg-rose-100 text-rose-700 dark:border-rose-800 dark:text-rose-300',
  },
];

interface Phase2MetresProps {
  lots: LotItem[];
  onUpdateLots: (updatedLots: LotItem[]) => void;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  onOpenAddLotModal: () => void;
  onOpenAddOuvrageModal: () => void;
  validationStatus: 'VALIDE' | 'EN_COURS' | 'REJETE' | 'EN_ATTENTE';
  motifRejet?: string;
}

export const Phase2Metres: React.FC<Phase2MetresProps> = ({
  lots,
  onUpdateLots,
  onOpenApproveModal,
  onOpenRejectModal,
  onOpenAddLotModal,
  onOpenAddOuvrageModal,
  validationStatus,
  motifRejet,
}) => {
  const [activeLotId, setActiveLotId] = useState<string>(lots[1]?.id || lots[0]?.id || '');
  // Default to flat view where all lines are at the same level (Demande utilisateur)
  const [viewMode, setViewMode] = useState<'flat' | 'hierarchie' | 'spatial'>('flat');
  const [selectedSpatialLevel, setSelectedSpatialLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state for inline changes
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editQuantite, setEditQuantite] = useState<number>(0);
  const [editPU, setEditPU] = useState<number>(0);

  // Flat lines editing and level dropdown state in Phase 2
  const [lotFlatLinesMap, setLotFlatLinesMap] = useState<Record<string, StagingTreeNode[]>>({});
  const [openLevelMenuNodeId, setOpenLevelMenuNodeId] = useState<string | null>(null);
  const [editingFlatLineId, setEditingFlatLineId] = useState<string | null>(null);
  const [editLineQte, setEditLineQte] = useState<number>(0);
  const [editLinePu, setEditLinePu] = useState<number>(0);
  const [editLineDesig, setEditLineDesig] = useState<string>('');
  const [editLineUnit, setEditLineUnit] = useState<string>('');

  // Active Carnet de Métré Modal state
  const [selectedOuvrageForMetre, setSelectedOuvrageForMetre] = useState<{
    blocId: string;
    ouvrage: OuvrageItem;
  } | null>(null);

  const [metreLinesState, setMetreLinesState] = useState<Record<string, MetreDimensionLine[]>>({
    'ouv-2-1-2': MOCK_METRE_LINES_RADIER,
    'ouv-2-2-1': MOCK_METRE_LINES_VOILES,
  });

  // Smart Sub-Lines Selection Modal state in Phase 2
  const [smartModalState, setSmartModalState] = useState<{
    isOpen: boolean;
    blocId: string;
    ouvrage: OuvrageItem | null;
    parentNode: StagingTreeNode | null;
    allLinesBelow: StagingTreeNode[];
  } | null>(null);

  // Project variables for civil engineering calculations
  const [projectVariables, setProjectVariables] = useState({
    epDalle: 0.2, // 20 cm
    hSousPlafond: 2.8, // 2.80 m
    ratioArmatures: 95, // 95 kg/m3 pour le radier
  });

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // Helper to extract flat lines from a lot (Initialise tout au même niveau si makeAllSameLevel = true)
  const extractFlatLinesFromLot = (lot: LotItem, makeAllSameLevel: boolean = true): StagingTreeNode[] => {
    const nodes: StagingTreeNode[] = [];
    lot.blocs.forEach((b) => {
      if (b.titre && !b.id.startsWith('bloc-default') && b.ouvrages.length > 0) {
        nodes.push({
          id: b.id,
          code: b.code || '',
          designation: b.titre,
          role: makeAllSameLevel ? 'LIGNE' : 'BLOC',
          level: makeAllSameLevel ? 1 : 3,
          calcMode: 'SUM',
          inclusionMode: 'BASE',
          montantHT: b.totalHT || 0,
          confidenceScore: 1,
          checked: true,
          children: [],
        });
      }

      b.ouvrages.forEach((ouv) => {
        nodes.push({
          id: ouv.id,
          code: ouv.code,
          designation: ouv.designation,
          role: makeAllSameLevel ? 'LIGNE' : (ouv.role || 'OUVRAGE'),
          level: makeAllSameLevel ? 1 : 4,
          unit: ouv.unite,
          quantite: ouv.quantite,
          unitPrice: ouv.prixUnitaireHT,
          montantHT: ouv.montantHT,
          calcMode: ouv.calcMode || 'QTY_PU',
          inclusionMode: ouv.inclusionMode || 'BASE',
          confidenceScore: 1,
          checked: true,
          children: [],
        });

        ouv.articles.forEach((art) => {
          nodes.push({
            id: art.id,
            code: art.code,
            designation: art.designation,
            role: makeAllSameLevel ? 'LIGNE' : (art.level === 5 ? 'COMPONENT_ART' : 'ARTICLE'),
            level: makeAllSameLevel ? 1 : (art.level === 5 ? 7 : 5),
            unit: art.unite,
            quantite: art.quantite,
            unitPrice: art.prixUnitaireHT,
            montantHT: art.montantHT,
            calcMode: art.calcMode || 'QTY_PU',
            inclusionMode: art.inclusionMode || 'BASE',
            confidenceScore: 1,
            checked: true,
            children: [],
          });

          if (art.components && art.components.length > 0) {
            art.components.forEach((comp) => {
              nodes.push({
                id: comp.id,
                code: comp.code,
                designation: comp.designation,
                role: makeAllSameLevel ? 'LIGNE' : 'COMPONENT_ART',
                level: makeAllSameLevel ? 1 : 7,
                unit: comp.unite,
                quantite: comp.quantite,
                unitPrice: comp.prixUnitaireHT,
                montantHT: comp.montantHT,
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                confidenceScore: 1,
                checked: true,
                children: [],
              });
            });
          }
        });
      });
    });
    return nodes;
  };

  // Rebuild structured LotItem from flat nodes
  const rebuildLotFromFlatLines = (currentLot: LotItem, flatNodes: StagingTreeNode[]): LotItem => {
    const blocs: BlocItem[] = [];
    let currentZone: string | null = null;
    let currentBloc: BlocItem | null = null;
    let currentOuvrage: OuvrageItem | null = null;

    for (const node of flatNodes) {
      const lvl = node.level || 1;
      const role = node.role;

      if (role === 'ZONE' || lvl === 2) {
        currentZone = node.designation;
        currentBloc = {
          id: node.id,
          code: node.code || 'ZONE',
          titre: `🏢 [ZONE] ${node.designation}`,
          isExpanded: true,
          totalHT: node.montantHT || 0,
          ouvrages: [],
        };
        blocs.push(currentBloc);
        currentOuvrage = null;
      } else if (role === 'BLOC' || lvl === 3) {
        currentBloc = {
          id: node.id,
          code: node.code,
          titre: currentZone ? `[${currentZone}] ${node.designation}` : node.designation,
          isExpanded: true,
          totalHT: node.montantHT || 0,
          ouvrages: [],
        };
        blocs.push(currentBloc);
        currentOuvrage = null;
      } else if (role === 'OUVRAGE' || role === 'ENSEMBLE' || lvl === 4 || lvl === 6) {
        if (!currentBloc) {
          currentBloc = {
            id: `bloc-def-${currentLot.id}`,
            code: '01',
            titre: currentLot.titre || 'Travaux Généraux',
            isExpanded: true,
            totalHT: 0,
            ouvrages: [],
          };
          blocs.push(currentBloc);
        }

        currentOuvrage = {
          id: node.id,
          code: node.code,
          designation: node.designation,
          unite: node.unit || 'ENS',
          quantite: node.quantite || 1,
          prixUnitaireHT: node.unitPrice || 0,
          montantHT: node.montantHT || 0,
          articles: [],
          isExpanded: true,
          statut: 'VALIDE',
          role,
        };
        currentBloc.ouvrages.push(currentOuvrage);
      } else {
        if (!currentBloc) {
          currentBloc = {
            id: `bloc-def-${currentLot.id}`,
            code: '01',
            titre: currentLot.titre || 'Travaux Généraux',
            isExpanded: true,
            totalHT: 0,
            ouvrages: [],
          };
          blocs.push(currentBloc);
        }

        if (!currentOuvrage) {
          currentOuvrage = {
            id: `ouv-def-${node.id}`,
            code: node.code || '1',
            designation: 'Postes & Articles du Lot',
            unite: 'ENS',
            quantite: 1,
            prixUnitaireHT: 0,
            montantHT: 0,
            articles: [],
            isExpanded: true,
            statut: 'VALIDE',
          };
          currentBloc.ouvrages.push(currentOuvrage);
        }

        currentOuvrage.articles.push({
          id: node.id,
          code: node.code,
          designation: node.designation,
          unite: node.unit || 'U',
          quantite: node.quantite || 1,
          quantiteRetenue: node.quantite || 1,
          prixUnitaireHT: node.unitPrice || 0,
          montantHT: node.montantHT || 0,
          tva: 20,
          coeffVente: currentLot.coefficientVente || 1.25,
          prixVenteHT: Math.round((node.montantHT || 0) * (currentLot.coefficientVente || 1.25)),
          typeArticle: 'materiau',
          statut: 'VALIDE',
          level: lvl === 7 || role === 'COMPONENT_ART' || role === 'COMPONENT_ENS' ? 5 : 4,
        });
      }
    }

    blocs.forEach((b) => {
      b.ouvrages.forEach((o) => {
        if (o.articles.length > 0) {
          o.montantHT = o.articles.reduce((sum, a) => sum + a.montantHT, 0);
        }
      });
      b.totalHT = b.ouvrages.reduce((sum, o) => sum + o.montantHT, 0);
    });

    return {
      ...currentLot,
      blocs: blocs.length > 0 ? blocs : currentLot.blocs,
    };
  };

  // Get current active lines (Defaulting to all lines at the same level)
  const activeLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);

  // Reset all lines in current lot to the exact same flat level (Position 1 · LIGNE)
  const handleResetLotLinesToSameLevel = () => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, false);
    const flattened = currentLines.map((line) => ({
      ...line,
      role: 'LIGNE' as NodeRole,
      level: 1,
      children: [],
    }));

    setLotFlatLinesMap((prev) => ({
      ...prev,
      [activeLot.id]: flattened,
    }));

    const updatedLot = rebuildLotFromFlatLines(activeLot, flattened);
    onUpdateLots(lots.map((l) => (l.id === activeLot.id ? updatedLot : l)));
  };

  // Change a single line level / position in Phase 2
  const handleChangeLinePositionInPhase2 = (
    nodeId: string,
    targetLevel: number,
    specificRole?: NodeRole
  ) => {
    const assignedRole: NodeRole = specificRole || (
      targetLevel === 1 ? 'LIGNE' :
      targetLevel === 2 ? 'ZONE' :
      targetLevel === 3 ? 'BLOC' :
      targetLevel === 4 ? 'OUVRAGE' :
      targetLevel === 5 ? 'ARTICLE' :
      targetLevel === 6 ? 'ENSEMBLE' :
      targetLevel === 7 ? 'COMPONENT_ART' :
      'NOTE'
    );

    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const updatedLines = currentLines.map((n) =>
      n.id === nodeId ? { ...n, level: targetLevel, role: assignedRole } : n
    );

    setLotFlatLinesMap((prev) => ({
      ...prev,
      [activeLot.id]: updatedLines,
    }));

    const updatedLot = rebuildLotFromFlatLines(activeLot, updatedLines);
    onUpdateLots(lots.map((l) => (l.id === activeLot.id ? updatedLot : l)));
    setOpenLevelMenuNodeId(null);
  };

  // Progression hierarchy when advancing types & positions:
  // Ligne (1) -> Zone (2, en haut) -> Bloc (3) -> Ouvrage (4) -> Article (5) -> Ensemble (6) -> Composant (7)
  const ADVANCE_SEQUENCE: { level: number; role: NodeRole; label: string }[] = [
    { level: 1, role: 'LIGNE', label: 'Ligne' },
    { level: 2, role: 'ZONE', label: 'Zone' },
    { level: 3, role: 'BLOC', label: 'Bloc' },
    { level: 4, role: 'OUVRAGE', label: 'Ouvrage' },
    { level: 5, role: 'ARTICLE', label: 'Article' },
    { level: 6, role: 'ENSEMBLE', label: 'Ensemble' },
    { level: 7, role: 'COMPONENT_ART', label: 'Composant' },
  ];

  // Avancer la position d'une ligne vers le type suivant (⇥)
  const handleAdvanceLinePosition = (nodeId: string) => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const line = currentLines.find((n) => n.id === nodeId);
    if (!line) return;

    const currentLvl = line.level || 1;
    const currentIdx = ADVANCE_SEQUENCE.findIndex((s) => s.level === currentLvl);
    if (currentIdx === -1) {
      handleChangeLinePositionInPhase2(nodeId, 2, 'ZONE');
    } else if (currentIdx < ADVANCE_SEQUENCE.length - 1) {
      const nextStep = ADVANCE_SEQUENCE[currentIdx + 1];
      handleChangeLinePositionInPhase2(nodeId, nextStep.level, nextStep.role);
    }
  };

  // Reculer la position d'une ligne vers le type précédent (⇤)
  const handleRecedeLinePosition = (nodeId: string) => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const line = currentLines.find((n) => n.id === nodeId);
    if (!line) return;

    const currentLvl = line.level || 1;
    const currentIdx = ADVANCE_SEQUENCE.findIndex((s) => s.level === currentLvl);
    if (currentIdx > 0) {
      const prevStep = ADVANCE_SEQUENCE[currentIdx - 1];
      handleChangeLinePositionInPhase2(nodeId, prevStep.level, prevStep.role);
    } else {
      handleChangeLinePositionInPhase2(nodeId, 1, 'LIGNE');
    }
  };

  // Modifier directement le Type (Zone, Bloc, Ouvrage, Article...) -> avance automatiquement la position
  const handleSelectLineType = (nodeId: string, roleType: string) => {
    switch (roleType) {
      case 'ZONE':
        handleChangeLinePositionInPhase2(nodeId, 2, 'ZONE');
        break;
      case 'BLOC':
        handleChangeLinePositionInPhase2(nodeId, 3, 'BLOC');
        break;
      case 'OUVRAGE':
        handleChangeLinePositionInPhase2(nodeId, 4, 'OUVRAGE');
        break;
      case 'ARTICLE':
        handleChangeLinePositionInPhase2(nodeId, 5, 'ARTICLE');
        break;
      case 'ENSEMBLE':
        handleChangeLinePositionInPhase2(nodeId, 6, 'ENSEMBLE');
        break;
      case 'COMPOSANT':
      case 'COMPONENT_ART':
        handleChangeLinePositionInPhase2(nodeId, 7, 'COMPONENT_ART');
        break;
      case 'NOTE':
        handleChangeLinePositionInPhase2(nodeId, 8, 'NOTE');
        break;
      case 'LOT':
        handleChangeLinePositionInPhase2(nodeId, 2, 'LOT');
        break;
      default:
        handleChangeLinePositionInPhase2(nodeId, 1, 'LIGNE');
        break;
    }
  };

  // Open Smart Sub-Lines Modal for any line in flat view
  const handleOpenSmartSubLinesOnFlatLine = (line: StagingTreeNode) => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const targetIdx = currentLines.findIndex((n) => n.id === line.id);
    const linesBelow = targetIdx !== -1 ? currentLines.slice(targetIdx + 1) : [];

    const targetRole = line.role && line.role !== 'LIGNE' ? line.role : 'OUVRAGE';
    const targetLevel = targetRole === 'ZONE' ? 2 : targetRole === 'BLOC' ? 3 : targetRole === 'OUVRAGE' ? 4 : targetRole === 'ARTICLE' ? 5 : 4;

    setSmartModalState({
      isOpen: true,
      blocId: activeLot.blocs[0]?.id || 'bloc-01',
      ouvrage: null,
      parentNode: { ...line, role: targetRole, level: targetLevel },
      allLinesBelow: linesBelow,
    });
  };

  // Start inline editing of flat line
  const handleStartEditFlatLine = (line: StagingTreeNode) => {
    setEditingFlatLineId(line.id);
    setEditLineQte(line.quantite || 0);
    setEditLinePu(line.unitPrice || 0);
    setEditLineDesig(line.designation);
    setEditLineUnit(line.unit || 'U');
  };

  // Save inline edit of flat line
  const handleSaveFlatLineEdit = (lineId: string) => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const updatedLines = currentLines.map((l) => {
      if (l.id !== lineId) return l;
      const newTotal = Math.round(editLineQte * editLinePu * 100) / 100;
      return {
        ...l,
        quantite: editLineQte,
        unitPrice: editLinePu,
        montantHT: newTotal,
        designation: editLineDesig,
        unit: editLineUnit,
      };
    });

    setLotFlatLinesMap((prev) => ({
      ...prev,
      [activeLot.id]: updatedLines,
    }));

    const updatedLot = rebuildLotFromFlatLines(activeLot, updatedLines);
    onUpdateLots(lots.map((lot) => (lot.id === activeLot.id ? updatedLot : lot)));
    setEditingFlatLineId(null);
  };

  // Open Carnet de Métré for a flat line
  const handleOpenMetreModalForFlatLine = (line: StagingTreeNode) => {
    const fakeOuvrage: OuvrageItem = {
      id: line.id,
      code: line.code || '1',
      designation: line.designation,
      unite: line.unit || 'm³',
      quantite: line.quantite || 0,
      prixUnitaireHT: line.unitPrice || 0,
      montantHT: line.montantHT || 0,
      articles: [],
      isExpanded: true,
      statut: 'VALIDE',
    };
    setSelectedOuvrageForMetre({
      blocId: activeLot.blocs[0]?.id || 'bloc-01',
      ouvrage: fakeOuvrage,
    });
  };

  // Open Smart Sub-Lines Modal for an Ouvrage in Phase 2
  const handleOpenSmartSubLinesForOuvrage = (blocId: string, ouvrage: OuvrageItem) => {
    const flatLotNodes: StagingTreeNode[] = [];
    activeLot.blocs.forEach((b) => {
      b.ouvrages.forEach((ouv) => {
        flatLotNodes.push({
          id: ouv.id,
          code: ouv.code,
          designation: ouv.designation,
          role: (ouv.role || 'OUVRAGE') as NodeRole,
          level: 4,
          unit: ouv.unite,
          quantite: ouv.quantite,
          unitPrice: ouv.prixUnitaireHT,
          montantHT: ouv.montantHT,
          checked: true,
          calcMode: 'QTY_PU',
          inclusionMode: 'BASE',
          confidenceScore: 1,
        });
        ouv.articles.forEach((art) => {
          flatLotNodes.push({
            id: art.id,
            code: art.code,
            designation: art.designation,
            role: (art.level === 5 ? 'COMPONENT_ART' : 'ARTICLE') as NodeRole,
            level: art.level === 5 ? 7 : 5,
            unit: art.unite,
            quantite: art.quantite,
            unitPrice: art.prixUnitaireHT,
            montantHT: art.montantHT,
            checked: true,
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            confidenceScore: 1,
          });
        });
      });
    });

    const targetIdx = flatLotNodes.findIndex((n) => n.id === ouvrage.id);
    const linesBelow = targetIdx !== -1 ? flatLotNodes.slice(targetIdx + 1) : [];

    const parentStagingNode: StagingTreeNode = {
      id: ouvrage.id,
      code: ouvrage.code,
      designation: ouvrage.designation,
      role: (ouvrage.role || 'OUVRAGE') as NodeRole,
      level: 4,
      unit: ouvrage.unite,
      quantite: ouvrage.quantite,
      unitPrice: ouvrage.prixUnitaireHT,
      montantHT: ouvrage.montantHT,
      checked: true,
      calcMode: 'QTY_PU',
      inclusionMode: 'BASE',
      confidenceScore: 1,
    };

    setSmartModalState({
      isOpen: true,
      blocId,
      ouvrage,
      parentNode: parentStagingNode,
      allLinesBelow: linesBelow,
    });
  };

  // Confirm sub-lines attachment in Phase 2
  const handleConfirmSmartSubLinesInPhase2 = (
    parentNode: StagingTreeNode,
    parentTargetLevel: number,
    parentTargetRole: NodeRole,
    selectedChildren: { node: StagingTreeNode; level: number; role: NodeRole }[]
  ) => {
    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
    const selectedMap = new Map(selectedChildren.map((c) => [c.node.id, c]));

    const updatedLines = currentLines.map((line) => {
      if (line.id === parentNode.id) {
        return {
          ...line,
          level: parentTargetLevel,
          role: parentTargetRole,
        };
      }
      if (selectedMap.has(line.id)) {
        const cConfig = selectedMap.get(line.id)!;
        return {
          ...line,
          level: cConfig.level,
          role: cConfig.role,
        };
      }
      return line;
    });

    setLotFlatLinesMap((prev) => ({
      ...prev,
      [activeLot.id]: updatedLines,
    }));

    const updatedLot = rebuildLotFromFlatLines(activeLot, updatedLines);
    onUpdateLots(lots.map((l) => (l.id === activeLot.id ? updatedLot : l)));
    setSmartModalState(null);
  };

  // Apply target role/level to parent line only
  const handleApplySingleOnlyInPhase2 = (
    parentNode: StagingTreeNode,
    targetLevel: number,
    targetRole: NodeRole
  ) => {
    handleChangeLinePositionInPhase2(parentNode.id, targetLevel, targetRole);
    setSmartModalState(null);
  };

  // Filtered lines for flat view
  const filteredActiveLines = useMemo(() => {
    if (!searchTerm.trim()) return activeLines;
    const term = searchTerm.toLowerCase();
    return activeLines.filter(
      (l) =>
        (l.code && l.code.toLowerCase().includes(term)) ||
        (l.designation && l.designation.toLowerCase().includes(term))
    );
  }, [activeLines, searchTerm]);

  // Toggle bloc accordion
  const toggleBloc = (blocId: string) => {
    const updated = lots.map((l) => {
      if (l.id !== activeLotId) return l;
      return {
        ...l,
        blocs: l.blocs.map((b) => (b.id === blocId ? { ...b, isExpanded: !b.isExpanded } : b)),
      };
    });
    onUpdateLots(updated);
  };

  // Toggle ouvrage accordion
  const toggleOuvrage = (blocId: string, ouvrageId: string) => {
    const updated = lots.map((l) => {
      if (l.id !== activeLotId) return l;
      return {
        ...l,
        blocs: l.blocs.map((b) => {
          if (b.id !== blocId) return b;
          return {
            ...b,
            ouvrages: b.ouvrages.map((o) =>
              o.id === ouvrageId ? { ...o, isExpanded: !o.isExpanded } : o
            ),
          };
        }),
      };
    });
    onUpdateLots(updated);
  };

  // Start inline editing an article
  const handleStartEdit = (art: ArticleItem) => {
    setEditingArticleId(art.id);
    setEditQuantite(art.quantite);
    setEditPU(art.prixUnitaireHT);
  };

  // Save inline edit with dynamic ratio recalculation for Civil Engineering
  const handleSaveEdit = (blocId: string, ouvrageId: string, articleId: string) => {
    const updated = lots.map((l) => {
      if (l.id !== activeLotId) return l;
      return {
        ...l,
        blocs: l.blocs.map((b) => {
          if (b.id !== blocId) return b;
          let updatedOuvrages = b.ouvrages.map((o) => {
            if (o.id !== ouvrageId) return o;

            let updatedArticles = o.articles.map((a) => {
              if (a.id !== articleId) return a;
              const newTotalHT = editQuantite * editPU;
              const newPrixVente = newTotalHT * (a.coeffVente || l.coefficientVente || 1.25);
              return {
                ...a,
                quantite: editQuantite,
                quantiteRetenue: editQuantite,
                prixUnitaireHT: editPU,
                montantHT: newTotalHT,
                prixVenteHT: newPrixVente,
              };
            });

            // Dynamic Ratio Binding: If concrete quantity in Radier changes, update rebar quantity automatically!
            const isConcrete = updatedArticles.find(
              (a) => a.id === articleId && a.designation.toLowerCase().includes('béton')
            );
            if (isConcrete) {
              const newConcreteVol = editQuantite;
              const newRebarQty = Math.round(newConcreteVol * projectVariables.ratioArmatures);
              updatedArticles = updatedArticles.map((a) => {
                if (a.designation.toLowerCase().includes('armature') || a.unite === 'kg') {
                  const newTotalRebar = newRebarQty * a.prixUnitaireHT;
                  return {
                    ...a,
                    quantite: newRebarQty,
                    quantiteRetenue: newRebarQty,
                    montantHT: newTotalRebar,
                    prixVenteHT: newTotalRebar * (a.coeffVente || 1.25),
                  };
                }
                return a;
              });
            }

            const newOuvrageHT = updatedArticles.reduce((acc, curr) => acc + curr.montantHT, 0);
            return {
              ...o,
              quantite: isConcrete ? editQuantite : o.quantite,
              montantHT: newOuvrageHT,
              prixUnitaireHT:
                o.quantite && o.quantite > 0
                  ? parseFloat((newOuvrageHT / o.quantite).toFixed(2))
                  : o.prixUnitaireHT,
              articles: updatedArticles,
            };
          });

          const newBlocHT = updatedOuvrages.reduce((acc, curr) => acc + curr.montantHT, 0);
          return {
            ...b,
            totalHT: newBlocHT,
            ouvrages: updatedOuvrages,
          };
        }),
      };
    });
    onUpdateLots(updated);
    setEditingArticleId(null);
  };

  // Open Carnet de Métré for an ouvrage
  const handleOpenMetreModal = (blocId: string, ouvrage: OuvrageItem) => {
    setSelectedOuvrageForMetre({ blocId, ouvrage });
  };

  // Add line to carnet de métré
  const handleAddMetreLine = (ouvrageId: string) => {
    const currentLines = metreLinesState[ouvrageId] || [];
    const newLine: MetreDimensionLine = {
      id: `m-line-${Date.now()}`,
      libelle: 'Nouvelle ligne de métré (zone complémentaire)',
      localisation: 'RDC Axe 1-4',
      planRef: 'PE-GC-201',
      nombre: 1,
      longueur: 10.0,
      largeur: 5.0,
      hauteur: 0.2,
      signe: '+',
      resultat: 10.0,
      commentaire: 'Mesuré sur plan',
    };
    setMetreLinesState({
      ...metreLinesState,
      [ouvrageId]: [...currentLines, newLine],
    });
  };

  // Delete line from carnet de métré
  const handleDeleteMetreLine = (ouvrageId: string, lineId: string) => {
    const currentLines = metreLinesState[ouvrageId] || [];
    setMetreLinesState({
      ...metreLinesState,
      [ouvrageId]: currentLines.filter((l) => l.id !== lineId),
    });
  };

  // Calculate sum of carnet de métré
  const getMetreTotalResult = (lines: MetreDimensionLine[] = []) => {
    return lines.reduce((sum, line) => {
      const val = line.nombre * (line.longueur ?? 1) * (line.largeur ?? 1) * (line.hauteur ?? 1);
      return line.signe === '+' ? sum + val : sum - val;
    }, 0);
  };

  // Toggle article between Level 4 (Article) and Level 5 (Composant)
  const handleToggleArticleLevel = (blocId: string, ouvrageId: string, articleId: string) => {
    const updated = lots.map((l) => {
      if (l.id !== activeLotId) return l;
      return {
        ...l,
        blocs: l.blocs.map((b) => {
          if (b.id !== blocId) return b;
          return {
            ...b,
            ouvrages: b.ouvrages.map((o) => {
              if (o.id !== ouvrageId) return o;
              return {
                ...o,
                articles: o.articles.map((a) => {
                  if (a.id !== articleId) return a;
                  const isCurrentComponent = a.code.includes('.') && a.code.split('.').length >= 4;
                  let newCode = a.code;
                  if (isCurrentComponent) {
                    newCode = a.code.replace(/\.[a-z0-9]+$/, '');
                  } else {
                    newCode = `${a.code}.1`;
                  }
                  return {
                    ...a,
                    code: newCode,
                  };
                }),
              };
            }),
          };
        }),
      };
    });
    onUpdateLots(updated);
  };

  // Calculate lot total
  const getLotTotalHT = (lot: LotItem) => {
    return lot.blocs.reduce((sum, b) => {
      return (
        sum +
        b.ouvrages.reduce((ouvSum, o) => {
          return ouvSum + o.articles.reduce((artSum, a) => artSum + a.montantHT, 0);
        }, 0)
      );
    }, 0);
  };

  // Role badges helper
  const getCalcBadge = (mode?: CalcMode) => {
    switch (mode) {
      case 'COMP_SUM':
        return 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'COMP_UNIT':
        return 'bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-950/60 dark:text-teal-300';
      case 'ENS_QTY':
        return 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300';
      case 'ENS_GLOBAL':
        return 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      case 'RATIO':
        return 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300';
      case 'PERCENT':
        return 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
      case 'LUMP':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Statut des Métrés :
          </span>
          {validationStatus === 'VALIDE' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEFFF1] px-3.5 py-1 text-xs font-bold text-[#16A148]">
              <CheckCircle2 className="h-4 w-4" /> Métrés Approuvés & Validés
            </span>
          ) : validationStatus === 'REJETE' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEDED] px-3.5 py-1 text-xs font-bold text-[#DC2827]">
              <XCircle className="h-4 w-4" /> Métrés Rejetés : {motifRejet || 'Quantités à revoir'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3.5 py-1 text-xs font-semibold text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
              Métrés en cours de vérification
            </span>
          )}
        </div>

        {/* Global Civil Engineering Project Variables */}
        <div className="hidden items-center gap-3 rounded-xl bg-slate-50 px-3 py-1.5 text-xs lg:flex dark:bg-slate-800">
          <span className="font-semibold text-slate-500">Variables BTP :</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            ép. dalle = <strong>{projectVariables.epDalle} m</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            h. étage = <strong>{projectVariables.hSousPlafond} m</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            ratio aciers = <strong>{projectVariables.ratioArmatures} kg/m³</strong>
          </span>
        </div>

        {/* Actions Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddOuvrageModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ajouter Ouvrage</span>
          </button>
          <button
            type="button"
            onClick={onOpenRejectModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejeter</span>
          </button>
          <button
            type="button"
            onClick={onOpenApproveModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#16A148] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approuver les Métrés</span>
          </button>
        </div>
      </div>

      {/* Lot Selection Tabs and Dual-View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-800">
        {/* Lot Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {lots.map((lot) => {
            const isSelected = lot.id === activeLotId;
            const is5LevelLot = lot.id === 'lot-02' || lot.code === 'LOT 02';

            return (
              <button
                key={lot.id}
                type="button"
                onClick={() => setActiveLotId(lot.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#1B4591] text-white shadow-md ring-2 ring-blue-400'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span>{lot.code}</span>
                <span className="hidden sm:inline font-normal opacity-90 truncate max-w-[180px]">
                  {lot.titre}
                </span>

                {is5LevelLot && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    ★ 5 Niveaux
                  </span>
                )}

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {(getLotTotalHT(lot) / 1000).toFixed(0)} k€
                </span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('flat')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              viewMode === 'flat'
                ? 'bg-white text-[#1B4591] shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#1B4591] dark:text-sky-400" />
            <span>📋 Lignes au même niveau (Métrique & Niveaux)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hierarchie')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              viewMode === 'hierarchie'
                ? 'bg-white text-[#1B4591] shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Box className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>🌳 Arborescence WBS Restructurée</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('spatial')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              viewMode === 'spatial'
                ? 'bg-white text-[#1B4591] shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Building className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>🏢 Vue Spatiale</span>
          </button>
        </div>
      </div>

      {/* 5-LEVEL VIVID COLOR LEGEND BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Repères Couleurs des 5 Niveaux :
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Pos 2 : ZONE (En haut · Contient Blocs & Ouvrages)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-2 py-1 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              Pos 3 : BLOC / CHAPITRE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Pos 4 : OUVRAGE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Pos 5 : ARTICLE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Pos 6 : ENSEMBLE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-orange-950 dark:bg-orange-950/60 dark:text-orange-200">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Pos 7 : COMPOSANT (DÉBOURSÉ)
            </span>
          </div>
        </div>
      </div>

      {/* Spatial filter if spatial view is selected */}
      {viewMode === 'spatial' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/70 p-3 text-xs dark:bg-blue-950/30">
          <span className="font-semibold text-[#1B4591] dark:text-sky-300">
            Filtrer par Niveau constructif :
          </span>
          {[
            { id: 'all', label: 'Tous les niveaux' },
            { id: 'r-1', label: 'Sous-Sol R-1 (Infras & Radier)' },
            { id: 'rdc', label: 'RDC (Superstructure, Voiles, Hall)' },
            { id: 'r1-5', label: 'R+1 à R+5 (Chambres & Salles de bains)' },
            { id: 'toiture', label: 'Toiture-Terrasse & CVC' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedSpatialLevel(lvl.id)}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                selectedSpatialLevel === lvl.id
                  ? 'bg-[#1B4591] text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 1 : BANDEAU DU LOT ACTIF (EXEMPLE GÉNIE CIVIL 5 NIVEAUX) */}
      {/* ========================================================================= */}
      <div className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-gradient-to-r from-blue-900 via-[#1B4591] to-blue-950 text-white shadow-md p-5 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-blue-500 text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm ring-1 ring-white/30">
                NIV 1 · LOT
              </span>
              <span className="font-mono text-sm font-bold bg-white/20 px-2.5 py-0.5 rounded-md">
                {activeLot.code}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                {activeLot.statutValidation === 'VALIDE' ? 'Lot Validé' : 'Métrés En Cours'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold sm:text-xl tracking-tight">
              {activeLot.titre}
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl">
              Exemple de référence Génie Civil complet : Ce lot structure l'intégralité des 5 niveaux hiérarchiques (Lot &gt; Bloc &gt; Ouvrage &gt; Article &gt; Composant).
            </p>
          </div>

          {/* Financial & Technical Summary Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-right backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-semibold">Montant Total HT</span>
              <span className="font-mono text-base font-black text-white">
                {getLotTotalHT(activeLot).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-right backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-semibold">Prix de Vente (K = {activeLot.coefficientVente || 1.28})</span>
              <span className="font-mono text-base font-black text-emerald-300">
                {(getLotTotalHT(activeLot) * (activeLot.coefficientVente || 1.28)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-semibold">TVA</span>
              <span className="font-mono text-sm font-bold text-white">{activeLot.tva || 20} %</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE LIGNES AU MÊME NIVEAU (DEMANDE UTILISATEUR : TOUT AU MÊME NIVEAU)     */}
      {/* ========================================================================= */}
      {viewMode === 'flat' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Lignes du Lot au Même Niveau
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {activeLines.length} ligne{activeLines.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Toutes les lignes sont au même niveau (Position 1 · LIGNE). <strong>Modifier le Type (Zone en haut, Bloc, Ouvrage, Article, Ensemble, Composant) avance automatiquement la position</strong> et décale la ligne vers la droite. Une <strong>Zone</strong> contient les Blocs et les Ouvrages. Vous pouvez aussi utiliser les boutons <strong>⇥ Avancer</strong> et <strong>⇤ Reculer</strong> ou la règle [1-8].
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrer les lignes..."
                  className="rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Reset all lines to same level button (Demande utilisateur centrale) */}
              <button
                type="button"
                onClick={handleResetLotLinesToSameLevel}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 shadow-xs transition-all hover:bg-amber-100 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                title="Remet toutes les lignes de ce lot au même niveau (Position 1 · LIGNE)"
              >
                <RotateCcw className="h-4 w-4 text-amber-600" />
                <span>Initialiser tout au même niveau</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {openLevelMenuNodeId && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setOpenLevelMenuNodeId(null)}
              />
            )}
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                <tr>
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-3 w-72">Règle de Position [1-8] & Déplacement</th>
                  <th className="py-3 px-3 w-48">Type (Zone, Bloc, Ouvrage, Article...)</th>
                  <th className="py-3 px-3 w-28">N° / Code</th>
                  <th className="py-3 px-4 min-w-[320px]">Désignation / Libellé</th>
                  <th className="py-3 px-2 text-center w-20">Unité</th>
                  <th className="py-3 px-3 text-right w-28">Quantité Retenue</th>
                  <th className="py-3 px-3 text-center w-28">Métré</th>
                  <th className="py-3 px-2 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredActiveLines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Aucune ligne trouvée pour "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredActiveLines.map((line, idx) => {
                    const currentLevel = line.level || 1;
                    const isEditing = editingFlatLineId === line.id;

                    // Row left border color according to role
                    const rowBorderClass =
                      line.role === 'ZONE' || currentLevel === 2
                        ? 'border-l-[6px] border-l-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/25'
                        : line.role === 'BLOC' || currentLevel === 3
                        ? 'border-l-[5px] border-l-purple-600 bg-purple-50/30 dark:bg-purple-950/20'
                        : line.role === 'OUVRAGE' || currentLevel === 4
                        ? 'border-l-[5px] border-l-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : line.role === 'ARTICLE' || currentLevel === 5
                        ? 'border-l-[4px] border-l-sky-500 bg-sky-50/15 dark:bg-sky-950/10'
                        : line.role === 'ENSEMBLE' || currentLevel === 6
                        ? 'border-l-[5px] border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                        : line.role === 'COMPONENT_ART' || line.role === 'COMPONENT_ENS' || currentLevel === 7
                        ? 'border-l-[4px] border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
                        : line.role === 'NOTE' || currentLevel === 8
                        ? 'border-l-[4px] border-l-rose-400 bg-rose-50/20 dark:bg-rose-950/10 text-slate-500'
                        : 'border-l-[4px] border-l-slate-300 hover:bg-slate-50/70 dark:hover:bg-slate-800/40';

                    const activeDef = LEVEL_DEFINITIONS.find((d) => d.level === currentLevel) || LEVEL_DEFINITIONS[0];

                    return (
                      <tr
                        key={line.id}
                        className={`transition-colors ${rowBorderClass}`}
                      >
                        {/* 1. Index */}
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                          {idx + 1}
                        </td>

                        {/* 2. Position Ruler [1-8] avec boutons Avancer (⇥) et Reculer (⇤) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {/* Bouton Reculer la position (⇤) */}
                            <button
                              type="button"
                              onClick={() => handleRecedeLinePosition(line.id)}
                              disabled={currentLevel === 1}
                              title="Reculer la position / type précédent (⇤)"
                              className={`h-6 px-1.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-0.5 ${
                                currentLevel === 1
                                  ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-800 dark:text-slate-600'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <ArrowLeft className="h-3 w-3" />
                              <span>⇤</span>
                            </button>

                            {/* Règle numérique [1-8] */}
                            <div className="flex items-center gap-0.5">
                              {LEVEL_DEFINITIONS.map((def) => {
                                const isActive = currentLevel === def.level;
                                return (
                                  <button
                                    key={def.key}
                                    type="button"
                                    onClick={() => handleChangeLinePositionInPhase2(line.id, def.level, def.role)}
                                    title={`Positionner en ${def.label} (Pos ${def.key})`}
                                    className={`h-6 w-6 rounded-md text-[11px] font-black transition-all flex items-center justify-center ${
                                      isActive
                                        ? `${def.badgeClass} ring-2 ring-blue-500 shadow-xs scale-105`
                                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    {def.key}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Bouton Avancer la position (⇥) */}
                            <button
                              type="button"
                              onClick={() => handleAdvanceLinePosition(line.id)}
                              disabled={currentLevel === 7}
                              title="Avancer la position / type suivant (⇥)"
                              className={`h-6 px-1.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-0.5 ${
                                currentLevel === 7
                                  ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-800 dark:text-slate-600'
                                  : 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 shadow-2xs font-extrabold dark:border-blue-700 dark:bg-blue-950/40 dark:text-sky-300'
                              }`}
                            >
                              <span>⇥</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* 3. Type de la ligne (Zone, Bloc, Ouvrage, Article...) - Modifier le type avance la position */}
                        <td className="py-2.5 px-3 relative">
                          <button
                            type="button"
                            onClick={() => setOpenLevelMenuNodeId(openLevelMenuNodeId === line.id ? null : line.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold uppercase shadow-2xs transition-all hover:ring-2 hover:ring-blue-400 ${activeDef.badgeClass}`}
                            title="Cliquer pour modifier le type (Zone, Bloc, Ouvrage, Article...) et avancer la position"
                          >
                            <span>Pos {activeDef.key} · {activeDef.shortLabel}</span>
                            <ChevronDown className="h-3 w-3 stroke-[2.5]" />
                          </button>

                          {/* Menu contextuel complet des Types avec indication d'avancement de position */}
                          {openLevelMenuNodeId === line.id && (
                            <div className="absolute left-0 top-full z-40 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5 mb-1">
                                <span>Modifier le Type</span>
                                <span className="text-[9px] text-blue-600 font-bold">Avance la position ⇥</span>
                              </div>
                              <div className="space-y-1">
                                {[
                                  { role: 'ZONE', level: 2, label: 'Zone (En haut · Contient Blocs & Ouvrages)', pos: 'Pos 2 (Zone)', icon: '🏢' },
                                  { role: 'BLOC', level: 3, label: 'Bloc / Chapitre (Contient Ouvrages)', pos: 'Pos 3 (Bloc)', icon: '📦' },
                                  { role: 'OUVRAGE', level: 4, label: 'Ouvrage (Poste principal)', pos: 'Pos 4 (Ouvrage)', icon: '🏗️' },
                                  { role: 'ARTICLE', level: 5, label: 'Article (Élément de prix)', pos: 'Pos 5 (Article)', icon: '📄' },
                                  { role: 'ENSEMBLE', level: 6, label: 'Ensemble d\'ouvrages', pos: 'Pos 6 (Ensemble)', icon: '🗂️' },
                                  { role: 'COMPONENT_ART', level: 7, label: 'Composant / Déboursé', pos: 'Pos 7 (Sous-détail)', icon: '🔹' },
                                  { role: 'NOTE', level: 8, label: 'Note informative', pos: 'Pos 8 (*)', icon: '📝' },
                                  { role: 'LIGNE', level: 1, label: 'Ligne standard (Même niveau)', pos: 'Pos 1 (Base)', icon: '•' },
                                ].map((item) => {
                                  const isSelected = line.role === item.role || currentLevel === item.level;
                                  return (
                                    <button
                                      key={item.role}
                                      type="button"
                                      onClick={() => handleSelectLineType(line.id, item.role)}
                                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                                        isSelected
                                          ? 'bg-blue-50 text-[#1B4591] font-bold dark:bg-blue-950/40 dark:text-sky-300'
                                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{item.icon}</span>
                                        <div className="text-left">
                                          <span className="block font-bold">{item.label}</span>
                                          <span className="block text-[10px] text-slate-400 font-mono">{item.pos}</span>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <Check className="h-4 w-4 text-blue-600 stroke-[3]" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </td>


                        {/* 5. Code */}
                        <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {line.code || '-'}
                        </td>

                        {/* 6. Designation (Libellé) - Avancement visible de la position vers la droite */}
                        <td className="py-2.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editLineDesig}
                              onChange={(e) => setEditLineDesig(e.target.value)}
                              className="w-full rounded-lg border border-blue-400 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-600 dark:bg-slate-800 dark:text-white"
                            />
                          ) : (
                            <div
                              onDoubleClick={() => handleStartEditFlatLine(line)}
                              className="flex items-center transition-all duration-150"
                              style={{
                                paddingLeft:
                                  currentLevel === 1 ? '0px' :
                                  currentLevel === 2 ? '16px' :
                                  currentLevel === 3 ? '32px' :
                                  currentLevel === 4 ? '64px' :
                                  currentLevel === 5 ? '96px' :
                                  currentLevel === 6 ? '112px' :
                                  currentLevel === 7 ? '140px' :
                                  '20px',
                              }}
                            >
                              {/* Marqueurs visuels d'avancement de position */}
                              {currentLevel === 2 && (
                                <span className="inline-flex items-center gap-1.5 mr-2 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-950 border border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-2xs shrink-0">
                                  🏢 ZONE
                                </span>
                              )}
                              {currentLevel === 3 && (
                                <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 shadow-2xs shrink-0">
                                  📦 BLOC
                                </span>
                              )}
                              {currentLevel === 4 && (
                                <div className="flex items-center gap-1.5 mr-2 shrink-0">
                                  <span className="text-emerald-500 font-mono font-bold text-sm select-none">└──</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
                                    🏗️ OUVRAGE
                                  </span>
                                </div>
                              )}
                              {currentLevel === 5 && (
                                <div className="flex items-center gap-1.5 mr-2 shrink-0">
                                  <span className="text-sky-500 font-mono font-bold text-sm select-none">└──</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs">
                                    📄 ARTICLE
                                  </span>
                                </div>
                              )}
                              {currentLevel === 6 && (
                                <div className="flex items-center gap-1.5 mr-2 shrink-0">
                                  <span className="text-amber-500 font-mono font-bold text-sm select-none">↳</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 shadow-2xs">
                                    🗂️ ENSEMBLE
                                  </span>
                                </div>
                              )}
                              {currentLevel === 7 && (
                                <div className="flex items-center gap-1.5 mr-2 shrink-0">
                                  <span className="text-orange-500 font-mono font-bold text-sm select-none">└───</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-950 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 shadow-2xs">
                                    🔹 COMPOSANT
                                  </span>
                                </div>
                              )}
                              {currentLevel === 8 && (
                                <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">
                                  📝 NOTE *
                                </span>
                              )}

                              {/* Libellé */}
                              <span
                                className={`truncate ${
                                  currentLevel === 2
                                    ? 'font-black text-indigo-950 dark:text-indigo-100 text-sm tracking-wide'
                                    : currentLevel === 3
                                    ? 'font-bold text-purple-950 dark:text-purple-100 text-sm'
                                    : currentLevel === 4
                                    ? 'font-bold text-emerald-950 dark:text-emerald-100'
                                    : currentLevel === 5
                                    ? 'font-medium text-slate-900 dark:text-slate-100'
                                    : currentLevel === 6
                                    ? 'font-bold text-amber-950 dark:text-amber-100'
                                    : currentLevel === 7
                                    ? 'italic text-orange-950 dark:text-orange-200'
                                    : currentLevel === 8
                                    ? 'italic text-rose-800 dark:text-rose-300'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                                title={line.designation}
                              >
                                {line.designation}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 7. Unité */}
                        <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editLineUnit}
                              onChange={(e) => setEditLineUnit(e.target.value)}
                              className="w-14 rounded-lg border border-blue-400 bg-white px-1.5 py-1 text-center text-xs text-slate-900 focus:outline-none dark:border-blue-600 dark:bg-slate-800 dark:text-white"
                            />
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {line.unit || 'U'}
                            </span>
                          )}
                        </td>

                        {/* 8. Quantité Retenue */}
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editLineQte}
                              onChange={(e) => setEditLineQte(parseFloat(e.target.value) || 0)}
                              className="w-20 rounded-lg border border-blue-400 bg-white px-1.5 py-1 text-right text-xs text-slate-900 focus:outline-none dark:border-blue-600 dark:bg-slate-800 dark:text-white"
                            />
                          ) : (
                            line.quantite !== undefined ? line.quantite.toLocaleString('fr-FR') : '-'
                          )}
                        </td>


                        {/* 11. Métré Button */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenMetreModalForFlatLine(line)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#1B4591]/20 bg-[#ECF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1B4591] transition-all hover:bg-[#D8EAFF] dark:bg-slate-800 dark:text-sky-400 shadow-2xs"
                            title="Ouvrir le Carnet de Métré géométrique pour calculer les dimensions (L x l x h)"
                          >
                            <Ruler className="h-3 w-3" />
                            <span>📐 Métré</span>
                          </button>
                        </td>

                        {/* 12. Actions */}
                        <td className="py-2.5 px-2 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveFlatLineEdit(line.id)}
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                                title="Enregistrer"
                              >
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFlatLineId(null)}
                                className="rounded p-1 text-rose-500 hover:bg-rose-100"
                                title="Annuler"
                              >
                                <X className="h-3.5 w-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditFlatLine(line)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Modifier la ligne"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE ARBORESCENCE WBS RESTRUCTURÉE & VUE SPATIALE                          */}
      {/* ========================================================================= */}
      {viewMode !== 'flat' && (
        <div className="space-y-6 animate-in fade-in duration-200">
        {activeLot.blocs.map((bloc) => (
          <div
            key={bloc.id}
            className="overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-sm dark:border-purple-900/50 dark:bg-slate-900"
          >
            {/* Bloc Header (NIVEAU 2) */}
            <div
              onClick={() => toggleBloc(bloc.id)}
              className="flex cursor-pointer items-center justify-between border-l-[6px] border-l-purple-600 bg-purple-50/70 px-6 py-4 transition-colors hover:bg-purple-100/70 dark:bg-purple-950/30 dark:hover:bg-purple-950/50"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-purple-700 hover:bg-purple-200 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  {bloc.isExpanded ? (
                    <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-purple-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm">
                    NIV 2 · BLOC
                  </span>
                  <span className="rounded-md border border-purple-300 bg-purple-100 px-2 py-0.5 font-mono text-xs font-bold text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                    {bloc.code}
                  </span>
                  <h3 className="text-sm font-bold text-purple-950 dark:text-white">
                    {bloc.titre}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-purple-800 font-medium dark:text-purple-300">
                  {bloc.ouvrages.length} ouvrage{bloc.ouvrages.length > 1 ? 's' : ''}
                </span>
                <span className="font-mono text-sm font-black text-purple-950 dark:text-white">
                  {bloc.totalHT.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  € HT
                </span>
              </div>
            </div>

            {/* Bloc Ouvrages List */}
            {bloc.isExpanded && (
              <div className="divide-y divide-slate-100 p-2 dark:divide-slate-800">
                {bloc.ouvrages.map((ouvrage) => {
                  const hasMetreLines =
                    (metreLinesState[ouvrage.id] && metreLinesState[ouvrage.id].length > 0) ||
                    ouvrage.code === '2.1.2' ||
                    ouvrage.code === '1.1.1';

                  const isEnsemble = ouvrage.code === '5.2.1' || ouvrage.code === '5.1.1';

                  // Specific calculation mode indicator from code
                  const calcMode: CalcMode =
                    ouvrage.code === '2.1.2'
                      ? 'COMP_SUM'
                      : ouvrage.code === '4.1.1'
                      ? 'COMP_UNIT'
                      : ouvrage.code === '5.2.1'
                      ? 'ENS_QTY'
                      : ouvrage.code === '5.1.1'
                      ? 'ENS_GLOBAL'
                      : 'QTY_PU';

                  return (
                    <div key={ouvrage.id} className="p-3">
                      {/* Ouvrage Header Row (NIVEAU 3) */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 transition-colors ${
                          isEnsemble
                            ? 'border-l-[6px] border-l-amber-600 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/25 dark:border-amber-900'
                            : 'border-l-[6px] border-l-emerald-600 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/25 dark:border-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleOuvrage(bloc.id, ouvrage.id)}
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:text-slate-800"
                          >
                            {ouvrage.isExpanded ? (
                              <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                            )}
                          </button>

                          {/* Level 3 Badge */}
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm ${
                              isEnsemble ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          >
                            {isEnsemble ? 'NIV 3 · ENSEMBLE' : 'NIV 3 · OUVRAGE'}
                          </span>

                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                              isEnsemble
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {ouvrage.code}
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              isEnsemble ? 'text-amber-950 dark:text-white' : 'text-emerald-950 dark:text-white'
                            }`}
                          >
                            {ouvrage.designation}
                          </span>

                          {/* Calc mode badge */}
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${getCalcBadge(
                              calcMode
                            )}`}
                          >
                            {calcMode}
                          </span>

                          {/* Tolerance Alert if Radier 2.1.2 */}
                          {ouvrage.code === '2.1.2' && (
                            <span
                              className="inline-flex cursor-help items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-sm"
                              title="Montant source importé = 249 280 € vs Somme composants = 237 312 €. Le PU affiché (390.32 €) est dérivé et arrondi."
                            >
                              <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
                              Arrondi BTP (-11 968 € source)
                            </span>
                          )}
                        </div>

                        {/* Right: Quantities, Price & Carnet de Métré button */}
                        <div className="flex items-center gap-3">
                          {ouvrage.quantite !== undefined && (
                            <div className="text-right text-xs">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {ouvrage.quantite.toLocaleString('fr-FR')}{' '}
                                <span className="text-slate-500 font-normal">{ouvrage.unite}</span>
                              </span>
                            </div>
                          )}

                          <div className="text-right font-mono text-xs font-black text-slate-900 dark:text-white">
                            {ouvrage.montantHT.toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                            })}{' '}
                            €
                          </div>

                          {/* Smart Sub-lines button (Demande utilisateur : pop-up intelligent pour sélectionner les sous-lignes jusqu'au même niveau) */}
                          <button
                            type="button"
                            onClick={() => handleOpenSmartSubLinesForOuvrage(bloc.id, ouvrage)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-800 transition-all hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                            title="Sélection intelligente des sous-lignes/articles sous cet ouvrage (détecte ex: 2.3.1 pour 2.3 jusqu'à 2.4)"
                          >
                            <Sparkles className="h-3 w-3 text-sky-600 animate-pulse" />
                            <span>Sous-lignes 🪄</span>
                          </button>

                          {/* Open Carnet de Métré Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenMetreModal(bloc.id, ouvrage)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#1B4591]/20 bg-[#ECF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1B4591] transition-all hover:bg-[#D8EAFF] dark:bg-slate-800 dark:text-sky-400"
                          >
                            <Ruler className="h-3 w-3" />
                            <span>Carnet de Métré</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Sub-articles & Components (NIVEAUX 4 & 5) */}
                      {ouvrage.isExpanded && (
                        <div className="mt-2 pl-6">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 text-[11px] font-bold text-slate-600 dark:border-slate-800">
                              <tr>
                                <th className="py-1.5 px-2">Niveau</th>
                                <th className="py-1.5 px-2">Code</th>
                                <th className="py-1.5 px-2">Composant / Sous-Article</th>
                                <th className="py-1.5 px-2">Type Coût</th>
                                <th className="py-1.5 px-2 text-right">Qte Retenue</th>
                                <th className="py-1.5 px-2 text-center">Unité</th>
                                <th className="py-1.5 px-2 text-right">P.U. HT</th>
                                <th className="py-1.5 px-2 text-right">Total HT</th>
                                <th className="py-1.5 px-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {ouvrage.articles.map((art) => {
                                const isEditing = editingArticleId === art.id;
                                const isComponent =
                                  art.level === 5 ||
                                  (art.code.includes('.') &&
                                    art.code.split('.').length >= 4 &&
                                    (!art.components || art.components.length === 0));
                                const hasSubComponents = art.components && art.components.length > 0;

                                return (
                                  <React.Fragment key={art.id}>
                                    {/* NIVEAU 4 : LIGNE ARTICLE */}
                                    <tr
                                      className={`transition-colors ${
                                        hasSubComponents
                                          ? 'border-l-[4px] border-l-sky-500 bg-sky-50/50 hover:bg-sky-100/50 font-medium dark:bg-sky-950/25'
                                          : isComponent
                                          ? 'border-l-[4px] border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/60 dark:bg-orange-950/10'
                                          : 'border-l-[4px] border-l-sky-400 bg-sky-50/30 hover:bg-sky-50/60 dark:bg-sky-950/10'
                                      }`}
                                    >
                                      <td className="py-2 px-2">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleArticleLevel(bloc.id, ouvrage.id, art.id)}
                                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm transition-all hover:scale-105 cursor-pointer ${
                                            hasSubComponents
                                              ? 'bg-sky-600 hover:bg-sky-700'
                                              : isComponent
                                              ? 'bg-orange-500 hover:bg-orange-600'
                                              : 'bg-sky-500 hover:bg-sky-600'
                                          }`}
                                          title="Cliquer pour changer le niveau (Niv 4 Article <-> Niv 5 Composant)"
                                        >
                                          {hasSubComponents ? 'NIV 4 · ART' : isComponent ? 'NIV 5 · COMP' : 'NIV 4 · ART'}
                                        </button>
                                      </td>
                                      <td className="py-2 px-2 font-mono text-[11px] text-slate-800 dark:text-slate-200 font-bold">
                                        {art.code}
                                      </td>
                                      <td className="py-2 px-2 font-medium text-slate-800 dark:text-slate-200">
                                        <div className="flex items-center gap-2">
                                          <span>{art.designation}</span>
                                          {hasSubComponents && (
                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-900 border border-orange-300 dark:bg-orange-950/50 dark:text-orange-200">
                                              {art.components!.length} sous-composants déboursés (Niv 5)
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 px-2">
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                          {art.typeArticle}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 text-right font-mono">
                                        {isEditing ? (
                                          <input
                                            type="number"
                                            value={editQuantite}
                                            onChange={(e) =>
                                              setEditQuantite(parseFloat(e.target.value) || 0)
                                            }
                                            className="w-20 rounded border border-[#1B4591] px-1 py-0.5 text-right text-xs"
                                          />
                                        ) : (
                                          <span className="font-semibold">
                                            {art.quantite.toLocaleString('fr-FR')}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2 text-center text-slate-500 font-semibold">
                                        {art.unite}
                                      </td>
                                      <td className="py-2 px-2 text-right font-mono">
                                        {isEditing ? (
                                          <input
                                            type="number"
                                            value={editPU}
                                            onChange={(e) =>
                                              setEditPU(parseFloat(e.target.value) || 0)
                                            }
                                            className="w-20 rounded border border-[#1B4591] px-1 py-0.5 text-right text-xs"
                                          />
                                        ) : (
                                          <span>
                                            {art.prixUnitaireHT.toLocaleString('fr-FR', {
                                              minimumFractionDigits: 2,
                                            })}{' '}
                                            €
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                                        {art.montantHT.toLocaleString('fr-FR', {
                                          minimumFractionDigits: 2,
                                        })}{' '}
                                        €
                                      </td>
                                      <td className="py-2 px-2 text-center">
                                        {isEditing ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSaveEdit(bloc.id, ouvrage.id, art.id)
                                            }
                                            className="rounded bg-[#16A148] p-1 text-white hover:bg-emerald-700"
                                            title="Enregistrer"
                                          >
                                            <Check className="h-3 w-3 stroke-[3]" />
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleStartEdit(art)}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                            title="Modifier"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>

                                    {/* NIVEAU 5 : SOUS-COMPOSANTS DE DÉBOURSÉ SEC (INDENTÉS & DÉTAILLÉS) */}
                                    {hasSubComponents &&
                                      art.components!.map((comp) => (
                                        <tr
                                          key={comp.id}
                                          className="border-l-[4px] border-l-orange-400 bg-orange-50/35 hover:bg-orange-100/50 dark:bg-orange-950/20 text-xs transition-colors"
                                        >
                                          <td className="py-1.5 px-2 pl-4">
                                            <span className="rounded-md bg-orange-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                                              NIV 5 · {comp.resourceType || 'COMP'}
                                            </span>
                                          </td>
                                          <td className="py-1.5 px-2 font-mono text-[10px] text-orange-900 dark:text-orange-200 font-bold">
                                            {comp.code}
                                          </td>
                                          <td className="py-1.5 px-2 pl-6 font-normal text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-orange-500 font-bold">↳</span>
                                              <span className="italic">{comp.designation}</span>
                                            </div>
                                          </td>
                                          <td className="py-1.5 px-2">
                                            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-800 border border-orange-200 dark:bg-orange-900/60 dark:text-orange-200 uppercase">
                                              {comp.resourceType || comp.typeArticle}
                                            </span>
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                                            {comp.quantite.toLocaleString('fr-FR')}
                                          </td>
                                          <td className="py-1.5 px-2 text-center text-slate-500 text-[11px]">
                                            {comp.unite}
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                                            {comp.prixUnitaireHT.toLocaleString('fr-FR', {
                                              minimumFractionDigits: 2,
                                            })}{' '}
                                            €
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono font-semibold text-orange-950 dark:text-orange-300">
                                            {comp.montantHT.toLocaleString('fr-FR', {
                                              minimumFractionDigits: 2,
                                            })}{' '}
                                            €
                                          </td>
                                          <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 font-mono">
                                            Déboursé
                                          </td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* CARNET DE MÉTRÉ MODAL / DRAWER (INTERACTIVE CIVIL ENGINEERING CALCULATOR) */}
      {selectedOuvrageForMetre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECF4FF] text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
                  <Ruler className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Carnet de Métré Géométrique : {selectedOuvrageForMetre.ouvrage.code} -{' '}
                    {selectedOuvrageForMetre.ouvrage.designation}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calcul dimensionnel rigoureux avec déductions de trémies, baies et réservations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOuvrageForMetre(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Measurement Lines Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lignes de calcul du métré :
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {(metreLinesState[selectedOuvrageForMetre.ouvrage.id] || MOCK_METRE_LINES_RADIER)
                      .length}{' '}
                    lignes
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddMetreLine(selectedOuvrageForMetre.ouvrage.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4591] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#163a7a]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter une ligne de métré</span>
                </button>
              </div>

              {/* Measurement Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Signe</th>
                      <th className="py-2.5 px-3 font-bold">Désignation / Axe</th>
                      <th className="py-2.5 px-3 font-bold">Réf Plan</th>
                      <th className="py-2.5 px-2 text-right font-bold">Nbre</th>
                      <th className="py-2.5 px-2 text-right font-bold">Long. (m)</th>
                      <th className="py-2.5 px-2 text-right font-bold">Larg. (m)</th>
                      <th className="py-2.5 px-2 text-right font-bold">Haut. (m)</th>
                      <th className="py-2.5 px-3 text-right font-bold">Résultat</th>
                      <th className="py-2.5 px-2 text-center font-bold">Suppr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {(
                      metreLinesState[selectedOuvrageForMetre.ouvrage.id] || MOCK_METRE_LINES_RADIER
                    ).map((line) => {
                      const isNegative = line.signe === '-';
                      return (
                        <tr
                          key={line.id}
                          className={isNegative ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}
                        >
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${
                                isNegative
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                              }`}
                            >
                              {line.signe}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {line.libelle}
                            </span>
                            {line.commentaire && (
                              <p className="text-[10px] text-slate-400">{line.commentaire}</p>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                            {line.planRef || 'Plan DCE'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">{line.nombre}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {line.longueur?.toFixed(2) || '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {line.largeur?.toFixed(2) || '-'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {line.hauteur?.toFixed(2) || '-'}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-bold ${
                              isNegative
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {isNegative ? '-' : ''}
                            {line.resultat.toFixed(2)}{' '}
                            <span className="font-normal text-slate-500">
                              {selectedOuvrageForMetre.ouvrage.unite || 'm³'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMetreLine(selectedOuvrageForMetre.ouvrage.id, line.id)
                              }
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Linked Ratio Box (Genie Civil) */}
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs dark:border-sky-900 dark:bg-sky-950/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <div>
                    <h4 className="font-bold text-sky-900 dark:text-sky-300">
                      Liaison Dynamique des Ratios de Génie Civil (Norme UNTEC)
                    </h4>
                    <p className="mt-0.5 text-sky-700 dark:text-sky-400">
                      Le volume calculé par le métré pilote directement le tonnage d'armatures HA B500B selon le ratio paramétré de <strong>95 kg/m³</strong>. Tout ajustement géométrique actualise instantanément le montant du lot.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Total & Save */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500">
                  Total Métré Net Calculé :
                </span>
                <span className="font-mono text-base font-extrabold text-[#1B4591] dark:text-sky-300">
                  {getMetreTotalResult(
                    metreLinesState[selectedOuvrageForMetre.ouvrage.id] || MOCK_METRE_LINES_RADIER
                  ).toFixed(2)}{' '}
                  {selectedOuvrageForMetre.ouvrage.unite || 'm³'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOuvrageForMetre(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const totalNet = getMetreTotalResult(
                      metreLinesState[selectedOuvrageForMetre.ouvrage.id] || MOCK_METRE_LINES_RADIER
                    );
                    const roundedQty = Math.round(totalNet * 100) / 100;

                    // Update in flat lines map
                    const currentLines = lotFlatLinesMap[activeLot.id] || extractFlatLinesFromLot(activeLot, true);
                    const updatedLines = currentLines.map((l) => {
                      if (l.id === selectedOuvrageForMetre.ouvrage.id) {
                        const newTotalHT = Math.round(roundedQty * (l.unitPrice || 0) * 100) / 100;
                        return {
                          ...l,
                          quantite: roundedQty,
                          montantHT: newTotalHT,
                        };
                      }
                      return l;
                    });
                    setLotFlatLinesMap((prev) => ({
                      ...prev,
                      [activeLot.id]: updatedLines,
                    }));

                    // Update in structured lots
                    const updatedLot = rebuildLotFromFlatLines(activeLot, updatedLines);
                    onUpdateLots(lots.map((l) => (l.id === activeLot.id ? updatedLot : l)));
                    setSelectedOuvrageForMetre(null);
                  }}
                  className="rounded-xl bg-[#16A148] px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Valider & Appliquer aux Quantités
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMART SUB-LINES MODAL FOR OUVRAGES IN PHASE 2 */}
      {smartModalState && smartModalState.isOpen && smartModalState.parentNode && (
        <SmartSubLinesModal
          isOpen={smartModalState.isOpen}
          onClose={() => setSmartModalState(null)}
          parentNode={smartModalState.parentNode}
          targetLevel={smartModalState.parentNode.level || 4}
          targetRole={smartModalState.parentNode.role || 'OUVRAGE'}
          allLinesBelow={smartModalState.allLinesBelow}
          onConfirm={handleConfirmSmartSubLinesInPhase2}
          onApplySingleOnly={handleApplySingleOnlyInPhase2}
        />
      )}
    </div>
  );
};
