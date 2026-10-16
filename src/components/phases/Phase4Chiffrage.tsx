import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  PieChart,
  HardHat,
  Truck,
  Wrench,
  Boxes,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  Pencil,
  Check,
  X,
  Sparkles,
  Info,
  Building,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  LotItem,
  BlocItem,
  OuvrageItem,
  ArticleItem,
  ProjectInfo,
  CalcMode,
  ResourceType,
} from '../../types/dpgf';

interface Phase4ChiffrageProps {
  project: ProjectInfo;
  lots: LotItem[];
  onUpdateLots?: (updatedLots: LotItem[]) => void;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  chiffrageStatus: 'VALIDE' | 'EN_COURS' | 'REJETE' | 'EN_ATTENTE';
}

export const Phase4Chiffrage: React.FC<Phase4ChiffrageProps> = ({
  project,
  lots,
  onUpdateLots,
  onOpenApproveModal,
  onOpenRejectModal,
  chiffrageStatus,
}) => {
  const [activeLotId, setActiveLotId] = useState<string>(lots[1]?.id || lots[0]?.id || '');
  const [viewMode, setViewMode] = useState<'arborescence' | 'synthese'>('arborescence');
  const [searchTerm, setSearchTerm] = useState('');

  // Accordion open/close state
  const [expandedBlocs, setExpandedBlocs] = useState<Record<string, boolean>>({});
  const [expandedOuvrages, setExpandedOuvrages] = useState<Record<string, boolean>>({});

  // Inline editing state for article / component
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editQuantite, setEditQuantite] = useState<number>(0);
  const [editPU, setEditPU] = useState<number>(0);
  const [editCoeffK, setEditCoeffK] = useState<number>(1.25);

  // Financial parameter sliders for synthesis
  const [globalCoeff, setGlobalCoeff] = useState<number>(1.26);
  const [fraisGeneraux, setFraisGeneraux] = useState<number>(10.0);
  const [margeNette, setMargeNette] = useState<number>(13.5);
  const [aleas, setAleas] = useState<number>(2.5);

  const activeLot = lots.find((l) => l.id === activeLotId) || lots[0];

  // Helper calculations
  const getArticleDebourse = (art: ArticleItem): number => {
    return Math.round((art.quantite || 0) * (art.prixUnitaireHT || 0) * 100) / 100;
  };

  const getArticleCoeff = (art: ArticleItem, lotCoeff: number): number => {
    return art.coeffVente || lotCoeff || 1.25;
  };

  const getArticlePrixVente = (art: ArticleItem, lotCoeff: number): number => {
    if (art.prixVenteHT && art.prixVenteHT > 0) return art.prixVenteHT;
    const ds = getArticleDebourse(art);
    const k = getArticleCoeff(art, lotCoeff);
    return Math.round(ds * k * 100) / 100;
  };

  const getOuvrageDebourse = (ouv: OuvrageItem): number => {
    if (ouv.articles.length > 0) {
      return ouv.articles.reduce((sum, a) => sum + getArticleDebourse(a), 0);
    }
    return (ouv.quantite || 0) * (ouv.prixUnitaireHT || 0);
  };

  const getOuvragePrixVente = (ouv: OuvrageItem, lotCoeff: number): number => {
    if (ouv.articles.length > 0) {
      return ouv.articles.reduce((sum, a) => sum + getArticlePrixVente(a, lotCoeff), 0);
    }
    const ds = getOuvrageDebourse(ouv);
    return Math.round(ds * lotCoeff * 100) / 100;
  };

  const getBlocDebourse = (bloc: BlocItem): number => {
    return bloc.ouvrages.reduce((sum, o) => sum + getOuvrageDebourse(o), 0);
  };

  const getBlocPrixVente = (bloc: BlocItem, lotCoeff: number): number => {
    return bloc.ouvrages.reduce((sum, o) => sum + getOuvragePrixVente(o, lotCoeff), 0);
  };

  const getLotDebourse = (lot: LotItem): number => {
    return lot.blocs.reduce((sum, b) => sum + getBlocDebourse(b), 0);
  };

  const getLotPrixVente = (lot: LotItem): number => {
    const k = lot.coefficientVente || globalCoeff;
    return lot.blocs.reduce((sum, b) => sum + getBlocPrixVente(b, k), 0);
  };

  // Global calculations across all lots
  const totalDebourseSec = useMemo(() => {
    return lots.reduce((sum, l) => sum + getLotDebourse(l), 0);
  }, [lots]);

  const totalPrixVenteHT = useMemo(() => {
    return lots.reduce((sum, l) => sum + getLotPrixVente(l), 0);
  }, [lots, globalCoeff]);

  const totalMargeBrute = totalPrixVenteHT - totalDebourseSec;
  const avgCoeff = totalDebourseSec > 0 ? totalPrixVenteHT / totalDebourseSec : 1.26;
  const montantTVA = totalPrixVenteHT * 0.20;
  const prixTotalTTC = totalPrixVenteHT + montantTVA;

  // Real-time expenditure breakdown by nature from active lot
  const activeLotStats = useMemo(() => {
    let mo = 0;
    let fourn = 0;
    let mat = 0;
    let st = 0;

    activeLot.blocs.forEach((b) => {
      b.ouvrages.forEach((o) => {
        o.articles.forEach((a) => {
          const ds = getArticleDebourse(a);
          const res = a.resourceType || a.typeArticle;
          if (res === 'MO' || res === 'main_oeuvre') mo += ds;
          else if (res === 'MATERIEL' || res === 'materiel') mat += ds;
          else if (res === 'ST' || res === 'sous_traitance') st += ds;
          else fourn += ds;
        });
      });
    });

    const tot = mo + fourn + mat + st || 1;
    return {
      mo,
      fourn,
      mat,
      st,
      pctMo: Math.round((mo / tot) * 100),
      pctFourn: Math.round((fourn / tot) * 100),
      pctMat: Math.round((mat / tot) * 100),
      pctSt: Math.round((st / tot) * 100),
    };
  }, [activeLot]);

  // Toggle bloc accordion
  const toggleBloc = (blocId: string) => {
    setExpandedBlocs((prev) => ({
      ...prev,
      [blocId]: prev[blocId] === undefined ? false : !prev[blocId],
    }));
  };

  // Toggle ouvrage accordion
  const toggleOuvrage = (ouvrageId: string) => {
    setExpandedOuvrages((prev) => ({
      ...prev,
      [ouvrageId]: prev[ouvrageId] === undefined ? false : !prev[ouvrageId],
    }));
  };

  // Check if bloc is expanded (default true)
  const isBlocExpanded = (blocId: string): boolean => {
    return expandedBlocs[blocId] === undefined ? true : expandedBlocs[blocId];
  };

  // Check if ouvrage is expanded (default true)
  const isOuvrageExpanded = (ouvrageId: string): boolean => {
    return expandedOuvrages[ouvrageId] === undefined ? true : expandedOuvrages[ouvrageId];
  };

  // Expand / collapse all accordions
  const handleToggleAllAccordions = (expand: boolean) => {
    const bMap: Record<string, boolean> = {};
    const oMap: Record<string, boolean> = {};
    activeLot.blocs.forEach((b) => {
      bMap[b.id] = expand;
      b.ouvrages.forEach((o) => {
        oMap[o.id] = expand;
      });
    });
    setExpandedBlocs(bMap);
    setExpandedOuvrages(oMap);
  };

  // Start inline editing of an article / component
  const handleStartEdit = (art: ArticleItem, lotCoeff: number) => {
    setEditingArticleId(art.id);
    setEditQuantite(art.quantite || 0);
    setEditPU(art.prixUnitaireHT || 0);
    setEditCoeffK(art.coeffVente || lotCoeff);
  };

  // Save inline edit
  const handleSaveEdit = (blocId: string, ouvrageId: string, articleId: string) => {
    if (!onUpdateLots) {
      setEditingArticleId(null);
      return;
    }

    const updatedLots = lots.map((l) => {
      if (l.id !== activeLot.id) return l;

      return {
        ...l,
        blocs: l.blocs.map((b) => {
          if (b.id !== blocId) return b;

          const updatedOuvrages = b.ouvrages.map((o) => {
            if (o.id !== ouvrageId) return o;

            const updatedArticles = o.articles.map((a) => {
              if (a.id !== articleId) return a;
              const newTotalDS = Math.round(editQuantite * editPU * 100) / 100;
              const newPrixVente = Math.round(newTotalDS * editCoeffK * 100) / 100;
              return {
                ...a,
                quantite: editQuantite,
                quantiteRetenue: editQuantite,
                prixUnitaireHT: editPU,
                montantHT: newTotalDS,
                coeffVente: editCoeffK,
                prixVenteHT: newPrixVente,
              };
            });

            const newOuvrageDS = updatedArticles.reduce((acc, curr) => acc + curr.montantHT, 0);
            return {
              ...o,
              montantHT: newOuvrageDS,
              articles: updatedArticles,
            };
          });

          return {
            ...b,
            totalHT: updatedOuvrages.reduce((acc, curr) => acc + curr.montantHT, 0),
            ouvrages: updatedOuvrages,
          };
        }),
      };
    });

    onUpdateLots(updatedLots);
    setEditingArticleId(null);
  };

  // Update lot's overall coefficient K
  const handleUpdateLotCoeff = (newK: number) => {
    if (!onUpdateLots) return;
    const updatedLots = lots.map((l) => {
      if (l.id !== activeLot.id) return l;
      return {
        ...l,
        coefficientVente: newK,
      };
    });
    onUpdateLots(updatedLots);
  };

  // Nature badge renderer
  const getNatureBadge = (nature?: string, resourceType?: ResourceType) => {
    const key = (resourceType || nature || 'materiau').toLowerCase();
    if (key.includes('mo') || key.includes('main')) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
          <HardHat className="h-3 w-3" />
          <span>MO</span>
        </span>
      );
    }
    if (key.includes('mat') && !key.includes('fourn')) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <Wrench className="h-3 w-3" />
          <span>MATÉRIEL</span>
        </span>
      );
    }
    if (key.includes('st') || key.includes('sous')) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Truck className="h-3 w-3" />
          <span>ST</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
        <Boxes className="h-3 w-3" />
        <span>FOURNITURE</span>
      </span>
    );
  };

  const activeLotCoeff = activeLot.coefficientVente || 1.25;
  const activeLotDS = getLotDebourse(activeLot);
  const activeLotPV = getLotPrixVente(activeLot);
  const activeLotMarge = activeLotPV - activeLotDS;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & FINANCIAL STATUS TOOLBAR                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF4FF] text-[#1B4591] shadow-xs dark:bg-slate-800 dark:text-sky-400">
            <Calculator className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#1B4591] dark:text-sky-400">
                Chiffrage & Étude des Déboursés
              </h2>
              {chiffrageStatus === 'VALIDE' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEFFF1] px-3.5 py-1 text-xs font-bold text-[#16A148]">
                  <CheckCircle2 className="h-4 w-4" /> Validé & Verrouillé
                </span>
              ) : chiffrageStatus === 'REJETE' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700">
                  <XCircle className="h-4 w-4" /> Chiffrage Refusé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#1B4591] dark:bg-slate-800 dark:text-sky-300">
                  En cours d'optimisation
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Détection des quantités depuis les métrés, calcul des déboursés secs (DS), coefficients multiplicateurs (K) et marges brutes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenRejectModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <XCircle className="h-4 w-4" />
            <span>Refuser</span>
          </button>
          <button
            type="button"
            onClick={onOpenApproveModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#16A148] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Valider le chiffrage</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL-VIEW SWITCHER & LOT SELECTION TABS                                */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-800">
        {/* Lot Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {lots.map((lot) => {
            const isSelected = lot.id === activeLotId;
            const is5LevelLot = lot.id === 'lot-02' || lot.code === 'LOT 02';
            const lotPV = getLotPrixVente(lot);

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
                <span className="hidden sm:inline font-normal opacity-90 truncate max-w-[170px]">
                  {lot.titre}
                </span>

                {is5LevelLot && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
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
                    isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {(lotPV / 1000).toFixed(0)} k€ PV
                </span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Arborescence WBS vs Synthèse */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('arborescence')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              viewMode === 'arborescence'
                ? 'bg-white text-[#1B4591] shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#1B4591] dark:text-sky-400" />
            <span>🌳 Arborescence & Déboursés WBS</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('synthese')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors ${
              viewMode === 'synthese'
                ? 'bg-white text-[#1B4591] shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <PieChart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>📊 Synthèse Rentabilité & Coefficients</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REPÈRES COULEURS DES 5 NIVEAUX HIÉRARCHIQUES (IDENTIQUE AUX MÉTRÉS)   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Repères Couleurs des 5 Niveaux :
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Niv 1 : LOT
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-2.5 py-1 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              Niv 2 : BLOC / CHAPITRE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Niv 3 : OUVRAGE / ENSEMBLE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Niv 4 : ARTICLE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1 text-orange-950 dark:bg-orange-950/60 dark:text-orange-200">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Niv 5 : COMPOSANT (DÉBOURSÉ)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BANDEAU FINANCIER DU LOT ACTIF (NIVEAU 1 · LOT)                        */}
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
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Quantités Métrées Validées
              </span>
            </div>
            <h2 className="text-lg font-extrabold sm:text-xl tracking-tight">
              {activeLot.titre}
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl">
              Détection intégrale de la hiérarchie depuis les métrés : déboursés réels calculés et coefficient multiplicateur appliqué par poste.
            </p>
          </div>

          {/* Financial Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-right backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-semibold">
                Total Déboursé Sec (DS)
              </span>
              <span className="font-mono text-base font-black text-white">
                {activeLotDS.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-right backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-end gap-1.5">
                <span className="block text-[10px] text-blue-200 uppercase font-semibold">
                  Coeff K
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="2.0"
                  value={activeLotCoeff}
                  onChange={(e) => handleUpdateLotCoeff(parseFloat(e.target.value) || 1.25)}
                  className="w-14 rounded bg-white/20 px-1 py-0.5 text-right font-mono text-xs font-bold text-white focus:bg-white focus:text-slate-900 focus:outline-none"
                  title="Modifier le coefficient multiplicateur K de ce lot"
                />
              </div>
              <span className="block text-[10px] text-blue-200 uppercase font-semibold mt-1">
                Prix de Vente HT (PV)
              </span>
              <span className="font-mono text-base font-black text-emerald-300">
                {activeLotPV.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>

            <div className="rounded-xl bg-white/10 p-3 text-right backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-blue-200 uppercase font-semibold">
                Marge Brute HT
              </span>
              <span className="font-mono text-base font-black text-amber-300">
                +{activeLotMarge.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
              </span>
              <span className="block text-[10px] text-amber-200">
                {activeLotPV > 0 ? ((activeLotMarge / activeLotPV) * 100).toFixed(1) : 0} % du PV
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : ARBORESCENCE WBS ET DÉBOURSÉS DÉTECTÉS (DEMANDE UTILISATEUR)      */}
      {/* ========================================================================= */}
      {viewMode === 'arborescence' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1B4591] dark:bg-slate-800 dark:text-sky-400">
                <Boxes className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Arborescence Complète & Décomposition des Coûts
                </h3>
                <p className="text-xs text-slate-500">
                  {activeLot.blocs.length} bloc(s) · {activeLot.blocs.reduce((sum, b) => sum + b.ouvrages.length, 0)} ouvrage(s)
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
                  placeholder="Filtrer dans ce lot..."
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

              {/* Expand / Collapse buttons */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggleAllAccordions(true)}
                  className="rounded-lg px-2.5 py-1 font-bold text-slate-700 hover:bg-white hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Tout déplier
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllAccordions(false)}
                  className="rounded-lg px-2.5 py-1 font-bold text-slate-700 hover:bg-white hover:shadow-xs dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Tout replier
                </button>
              </div>
            </div>
          </div>

          {/* Blocs & Ouvrages Tree */}
          <div className="space-y-6">
            {activeLot.blocs.map((bloc) => {
              const isBlocOpen = isBlocExpanded(bloc.id);
              const blocDS = getBlocDebourse(bloc);
              const blocPV = getBlocPrixVente(bloc, activeLotCoeff);
              const blocMarge = blocPV - blocDS;

              return (
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
                        {isBlocOpen ? (
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

                    <div className="flex items-center gap-5">
                      <span className="text-xs text-purple-800 font-medium dark:text-purple-300">
                        {bloc.ouvrages.length} ouvrage{bloc.ouvrages.length > 1 ? 's' : ''}
                      </span>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
                          Déboursé Sec
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {blocDS.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          Prix Vente HT
                        </span>
                        <span className="font-mono text-sm font-black text-purple-950 dark:text-white">
                          {blocPV.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloc Ouvrages List */}
                  {isBlocOpen && (
                    <div className="divide-y divide-slate-100 p-2 dark:divide-slate-800">
                      {bloc.ouvrages.map((ouvrage) => {
                        const isOuvOpen = isOuvrageExpanded(ouvrage.id);
                        const isEnsemble = ouvrage.code === '5.2.1' || ouvrage.code === '5.1.1' || ouvrage.role === 'ENSEMBLE';
                        const ouvDS = getOuvrageDebourse(ouvrage);
                        const ouvPV = getOuvragePrixVente(ouvrage, activeLotCoeff);
                        const ouvPUVente = ouvrage.quantite && ouvrage.quantite > 0 ? ouvPV / ouvrage.quantite : 0;
                        const ouvPUDS = ouvrage.quantite && ouvrage.quantite > 0 ? ouvDS / ouvrage.quantite : 0;

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
                                  onClick={() => toggleOuvrage(ouvrage.id)}
                                  className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:text-slate-800"
                                >
                                  {isOuvOpen ? (
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
                              </div>

                              {/* Right: Métré Qty, PU DS, Total DS, Coeff K, Total Vente */}
                              <div className="flex items-center gap-4 text-xs">
                                {ouvrage.quantite !== undefined && (
                                  <div className="text-right">
                                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                                      Quantité Métré
                                    </span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                      {ouvrage.quantite.toLocaleString('fr-FR')}{' '}
                                      <span className="text-slate-500 font-normal">{ouvrage.unite}</span>
                                    </span>
                                  </div>
                                )}

                                <div className="text-right">
                                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                                    Déboursé Sec
                                  </span>
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                    {ouvDS.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                                    Coeff K
                                  </span>
                                  <span className="font-mono font-black text-blue-600 dark:text-sky-400">
                                    {activeLotCoeff.toFixed(2)}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="block text-[10px] text-emerald-600 uppercase font-bold">
                                    Total Prix Vente
                                  </span>
                                  <span className="font-mono text-xs font-black text-emerald-950 dark:text-emerald-300">
                                    {ouvPV.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Articles & Components Table (NIVEAUX 4 & 5) */}
                            {isOuvOpen && ouvrage.articles.length > 0 && (
                              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                                    <tr>
                                      <th className="py-2.5 px-3 w-28">Niveau</th>
                                      <th className="py-2.5 px-2 w-24">Code WBS</th>
                                      <th className="py-2.5 px-3 min-w-[220px]">Désignation du Poste</th>
                                      <th className="py-2.5 px-2 w-28">Nature</th>
                                      <th className="py-2.5 px-2 text-right w-24">Quantité (Métré)</th>
                                      <th className="py-2.5 px-2 text-center w-14">Unité</th>
                                      <th className="py-2.5 px-2 text-right w-28">P.U. Déboursé (€)</th>
                                      <th className="py-2.5 px-2 text-right w-28">Total DS (€)</th>
                                      <th className="py-2.5 px-2 text-center w-20">Coeff K</th>
                                      <th className="py-2.5 px-2 text-right w-28">P.U. Vente (€)</th>
                                      <th className="py-2.5 px-2 text-right w-32">Total Vente HT (€)</th>
                                      <th className="py-2.5 px-2 text-right w-28">Marge (€)</th>
                                      <th className="py-2.5 px-2 text-center w-16">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {ouvrage.articles.map((art) => {
                                      const isComp = art.level === 5 || art.code.split('.').length >= 4;
                                      const isEditing = editingArticleId === art.id;
                                      const hasSubComponents = art.components && art.components.length > 0;

                                      const artDS = getArticleDebourse(art);
                                      const artK = getArticleCoeff(art, activeLotCoeff);
                                      const artPV = getArticlePrixVente(art, activeLotCoeff);
                                      const artPUVente = art.quantite && art.quantite > 0 ? artPV / art.quantite : 0;
                                      const artMarge = artPV - artDS;

                                      return (
                                        <React.Fragment key={art.id}>
                                          <tr
                                            className={`transition-colors ${
                                              isComp
                                                ? 'border-l-[4px] border-l-orange-500 bg-orange-50/20 hover:bg-orange-100/40 dark:bg-orange-950/15'
                                                : 'border-l-[4px] border-l-sky-500 bg-sky-50/10 hover:bg-sky-100/30 dark:bg-sky-950/10'
                                            }`}
                                          >
                                            {/* Level Badge */}
                                            <td className="py-2 px-3">
                                              <span
                                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs ${
                                                  isComp ? 'bg-orange-500' : 'bg-sky-500'
                                                }`}
                                              >
                                                {isComp ? 'NIV 5 · COMP' : 'NIV 4 · ART'}
                                              </span>
                                            </td>

                                            {/* Code WBS */}
                                            <td className="py-2 px-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                              {art.code}
                                            </td>

                                            {/* Designation */}
                                            <td
                                              className={`py-2 px-3 font-medium ${
                                                isComp
                                                  ? 'pl-6 text-orange-950 dark:text-orange-200'
                                                  : 'text-slate-800 dark:text-slate-200'
                                              }`}
                                            >
                                              {isComp ? `↳ ${art.designation}` : art.designation}
                                            </td>

                                            {/* Nature */}
                                            <td className="py-2 px-2">
                                              {getNatureBadge(art.typeArticle, art.resourceType)}
                                            </td>

                                            {/* Quantité Métré */}
                                            <td className="py-2 px-2 text-right font-mono text-xs font-bold">
                                              {isEditing ? (
                                                <input
                                                  type="number"
                                                  value={editQuantite}
                                                  onChange={(e) => setEditQuantite(parseFloat(e.target.value) || 0)}
                                                  className="w-20 rounded border border-blue-400 bg-white px-1.5 py-0.5 text-right font-mono text-xs dark:bg-slate-800"
                                                />
                                              ) : (
                                                art.quantite.toLocaleString('fr-FR')
                                              )}
                                            </td>

                                            {/* Unité */}
                                            <td className="py-2 px-2 text-center text-slate-500 font-mono text-xs">
                                              {art.unite}
                                            </td>

                                            {/* P.U. Déboursé Sec */}
                                            <td className="py-2 px-2 text-right font-mono text-xs">
                                              {isEditing ? (
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={editPU}
                                                  onChange={(e) => setEditPU(parseFloat(e.target.value) || 0)}
                                                  className="w-20 rounded border border-blue-400 bg-white px-1.5 py-0.5 text-right font-mono text-xs dark:bg-slate-800"
                                                />
                                              ) : (
                                                `${(art.prixUnitaireHT || 0).toLocaleString('fr-FR', {
                                                  minimumFractionDigits: 2,
                                                })} €`
                                              )}
                                            </td>

                                            {/* Total Déboursé Sec */}
                                            <td className="py-2 px-2 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                              {isEditing
                                                ? `${(editQuantite * editPU).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
                                                : `${artDS.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                                            </td>

                                            {/* Coeff K */}
                                            <td className="py-2 px-2 text-center font-mono text-xs">
                                              {isEditing ? (
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  value={editCoeffK}
                                                  onChange={(e) => setEditCoeffK(parseFloat(e.target.value) || 1.25)}
                                                  className="w-16 rounded border border-blue-400 bg-white px-1.5 py-0.5 text-center font-mono text-xs dark:bg-slate-800"
                                                />
                                              ) : (
                                                <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                  {artK.toFixed(2)}
                                                </span>
                                              )}
                                            </td>

                                            {/* P.U. Vente HT */}
                                            <td className="py-2 px-2 text-right font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                              {isEditing
                                                ? `${(editPU * editCoeffK).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
                                                : `${artPUVente.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                                            </td>

                                            {/* Total Vente HT */}
                                            <td className="py-2 px-2 text-right font-mono text-xs font-black text-emerald-900 dark:text-emerald-300">
                                              {isEditing
                                                ? `${(editQuantite * editPU * editCoeffK).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
                                                : `${artPV.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                                            </td>

                                            {/* Marge Brute */}
                                            <td className="py-2 px-2 text-right font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                                              +{artMarge.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                                            </td>

                                            {/* Actions */}
                                            <td className="py-2 px-2 text-center">
                                              {isEditing ? (
                                                <div className="flex items-center justify-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleSaveEdit(bloc.id, ouvrage.id, art.id)}
                                                    className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                                                    title="Sauvegarder"
                                                  >
                                                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => setEditingArticleId(null)}
                                                    className="rounded p-1 text-rose-500 hover:bg-rose-100"
                                                    title="Annuler"
                                                  >
                                                    <X className="h-3.5 w-3.5 stroke-[2.5]" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => handleStartEdit(art, activeLotCoeff)}
                                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                                  title="Ajuster le déboursé ou le coefficient"
                                                >
                                                  <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                              )}
                                            </td>
                                          </tr>

                                          {/* Nested Level 5 Components if any */}
                                          {hasSubComponents &&
                                            art.components!.map((comp) => {
                                              const compDS = getArticleDebourse(comp);
                                              return (
                                                <tr
                                                  key={comp.id}
                                                  className="border-l-[4px] border-l-orange-400 bg-orange-50/35 hover:bg-orange-100/50 dark:bg-orange-950/20 text-xs transition-colors"
                                                >
                                                  <td className="py-1.5 px-3 pl-4">
                                                    <span className="rounded-md bg-orange-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                                                      NIV 5 · {comp.resourceType || 'COMP'}
                                                    </span>
                                                  </td>
                                                  <td className="py-1.5 px-2 font-mono text-[10px] text-orange-900 dark:text-orange-200 font-bold">
                                                    {comp.code}
                                                  </td>
                                                  <td className="py-1.5 px-3 pl-6 font-normal text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="text-orange-500 font-bold">↳</span>
                                                      <span className="italic">{comp.designation}</span>
                                                    </div>
                                                  </td>
                                                  <td className="py-1.5 px-2">
                                                    {getNatureBadge(comp.typeArticle, comp.resourceType)}
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
                                                    {compDS.toLocaleString('fr-FR', {
                                                      minimumFractionDigits: 2,
                                                    })}{' '}
                                                    €
                                                  </td>
                                                  <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 font-mono">
                                                    -
                                                  </td>
                                                  <td className="py-1.5 px-2 text-right text-[10px] text-slate-400 font-mono">
                                                    -
                                                  </td>
                                                  <td className="py-1.5 px-2 text-right text-[10px] text-slate-400 font-mono">
                                                    Inclus article
                                                  </td>
                                                  <td className="py-1.5 px-2 text-right text-[10px] text-slate-400 font-mono">
                                                    -
                                                  </td>
                                                  <td className="py-1.5 px-2 text-center text-[10px] text-slate-400 font-mono">
                                                    Déboursé
                                                  </td>
                                                </tr>
                                              );
                                            })}
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
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : SYNTHÈSE RENTABILITÉ & PARAMÈTRES FINANCIERS                      */}
      {/* ========================================================================= */}
      {viewMode === 'synthese' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Financial KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Déboursé Sec */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Déboursé Sec (DS)
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-[#1B4591] dark:text-sky-400">
                {Math.round(totalDebourseSec).toLocaleString('fr-FR')} € HT
              </div>
              <span className="text-[11px] text-slate-400">Coûts directs d'exécution chantier</span>
            </div>

            {/* Card 2: Coefficient K Moyen */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Coefficient Moyen (K)
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-[#0394D7]">
                {avgCoeff.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400">Couvre Frais Généraux + Marge</span>
            </div>

            {/* Card 3: Prix de Vente HT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prix de Vente Total (PV HT)
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-[#16A148]">
                {Math.round(totalPrixVenteHT).toLocaleString('fr-FR')} € HT
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Marge brute : +{Math.round(totalMargeBrute).toLocaleString('fr-FR')} €
              </span>
            </div>

            {/* Card 4: Montant Total TTC */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#1B4591] to-[#163a7a] p-5 text-white shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                Montant Offre Client TTC
              </span>
              <div className="mt-2 font-mono text-2xl font-black">
                {Math.round(prixTotalTTC).toLocaleString('fr-FR')} € TTC
              </div>
              <span className="text-[11px] text-sky-200">
                TVA 20% incluse ({Math.round(montantTVA).toLocaleString('fr-FR')} €)
              </span>
            </div>
          </div>

          {/* Sliders Interactive Panel & Nature Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Sliders */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Sliders className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Paramètres Financiers & Coefficients
                </h3>
              </div>

              {/* Slider 1: Coeff de vente */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Coefficient de Vente Général :
                  </span>
                  <span className="font-mono text-sm font-bold text-[#1B4591] dark:text-sky-400">
                    {globalCoeff.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.10"
                  max="1.45"
                  step="0.01"
                  value={globalCoeff}
                  onChange={(e) => setGlobalCoeff(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#1B4591] dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.10 (Minimum)</span>
                  <span>1.26 (Recommandé BTP)</span>
                  <span>1.45 (Prestige)</span>
                </div>
              </div>

              {/* Slider 2: Frais généraux */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Frais Généraux d'Entreprise (FG) :
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {fraisGeneraux.toFixed(1)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="18"
                  step="0.5"
                  value={fraisGeneraux}
                  onChange={(e) => setFraisGeneraux(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#0394D7] dark:bg-slate-700"
                />
              </div>

              {/* Slider 3: Marge nette */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Marge Nette / Bénéfice Visé :
                  </span>
                  <span className="font-mono text-sm font-bold text-[#16A148]">
                    {margeNette.toFixed(1)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="22"
                  step="0.5"
                  value={margeNette}
                  onChange={(e) => setMargeNette(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#16A148] dark:bg-slate-700"
                />
              </div>

              {/* Slider 4: Aléas */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Provision pour Aléas & Imprévus :
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-600">
                    {aleas.toFixed(1)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={aleas}
                  onChange={(e) => setAleas(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500 dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Right: Cost breakdown by nature */}
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Boxes className="h-5 w-5 text-[#1B4591] dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Répartition par Nature ({activeLot.code})
                </h3>
              </div>

              {/* Progress bar visual */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 flex shadow-inner">
                <div style={{ width: `${activeLotStats.pctFourn}%` }} className="bg-[#1B4591]" title={`Fournitures (${activeLotStats.pctFourn}%)`} />
                <div style={{ width: `${activeLotStats.pctMo}%` }} className="bg-[#0394D7]" title={`Main d'œuvre (${activeLotStats.pctMo}%)`} />
                <div style={{ width: `${activeLotStats.pctMat}%` }} className="bg-[#16A148]" title={`Matériel (${activeLotStats.pctMat}%)`} />
                <div style={{ width: `${activeLotStats.pctSt}%` }} className="bg-amber-500" title={`Sous-traitance (${activeLotStats.pctSt}%)`} />
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#1B4591]" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Fournitures & Matériaux ({activeLotStats.pctFourn}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(activeLotStats.fourn).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#0394D7]" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Main d'œuvre ({activeLotStats.pctMo}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(activeLotStats.mo).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#16A148]" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Matériel & Engins ({activeLotStats.pctMat}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(activeLotStats.mat).toLocaleString('fr-FR')} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Sous-traitance ({activeLotStats.pctSt}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(activeLotStats.st).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
