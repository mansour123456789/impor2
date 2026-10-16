import React, { useState, useMemo, useEffect } from 'react';
import {
  Upload,
  Link2,
  Columns,
  GitBranch,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  Layers,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Minus,
  CheckSquare,
  Square,
  HelpCircle,
  TrendingDown,
  CheckCircle,
  Eye,
  Maximize2,
  Minimize2,
  Edit2,
  RotateCcw,
  Undo2,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  CornerUpLeft,
  X,
  MousePointerClick,
  Hash,
  Keyboard,
  Copy,
  Compass,
  Paintbrush,
  Wand2,
  Split,
} from 'lucide-react';
import {
  ImportSubStep,
  LotItem,
  StagingTreeNode,
  ImportIntegrationOptions,
  CalcMode,
  InclusionMode,
  NodeRole,
  ResourceType,
} from '../../types/dpgf';
import { MOCK_STAGING_TREE } from '../../data/mockCivilEngineeringTree';
import * as XLSX from 'xlsx';
import { ImportUploadStep } from './import/ImportUploadStep';
import { AssociationStep, DEFAULT_DPGF_LOTS } from './import/AssociationStep';
import { IdentificationStep } from './import/IdentificationStep';
import {
  SheetConfig,
  autoDetectSheetConfig,
  buildHierarchicalTreeFromSheets,
  convertTreeToLotItems,
} from '../../utils/dpgfParser';
import { SmartSubLinesModal } from '../modals/SmartSubLinesModal';

const formatCurrency = (val?: number): string => {
  if (val === undefined || val === null || isNaN(val)) return '0,00 €';
  return val.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface Phase1ImportProps {
  onImportComplete: (importedLots: LotItem[]) => void;
  existingLots: LotItem[];
}

export const Phase1Import: React.FC<Phase1ImportProps> = ({ onImportComplete, existingLots }) => {
  const [subStep, setSubStep] = useState<ImportSubStep>('arborescence');
  const [isMultipleFiles, setIsMultipleFiles] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    '2.1- AE- Annexe 1 AE DPGF (1).xlsx'
  );
  const [isDragging, setIsDragging] = useState(false);

  // Sheets and Excel state
  const [availableSheets, setAvailableSheets] = useState<string[]>([
    'RECAP',
    'LOT 00',
    'LOT 01',
    'LOT 02',
    'LOT 03',
    'LOT 04',
    'LOT 05',
    'LOT 06',
    'LOT 07',
    'LOT 08',
    'LOT 09',
    'LOT 13',
    'LOT 10',
    'LOT 11',
    'LOT 12',
    'LOT 14',
  ]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>(['LOT 02']);
  const [activeSheet, setActiveSheet] = useState<string>('LOT 02');
  const [rawSheetsData, setRawSheetsData] = useState<Record<string, (string | number)[][]>>({});
  const [allowMultipleLotsPerFile, setAllowMultipleLotsPerFile] = useState<boolean>(false);
  const [sheetConfigs, setSheetConfigs] = useState<Record<string, SheetConfig>>({});
  const [sheetLotMap, setSheetLotMap] = useState<Record<string, string>>({
    RECAP: 'RECAP',
    'LOT 00': '00 - DEPOLLUTION – DESAMIANTAGE - DEPLOMBAGE',
    'LOT 01': '01 - CURAGE',
    'LOT 02': '02 - INSTALLATIONS DE CHANTIER – FONDATIONS - GROS ŒUVRE – CHARPENTE BOIS',
    'LOT 03': '03 - COUVERTURE',
    'LOT 04': '04 - TRAITEMENT DES FAÇADES',
    'LOT 05': '05 - MENUISERIES EXTERIEURES - OCCULTATIONS',
    'LOT 06': '06 - METALLERIE',
    'LOT 07': '07 - MENUISERIES INTERIEURES',
    'LOT 08': '08 - CLOISONS - DOUBLAGE - FAUX PLAFONDS',
    'LOT 09': '09 - REVETEMENTS DE SOL - FAÏENCES',
    'LOT 10': '10 - PEINTURE',
    'LOT 11': '11 - ASCENSEUR',
    'LOT 12': '12 - PLOMBERIE - CHAUFFAGE - VENTILATION',
    'LOT 13': '13 - COURANTS FORTS / COURANTS FAIBLES',
    'LOT 14': '14 - AMENAGEMENTS EXTERIEURS',
  });

  // Staging tree state
  const [treeData, setTreeData] = useState<StagingTreeNode[]>(MOCK_STAGING_TREE);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterProfile, setActiveFilterProfile] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [inclusionFilter, setInclusionFilter] = useState<string>('all');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState<boolean>(false);
  const [activeClassificationSheet, setActiveClassificationSheet] = useState<string>('ALL');

  // Helper to find a specific LOT node matching a sheet name
  const findMatchingLotNode = (
    nodes: StagingTreeNode[],
    sheetName: string
  ): StagingTreeNode | null => {
    const s = sheetName.trim().toLowerCase();
    for (const n of nodes) {
      const isLot = n.role === 'LOT' || n.role === 'MACRO_LOT' || n.level === 2 || n.level === 3;
      if (isLot) {
        const nodeSheet = (n.sheetName || '').trim().toLowerCase();
        const nodeCode = (n.code || '').trim().toLowerCase();
        const nodeId = (n.id || '').trim().toLowerCase();

        if (
          nodeSheet === s ||
          nodeCode === s ||
          nodeCode.includes(s) ||
          s.includes(nodeCode) ||
          nodeId.includes(s.replace(/[^a-z0-9]/g, '-'))
        ) {
          return n;
        }
      }
      if (n.children && n.children.length > 0) {
        const found = findMatchingLotNode(n.children, sheetName);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelectClassificationSheet = (sheet: string) => {
    setActiveClassificationSheet(sheet);
    if (sheet !== 'ALL') {
      const existing = findMatchingLotNode(treeData, sheet);
      // If lot is not present or has no children, but rawSheetsData has it, parse it
      if ((!existing || !existing.children || existing.children.length === 0) && rawSheetsData[sheet]) {
        const nextSheets = selectedSheets.includes(sheet) ? selectedSheets : [...selectedSheets, sheet];
        const parsed = buildHierarchicalTreeFromSheets(
          nextSheets,
          sheetConfigs,
          rawSheetsData,
          sheetLotMap
        );
        if (parsed.length > 0) {
          setTreeData(parsed);
          setSelectedSheets(nextSheets);
          setToastNotification({
            message: `Feuille "${sheet}" analysée et prête pour affichage`,
          });
          setTimeout(() => setToastNotification(null), 3500);
        }
      }
    }
  };

  // User modification of levels state
  const [openLevelMenuNodeId, setOpenLevelMenuNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('stg-2-1-1');
  const [hoveredNodeTrail, setHoveredNodeTrail] = useState<StagingTreeNode[]>([]);
  const [flashNodeId, setFlashNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: StagingTreeNode;
  } | null>(null);

  const [toastNotification, setToastNotification] = useState<{
    message: string;
    previousTree?: StagingTreeNode[];
  } | null>(null);

  // example2.md Next-Gen Speed-First States
  const [speedKeysEnabled, setSpeedKeysEnabled] = useState(true);
  const [painterActive, setPainterActive] = useState(false);
  const [painterLevel, setPainterLevel] = useState<number>(6); // Default 6 (ARTICLE)
  const [isPainterMenuOpen, setIsPainterMenuOpen] = useState(false);
  const [lastClickedNodeId, setLastClickedNodeId] = useState<string | null>(null);
  const [showCockpitWbs, setShowCockpitWbs] = useState(true); // Split-Screen default on
  const [wbsViewScope, setWbsViewScope] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Integration basket options
  const [integrationOptions, setIntegrationOptions] = useState<ImportIntegrationOptions>({
    targetLotId: 'lot-02',
    conflictMode: 'remplacer',
    priceMode: 'importer',
    coeffK: 1.25,
    qtyMode: 'importer',
    hierarchyMode: 'conserver_chemin',
  });

  // Cascading mode state: by default true as requested by user
  const [cascadeToBelow, setCascadeToBelow] = useState<boolean>(true);

  // Smart Sub-Lines Selection Modal state (Intelligent detection of sub-lines e.g. 2.3.1 up to 2.4)
  const [autoOpenSmartSubLines, setAutoOpenSmartSubLines] = useState<boolean>(true);
  const [smartModalState, setSmartModalState] = useState<{
    isOpen: boolean;
    parentNode: StagingTreeNode | null;
    targetLevel: number;
    targetRole: NodeRole;
    allLinesBelow: StagingTreeNode[];
  }>({
    isOpen: false,
    parentNode: null,
    targetLevel: 4,
    targetRole: 'OUVRAGE',
    allLinesBelow: [],
  });

  // Track global mouse down for drag-to-paint
  useEffect(() => {
    const handleDown = () => setIsMouseDown(true);
    const handleUp = () => setIsMouseDown(false);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenLevelMenuNodeId(null);
      setContextMenu(null);
      setIsPainterMenuOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const subSteps = [
    { id: 'import' as ImportSubStep, label: 'Import', icon: Upload },
    { id: 'association' as ImportSubStep, label: 'Association des lots', icon: Link2 },
    { id: 'identification' as ImportSubStep, label: 'Identification des colonnes', icon: Columns },
    { id: 'arborescence' as ImportSubStep, label: 'Classification des éléments', icon: GitBranch },
    { id: 'verification' as ImportSubStep, label: 'Vérification', icon: CheckCircle2 },
  ];

  const currentIdx = subSteps.findIndex((s) => s.id === subStep);

  // Preload official DPGF file on mount if available in public/
  useEffect(() => {
    const preloadOfficialFile = async () => {
      try {
        let res = await fetch('/2.1- AE- Annexe 1 AE DPGF (1).xlsx');
        if (!res.ok) res = await fetch('/dpgf_annexe1.xlsx');
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const wb = XLSX.read(buffer, { type: 'array' });
          const sheets = wb.SheetNames;
          if (sheets && sheets.length > 0) {
            setAvailableSheets(sheets);
            const data: Record<string, (string | number)[][]> = {};
            const configs: Record<string, SheetConfig> = {};
            for (const s of sheets) {
              const ws = wb.Sheets[s];
              const rows = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                defval: '',
              }) as (string | number)[][];
              data[s] = rows;
              configs[s] = autoDetectSheetConfig(s, rows);
            }
            setRawSheetsData(data);
            setSheetConfigs(configs);

            // Pre-parse all non-recap sheets into the hierarchical tree (Projet > 2 Zones > Lots)
            const nonRecapSheets = sheets.filter((s) => !s.toUpperCase().includes('RECAP'));
            const parsed = buildHierarchicalTreeFromSheets(
              nonRecapSheets,
              configs,
              data,
              sheetLotMap
            );
            if (parsed.length > 0) {
              setTreeData(parsed);
              setSelectedSheets(nonRecapSheets);
            }
          }
        }
      } catch (e) {
        console.warn('Preload notice:', e);
      }
    };
    preloadOfficialFile();
  }, []);

  const handleFileLoaded = (
    fileName: string,
    sheets: string[],
    data: Record<string, (string | number)[][]>
  ) => {
    setUploadedFileName(fileName);
    setAvailableSheets(sheets);
    setRawSheetsData(data);
    const configs: Record<string, SheetConfig> = {};
    const lotMap: Record<string, string> = {};

    for (const s of sheets) {
      configs[s] = autoDetectSheetConfig(s, data[s] || []);
      const upper = s.toUpperCase();
      if (upper.includes('RECAP') || upper.includes('SYNTHESE')) {
        lotMap[s] = 'RECAP';
      } else {
        const matchLot = DEFAULT_DPGF_LOTS.find((l) => l.code && upper.includes(l.code));
        if (matchLot) {
          lotMap[s] = matchLot.label;
        } else {
          lotMap[s] = s;
        }
      }
    }
    setSheetConfigs(configs);
    setSheetLotMap(lotMap);

    const defaultSelection = sheets.includes('LOT 02') ? ['LOT 02'] : [sheets[0]];
    setSelectedSheets(defaultSelection);
    setActiveSheet(defaultSelection[0]);
    setSubStep('association');
  };

  const handleParseAndProceed = () => {
    const parsedLots = buildHierarchicalTreeFromSheets(
      selectedSheets,
      sheetConfigs,
      rawSheetsData,
      sheetLotMap
    );

    if (parsedLots.length > 0) {
      setTreeData(parsedLots);
      setToastNotification({
        message: `${parsedLots.length} lot(s) importé(s) avec succès depuis le fichier DPGF.`,
      });
      setTimeout(() => setToastNotification(null), 4000);
    }
    setActiveClassificationSheet('ALL');
    setSubStep('arborescence');
  };

  // Helper to determine Level / Position Number :
  // Pos 1 : PROJET (racine, 1ère ligne) & LIGNE (lignes brutes sans niveau)
  // Pos 2 : LOT (les lots de chaque feuille importée)
  // Pos 3 : BLOC (sous-section / chapitre sous le lot)
  // Pos 4 : OUVRAGE (ouvrage sous le bloc)
  // Pos 5 : ARTICLE (article sous l'ouvrage)
  // Pos 6 : ENSEMBLE (ensemble sous l'article ou l'ouvrage)
  // Pos 7 : COMPOSANT / ENSEMBLE & COMPOSANT / ARTICLE (ressources)
  // Pos 8 : NOTE (prescriptions, observations, PM)
  const getNodeLevel = (node: StagingTreeNode): number => {
    // 1. Explicit level has absolute priority
    if (typeof node.level === 'number' && node.level >= 1) {
      if (node.role === 'LOT' || node.role === 'MACRO_LOT') return 2;
      return Math.min(8, Math.max(1, node.level));
    }

    // 2. Explicit role mapping
    if (node.role) {
      switch (node.role) {
        case 'PROJECT':
        case 'TRANCHE':
        case 'LIGNE':
          return 1;
        case 'MACRO_LOT':
        case 'LOT':
        case 'ZONE':
        case 'LOCATION':
          return 2;
        case 'CHAPITRE':
        case 'BLOC':
          return 3;
        case 'OUVRAGE':
          return 4; // aprer le bloc il ya un ouvrage
        case 'ARTICLE':
          return 5; // aprer article
        case 'ENSEMBLE':
        case 'TYPE':
          return 6; // aprer ensamble
        case 'COMPONENT':
        case 'COMPONENT_ENS':
        case 'COMPONENT_ART':
          return 7; // aprer composant/ensable , composant/article
        case 'NOTE':
        case 'CTRL':
          return 8; // aprer note *
      }
    }

    return 1;
  };

  // Pixel indent based on roles and positions
  const getIndentPixels = (pos: number, role?: NodeRole) => {
    if (role === 'PROJECT') return 0;
    if (role === 'LOT') return 16;
    if (role === 'LIGNE') return 32; // Lignes brutes de la feuille : à la même ligne sous le lot !
    switch (pos) {
      case 1: return 32;  // Ligne brute sans niveau
      case 2: return 16;  // Lot (niveau 2)
      case 3: return 32;  // Bloc
      case 4: return 48;  // Ouvrage
      case 5: return 64;  // Article
      case 6: return 80;  // Ensemble
      case 7: return 96;  // Composant (Ensemble ou Article)
      case 8: return 88;  // Note
      default: return 32;
    }
  };

  // Distinct Vivid Color Profiles for each of the Positions (1 to 8)
  const getLevelStyle = (node: StagingTreeNode) => {
    const level = getNodeLevel(node);

    switch (level) {
      case 1: {
        const isProject = node.role === 'PROJECT' || node.role === 'TRANCHE';
        return {
          levelNum: 1,
          levelName: isProject ? 'POS 1 · PROJET' : 'POS 1 · LIGNE',
          shortLabel: isProject ? 'PROJET' : 'LIGNE',
          badgeClass: isProject
            ? 'bg-[#1B4591] text-white font-black shadow-sm ring-1 ring-blue-900/30 hover:bg-blue-800'
            : 'bg-blue-700 text-white font-black shadow-sm ring-1 ring-blue-800/30 hover:bg-blue-800',
          codeBadgeClass: 'bg-blue-100 text-blue-950 border border-blue-400 font-bold',
          rowClass:
            'border-l-[6px] border-l-blue-600 bg-white border-b border-slate-200/80 hover:bg-blue-50/40 dark:bg-slate-900 dark:border-slate-800',
          textClass: 'font-extrabold text-slate-900 dark:text-slate-50 text-base sm:text-[16.5px] leading-relaxed tracking-tight',
          colorDot: 'bg-[#1B4591]',
        };
      }
      case 2:
        return {
          levelNum: 2,
          levelName: 'POS 2 · LOT',
          shortLabel: 'LOT',
          badgeClass: 'bg-purple-600 text-white font-extrabold shadow-sm ring-1 ring-purple-700/30 hover:bg-purple-700',
          codeBadgeClass: 'bg-purple-100 text-purple-950 border border-purple-300 font-bold',
          rowClass:
            'border-l-[6px] border-l-purple-600 bg-purple-50/70 border-b border-purple-100/80 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:border-purple-900 dark:hover:bg-purple-950/45',
          textClass: 'font-extrabold text-purple-950 dark:text-purple-100 text-[15.5px] sm:text-[16px] leading-relaxed tracking-tight',
          colorDot: 'bg-purple-600',
        };
      case 3:
        return {
          levelNum: 3,
          levelName: 'POS 3 · BLOC',
          shortLabel: 'BLOC',
          badgeClass: 'bg-emerald-600 text-white font-bold shadow-sm ring-1 ring-emerald-700/30 hover:bg-emerald-700',
          codeBadgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold',
          rowClass:
            'border-l-[6px] border-l-emerald-600 bg-emerald-50/65 border-b border-emerald-100/80 hover:bg-emerald-100/65 dark:bg-emerald-950/25 dark:border-emerald-900 dark:hover:bg-emerald-950/40',
          textClass: 'font-bold text-emerald-950 dark:text-emerald-100 text-[14.5px] sm:text-[15px] leading-relaxed',
          colorDot: 'bg-emerald-600',
        };
      case 4:
        // Position 4 : OUVRAGE
        return {
          levelNum: 4,
          levelName: 'POS 4 · OUVRAGE',
          shortLabel: 'OUVRAGE',
          badgeClass: 'bg-teal-600 text-white font-bold shadow-sm ring-1 ring-teal-700/30 hover:bg-teal-700',
          codeBadgeClass: 'bg-teal-100 text-teal-950 border border-teal-300 font-medium',
          rowClass:
            'border-l-[6px] border-l-teal-600 bg-teal-50/60 border-b border-teal-100/80 hover:bg-teal-100/60 dark:bg-teal-950/20 dark:border-teal-900 dark:hover:bg-teal-950/35',
          textClass: 'font-bold text-teal-950 dark:text-teal-100 text-[14.5px] sm:text-[15px] leading-relaxed',
          colorDot: 'bg-teal-600',
        };
      case 5:
        // Position 5 : ARTICLE
        return {
          levelNum: 5,
          levelName: 'POS 5 · ARTICLE',
          shortLabel: 'ARTICLE',
          badgeClass: 'bg-sky-600 text-white font-bold shadow-sm ring-1 ring-sky-700/30 hover:bg-sky-700',
          codeBadgeClass: 'bg-sky-100 text-sky-950 border border-sky-300 font-medium',
          rowClass:
            'border-l-[6px] border-l-sky-600 bg-sky-50/60 border-b border-sky-100/80 hover:bg-sky-100/60 dark:bg-sky-950/20 dark:border-sky-900 dark:hover:bg-sky-950/35',
          textClass: 'font-semibold text-slate-900 dark:text-slate-100 text-[14px] sm:text-[14.5px] leading-relaxed',
          colorDot: 'bg-sky-600',
        };
      case 6:
        // Position 6 : ENSEMBLE
        return {
          levelNum: 6,
          levelName: 'POS 6 · ENSEMBLE',
          shortLabel: 'ENSEMBLE',
          badgeClass: 'bg-amber-600 text-white font-bold shadow-sm ring-1 ring-amber-700/30 hover:bg-amber-700',
          codeBadgeClass: 'bg-amber-100 text-amber-950 border border-amber-300 font-bold',
          rowClass:
            'border-l-[6px] border-l-amber-600 bg-amber-50/60 border-b border-amber-100/80 hover:bg-amber-100/60 dark:bg-amber-950/25 dark:border-amber-900 dark:hover:bg-amber-950/40',
          textClass: 'font-bold text-amber-950 dark:text-amber-100 text-[14px] sm:text-[14.5px] leading-relaxed',
          colorDot: 'bg-amber-600',
        };
      case 7:
        // Position 7 : COMPOSANT (COMPOSANT/ENSEMBLE ou COMPOSANT/ARTICLE)
        const isCompEns = node.role === 'COMPONENT_ENS';
        const compLabel = isCompEns ? 'COMPOSANT / ENS' : 'COMPOSANT / ART';
        return {
          levelNum: 7,
          levelName: `POS 7 · ${compLabel} (${node.resourceType || 'FOURN'})`,
          shortLabel: isCompEns ? 'COMP/ENS' : 'COMP/ART',
          badgeClass: isCompEns
            ? 'bg-rose-500 text-white font-extrabold shadow-sm ring-1 ring-rose-600/30 hover:bg-rose-600'
            : 'bg-pink-600 text-white font-extrabold shadow-sm ring-1 ring-pink-700/30 hover:bg-pink-700',
          codeBadgeClass: 'bg-rose-100 text-rose-950 border border-rose-300 font-mono text-[10px]',
          rowClass:
            'border-l-[6px] border-l-rose-500 bg-rose-50/50 border-b border-rose-100/80 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900 dark:hover:bg-rose-950/35',
          textClass: 'font-medium text-rose-950 dark:text-rose-200 text-[13.5px] sm:text-[14px] leading-relaxed',
          colorDot: isCompEns ? 'bg-rose-500' : 'bg-pink-600',
        };
      case 8:
      default:
        return {
          levelNum: 8,
          levelName: 'POS 8 · NOTE / CTRL',
          shortLabel: 'NOTE / CTRL',
          badgeClass: 'bg-slate-500 text-white font-semibold shadow-sm ring-1 ring-slate-600/30 hover:bg-slate-600',
          codeBadgeClass: 'bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[10px]',
          rowClass:
            'border-l-[6px] border-l-slate-400 bg-slate-50/70 border-b border-slate-200/80 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:border-slate-800',
          textClass: 'italic text-slate-700 dark:text-slate-300 text-[13.5px] sm:text-[14px] leading-relaxed',
          colorDot: 'bg-slate-500',
        };
    }
  };

  // Helper to get role and calcMode for a given position/level
  const getPropsForLevel = (
    lvl: number,
    specificRole?: NodeRole,
    specificResourceType?: ResourceType
  ) => {
    let role: NodeRole = specificRole || (lvl === 1 ? 'LIGNE' : 'ARTICLE');
    let calcMode: CalcMode = 'QTY_PU';

    if (lvl === 1) {
      role = specificRole === 'PROJECT' || specificRole === 'TRANCHE' ? 'PROJECT' : 'LIGNE';
      calcMode = role === 'PROJECT' ? 'SUM' : 'QTY_PU';
    } else if (lvl === 2) {
      role = 'LOT';
      calcMode = 'SUM';
    } else if (lvl === 3) {
      role = 'BLOC';
      calcMode = 'SUM';
    } else if (lvl === 4) {
      // Pos 4 : OUVRAGE
      role = 'OUVRAGE';
      calcMode = 'QTY_PU';
    } else if (lvl === 5) {
      // Pos 5 : ARTICLE
      role = 'ARTICLE';
      calcMode = 'QTY_PU';
    } else if (lvl === 6) {
      // Pos 6 : ENSEMBLE
      role = 'ENSEMBLE';
      calcMode = 'ENS_QTY';
    } else if (lvl === 7) {
      // Pos 7 : COMPOSANT (Ensemble ou Article)
      role = specificRole === 'COMPONENT_ENS' ? 'COMPONENT_ENS' : (specificRole === 'COMPONENT_ART' ? 'COMPONENT_ART' : 'COMPONENT');
      calcMode = 'QTY_PU';
    } else if (lvl >= 8) {
      // Pos 8 : NOTE
      role = 'NOTE';
      calcMode = 'LUMP';
    }

    return {
      role,
      level: lvl,
      calcMode,
      resourceType: lvl === 7 ? specificResourceType || 'FOURN' : undefined,
    };
  };

  // Helper to find which lot node holds a given node ID (must strictly contain nodeId as child or descendant)
  const findLotHoldingNode = (tree: StagingTreeNode[], nodeId: string): StagingTreeNode | null => {
    const hasDescendantId = (n: StagingTreeNode): boolean => {
      if (!n.children || n.children.length === 0) return false;
      return n.children.some((c) => c.id === nodeId || hasDescendantId(c));
    };

    const scan = (nodes: StagingTreeNode[]): StagingTreeNode | null => {
      for (const n of nodes) {
        if (hasDescendantId(n)) {
          // If any child lot also contains it, return the deeper lot
          if (n.children) {
            const deeper = scan(n.children);
            if (deeper) return deeper;
          }
          const isLot = n.role === 'LOT' || n.role === 'MACRO_LOT' || n.level === 3 || (n.sheetName && n.sheetName !== 'ALL');
          if (isLot) {
            return n;
          }
        }
      }
      return null;
    };

    return scan(tree);
  };

  // Flatten tree nodes into a sequential visual list (pre-order traversal)
  const flattenTreeNodes = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
    const result: StagingTreeNode[] = [];
    const walk = (list: StagingTreeNode[]) => {
      for (const item of list) {
        result.push(item);
        if (item.children && item.children.length > 0) {
          walk(item.children);
        }
      }
    };
    walk(nodes);
    return result;
  };

  // Rebuild hierarchy from flat list based on node levels (Unchecked lines are excluded from WBS tree)
  const rebuildTreeHierarchyFromFlat = (flatNodes: StagingTreeNode[]): StagingTreeNode[] => {
    // Only process checked lines (qu'on décoche une ligne, elle disparaît de l'Arbre WBS Restructuré)
    const activeNodes = flatNodes.filter((n) => n.checked !== false || n.indeterminate);
    const rootItems: StagingTreeNode[] = [];
    const stack: { node: StagingTreeNode; level: number }[] = [];

    for (const raw of activeNodes) {
      const lvl = getNodeLevel(raw);
      const item: StagingTreeNode = {
        ...raw,
        level: lvl,
        children: [],
      };

      // Position 1 : simple flat root line (no nesting under anything)
      if (lvl === 1) {
        stack.length = 0;
        rootItems.push(item);
        continue;
      }

      // Pop ancestors based on 8 positions
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.level > lvl || (lvl >= 8 && top.level >= 8)) {
          stack.pop();
        } else if (top.level === lvl) {
          stack.pop();
        } else {
          break;
        }
      }

      if (stack.length === 0) {
        rootItems.push(item);
      } else {
        const parent = stack[stack.length - 1].node;
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      }

      // Notes (level 8) and components (level 7) do not hold sub-blocks
      if (lvl < 7) {
        stack.push({ node: item, level: lvl });
      }
    }

    return rootItems;
  };

  // CHANGE NODE LEVEL LOGIC (AVEC CASCADE VERS LE BAS ET RESTRUCTURATION DE POSITION)
  const handleChangeNodeLevel = (
    nodeId: string,
    targetLevel: number,
    param3?: NodeRole | boolean,
    param4?: ResourceType | boolean,
    param5?: boolean
  ) => {
    let specificRole: NodeRole | undefined = undefined;
    let specificResourceType: ResourceType | undefined = undefined;
    let forceCascade: boolean | undefined = undefined;

    if (typeof param3 === 'boolean') {
      forceCascade = param3;
    } else if (typeof param3 === 'string') {
      specificRole = param3 as NodeRole;
    }

    if (typeof param4 === 'boolean') {
      forceCascade = param4;
    } else if (typeof param4 === 'string') {
      specificResourceType = param4 as ResourceType;
    }

    if (typeof param5 === 'boolean') {
      forceCascade = param5;
    }

    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    const shouldCascade = forceCascade !== undefined ? forceCascade : cascadeToBelow;

    // Find target lot containing this node
    const targetLot = findLotHoldingNode(treeData, nodeId);
    let modifiedCount = 0;
    let modifiedNodeName = '';

    if (targetLot && targetLot.children && targetLot.children.length > 0) {
      // Flatten the lot's children to perform sequential cascade and re-structuring
      const flatList = flattenTreeNodes(targetLot.children);
      const targetIdx = flatList.findIndex((n) => n.id === nodeId);

      if (targetIdx !== -1) {
        const targetNode = flatList[targetIdx];
        const oldLevel = getNodeLevel(targetNode);
        const delta = targetLevel - oldLevel;
        modifiedNodeName = `${targetNode.code} ${targetNode.designation}`;

        // 1. Update target node
        const targetProps = getPropsForLevel(targetLevel, specificRole, specificResourceType);
        Object.assign(targetNode, targetProps);
        modifiedCount += 1;

        // Extract WBS block prefix if code has dot notation (e.g. "2.1.1" -> "2.1.", "2.1" -> "2.")
        const cleanCode = (targetNode.code || '').trim();
        const codeParts = cleanCode.split('.');
        const blockPrefix =
          codeParts.length >= 3
            ? codeParts.slice(0, 2).join('.') + '.'
            : codeParts.length === 2
            ? codeParts[0] + '.'
            : '';

        // 2. Cascade to following lines in the same block if shouldCascade
        if (shouldCascade) {
          for (let j = targetIdx + 1; j < flatList.length; j++) {
            const curr = flatList[j];
            const currLvl = getNodeLevel(curr);
            const currCode = (curr.code || '').trim();

            // Stop condition: only if we reach an explicit higher-level section header
            // (e.g. another LOT, ZONE, or PROJECT, or next BLOC header with a different prefix)
            if (curr.role === 'LOT' || curr.role === 'ZONE' || curr.role === 'PROJECT') {
              break;
            }
            if (blockPrefix && /^\d+(\.\d+)*/.test(currCode) && !currCode.startsWith(blockPrefix)) {
              // Crossed into a different chapter / block (e.g. 2.2 vs 2.1)
              break;
            }

            // Determine if curr was at the same level or is a sibling line in this section
            const isSibling =
              currLvl === oldLevel ||
              currLvl === 1 ||
              (blockPrefix ? currCode.startsWith(blockPrefix) : false);

            if (isSibling) {
              // Sibling in the section: directly follows the target level!
              // When target moves to 5, curr moves to 5 (avancer).
              // When target returns to 3, curr returns to 3 (retourner).
              const currProps = getPropsForLevel(targetLevel, specificRole, specificResourceType);
              Object.assign(curr, currProps);
              modifiedCount += 1;
            } else if (currLvl > oldLevel) {
              // Sub-child item (e.g. resource or sub-article): shift by delta
              const newLvl = Math.max(1, Math.min(8, currLvl + delta));
              const currProps = getPropsForLevel(newLvl);
              Object.assign(curr, currProps);
              modifiedCount += 1;
            } else {
              // Shift by delta or follow target
              const newLvl = Math.max(1, Math.min(8, currLvl + delta));
              const currProps = getPropsForLevel(newLvl);
              Object.assign(curr, currProps);
              modifiedCount += 1;
            }
          }
        }

        // 3. Keep all lot lines in flat sequential order with updated levels and positions
        targetLot.children = flatList.map((item) => ({
          ...item,
          level: getNodeLevel(item),
          children: [],
        }));

        const updatedTree = refreshParentCheckStates(JSON.parse(JSON.stringify(treeData)));
        setTreeData(updatedTree);
        setOpenLevelMenuNodeId(null);

        // Trigger visual flash pulse on modified row
        setFlashNodeId(nodeId);
        setTimeout(() => setFlashNodeId(null), 1200);

        // Show toast with Undo option
        const msg =
          modifiedCount > 1
            ? `${modifiedCount} lignes reclassées en NIV ${targetLevel} · ${targetProps.role} (de ${targetNode.code} jusqu'aux lignes suivantes)`
            : `Ligne "${modifiedNodeName.substring(0, 35)}..." reclassée en NIV ${targetLevel} · ${targetProps.role}`;

        setToastNotification({
          message: msg,
          previousTree: previousTreeCopy,
        });
        setTimeout(() => setToastNotification(null), 4500);
        return;
      }
    }

    // Fallback if node is not inside a lot's children (e.g. modifying LOT or ZONE or PROJECT directly):
    const targetProps = getPropsForLevel(targetLevel);
    const updateRecursive = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        if (n.id === nodeId) {
          modifiedNodeName = `${n.code} ${n.designation}`;
          const oldLvl = getNodeLevel(n);
          const delta = targetLevel - oldLvl;

          // Shift descendants as well
          const shiftDesc = (child: StagingTreeNode): StagingTreeNode => {
            const cLvl = getNodeLevel(child);
            const newLvl = Math.max(1, Math.min(8, cLvl + delta));
            const cProps = getPropsForLevel(newLvl);
            return {
              ...child,
              ...cProps,
              children: child.children ? child.children.map(shiftDesc) : undefined,
            };
          };

          return {
            ...n,
            ...targetProps,
            children: n.children ? n.children.map(shiftDesc) : undefined,
          };
        }
        if (n.children) {
          return { ...n, children: updateRecursive(n.children) };
        }
        return n;
      });
    };

    const updated = updateRecursive(treeData);
    setTreeData(refreshParentCheckStates(updated));
    setOpenLevelMenuNodeId(null);
    setFlashNodeId(nodeId);
    setTimeout(() => setFlashNodeId(null), 1200);

    setToastNotification({
      message: `Ligne "${modifiedNodeName.substring(0, 35)}..." reclassée en NIV ${targetLevel} · ${targetProps.role}`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4500);
  };

  // Get all lines sequentially below a node within its lot / sheet
  const getLinesBelowNode = (nodeId: string): StagingTreeNode[] => {
    const targetLot = findLotHoldingNode(treeData, nodeId);
    const listToSearch =
      targetLot && targetLot.children && targetLot.children.length > 0
        ? targetLot.children
        : treeData;
    const flat = flattenTreeNodes(listToSearch);
    const idx = flat.findIndex((n) => n.id === nodeId);
    if (idx === -1) return [];
    return flat.slice(idx + 1);
  };

  // Open the Smart Sub-Lines Selection Modal
  const handleOpenSmartSubLines = (
    node: StagingTreeNode,
    overrideLevel?: number,
    overrideRole?: NodeRole
  ) => {
    const currentLvl = getNodeLevel(node);
    let targetLvl = overrideLevel !== undefined ? overrideLevel : currentLvl;
    let targetRole: NodeRole = overrideRole || node.role;

    if (overrideLevel === undefined && (node.role === 'LIGNE' || node.role === 'PROJECT')) {
      targetLvl = 4;
      targetRole = 'OUVRAGE';
    }

    const linesBelow = getLinesBelowNode(node.id);

    setSmartModalState({
      isOpen: true,
      parentNode: node,
      targetLevel: targetLvl,
      targetRole,
      allLinesBelow: linesBelow,
    });
    setOpenLevelMenuNodeId(null);
    setContextMenu(null);
  };

  // Confirm and attach sub-lines from Smart Modal
  const handleConfirmSmartSubLines = (
    parentNode: StagingTreeNode,
    parentTargetLevel: number,
    parentTargetRole: NodeRole,
    selectedChildren: { node: StagingTreeNode; level: number; role: NodeRole }[]
  ) => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    const targetLot = findLotHoldingNode(treeData, parentNode.id);
    const selectedMap = new Map(selectedChildren.map((c) => [c.node.id, c]));

    if (targetLot && targetLot.children && targetLot.children.length > 0) {
      const flatList = flattenTreeNodes(targetLot.children);

      // 1. Update parent node
      const parentIdx = flatList.findIndex((n) => n.id === parentNode.id);
      if (parentIdx !== -1) {
        const pNode = flatList[parentIdx];
        const pProps = getPropsForLevel(parentTargetLevel, parentTargetRole);
        Object.assign(pNode, pProps);
      }

      // 2. Update selected children
      for (const childItem of flatList) {
        if (selectedMap.has(childItem.id)) {
          const cConfig = selectedMap.get(childItem.id)!;
          const cProps = getPropsForLevel(cConfig.level, cConfig.role);
          Object.assign(childItem, cProps);
        }
      }

      // 3. Keep lot flat sequential order
      targetLot.children = flatList.map((item) => ({
        ...item,
        level: getNodeLevel(item),
        children: [],
      }));
    } else {
      // Global update across treeData
      const flatList = flattenTreeNodes(treeData);
      const parentIdx = flatList.findIndex((n) => n.id === parentNode.id);
      if (parentIdx !== -1) {
        const pNode = flatList[parentIdx];
        const pProps = getPropsForLevel(parentTargetLevel, parentTargetRole);
        Object.assign(pNode, pProps);
      }
      for (const childItem of flatList) {
        if (selectedMap.has(childItem.id)) {
          const cConfig = selectedMap.get(childItem.id)!;
          const cProps = getPropsForLevel(cConfig.level, cConfig.role);
          Object.assign(childItem, cProps);
        }
      }
    }

    const updatedTree = refreshParentCheckStates(JSON.parse(JSON.stringify(treeData)));
    setTreeData(updatedTree);

    // Trigger visual flash
    setFlashNodeId(parentNode.id);
    setTimeout(() => setFlashNodeId(null), 1200);

    setToastNotification({
      message: `${parentNode.code} classé en ${parentTargetRole} · ${selectedChildren.length} sous-lignes rattachées`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Apply to single line only (without changing children)
  const handleApplySingleOnly = (
    parentNode: StagingTreeNode,
    targetLevel: number,
    targetRole: NodeRole
  ) => {
    handleChangeNodeLevel(parentNode.id, targetLevel, targetRole, false);
  };

  // Promote (Monter d'un niveau : 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1)
  const handlePromote = (node: StagingTreeNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLvl = getNodeLevel(node);
    if (currentLvl > 1) {
      handleChangeNodeLevel(node.id, currentLvl - 1);
    }
  };

  // Demote (Descendre d'un niveau : 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8)
  const handleDemote = (node: StagingTreeNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLvl = getNodeLevel(node);
    if (currentLvl < 8) {
      handleChangeNodeLevel(node.id, currentLvl + 1);
    }
  };

  // Undo last level change
  const handleUndo = () => {
    if (toastNotification?.previousTree) {
      setTreeData(toastNotification.previousTree);
      setToastNotification({
        message: 'Modification annulée avec succès',
      });
      setTimeout(() => setToastNotification(null), 3000);
    }
  };

  // Batch Promote all checked items
  const handleBatchPromote = () => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    let modifiedCount = 0;

    const promoteRecursive = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        let updated = { ...n };
        if (n.checked) {
          const lvl = getNodeLevel(n);
          if (lvl > 1) {
            modifiedCount += 1;
            const newLvl = lvl - 1;
            updated.level = newLvl;
            if (newLvl === 1) {
              updated.role = (n.role === 'PROJECT' || n.role === 'TRANCHE') ? 'PROJECT' : 'LIGNE';
              updated.calcMode = updated.role === 'PROJECT' ? 'SUM' : 'QTY_PU';
            } else if (newLvl === 2) {
              updated.role = 'LOT';
              updated.calcMode = 'SUM';
            } else if (newLvl === 3) {
              updated.role = 'BLOC';
              updated.calcMode = 'SUM';
            } else if (newLvl === 4) {
              updated.role = 'OUVRAGE';
              updated.calcMode = 'QTY_PU';
            } else if (newLvl === 5) {
              updated.role = 'ARTICLE';
              updated.calcMode = 'QTY_PU';
            } else if (newLvl === 6) {
              updated.role = 'ENSEMBLE';
              updated.calcMode = 'ENS_QTY';
            } else if (newLvl === 7) {
              updated.role = n.role === 'COMPONENT_ART' ? 'COMPONENT_ART' : 'COMPONENT_ENS';
              updated.calcMode = 'QTY_PU';
              updated.resourceType = updated.resourceType || 'FOURN';
            } else if (newLvl >= 8) {
              updated.role = 'NOTE';
              updated.calcMode = 'LUMP';
            }
          }
        }
        if (n.children) {
          updated.children = promoteRecursive(n.children);
        }
        return updated;
      });
    };

    const updatedTree = promoteRecursive(treeData);
    setTreeData(refreshParentCheckStates(updatedTree));
    setToastNotification({
      message: `${modifiedCount} éléments promus d'un niveau hiérarchique`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Batch Demote all checked items
  const handleBatchDemote = () => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    let modifiedCount = 0;

    const demoteRecursive = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        let updated = { ...n };
        if (n.checked) {
          const lvl = getNodeLevel(n);
          if (lvl < 8) {
            modifiedCount += 1;
            const newLvl = lvl + 1;
            updated.level = newLvl;
            if (newLvl === 2) {
              updated.role = 'LOT';
              updated.calcMode = 'SUM';
            } else if (newLvl === 3) {
              updated.role = 'BLOC';
              updated.calcMode = 'SUM';
            } else if (newLvl === 4) {
              updated.role = 'OUVRAGE';
              updated.calcMode = 'QTY_PU';
            } else if (newLvl === 5) {
              updated.role = 'ARTICLE';
              updated.calcMode = 'QTY_PU';
            } else if (newLvl === 6) {
              updated.role = 'ENSEMBLE';
              updated.calcMode = 'ENS_QTY';
            } else if (newLvl === 7) {
              updated.role = n.role === 'COMPONENT_ART' ? 'COMPONENT_ART' : 'COMPONENT_ENS';
              updated.calcMode = 'QTY_PU';
              updated.resourceType = updated.resourceType || 'FOURN';
            } else if (newLvl >= 8) {
              updated.role = 'NOTE';
              updated.calcMode = 'LUMP';
            }
          }
        }
        if (n.children) {
          updated.children = demoteRecursive(n.children);
        }
        return updated;
      });
    };

    const updatedTree = demoteRecursive(treeData);
    setTreeData(refreshParentCheckStates(updatedTree));
    setToastNotification({
      message: `${modifiedCount} éléments abaissés d'un niveau hiérarchique`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Batch change selected nodes level
  const handleBatchChangeLevel = (targetLevel: number, specificRole?: NodeRole) => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));

    let assignedRole: NodeRole = specificRole || (targetLevel === 4 ? 'OUVRAGE' : targetLevel === 5 ? 'ARTICLE' : targetLevel === 6 ? 'ENSEMBLE' : targetLevel === 7 ? 'COMPONENT_ENS' : targetLevel >= 8 ? 'NOTE' : 'LIGNE');
    let assignedCalcMode: CalcMode = 'QTY_PU';

    if (targetLevel === 1) {
      assignedRole = specificRole === 'PROJECT' ? 'PROJECT' : 'LIGNE';
      assignedCalcMode = assignedRole === 'PROJECT' ? 'SUM' : 'QTY_PU';
    } else if (targetLevel === 2) {
      assignedRole = 'LOT';
      assignedCalcMode = 'SUM';
    } else if (targetLevel === 3) {
      assignedRole = 'BLOC';
      assignedCalcMode = 'SUM';
    } else if (targetLevel === 4) {
      assignedRole = 'OUVRAGE';
      assignedCalcMode = 'QTY_PU';
    } else if (targetLevel === 5) {
      assignedRole = 'ARTICLE';
      assignedCalcMode = 'QTY_PU';
    } else if (targetLevel === 6) {
      assignedRole = 'ENSEMBLE';
      assignedCalcMode = 'ENS_QTY';
    } else if (targetLevel === 7) {
      assignedRole = specificRole || 'COMPONENT_ENS';
      assignedCalcMode = 'QTY_PU';
    } else if (targetLevel >= 8) {
      assignedRole = 'NOTE';
      assignedCalcMode = 'LUMP';
    }

    let modifiedCount = 0;
    const updateChecked = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        let updatedNode = { ...n };
        if (n.checked) {
          modifiedCount += 1;
          updatedNode.role = assignedRole;
          updatedNode.level = targetLevel;
          updatedNode.calcMode = assignedCalcMode;
          if (targetLevel === 7) {
            updatedNode.resourceType = updatedNode.resourceType || 'FOURN';
          }
        }
        if (n.children) {
          updatedNode.children = updateChecked(n.children);
        }
        return updatedNode;
      });
    };

    const updated = updateChecked(treeData);
    setTreeData(refreshParentCheckStates(updated));

    setToastNotification({
      message: `${modifiedCount} éléments cochés reclassés en POS ${targetLevel} · ${assignedRole}`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4500);
  };

  // Auto-renumber tree WBS codes to professional civil engineering format
  const handleAutoRenumberTree = () => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));

    const renumberRecursive = (
      nodes: StagingTreeNode[],
      parentCode: string = '',
      depthLevel: number = 1
    ): StagingTreeNode[] => {
      return nodes.map((node, index) => {
        let newCode = node.code;
        const num = index + 1;
        if (depthLevel === 1) {
          newCode = 'PROJET';
        } else if (depthLevel === 2) {
          newCode = `LOT 0${num}`;
        } else if (depthLevel === 3) {
          const lotNum = parentCode.replace(/\D/g, '') || '2';
          newCode = `${parseInt(lotNum, 10)}.${num}`;
        } else if (depthLevel === 4) {
          newCode = `${parentCode}.${num}`;
        } else if (depthLevel === 5) {
          newCode = `${parentCode}.${String.fromCharCode(96 + num)}`;
        } else if (depthLevel >= 6 || node.role === 'NOTE') {
          newCode = 'NOTE';
        }

        const updatedChildren = node.children
          ? renumberRecursive(node.children, newCode, depthLevel + 1)
          : undefined;

        return {
          ...node,
          code: newCode,
          children: updatedChildren,
        };
      });
    };

    const renumbered = renumberRecursive(treeData);
    setTreeData(renumbered);
    setToastNotification({
      message: 'Arborescence harmonisée aux 8 positions : PROJET (1) > LOTS (2) > BLOCS (3) > OUVRAGE (4) > ARTICLES (5) > ENSEMBLES (6) > COMPOSANTS (7) > NOTES (8)',
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Shift+Click Range Selection (example2.md Specification)
  const handleShiftRangeSelect = (fromId: string, toId: string) => {
    const visibleNodes: StagingTreeNode[] = [];
    const collectVisible = (nodes: StagingTreeNode[]) => {
      for (const n of nodes) {
        if (isNodeVisible(n)) {
          visibleNodes.push(n);
          if (n.isExpanded !== false && n.children && n.children.length > 0) {
            collectVisible(n.children);
          }
        }
      }
    };
    collectVisible(treeData);

    const fromIdx = visibleNodes.findIndex((n) => n.id === fromId);
    const toIdx = visibleNodes.findIndex((n) => n.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);
    const idsToSelect = new Set(visibleNodes.slice(start, end + 1).map((n) => n.id));

    const setCheckedRecursive = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        let updated = { ...n };
        if (idsToSelect.has(n.id)) {
          updated.checked = true;
          updated.indeterminate = false;
        }
        if (updated.children && updated.children.length > 0) {
          updated.children = setCheckedRecursive(updated.children);
        }
        return updated;
      });
    };

    setTreeData(refreshParentCheckStates(setCheckedRecursive(treeData)));
    setSelectedNodeId(toId);
    setToastNotification({
      message: `${idsToSelect.size} lignes sélectionnées par plage (Shift+Clic)`,
    });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Smart Auto-Classify (Baguette Magique - example2.md Specification)
  const handleSmartAutoClassify = () => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    let classifiedCount = 0;

    const autoClassifyNodes = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((n) => {
        let updated = { ...n };
        const code = n.code ? n.code.trim() : '';
        const oldLvl = getNodeLevel(n);

        // Don't auto-modify root PROJET (1) or LOTS (2)
        if (oldLvl > 2) {
          const dotCount = (code.match(/\./g) || []).length;

          if (!code && !n.quantite && !n.prixUnitaire) {
            // Text without code or price -> NOTE (Pos 6)
            updated = { ...updated, ...getPropsForLevel(6) };
            classifiedCount++;
          } else if (dotCount === 1) {
            // "2.1" -> BLOC / CHAPITRE (POS 3)
            updated = { ...updated, ...getPropsForLevel(3) };
            classifiedCount++;
          } else if (dotCount === 2) {
            // "2.1.1" -> OUVRAGE / ENSEMBLE (POS 4) or ARTICLE (POS 4)
            const hasKids = n.children && n.children.length > 0;
            const role = hasKids ? 'ENSEMBLE' : 'ARTICLE';
            updated = { ...updated, ...getPropsForLevel(4, role) };
            classifiedCount++;
          } else if (dotCount === 3) {
            // "2.1.1.1" -> OUVRAGE / ARTICLE (POS 4)
            updated = { ...updated, ...getPropsForLevel(4, 'ARTICLE') };
            classifiedCount++;
          } else if (dotCount >= 4) {
            // "2.1.1.1.1" -> COMPONENT (POS 5)
            updated = { ...updated, ...getPropsForLevel(5) };
            classifiedCount++;
          }
        }

        if (n.children && n.children.length > 0) {
          updated.children = autoClassifyNodes(n.children);
        }
        return updated;
      });
    };

    const updated = autoClassifyNodes(treeData);
    setTreeData(refreshParentCheckStates(updated));
    setToastNotification({
      message: `🪄 ${classifiedCount} lignes auto-classifiées selon la structure WBS`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4500);
  };

  // Initialise tout au même niveau (Position 1 · Lignes brutes sans niveaux sous chaque lot)
  const handleFlattenAllToPosition1 = (forceAllLots: boolean = false) => {
    const previousTreeCopy = JSON.parse(JSON.stringify(treeData));
    let flattenedCount = 0;

    const collectFlatNodes = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      const list: StagingTreeNode[] = [];
      const walk = (items: StagingTreeNode[]) => {
        for (const item of items) {
          flattenedCount += 1;
          list.push({
            ...item,
            role: 'LIGNE',
            level: 1, // Position 1 (Même niveau pour toutes les lignes brutes)
            calcMode: item.calcMode || 'QTY_PU',
            children: [],
          });
          if (item.children && item.children.length > 0) {
            walk(item.children);
          }
        }
      };
      walk(nodes);
      return list;
    };

    const processLotNode = (n: StagingTreeNode): StagingTreeNode => {
      const isLot = n.role === 'LOT' || n.role === 'MACRO_LOT' || n.level === 2 || (n.sheetName && n.sheetName !== 'ALL');
      if (isLot) {
        return {
          ...n,
          role: 'LOT',
          level: 2,
          children: n.children ? collectFlatNodes(n.children) : [],
        };
      }
      if (n.children && n.children.length > 0) {
        return {
          ...n,
          children: n.children.map(processLotNode),
        };
      }
      return n;
    };

    let newTree: StagingTreeNode[] = [];

    if (!forceAllLots && activeClassificationSheet !== 'ALL') {
      const targetLot = findMatchingLotNode(treeData, activeClassificationSheet);
      if (targetLot && targetLot.children) {
        targetLot.children = collectFlatNodes(targetLot.children);
      }
      newTree = JSON.parse(JSON.stringify(treeData));
    } else {
      newTree = treeData.map(processLotNode);
    }

    const updated = refreshParentCheckStates(newTree);
    setTreeData(updated);
    setToastNotification({
      message: `✓ ${flattenedCount} lignes initialisées au même niveau (Position 1 · Lignes brutes sans niveaux)`,
      previousTree: previousTreeCopy,
    });
    setTimeout(() => setToastNotification(null), 4500);
  };


  // Real-time Financial Audit Amounts
  const { totalCalculatedLotAmount, totalExcelLotAmount } = useMemo(() => {
    let calcSum = 0;
    let excelSum = 0;

    const lotNode =
      activeClassificationSheet !== 'ALL'
        ? findMatchingLotNode(treeData, activeClassificationSheet)
        : treeData.find((n) => n.role === 'LOT' || n.level === 2 || n.level === 3);

    if (lotNode) {
      excelSum = lotNode.montantHT || 842150;
      const sumLeaves = (nodes: StagingTreeNode[]) => {
        for (const n of nodes) {
          const lvl = getNodeLevel(n);
          if (lvl >= 4 && lvl <= 6 && n.montantHT) {
            calcSum += n.montantHT;
          }
          if (n.children) sumLeaves(n.children);
        }
      };
      if (lotNode.children) sumLeaves(lotNode.children);
      if (calcSum === 0) calcSum = excelSum;
    } else {
      excelSum = 842150;
      calcSum = 842150;
    }

    return { totalCalculatedLotAmount: calcSum, totalExcelLotAmount: excelSum };
  }, [treeData, activeClassificationSheet]);

  // Render Mini WBS Tree for Cockpit side panel
  // Handle click on Mini WBS tree item: select node and scroll into view smoothly
  const handleMiniTreeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setLastClickedNodeId(nodeId);
    const element = document.getElementById(`row-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashNodeId(nodeId);
      setTimeout(() => setFlashNodeId(null), 1200);
    }
  };

  // Render Mini WBS Tree for side panel (100% réactif en temps réel et arborescence hiérarchisée)
  const renderMiniWbsTree = (nodes: StagingTreeNode[], depth = 0): React.ReactNode => {
    // Ne rendre que les éléments cochés (les lignes décochées sont masquées/supprimées du volet WBS)
    const activeNodes = nodes.filter((node) => node.checked !== false || node.indeterminate);

    return activeNodes.map((node) => {
      const lvl = getNodeLevel(node);
      const isSelected = selectedNodeId === node.id;
      const isExpanded = node.isExpanded !== false;
      const isLot = node.role === 'LOT' || node.role === 'MACRO_LOT' || lvl === 3;

      // Filtrer les enfants pour ne conserver que les lignes cochées
      const rawChildren = node.children || [];
      const activeChildren = rawChildren.filter((c) => c.checked !== false || c.indeterminate);

      // Si c'est un LOT, reconstruire son arborescence imbriquée avec UNIQUEMENT les lignes cochées
      const childrenToRender: StagingTreeNode[] =
        isLot && activeChildren.length > 0
          ? rebuildTreeHierarchyFromFlat(activeChildren)
          : activeChildren;

      const hasChildren = childrenToRender.length > 0;

      // Calcul dynamique du montant du lot selon les lignes cochées
      let displayAmount = node.montantHT;
      if (isLot && node.children) {
        const sumChecked = node.children
          .filter((c) => c.checked !== false)
          .reduce((sum, c) => sum + (c.montantHT || 0), 0);
        if (sumChecked > 0) displayAmount = sumChecked;
      }

      const getLvlBadgeStyle = (l: number) => {
        switch (l) {
          case 1:
            return 'bg-[#1B4591] text-white border-[#1B4591] font-black shadow-2xs';
          case 2:
            return 'bg-purple-600 text-white border-purple-600 font-black shadow-2xs';
          case 3:
            return 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs';
          case 4:
            return 'bg-teal-600 text-white border-teal-600 font-bold shadow-2xs';
          case 5:
            return 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs';
          case 6:
            return 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs';
          case 7:
            return node.role === 'COMPONENT_ART'
              ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-2xs'
              : 'bg-rose-500 text-white border-rose-500 font-bold shadow-2xs';
          default:
            return 'bg-slate-500 text-white border-slate-500 font-medium shadow-2xs';
        }
      };

      const getLvlLabel = (l: number) => {
        switch (l) {
          case 1: return 'POS 1';
          case 2: return 'POS 2';
          case 3: return 'POS 3';
          case 4: return 'POS 4·OUV';
          case 5: return 'POS 5·ART';
          case 6: return 'POS 6·ENS';
          case 7: return node.role === 'COMPONENT_ART' ? 'POS 7·ART' : 'POS 7·ENS';
          default: return 'NOTE *';
        }
      };

      const indentPx = Math.min(depth * 14, 72);

      return (
        <div key={node.id} style={{ paddingLeft: `${indentPx}px` }} className="py-0.5">
          <div
            onClick={() => handleMiniTreeClick(node.id)}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] transition-colors cursor-pointer ${
              isSelected
                ? 'bg-blue-100/95 text-[#1B4591] font-bold shadow-xs ring-1 ring-blue-400 dark:bg-blue-950/80 dark:text-sky-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title={`Cliquer pour accéder à la ligne ${node.code} - ${node.designation}`}
          >
            <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNodeExpand(node.id);
                  }}
                  className="text-slate-400 hover:text-slate-700 shrink-0"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              ) : (
                <span className="w-3 shrink-0" />
              )}
              <span className={`rounded px-1.5 py-0.2 text-[9px] font-black border shrink-0 ${getLvlBadgeStyle(lvl)}`}>
                {getLvlLabel(lvl)}
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">{node.code}</span>
              <span className="truncate">{node.designation}</span>
            </div>
            {displayAmount !== undefined && displayAmount > 0 ? (
              <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0 ml-1.5">
                {formatCurrency(displayAmount)}
              </span>
            ) : null}
          </div>
          {hasChildren && isExpanded && renderMiniWbsTree(childrenToRender, depth + 1)}
        </div>
      );
    });
  };

  // Copy node WBS and title to clipboard
  const handleCopyNodeWBS = (node: StagingTreeNode) => {
    const text = `${node.code} - ${node.designation} (${(node.montantHT || 0).toLocaleString('fr-FR')} € HT)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setToastNotification({
      message: `Copié dans le presse-papier : "${node.code} ${node.designation.substring(0, 25)}..."`,
    });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Context menu on right click
  const handleContextMenu = (e: React.MouseEvent, node: StagingTreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 280),
      y: Math.min(e.clientY, window.innerHeight - 380),
      node,
    });
  };

  // Toggle node expansion
  const toggleNodeExpand = (nodeId: string) => {
    const updateExpand = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateExpand(node.children) };
        }
        return node;
      });
    };
    setTreeData(updateExpand(treeData));
  };

  // Expand / collapse all nodes
  const setAllExpand = (expandVal: boolean) => {
    const updateAll = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: expandVal,
        children: node.children ? updateAll(node.children) : undefined,
      }));
    };
    setTreeData(updateAll(treeData));
  };

  // Helper to update children recursively
  const setCheckRecursive = (node: StagingTreeNode, checkValue: boolean): StagingTreeNode => {
    const updatedChildren = node.children
      ? node.children.map((c) => setCheckRecursive(c, checkValue))
      : undefined;
    return {
      ...node,
      checked: checkValue,
      indeterminate: false,
      children: updatedChildren,
    };
  };

  // Helper to recompute parent checked states (Projet et Lot restent cochés avec la coche ✓, jamais de tiret)
  const refreshParentCheckStates = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
    return nodes.map((node) => {
      if (!node.children || node.children.length === 0) {
        return node;
      }
      const refreshedChildren = refreshParentCheckStates(node.children);
      const someChecked = refreshedChildren.some((c) => c.checked);

      return {
        ...node,
        children: refreshedChildren,
        checked: someChecked,
        indeterminate: false,
      };
    });
  };

  // Toggle node check state with tri-state cascading
  const toggleNodeCheck = (nodeId: string) => {
    const updateNode = (nodes: StagingTreeNode[]): StagingTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          const targetValue = !node.checked;
          return setCheckRecursive(node, targetValue);
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    const updated = updateNode(treeData);
    setTreeData(refreshParentCheckStates(updated));
  };

  // Select all or deselect all
  const handleSelectAll = (checkValue: boolean) => {
    const updated = treeData.map((node) => setCheckRecursive(node, checkValue));
    setTreeData(refreshParentCheckStates(updated));
  };

  // Apply predefined selection profile
  const handleApplyProfile = (profile: string) => {
    setActiveFilterProfile(profile);
    if (profile === 'all') {
      handleSelectAll(true);
    } else if (profile === 'go') {
      const updated = treeData.map((node) => {
        const isLot02 = node.code.includes('02') || node.designation.toLowerCase().includes('gros œuvre');
        return setCheckRecursive(node, isLot02);
      });
      setTreeData(refreshParentCheckStates(updated));
    } else if (profile === 'base') {
      const filterBase = (node: StagingTreeNode): StagingTreeNode => {
        const isBase = node.inclusionMode === 'BASE';
        const updatedChildren = node.children ? node.children.map(filterBase) : undefined;
        return {
          ...node,
          checked: isBase,
          children: updatedChildren,
        };
      };
      const updated = treeData.map(filterBase);
      setTreeData(refreshParentCheckStates(updated));
    } else if (profile === 'comp') {
      const filterComp = (node: StagingTreeNode): StagingTreeNode => {
        const isComp = ['COMP_SUM', 'COMP_UNIT', 'ENS_QTY', 'ENS_GLOBAL'].includes(node.calcMode);
        const updatedChildren = node.children ? node.children.map(filterComp) : undefined;
        return {
          ...node,
          checked: isComp,
          children: updatedChildren,
        };
      };
      const updated = treeData.map(filterComp);
      setTreeData(refreshParentCheckStates(updated));
    }
  };

  // Determine what root nodes to display:
  // If ALL: display full project arborescence (Project -> 2 Zones -> All Lots)
  // If specific lot: display ONLY that LOT and all of its data (BLOCS, ENSEMBLES, ARTICLES, COMPOSANTS, NOTES)
  const displayedTreeNodes = useMemo<StagingTreeNode[]>(() => {
    if (activeClassificationSheet === 'ALL') {
      return treeData;
    }

    const lotNode = findMatchingLotNode(treeData, activeClassificationSheet);
    if (lotNode) {
      return [lotNode];
    }

    // Fallback: if in rawSheetsData, parse directly
    if (rawSheetsData[activeClassificationSheet]) {
      const parsed = buildHierarchicalTreeFromSheets(
        [activeClassificationSheet],
        sheetConfigs,
        rawSheetsData,
        sheetLotMap
      );
      const parsedLot = findMatchingLotNode(parsed, activeClassificationSheet);
      if (parsedLot) {
        return [parsedLot];
      }
    }

    return [];
  }, [treeData, activeClassificationSheet, rawSheetsData, sheetConfigs, sheetLotMap]);

  // Count items by level for the legend bar
  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    const scan = (nodes: StagingTreeNode[]) => {
      for (const n of nodes) {
        const lvl = getNodeLevel(n);
        if (lvl in counts) counts[lvl] += 1;
        if (n.children) scan(n.children);
      }
    };
    scan(displayedTreeNodes);
    return counts;
  }, [displayedTreeNodes]);

  // Count checked items
  const checkedNodesCount = useMemo(() => {
    let count = 0;
    const scan = (nodes: StagingTreeNode[]) => {
      for (const n of nodes) {
        if (n.checked) count += 1;
        if (n.children) scan(n.children);
      }
    };
    scan(treeData);
    return count;
  }, [treeData]);

  // Calculate retained basket metrics
  const basketMetrics = useMemo(() => {
    let totalLines = 0;
    let retainedLines = 0;
    let totalAmount = 0;
    let retainedAmount = 0;
    let detectedAlerts = 0;

    const countMetrics = (nodes: StagingTreeNode[]) => {
      for (const node of nodes) {
        totalLines += 1;
        totalAmount += node.montantHT || 0;
        if (node.alertCodes && node.alertCodes.length > 0) {
          detectedAlerts += 1;
        }
        if (node.checked || node.indeterminate) {
          if (node.checked) {
            retainedLines += 1;
            if (!node.children || node.children.length === 0) {
              retainedAmount += node.montantHT || 0;
            } else if (node.calcMode === 'LUMP' || node.calcMode === 'ENS_GLOBAL') {
              retainedAmount += node.montantHT || 0;
            }
          }
        }
        if (node.children) {
          countMetrics(node.children);
        }
      }
    };
    countMetrics(treeData);

    if (retainedAmount === 0) {
      retainedAmount = treeData
        .filter((l) => l.checked)
        .reduce((sum, curr) => sum + (curr.montantHT || 0), 0);
    }

    return {
      totalLines,
      retainedLines,
      retainedAmount: retainedAmount > 0 ? retainedAmount : 612480,
      detectedAlerts,
    };
  }, [treeData]);

  // Filter evaluation for display
  const isNodeVisible = (node: StagingTreeNode): boolean => {
    // Level filter
    if (levelFilter !== 'all') {
      const lvl = getNodeLevel(node);
      if (lvl !== levelFilter) {
        const hasMatchingChild = node.children?.some(isNodeVisible);
        if (!hasMatchingChild) return false;
      }
    }

    // Search query with boolean support: "radier ET béton SAUF option"
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nodeText = `${node.code} ${node.designation} ${node.unit || ''} ${node.calcMode} ${node.tags?.map((t) => t.value).join(' ') || ''}`.toLowerCase();

      if (q.includes('et') || q.includes('sauf')) {
        const parts = q.split('sauf');
        const positivePart = parts[0];
        const negativePart = parts[1] || '';

        const positiveTerms = positivePart.split('et').map((t) => t.trim()).filter(Boolean);
        const matchesPositive = positiveTerms.every((t) => nodeText.includes(t));
        const matchesNegative = negativePart.trim() ? nodeText.includes(negativePart.trim()) : false;

        if (!matchesPositive || matchesNegative) {
          const hasMatchingChild = node.children?.some(isNodeVisible);
          if (!hasMatchingChild) return false;
        }
      } else {
        if (!nodeText.includes(q)) {
          const hasMatchingChild = node.children?.some(isNodeVisible);
          if (!hasMatchingChild) return false;
        }
      }
    }

    if (roleFilter !== 'all' && node.role !== roleFilter) {
      const hasMatchingChild = node.children?.some(isNodeVisible);
      if (!hasMatchingChild) return false;
    }

    if (inclusionFilter !== 'all' && node.inclusionMode !== inclusionFilter) {
      const hasMatchingChild = node.children?.some(isNodeVisible);
      if (!hasMatchingChild) return false;
    }

    if (showOnlyAlerts && (!node.alertCodes || node.alertCodes.length === 0)) {
      const hasMatchingChild = node.children?.some(isNodeVisible);
      if (!hasMatchingChild) return false;
    }

    return true;
  };

  // Render individual tree item with interactive level modification
  const renderTreeNode = (
    node: StagingTreeNode,
    depth: number = 0,
    path: StagingTreeNode[] = []
  ) => {
    if (!isNodeVisible(node)) return null;

    const currentPath = [...path, node];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.isExpanded !== false;
    const style = getLevelStyle(node);
    const currentLevel = getNodeLevel(node);
    const isLevelMenuOpen = openLevelMenuNodeId === node.id;
    const isSelected = selectedNodeId === node.id;
    const isFlashing = flashNodeId === node.id;

    // Calc mode badge styling
    const getCalcBadge = (mode: CalcMode) => {
      switch (mode) {
        case 'COMP_SUM':
          return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        case 'COMP_UNIT':
          return 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
        case 'ENS_QTY':
          return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
        case 'ENS_GLOBAL':
          return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
        case 'RATIO':
          return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
        case 'PERCENT':
          return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
        case 'LUMP':
          return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-300';
      }
    };

    return (
      <div key={node.id} className="group/item relative">
        <div
          id={`row-${node.id}`}
          tabIndex={0}
          onClick={(e) => {
            if (painterActive) {
              e.stopPropagation();
              handleChangeNodeLevel(node.id, painterLevel, false);
              return;
            }
            if (e.shiftKey && lastClickedNodeId) {
              handleShiftRangeSelect(lastClickedNodeId, node.id);
            } else {
              setSelectedNodeId(node.id);
              setLastClickedNodeId(node.id);
            }
          }}
          onMouseEnter={() => {
            if (hoveredNodeTrail[hoveredNodeTrail.length - 1]?.id !== node.id) {
              setHoveredNodeTrail(currentPath);
            }
            if (painterActive && isMouseDown) {
              handleChangeNodeLevel(node.id, painterLevel, false);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          className={`relative flex items-center justify-between rounded-xl px-4 py-3 sm:py-3.5 cursor-pointer transition-colors duration-75 select-none min-h-[56px] box-border ${
            style.rowClass
          } ${
            isFlashing
              ? 'ring-2 ring-inset ring-emerald-500 shadow-lg bg-emerald-100/90 dark:bg-emerald-950/80 z-20'
              : isSelected
              ? 'ring-1 ring-inset ring-[#1B4591] shadow-sm z-10'
              : node.checked
              ? 'ring-1 ring-inset ring-blue-500/20'
              : node.indeterminate
              ? 'ring-1 ring-inset ring-amber-500/20'
              : ''
          }`}
          style={{ marginLeft: `${getIndentPixels(currentLevel, node.role)}px` }}
        >
          {/* Left item details */}
          <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3 mr-3">
            {/* Expand / Collapse toggle */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-black/10 dark:hover:bg-white/10"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                )}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}

            {/* Checkbox (Coché ✓ ou Décoché, jamais de tiret sur Projet/Lot) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeCheck(node.id);
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors focus:outline-none shadow-sm cursor-pointer"
              style={{
                borderColor: node.checked ? '#1B4591' : '#CBD5E1',
                backgroundColor: node.checked ? '#1B4591' : 'white',
              }}
            >
              {node.checked ? (
                <Check className="h-4 w-4 stroke-[3] text-white" />
              ) : null}
            </button>

            {/* Visual Indent Ruler (example2.md Specification) */}
            <div
              className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shrink-0"
              title="Règle de positionnement : 1 clic direct pour changer de position"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => {
                const isCurrent = currentLevel === lvl;
                const getDotColor = (l: number) => {
                  switch (l) {
                    case 1: return 'bg-[#1B4591] text-white';
                    case 2: return 'bg-purple-600 text-white';
                    case 3: return 'bg-emerald-600 text-white';
                    case 4: return 'bg-teal-600 text-white';
                    case 5: return 'bg-sky-600 text-white';
                    case 6: return 'bg-amber-600 text-white';
                    case 7: return node.role === 'COMPONENT_ART' ? 'bg-pink-600 text-white' : 'bg-rose-500 text-white';
                    default: return 'bg-slate-600 text-white';
                  }
                };
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeNodeLevel(node.id, lvl, cascadeToBelow);
                    }}
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black transition-colors ${
                      isCurrent
                        ? `${getDotColor(lvl)} scale-110 shadow-xs ring-1 ring-white/60`
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={
                      lvl === 1
                        ? 'Pos 1 · PROJET / LIGNE'
                        : lvl === 2
                        ? 'Pos 2 · LOT'
                        : lvl === 3
                        ? 'Pos 3 · BLOC'
                        : lvl === 4
                        ? 'Pos 4 · OUVRAGE'
                        : lvl === 5
                        ? 'Pos 5 · ARTICLE'
                        : lvl === 6
                        ? 'Pos 6 · ENSEMBLE'
                        : lvl === 7
                        ? 'Pos 7 · COMPOSANT'
                        : 'Pos 8 · NOTE *'
                    }
                  >
                    {lvl === 8 ? '*' : lvl}
                  </button>
                );
              })}
            </div>

            {/* INTERACTIVE LEVEL BADGE WITH DROPDOWN TRIGGER */}
            <div className="relative shrink-0 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLevelMenuNodeId(isLevelMenuOpen ? null : node.id);
                }}
                className={`group/badge inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide transition-all duration-150 hover:shadow-md cursor-pointer ${style.badgeClass}`}
                title="Cliquer pour changer la position hiérarchique"
              >
                <span>{style.levelName}</span>
                <ChevronDown className="h-3 w-3 stroke-[2.5] opacity-70 group-hover/badge:opacity-100" />
              </button>

              {/* SMART SUB-LINES POPUP BUTTON (DEMANDE UTILISATEUR : POPUP INTELLIGENT DE RATTACHEMENT) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSmartSubLines(node);
                }}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-sky-200/90 bg-sky-50/90 hover:bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-800 hover:border-sky-300 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 transition-all shrink-0 cursor-pointer shadow-2xs"
                title="Assistant intelligent : sélectionner et rattacher les sous-lignes (détecte ex: 2.3.1 pour 2.3 jusqu'à 2.4)"
              >
                <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400 animate-pulse" />
                <span>Sous-lignes 🪄</span>
              </button>

              {/* LEVEL SELECTION POPOVER DROPDOWN */}
              {isLevelMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="border-b border-slate-100 pb-1.5 px-2 mb-1.5 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Changer la position de la ligne
                    </p>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {node.code}
                    </p>
                  </div>

                  {/* PROMINENT ASSISTANT BUTTON IN DROPDOWN */}
                  <button
                    type="button"
                    onClick={() => handleOpenSmartSubLines(node)}
                    className="flex w-full items-center justify-between rounded-xl p-2 mb-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 text-blue-900 font-extrabold text-xs dark:from-blue-950/60 dark:to-sky-950/60 dark:border-blue-800 dark:text-sky-300 hover:from-blue-100 hover:to-sky-100 transition-all cursor-pointer shadow-xs"
                    title="Détecte automatiquement les sous-lignes jusqu'au prochain élément de même niveau"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-sky-600 animate-pulse" />
                      <span>Rattacher les sous-lignes 🪄</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1">
                    {[
                      { lvl: 1, role: 'LIGNE' as NodeRole, name: 'LIGNE', desc: 'Position 1 (Ligne brute sans niveau)', color: 'bg-blue-700' },
                      { lvl: 1, role: 'PROJECT' as NodeRole, name: 'PROJET', desc: 'Position 1 (Nom du projet / Racine)', color: 'bg-[#1B4591]' },
                      { lvl: 2, role: 'LOT' as NodeRole, name: 'LOT', desc: 'Position 2 (Lot / Feuille importée)', color: 'bg-purple-600' },
                      { lvl: 3, role: 'BLOC' as NodeRole, name: 'BLOC / CHAPITRE', desc: 'Position 3 (Sous-section / Chapitre sous le Lot)', color: 'bg-emerald-600' },
                      { lvl: 4, role: 'OUVRAGE' as NodeRole, name: 'OUVRAGE', desc: 'Position 4 (Ouvrage sous le Bloc / Poste)', color: 'bg-teal-600' },
                      { lvl: 5, role: 'ARTICLE' as NodeRole, name: 'ARTICLE', desc: 'Position 5 (Article sous l\'Ouvrage / Ligne chiffrée)', color: 'bg-sky-600' },
                      { lvl: 6, role: 'ENSEMBLE' as NodeRole, name: 'ENSEMBLE', desc: 'Position 6 (Ensemble d\'ouvrages / Sous-total)', color: 'bg-amber-600' },
                      { lvl: 7, role: 'COMPONENT_ENS' as NodeRole, name: 'COMPOSANT / ENSEMBLE', desc: 'Position 7 (Composant sous l\'Ensemble : Fourn., MO, Matériel)', color: 'bg-rose-500' },
                      { lvl: 7, role: 'COMPONENT_ART' as NodeRole, name: 'COMPOSANT / ARTICLE', desc: 'Position 7 (Composant sous l\'Article : Fourn., MO, Matériel)', color: 'bg-pink-600' },
                      { lvl: 8, role: 'NOTE' as NodeRole, name: 'NOTE *', desc: 'Position 8 (Prescription / Pour mémoire / Contrôle)', color: 'bg-slate-500' },
                    ].map((lvlItem) => {
                      const isItemActive = currentLevel === lvlItem.lvl && (!lvlItem.role || node.role === lvlItem.role);
                      return (
                        <button
                          key={`${lvlItem.lvl}-${lvlItem.role}`}
                          type="button"
                          onClick={() => {
                            // User request: when selecting BLOC, OUVRAGE, ARTICLE, or ENSEMBLE, open smart sub-lines popup
                            const linesBelow = getLinesBelowNode(node.id);
                            if (autoOpenSmartSubLines && lvlItem.lvl >= 3 && lvlItem.lvl <= 6 && linesBelow.length > 0) {
                              handleOpenSmartSubLines(node, lvlItem.lvl, lvlItem.role);
                            } else {
                              handleChangeNodeLevel(node.id, lvlItem.lvl, lvlItem.role);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl p-2 text-left text-xs font-bold transition-colors ${
                            isItemActive
                              ? 'bg-blue-100 text-blue-900 font-black dark:bg-blue-950/70 dark:text-blue-200'
                              : 'hover:bg-slate-50 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md text-white text-[10px] font-black shrink-0 ${lvlItem.color}`}
                            >
                              {lvlItem.lvl === 8 ? '*' : lvlItem.lvl}
                            </span>
                            <div>
                              <div className="text-xs font-bold">Pos {lvlItem.lvl} : {lvlItem.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{lvlItem.desc}</div>
                            </div>
                          </div>
                          {isItemActive && <Check className="h-4 w-4 text-[#1B4591] stroke-[3] shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Sub-resource quick pills if Position 7 Component */}
                    {(currentLevel === 7 || node.role === 'COMPONENT' || node.role === 'COMPONENT_ENS' || node.role === 'COMPONENT_ART') && (
                      <div className="mt-1 flex items-center justify-center gap-1 px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[
                          { key: 'FOURN' as ResourceType, label: 'Fourn.' },
                          { key: 'MO' as ResourceType, label: 'MO' },
                          { key: 'MATERIEL' as ResourceType, label: 'Matériel' },
                          { key: 'ST' as ResourceType, label: 'ST' },
                        ].map((res) => (
                          <button
                            key={res.key}
                            type="button"
                            onClick={() => handleChangeNodeLevel(node.id, 7, node.role || 'COMPONENT_ENS', res.key)}
                            className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold transition-all ${
                              node.resourceType === res.key
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-900 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {res.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Auto-cascade toggle switch */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoOpenSmartSubLines(!autoOpenSmartSubLines);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          autoOpenSmartSubLines
                            ? 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-sky-300'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}
                        title="Ouvrir la pop-up de sélection automatique des sous-lignes lors du choix d'un bloc, ouvrage ou article"
                      >
                        <span className="truncate">Assistant sous-lignes auto :</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-black shrink-0 ${
                            autoOpenSmartSubLines ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {autoOpenSmartSubLines ? 'ACTIF' : 'OFF'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCascadeToBelow(!cascadeToBelow);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          cascadeToBelow
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}
                        title="Quand activé, modifier cette ligne modifie et repositionne aussi toutes les lignes en bas de cette section"
                      >
                        <span className="truncate">Cascader sur les lignes en bas :</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-black shrink-0 ${
                            cascadeToBelow ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {cascadeToBelow ? 'OUI' : 'NON'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK INDENT / OUTDENT BUTTONS (PROMOTION / DÉMOTION RAPIDE) */}
            <div className="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                onClick={(e) => handlePromote(node, e)}
                disabled={currentLevel === 1}
                className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-20 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Monter d'un niveau (Promouvoir · Shift+Tab)"
              >
                <ArrowLeft className="h-3 w-3 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDemote(node, e)}
                disabled={currentLevel >= 8}
                className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-800 disabled:opacity-20 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Descendre d'un niveau (Rétrograder · Tab)"
              >
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Code */}
            <span className={`shrink-0 font-mono text-[12.5px] sm:text-[13px] px-2.5 py-1 rounded-md font-bold ${style.codeBadgeClass}`}>
              {node.code}
            </span>

            {/* Calc Mode Badge */}
            {node.calcMode !== 'SUM' && node.calcMode !== 'QTY_PU' && (
              <span className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-bold ${getCalcBadge(node.calcMode)}`}>
                {node.calcMode}
              </span>
            )}

            {/* Inclusion mode (if not BASE) */}
            {node.inclusionMode !== 'BASE' && (
              <span className="shrink-0 rounded bg-rose-600 px-2 py-0.5 text-[11px] font-black text-white shadow-sm">
                {node.inclusionMode}
              </span>
            )}

            {/* Designation / Nom de l'article */}
            <span className={`truncate flex-1 min-w-[140px] ${style.textClass}`} title={node.designation}>
              {node.designation}
            </span>

            {/* Alert badge if any */}
            {node.alertCodes && node.alertCodes.length > 0 && (
              <span
                className="shrink-0 inline-flex cursor-help items-center gap-1 rounded bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm"
                title={node.alertMessage}
              >
                <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                {node.alertCodes.join(', ')}
              </span>
            )}
          </div>

          {/* Right item figures: Quantité | Unité | P.U. HT | Total HT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 text-right">
            {/* Quantité */}
            <div className="w-16 sm:w-20 text-right shrink-0">
              {node.quantite !== undefined && node.quantite !== null ? (
                <span className="font-mono text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  {node.quantite.toLocaleString('fr-FR')}
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-300 dark:text-slate-600">—</span>
              )}
            </div>

            {/* Unité */}
            <div className="w-14 sm:w-16 flex justify-center shrink-0">
              {node.unit || node.calcMode === 'ENS_QTY' || node.calcMode === 'LUMP' ? (
                <span
                  className="inline-flex items-center justify-center px-2 py-0.5 min-w-[36px] rounded text-xs font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-2xs"
                  title={`Unité : ${node.unit || (node.calcMode === 'ENS_QTY' ? 'ENS' : 'FF')}`}
                >
                  {node.unit || (node.calcMode === 'ENS_QTY' ? 'ENS' : 'FF')}
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-300 dark:text-slate-600">—</span>
              )}
            </div>

            {/* Prix Unitaire (P.U. HT) */}
            <div className="w-20 sm:w-24 text-right shrink-0">
              {node.unitPrice !== undefined && node.unitPrice !== null && node.unitPrice > 0 ? (
                <span className="font-mono text-[13px] sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  {node.unitPrice.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  €
                </span>
              ) : (
                <span className="font-mono text-xs text-slate-300 dark:text-slate-600">—</span>
              )}
            </div>

            {/* Total Montant HT / Prix */}
            <div className="w-24 sm:w-28 text-right shrink-0">
              <span className="font-mono text-sm sm:text-[15px] font-black text-slate-900 dark:text-white">
                {(node.montantHT || 0).toLocaleString('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{' '}
                €
              </span>
            </div>
          </div>
        </div>

        {/* Children render WITH HIGH-PRECISION DOTTED GUIDE LINE */}
        {hasChildren && isExpanded && (
          <div className="relative ml-5 pl-3 border-l-2 border-dashed border-slate-300 dark:border-slate-700/80 space-y-1.5 mt-1.5">
            {node.children!.map((child) => renderTreeNode(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  // Keyboard Shortcuts: Speed-Keys 1-7, N, Tab, Shift+Tab, Ctrl+Z, ArrowUp/Down, J/K, B (Painter), Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Escape') {
        setOpenLevelMenuNodeId(null);
        setContextMenu(null);
        setPainterActive(false);
        setIsPainterMenuOpen(false);
        return;
      }

      // Undo Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (toastNotification?.previousTree) {
          setTreeData(toastNotification.previousTree);
          setToastNotification({
            message: 'Action annulée avec succès (Ctrl+Z)',
          });
          setTimeout(() => setToastNotification(null), 3000);
        }
        return;
      }

      // Toggle Painter Mode on 'b'
      if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setPainterActive((prev) => !prev);
        setToastNotification({
          message: !painterActive
            ? `🖌️ Mode Pinceau activé (NIV ${painterLevel}) : Cliquez ou glissez sur les lignes`
            : 'Mode Pinceau désactivé',
        });
        setTimeout(() => setToastNotification(null), 2500);
        return;
      }

      if (subStep === 'arborescence') {
        // Collect visible nodes in linear order for keyboard navigation
        const visibleNodes: StagingTreeNode[] = [];
        const collectVisible = (nodes: StagingTreeNode[]) => {
          for (const n of nodes) {
            if (isNodeVisible(n)) {
              visibleNodes.push(n);
              if (n.isExpanded !== false && n.children && n.children.length > 0) {
                collectVisible(n.children);
              }
            }
          }
        };
        collectVisible(treeData);

        const currentIdx = visibleNodes.findIndex((n) => n.id === selectedNodeId);

        // ArrowDown / J : Next row
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            const nextIdx = currentIdx < visibleNodes.length - 1 ? currentIdx + 1 : 0;
            setSelectedNodeId(visibleNodes[nextIdx].id);
          }
          return;
        }

        // ArrowUp / K : Previous row
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (visibleNodes.length > 0) {
            const prevIdx = currentIdx > 0 ? currentIdx - 1 : visibleNodes.length - 1;
            setSelectedNodeId(visibleNodes[prevIdx].id);
          }
          return;
        }

        // Space : Toggle checkbox
        if (e.key === ' ' && selectedNodeId) {
          e.preventDefault();
          toggleNodeCheck(selectedNodeId);
          return;
        }

        // Speed-Keys 1..6: directly sets position!
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= 6 && selectedNodeId) {
          e.preventDefault();
          handleChangeNodeLevel(selectedNodeId, num, undefined, undefined, e.shiftKey ? true : cascadeToBelow);
          return;
        }

        // Speed-Key '7' or 'N' : sets NOTE (position 7)
        if ((e.key === '7' || e.key.toLowerCase() === 'n') && selectedNodeId) {
          e.preventDefault();
          handleChangeNodeLevel(selectedNodeId, 7, 'NOTE', undefined, false);
          return;
        }

        // Tab (Demote/Indent), Shift+Tab (Promote/Outdent)
        if (e.key === 'Tab' && selectedNodeId) {
          e.preventDefault();
          const target = visibleNodes.find((n) => n.id === selectedNodeId);
          if (!target) return;
          const currentLvl = getNodeLevel(target);
          if (e.shiftKey) {
            if (currentLvl > 1) {
              handleChangeNodeLevel(target.id, currentLvl - 1, undefined, undefined, cascadeToBelow);
            }
          } else {
            if (currentLvl < 7) {
              handleChangeNodeLevel(target.id, currentLvl + 1, undefined, undefined, cascadeToBelow);
            }
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, treeData, subStep, toastNotification, painterActive, painterLevel, cascadeToBelow]);

  return (
    <div className="space-y-6 relative">
      {/* 5-Step Stepper Bar matching frontend-intern */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between w-full">
          {subSteps.map((step, idx) => {
            const Icon = step.icon;
            const stepIndex = subSteps.findIndex((item) => item.id === subStep);
            const isActive = subStep === step.id;
            const isDone = stepIndex >= 0 && stepIndex > idx;
            const connectorSolid = stepIndex >= 0 && idx < stepIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="relative z-10 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSubStep(step.id);
                      if (step.id === 'arborescence') {
                        setActiveClassificationSheet('ALL');
                      }
                    }}
                    className="flex items-center gap-2.5 group focus:outline-none"
                  >
                    {isActive ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4591] shadow-md sm:h-11 sm:w-11">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    ) : isDone ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6FAE9] sm:h-11 sm:w-11">
                        <Icon className="h-4 w-4 text-[#16A148]" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECF4FF] dark:bg-slate-800 sm:h-11 sm:w-11">
                        <Icon className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
                      </div>
                    )}
                    <span
                      className={`text-xs font-semibold sm:text-sm ${
                        isActive
                          ? 'text-[#1B4591] dark:text-sky-400 font-bold'
                          : isDone
                          ? 'text-slate-800 dark:text-slate-200 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                </div>
                {idx < subSteps.length - 1 && (
                  <div
                    className={`mx-2 min-w-[1.5rem] flex-1 border-t-2 sm:min-w-[2rem] ${
                      connectorSolid
                        ? 'border-solid border-[#16A148]'
                        : 'border-dashed border-[#BFC7D6] dark:border-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {/* SUB-STEP 1: IMPORT & FILE DROP */}
        {subStep === 'import' && (
          <ImportUploadStep
            onFileLoaded={handleFileLoaded}
            currentFileName={uploadedFileName}
            isMultipleFiles={isMultipleFiles}
            onToggleMultipleFiles={setIsMultipleFiles}
            onNext={() => setSubStep('association')}
          />
        )}

        {/* SUB-STEP 2: ASSOCIATION DES LOTS */}
        {subStep === 'association' && (
          <AssociationStep
            fileName={uploadedFileName}
            availableSheets={availableSheets}
            selectedSheets={selectedSheets}
            onToggleSheet={(sheet) => {
              setSelectedSheets((prev) =>
                prev.includes(sheet) ? prev.filter((s) => s !== sheet) : [...prev, sheet]
              );
            }}
            onSelectAllSheets={(select) => {
              setSelectedSheets(select ? [...availableSheets] : []);
            }}
            onSelectGoOnly={() => {
              const goSheets = availableSheets.filter(
                (s) => s.includes('02') || s.toLowerCase().includes('gros')
              );
              setSelectedSheets(goSheets.length > 0 ? goSheets : [availableSheets[0]]);
              if (goSheets.length > 0) setActiveSheet(goSheets[0]);
            }}
            sheetLotMap={sheetLotMap}
            onChangeSheetMapping={(sheet, lotLabel) => {
              setSheetLotMap((prev) => ({ ...prev, [sheet]: lotLabel }));
            }}
            rawSheetsData={rawSheetsData}
            allowMultipleLotsPerFile={allowMultipleLotsPerFile}
            onToggleAllowMultipleLots={setAllowMultipleLotsPerFile}
            onPrev={() => setSubStep('import')}
            onNext={() => {
              if (selectedSheets.length > 0 && !selectedSheets.includes(activeSheet)) {
                setActiveSheet(selectedSheets[0]);
              }
              setSubStep('identification');
            }}
          />
        )}

        {/* SUB-STEP 3: IDENTIFICATION DES COLONNES */}
        {subStep === 'identification' && (
          <IdentificationStep
            fileName={uploadedFileName}
            selectedSheets={selectedSheets}
            activeSheet={activeSheet}
            onSelectActiveSheet={setActiveSheet}
            sheetLotMap={sheetLotMap}
            sheetConfigs={sheetConfigs}
            onUpdateSheetConfig={(sheet, cfg) => {
              setSheetConfigs((prev) => ({ ...prev, [sheet]: cfg }));
            }}
            rawSheetsData={rawSheetsData}
            onPrev={() => setSubStep('association')}
            onParseAndProceed={handleParseAndProceed}
          />
        )}

        {/* SUB-STEP 4: ARBORESCENCE 5 NIVEAUX & CONTRÔLE UTILISATEUR COMPLET */}
        {subStep === 'arborescence' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header with Title and Profiles */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-[#1B4591] dark:text-sky-400">
                  Zone de Transit : Classification WBS aux 6 Positions Standard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hiérarchie standardisée : Pos 1 (Projet / Lignes brutes) &gt; Pos 2 (Lot) &gt; Pos 3 (Bloc) &gt; Pos 4 (Ouvrage : Article &amp; Ensemble dans la même position) &gt; Pos 5 (Composant) &gt; Pos 6 (Note/Ctrl).
                </p>
              </div>

              {/* Profiles quick selection */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Profils :</span>
                {[
                  { id: 'all', label: 'Tout sélectionner' },
                  { id: 'go', label: 'Gros Œuvre seul' },
                  { id: 'base', label: 'Base marché (sans options)' },
                  { id: 'comp', label: 'Ouvrages composés' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyProfile(p.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeFilterProfile === p.id
                        ? 'bg-[#1B4591] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SHEET SELECTION / SWITCHER TABS IN PHASE 4 (DEMANDE UTILISATEUR) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[#1B4591] dark:text-sky-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Sélection des feuilles dans la phase Classification des éléments :
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({availableSheets.length} feuilles dans le classeur)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFlattenAllToPosition1(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-900 shadow-sm transition-all hover:bg-blue-100 hover:border-blue-500 dark:border-blue-700 dark:bg-blue-950/80 dark:text-sky-300 cursor-pointer"
                    title="Initialiser toutes les lignes de tous les lots au même niveau (Position 1 · Lignes brutes sans niveaux)"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-blue-700 dark:text-sky-400 stroke-[2.5]" />
                    <span>Initialiser tout au même niveau</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Affichage actif :</span>
                    <span className="font-bold text-[#1B4591] dark:text-sky-400">
                      {activeClassificationSheet === 'ALL'
                        ? `Toutes les feuilles (${availableSheets.filter((s) => !s.toUpperCase().includes('RECAP')).length} lots importés)`
                        : `${activeClassificationSheet} : ${sheetLotMap[activeClassificationSheet]?.replace(/^[0-9]+\s*-\s*/, '') || ''} (Lot seul)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sheet tabs pills */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => handleSelectClassificationSheet('ALL')}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow-sm ${
                    activeClassificationSheet === 'ALL'
                      ? 'bg-[#1B4591] text-white ring-2 ring-[#1B4591]/40'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Toutes les feuilles</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      activeClassificationSheet === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {availableSheets.filter((s) => !s.toUpperCase().includes('RECAP')).length} lots
                  </span>
                </button>

                {availableSheets.map((sheet) => {
                  const isSheetParsed = (function check(nodes: StagingTreeNode[]): boolean {
                    return nodes.some(
                      (n) =>
                        n.sheetName === sheet ||
                        n.code.includes(sheet) ||
                        n.id.includes(sheet.toLowerCase().replace(/[^a-z0-9]/g, '-')) ||
                        (n.children && check(n.children))
                    );
                  })(treeData);
                  const isCurrent = activeClassificationSheet === sheet;
                  const lotLabel = sheetLotMap[sheet] || sheet;

                  return (
                    <button
                      key={sheet}
                      type="button"
                      onClick={() => handleSelectClassificationSheet(sheet)}
                      className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-[#1B4591] text-white ring-2 ring-[#1B4591]/40 shadow-md'
                          : isSheetParsed
                          ? 'border border-blue-200 bg-blue-50/80 text-blue-900 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                      title={`${sheet} : ${lotLabel}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isCurrent ? 'bg-emerald-300' : isSheetParsed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className="font-mono">{sheet}</span>
                      <span className="max-w-[140px] truncate text-[11px] opacity-80 font-normal">
                        {lotLabel.replace(/^[0-9]+\s*-\s*/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE 7-LEVEL + NOTE/CTRL VIVID COLOR LEGEND & LEVEL FILTER BAR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Légende des 7 Niveaux Hiérarchiques + Note/Ctrl :
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-400">
                    (Cliquez sur un niveau pour filtrer la vue)
                  </span>
                </div>

                {levelFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setLevelFilter('all')}
                    className="text-xs font-bold text-[#1B4591] underline hover:opacity-80 dark:text-sky-400"
                  >
                    Réinitialiser le filtre de niveau
                  </button>
                )}
              </div>

              {/* 8 Positions Standard Cards */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {[
                  {
                    lvl: 1,
                    label: 'POS 1 · LIGNE / PROJET',
                    border: 'border-blue-400 bg-blue-50/90 text-blue-950',
                    active: 'bg-[#1B4591] text-white border-[#1B4591]',
                  },
                  {
                    lvl: 2,
                    label: 'POS 2 · LOT',
                    border: 'border-purple-300 bg-purple-50/90 text-purple-950',
                    active: 'bg-purple-600 text-white border-purple-600',
                  },
                  {
                    lvl: 3,
                    label: 'POS 3 · BLOC',
                    border: 'border-emerald-300 bg-emerald-50/90 text-emerald-950',
                    active: 'bg-emerald-600 text-white border-emerald-600',
                  },
                  {
                    lvl: 4,
                    label: 'POS 4 · OUVRAGE',
                    border: 'border-teal-300 bg-teal-50/90 text-teal-950',
                    active: 'bg-teal-600 text-white border-teal-600',
                  },
                  {
                    lvl: 5,
                    label: 'POS 5 · ARTICLE',
                    border: 'border-sky-300 bg-sky-50/90 text-sky-950',
                    active: 'bg-sky-600 text-white border-sky-600',
                  },
                  {
                    lvl: 6,
                    label: 'POS 6 · ENSEMBLE',
                    border: 'border-amber-300 bg-amber-50/90 text-amber-950',
                    active: 'bg-amber-600 text-white border-amber-600',
                  },
                  {
                    lvl: 7,
                    label: 'POS 7 · COMPOSANTS',
                    border: 'border-rose-300 bg-rose-50/90 text-rose-950',
                    active: 'bg-rose-500 text-white border-rose-500',
                  },
                  {
                    lvl: 8,
                    label: 'POS 8 · NOTE *',
                    border: 'border-slate-300 bg-slate-50/90 text-slate-800',
                    active: 'bg-slate-600 text-white border-slate-600',
                  },
                ].map((item) => {
                  const isFilterActive = levelFilter === item.lvl;
                  return (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setLevelFilter(levelFilter === item.lvl ? 'all' : item.lvl)}
                      className={`flex flex-col justify-between rounded-xl border p-2 text-left transition-all shadow-sm ${
                        isFilterActive
                          ? `${item.active} ring-2 ring-offset-1`
                          : `${item.border} hover:opacity-90 dark:bg-slate-800 dark:border-slate-700`
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                            isFilterActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:white/10'
                          }`}
                        >
                          {item.lvl === 8 ? '*' : item.lvl}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                            isFilterActive ? 'bg-white text-slate-900' : 'bg-black/10 dark:white/10'
                          }`}
                        >
                          {levelCounts[item.lvl] || 0}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight leading-tight truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              {/* Boolean Search Input */}
              <div className="relative min-w-[280px] flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Recherche booléenne : ex. radier ET béton SAUF option..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1B4591] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={inclusionFilter}
                  onChange={(e) => setInclusionFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <option value="all">Tous les modes d'inclusion</option>
                  <option value="BASE">Base marché</option>
                  <option value="OPTION">Options</option>
                  <option value="PSE">PSE</option>
                  <option value="VARIANTE">Variantes</option>
                  <option value="PROVISION">Provisions</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowOnlyAlerts(!showOnlyAlerts)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors ${
                    showOnlyAlerts
                      ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Alertes V01-V12</span>
                </button>
              </div>
            </div>

            {/* Mode Pinceau Banner */}
            {painterActive && (
              <div className="flex items-center justify-between rounded-xl bg-amber-500 px-4 py-2 text-white shadow-md animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Paintbrush className="h-4 w-4" />
                  <span>
                    Mode Pinceau Actif (Pos {painterLevel === 8 ? '* · NOTE' : painterLevel}) : Cliquez ou glissez sur les lignes pour leur appliquer cette position
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] opacity-80">Changer de position :</span>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPainterLevel(lvl)}
                      className={`h-5 w-5 rounded text-[10px] font-black ${
                        painterLevel === lvl ? 'bg-white text-amber-900 shadow-sm' : 'bg-black/20 text-white hover:bg-black/30'
                      }`}
                      title={
                        lvl === 1 ? 'Pos 1 · PROJET / LIGNE' :
                        lvl === 2 ? 'Pos 2 · LOT' :
                        lvl === 3 ? 'Pos 3 · BLOC' :
                        lvl === 4 ? 'Pos 4 · OUVRAGE' :
                        lvl === 5 ? 'Pos 5 · ARTICLE' :
                        lvl === 6 ? 'Pos 6 · ENSEMBLE' :
                        lvl === 7 ? 'Pos 7 · COMPOSANT' : 'Pos 8 · NOTE *'
                      }
                    >
                      {lvl === 8 ? '*' : lvl}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPainterActive(false)}
                    className="ml-2 rounded-lg bg-black/20 px-2 py-0.5 text-xs font-bold hover:bg-black/40"
                  >
                    Quitter (Échap)
                  </button>
                </div>
              </div>
            )}

            {/* Main Cockpit Split-Screen: Outliner Table + Live WBS Tree & Financial Audit */}
            <div className="flex flex-col xl:flex-row gap-5 items-start">
              {/* Left / Main Table Container */}
              <div className="flex-1 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 w-full">
                {/* Tree Header with Batch Select, Auto-renumber, Painter, Magic Wand and Expand/Collapse */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-xs font-semibold text-[#1B4591] hover:underline dark:text-sky-400"
                    >
                      Tout cocher
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400"
                    >
                      Tout décocher
                    </button>
                  </div>

                  {/* Speed Tools (example2.md Specification) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Level Painter Tool */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPainterActive(!painterActive)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-sm transition-all ${
                          painterActive
                            ? 'border-amber-400 bg-amber-500 text-white ring-2 ring-amber-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                        title="Activer l'outil Pinceau (Raccourci: Touche B)"
                      >
                        <Paintbrush className="h-3 w-3" />
                        <span>Pinceau : NIV {painterLevel === 8 ? 'N' : painterLevel}</span>
                      </button>
                    </div>

                    {/* Bouton Initialiser tout au même niveau (Demande utilisateur) */}
                    <button
                      type="button"
                      onClick={() => handleFlattenAllToPosition1(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400 bg-blue-100/90 px-3 py-1 text-[11px] font-black text-blue-950 shadow-sm transition-all hover:bg-blue-200 hover:border-blue-500 dark:border-blue-700 dark:bg-blue-950/80 dark:text-sky-300 cursor-pointer"
                      title="Initialiser toutes les lignes de tous les lots au même niveau (Position 1 · Lignes brutes sans niveaux)"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-blue-700 dark:text-sky-400 stroke-[2.5]" />
                      <span>Initialiser tout au même niveau</span>
                    </button>

                    {/* Smart Auto-Classifier Tool */}
                    <button
                      type="button"
                      onClick={handleSmartAutoClassify}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                      title="Auto-classifier les lignes selon leur code (ex: X.X -> BLOC, X.X.X -> ENSEMBLE/ARTICLE)"
                    >
                      <Wand2 className="h-3 w-3 text-indigo-600" />
                      <span>Auto-Classifier</span>
                    </button>

                    {/* Auto-renumber WBS tool */}
                    <button
                      type="button"
                      onClick={handleAutoRenumberTree}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:text-[#1B4591] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      title="Renuméroter toute l'arborescence selon les standards WBS / UNTEC"
                    >
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span>Harmoniser WBS</span>
                    </button>

                    {/* Cockpit Split View Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowCockpitWbs(!showCockpitWbs)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-sm transition-all ${
                        showCockpitWbs
                          ? 'border-[#1B4591] bg-blue-50 text-[#1B4591] dark:bg-blue-950/60 dark:text-sky-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                      title="Afficher/Masquer le volet Arbre WBS Restructuré en temps réel"
                    >
                      <Split className="h-3 w-3" />
                      <span>Arbre WBS Restructuré</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAllExpand(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <Maximize2 className="h-3 w-3" />
                      <span>Tout déplier</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAllExpand(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <Minimize2 className="h-3 w-3" />
                      <span>Tout replier</span>
                    </button>
                  </div>
                </div>

                {/* UX INTERACTIVE BREADCRUMB & HOTKEYS BAR (Hauteur strictement verrouillée pour éliminer tout scintillement/vibration) */}
                <div className="h-10 min-h-[40px] max-h-[40px] border-b border-slate-100 bg-[#F8FAFC] px-4 text-xs dark:border-slate-800 dark:bg-slate-800/40 flex items-center overflow-hidden">
                  <div className="flex w-full items-center justify-between gap-2 overflow-hidden flex-nowrap">
                    <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                      <Compass className="h-3.5 w-3.5 shrink-0 text-[#1B4591] dark:text-sky-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                        Fil d'Ariane :
                      </span>
                      {hoveredNodeTrail.length > 0 ? (
                        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                          {hoveredNodeTrail.map((item, idx) => (
                            <React.Fragment key={item.id}>
                              <span
                                className={`px-1 rounded text-[10px] font-bold font-mono shrink-0 ${
                                  getLevelStyle(item).codeBadgeClass
                                }`}
                              >
                                {item.code}
                              </span>
                              <span className="truncate max-w-[140px]">{item.designation}</span>
                              {idx < hoveredNodeTrail.length - 1 && (
                                <span className="text-slate-300 font-bold shrink-0">&gt;</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic truncate">
                          Survolez ou cliquez sur une ligne pour voir son arborescence
                        </span>
                      )}
                    </div>

                    {/* Keyboard Hints Badge */}
                    <div className="hidden xl:flex items-center gap-2 text-[10px] text-blue-900 dark:text-sky-200 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 px-2 py-0.5 rounded-md font-medium shrink-0">
                      <Keyboard className="h-3 w-3 text-[#1B4591]" />
                      <span>Touches 1..6 Positions · 7/N Note</span>
                      <span>·</span>
                      <kbd className="rounded bg-white px-1 py-0.2 font-mono text-[9px] border dark:bg-slate-900">Tab</kbd>
                      <span>Indenter</span>
                      <span>·</span>
                      <kbd className="rounded bg-white px-1 py-0.2 font-mono text-[9px] border dark:bg-slate-900">J/K</kbd>
                      <span>Naviguer</span>
                      <span>·</span>
                      <kbd className="rounded bg-white px-1 py-0.2 font-mono text-[9px] border dark:bg-slate-900">Ctrl+Z</kbd>
                      <span>Annuler</span>
                    </div>
                  </div>
                </div>

                {/* Tree Body */}
                <div className="max-h-[640px] overflow-y-auto p-4">
                  {/* Specific Lot Exclusive View Banner */}
                  {activeClassificationSheet !== 'ALL' && (
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/90 border border-blue-200/90 p-3 shadow-sm dark:bg-blue-950/40 dark:border-blue-800">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-blue-950 dark:text-blue-100">
                          Affichage exclusif :
                        </span>
                        <span className="rounded-md bg-[#1B4591] px-2 py-0.5 font-mono text-xs font-black text-white">
                          {activeClassificationSheet}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sheetLotMap[activeClassificationSheet]?.replace(/^[0-9]+\s*-\s*/, '') || ''}
                        </span>
                        {displayedTreeNodes[0] && (
                          <span className="rounded-full bg-blue-200/70 px-2 py-0.5 text-[10px] font-bold text-blue-950 dark:bg-blue-900/60 dark:text-blue-200">
                            {(displayedTreeNodes[0].children || []).length} chapitres / blocs · {displayedTreeNodes[0].montantHT.toLocaleString('fr-FR')} € HT
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectClassificationSheet('ALL')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1B4591] shadow-sm transition-all hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Afficher tout le projet (Toutes les feuilles)</span>
                      </button>
                    </div>
                  )}

                  {/* Table Column Headers: Hiérarchie & Article à gauche | Quantité, Unité, PU HT, Total HT à la fin */}
                  <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-100/95 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200 shadow-xs">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="text-xs sm:text-[13px] font-black text-slate-800 dark:text-slate-100 tracking-wide">
                        Hiérarchie & Nom de l'Article / Libellé de l'Ouvrage
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3 text-right">
                      <span className="w-16 sm:w-20 text-right">Quantité</span>
                      <span className="w-14 sm:w-16 text-center">Unité</span>
                      <span className="w-20 sm:w-24 text-right">P.U. HT</span>
                      <span className="w-24 sm:w-28 text-right">Montant HT</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {displayedTreeNodes
                      .filter((rootNode) => isNodeVisible(rootNode))
                      .map((rootNode) => renderTreeNode(rootNode, 0, []))}

                    {displayedTreeNodes.filter((rootNode) => isNodeVisible(rootNode)).length === 0 && (
                      <div className="py-12 text-center text-slate-500">
                        <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">
                          Aucun élément actuellement chargé pour la feuille "{activeClassificationSheet}".
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectClassificationSheet(activeClassificationSheet)}
                          className="mt-2 text-xs font-bold text-[#1B4591] underline hover:opacity-80"
                        >
                          Analyser et afficher cette feuille
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Live WBS Tree Side Panel (100% synchronisé en temps réel avec le projet) */}
              {showCockpitWbs && (
                <div className="w-full xl:w-[380px] shrink-0 space-y-4">
                  {/* Live WBS Tree View Panel */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-[#1B4591]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Arbre WBS Restructuré
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-[#1B4591] border border-blue-200 dark:bg-blue-950/60 dark:text-sky-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Temps Réel
                      </span>
                    </div>

                    {/* Scope Switcher: Feuille active vs Projet complet */}
                    {activeClassificationSheet !== 'ALL' && (
                      <div className="mt-3 flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setWbsViewScope('CURRENT')}
                          className={`flex-1 py-1.5 px-2 rounded-lg transition-colors truncate ${
                            wbsViewScope === 'CURRENT'
                              ? 'bg-white dark:bg-slate-700 text-[#1B4591] dark:text-sky-300 shadow-xs font-black'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Lot actif ({activeClassificationSheet})
                        </button>
                        <button
                          type="button"
                          onClick={() => setWbsViewScope('ALL')}
                          className={`flex-1 py-1.5 px-2 rounded-lg transition-colors truncate ${
                            wbsViewScope === 'ALL'
                              ? 'bg-white dark:bg-slate-700 text-[#1B4591] dark:text-sky-300 shadow-xs font-black'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Tout le Projet
                        </button>
                      </div>
                    )}

                    <div className="mt-3 max-h-[720px] overflow-y-auto space-y-0.5 pr-1 font-mono text-[11px]">
                      {renderMiniWbsTree(
                        wbsViewScope === 'CURRENT' && activeClassificationSheet !== 'ALL'
                          ? displayedTreeNodes
                          : treeData
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Batch Action Dock (example2.md Specification) */}
            {checkedNodesCount >= 2 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-black">
                    {checkedNodesCount}
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-slate-200">
                    lignes sélectionnées
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-slate-400 mr-1">Reclasser :</span>
                  {[
                    { lvl: 1, label: '1 LIGNE', role: 'LIGNE' as NodeRole, bg: 'hover:bg-blue-600' },
                    { lvl: 2, label: '2 LOT', role: 'LOT' as NodeRole, bg: 'hover:bg-purple-600' },
                    { lvl: 3, label: '3 BLOC', role: 'BLOC' as NodeRole, bg: 'hover:bg-emerald-600' },
                    { lvl: 4, label: '4 OUVRAGE', role: 'OUVRAGE' as NodeRole, bg: 'hover:bg-teal-600' },
                    { lvl: 5, label: '5 ARTICLE', role: 'ARTICLE' as NodeRole, bg: 'hover:bg-sky-600' },
                    { lvl: 6, label: '6 ENSEMBLE', role: 'ENSEMBLE' as NodeRole, bg: 'hover:bg-amber-600' },
                    { lvl: 7, label: '7 COMP/ENS', role: 'COMPONENT_ENS' as NodeRole, bg: 'hover:bg-rose-600' },
                    { lvl: 7, label: '7 COMP/ART', role: 'COMPONENT_ART' as NodeRole, bg: 'hover:bg-pink-600' },
                    { lvl: 8, label: 'NOTE *', role: 'NOTE' as NodeRole, bg: 'hover:bg-slate-600' },
                  ].map((b) => (
                    <button
                      key={`${b.lvl}-${b.label}`}
                      type="button"
                      onClick={() => handleBatchChangeLevel(b.lvl, b.role)}
                      className={`rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1 text-xs font-bold transition-all ${b.bg}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700">
                  <button
                    type="button"
                    onClick={handleBatchPromote}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold hover:bg-slate-700"
                    title="Promouvoir d'un niveau (Shift+Tab)"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>-1 Niv</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchDemote}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold hover:bg-slate-700"
                    title="Abaisser d'un niveau (Tab)"
                  >
                    <span>+1 Niv</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Désélectionner tout"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="flex justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubStep('identification')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" /> Précédent
              </button>
              <button
                type="button"
                onClick={() => setSubStep('verification')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B4591] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#163a7a]"
              >
                Suivant : Vérification finale <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* SUB-STEP 5: VÉRIFICATION & VALIDATION */}
        {subStep === 'verification' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E6FAE9] text-[#16A148]">
              <FileCheck2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1B4591] dark:text-sky-400">
                Prêt pour la Phase Métrés de Génie Civil
              </h3>
              <p className="mx-auto mt-1 max-w-lg text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                L'arborescence à 5 niveaux et la sélection sélective ont été vérifiées avec succès. Vous accédez directement au Carnet de Métré interactif.
              </p>
            </div>

            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 text-left dark:border-slate-800 dark:bg-slate-800/60">
              <h4 className="text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Bilan de l'arborescence 5 niveaux :
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#16A148]" />
                    Projet cible :
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Construction Hôtel Grand Confort 4★
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#16A148]" />
                    Lignes retenues :
                  </span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {basketMetrics.retainedLines} postes analysés
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#16A148]" />
                    Montant HT sélectionné :
                  </span>
                  <strong className="font-mono text-[#1B4591] dark:text-sky-300">
                    {basketMetrics.retainedAmount.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    €
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#16A148]" />
                    Structure :
                  </span>
                  <span className="text-slate-500">5 Niveaux avec personnalisation totale</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setSubStep('arborescence')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" /> Modifier la sélection
              </button>
              <button
                type="button"
                onClick={() => {
                  const lotsToIntegrate = convertTreeToLotItems(treeData);
                  onImportComplete(lotsToIntegrate.length > 0 ? lotsToIntegrate : existingLots);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16A148] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Confirmer l'import & Ouvrir les Métrés</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BATCH ACTION BAR WHEN ITEMS ARE CHECKED (UX PARFAIT) */}
      {subStep === 'arborescence' && checkedNodesCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4591] text-white text-[11px] font-black">
              {checkedNodesCount}
            </span>
            <span>coché{checkedNodesCount > 1 ? 's' : ''} :</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Promote / Demote All */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleBatchPromote}
              className="inline-flex items-center gap-1 rounded-xl border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-200"
              title="Promouvoir tous les éléments cochés d'un niveau (Shift+Tab)"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Promouvoir tous</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDemote}
              className="inline-flex items-center gap-1 rounded-xl border border-orange-300 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-950 shadow-sm hover:bg-orange-100 dark:bg-orange-950/60 dark:text-orange-200"
              title="Abaisser tous les éléments cochés d'un niveau (Tab)"
            >
              <span>Abaisser tous</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Quick Batch Level Setters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Reclasser en :</span>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(1, 'LIGNE')}
              className="rounded-lg bg-blue-50 border border-blue-300 px-2 py-0.5 text-[10px] font-bold text-blue-900 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-200"
            >
              1 · LIGNE
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(2)}
              className="rounded-lg bg-purple-50 border border-purple-300 px-2 py-0.5 text-[10px] font-bold text-purple-900 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-200"
            >
              2 · LOT
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(3)}
              className="rounded-lg bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-200"
            >
              3 · BLOC
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(4, 'OUVRAGE')}
              className="rounded-lg bg-teal-50 border border-teal-300 px-2 py-0.5 text-[10px] font-bold text-teal-900 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-200"
            >
              4 · OUVRAGE
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(5, 'ARTICLE')}
              className="rounded-lg bg-sky-50 border border-sky-300 px-2 py-0.5 text-[10px] font-bold text-sky-900 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-200"
            >
              5 · ARTICLE
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(6, 'ENSEMBLE')}
              className="rounded-lg bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200"
            >
              6 · ENSEMBLE
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(7, 'COMPONENT_ENS')}
              className="rounded-lg bg-rose-50 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-950 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200"
            >
              7 · COMP/ENS
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(7, 'COMPONENT_ART')}
              className="rounded-lg bg-pink-50 border border-pink-300 px-2 py-0.5 text-[10px] font-bold text-pink-950 hover:bg-pink-100 dark:bg-pink-950/60 dark:text-pink-200"
            >
              7 · COMP/ART
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(8, 'NOTE')}
              className="rounded-lg bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              8 · NOTE *
            </button>
            <button
              type="button"
              onClick={() => handleBatchChangeLevel(1, 'LIGNE')}
              className="rounded-lg bg-blue-100 border border-blue-400 px-2 py-0.5 text-[10px] font-black text-blue-900 hover:bg-blue-200 dark:bg-blue-950/80 dark:text-sky-300"
              title="Mettre toutes les lignes sélectionnées au même niveau (Position 1 · LIGNE)"
            >
              🔄 Mettre au même niveau (Pos 1)
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Deselect All */}
          <button
            type="button"
            onClick={() => handleSelectAll(false)}
            className="text-xs text-slate-500 hover:text-slate-800 underline dark:text-slate-400"
          >
            Tout décocher
          </button>
        </div>
      )}

      {/* CONTEXT MENU ON RIGHT CLICK */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-64 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-slate-100 px-2.5 py-1.5 mb-1 dark:border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Action rapide · Ligne WBS
            </p>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
              {contextMenu.node.code} - {contextMenu.node.designation}
            </p>
          </div>

          <div className="space-y-0.5 text-xs">
            <button
              type="button"
              disabled={getNodeLevel(contextMenu.node) === 1}
              onClick={() => {
                handleChangeNodeLevel(contextMenu.node.id, getNodeLevel(contextMenu.node) - 1);
                setContextMenu(null);
              }}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-900 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                <span>Promouvoir d'une position</span>
              </div>
              <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-mono text-slate-500 dark:bg-slate-800">
                Shift+Tab
              </kbd>
            </button>

            <button
              type="button"
              disabled={getNodeLevel(contextMenu.node) >= 8}
              onClick={() => {
                handleChangeNodeLevel(contextMenu.node.id, getNodeLevel(contextMenu.node) + 1);
                setContextMenu(null);
              }}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-900 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />
                <span>Abaisser d'une position</span>
              </div>
              <kbd className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-mono text-slate-500 dark:bg-slate-800">
                Tab
              </kbd>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <p className="px-2.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase">
              Reclasser directement
            </p>

            {[
              { lvl: 1, role: 'LIGNE' as NodeRole, label: 'Pos 1 · LIGNE (Ligne brute)', color: 'bg-blue-700' },
              { lvl: 1, role: 'PROJECT' as NodeRole, label: 'Pos 1 · PROJET / TRANCHE', color: 'bg-[#1B4591]' },
              { lvl: 2, role: 'LOT' as NodeRole, label: 'Pos 2 · LOT (Feuille importée)', color: 'bg-purple-600' },
              { lvl: 3, role: 'BLOC' as NodeRole, label: 'Pos 3 · BLOC / CHAPITRE', color: 'bg-emerald-600' },
              { lvl: 4, role: 'OUVRAGE' as NodeRole, label: 'Pos 4 · OUVRAGE (Ouvrage sous le Bloc)', color: 'bg-teal-600' },
              { lvl: 5, role: 'ARTICLE' as NodeRole, label: 'Pos 5 · ARTICLE (Ligne chiffrée)', color: 'bg-sky-600' },
              { lvl: 6, role: 'ENSEMBLE' as NodeRole, label: 'Pos 6 · ENSEMBLE (Sous-total)', color: 'bg-amber-600' },
              { lvl: 7, role: 'COMPONENT_ENS' as NodeRole, label: 'Pos 7 · COMPOSANT / ENSEMBLE', color: 'bg-rose-500' },
              { lvl: 7, role: 'COMPONENT_ART' as NodeRole, label: 'Pos 7 · COMPOSANT / ARTICLE', color: 'bg-pink-600' },
              { lvl: 8, role: 'NOTE' as NodeRole, label: 'Pos 8 · NOTE * (Prescription/PM)', color: 'bg-slate-500' },
            ].map((item) => {
              const isMatch = getNodeLevel(contextMenu.node) === item.lvl && (!item.role || contextMenu.node.role === item.role);
              return (
                <button
                  key={`${item.lvl}-${item.role}`}
                  type="button"
                  onClick={() => {
                    handleChangeNodeLevel(contextMenu.node.id, item.lvl, item.role);
                    setContextMenu(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-left font-bold ${
                    isMatch
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                      : 'hover:bg-slate-50 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {isMatch && (
                    <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-600" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                handleOpenSmartSubLines(contextMenu.node);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
              <span>✨ Rattacher les sous-lignes...</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleFlattenAllToPosition1(true);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-sky-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
              <span>🔄 Initialiser tout au même niveau</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleCopyNodeWBS(contextMenu.node);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copier le libellé & WBS</span>
            </button>
          </div>
        </div>
      )}

      {/* SMART SUB-LINES MODAL (DEMANDE UTILISATEUR : POPUP INTELLIGENT DE RATTACHEMENT DE BLOC/OUVRAGE/ARTICLE/ENSEMBLE) */}
      {smartModalState.isOpen && smartModalState.parentNode && (
        <SmartSubLinesModal
          isOpen={smartModalState.isOpen}
          onClose={() =>
            setSmartModalState({
              isOpen: false,
              parentNode: null,
              targetLevel: 4,
              targetRole: 'OUVRAGE',
              allLinesBelow: [],
            })
          }
          parentNode={smartModalState.parentNode}
          targetLevel={smartModalState.targetLevel}
          targetRole={smartModalState.targetRole}
          allLinesBelow={smartModalState.allLinesBelow}
          onConfirm={handleConfirmSmartSubLines}
          onApplySingleOnly={handleApplySingleOnly}
        />
      )}

      {/* TOAST NOTIFICATION WITH UNDO BUTTON */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in slide-in-from-right-5 duration-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 dark:text-white">Niveau modifié</p>
            <p className="text-slate-500 max-w-[280px] truncate">{toastNotification.message}</p>
          </div>
          {toastNotification.previousTree && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Annuler</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
