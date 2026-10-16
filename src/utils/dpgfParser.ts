import * as XLSX from 'xlsx';
import { StagingTreeNode, LotItem, BlocItem, OuvrageItem, ArticleItem } from '../types/dpgf';

export interface SheetConfig {
  headerRow: string;
  footerRow: string | null;
  colDesignation: string;
  colNom: string;
  colType?: string;
  colUnite: string;
  colQte: string;
  colPu: string;
  colPrixTotal: string;
  autreColonnes: Record<string, string>;
  colRecapLot: string;
  colRecapHt: string;
  colRecapTva: string;
  colRecapTtc: string;
}

export const columnNumberToLetters = (colIndex: number): string => {
  let temp = colIndex;
  let letters = '';
  while (temp >= 0) {
    letters = String.fromCharCode((temp % 26) + 65) + letters;
    temp = Math.floor(temp / 26) - 1;
  }
  return letters;
};

export const lettersToColumnNumber = (letters: string): number => {
  if (!letters) return -1;
  let result = 0;
  const upper = letters.toUpperCase().trim();
  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      result = result * 26 + (code - 64);
    }
  }
  return result - 1;
};

export const HEADER_KEYWORDS = [
  /^n[°o]?\s*(art|article)?/i,
  /d[eé]sig/i,
  /libell[eé]/i,
  /unit[eé]/i,
  /\bq\.?t[eé]\b|quantit/i,
  /p\.?u|prix\s*unit/i,
  /total/i,
  /montant/i,
  /postes/i,
  /cctp/i,
  /lots?/i,
];

export const autoDetectHeaderRow = (rows: (string | number)[][]): number => {
  if (!rows || rows.length === 0) return 0;
  for (let r = 0; r < Math.min(30, rows.length); r++) {
    const row = rows[r];
    if (!row) continue;
    const matchCount = row.filter((c) =>
      HEADER_KEYWORDS.some((kw) => kw.test(String(c ?? '').trim()))
    ).length;
    if (matchCount >= 2) {
      return r;
    }
  }
  return 0;
};

export const autoDetectSheetConfig = (
  sheetName: string,
  rows: (string | number)[][]
): SheetConfig => {
  const isRecap =
    sheetName.toUpperCase().includes('RECAP') ||
    sheetName.toUpperCase().includes('SYNTHESE');

  const headerIdx = autoDetectHeaderRow(rows);
  const headerRowStr = String(headerIdx + 1);

  const cfg: SheetConfig = {
    headerRow: headerRowStr,
    footerRow: null,
    colDesignation: '',
    colNom: '',
    colUnite: '',
    colQte: '',
    colPu: '',
    colPrixTotal: '',
    autreColonnes: {},
    colRecapLot: '',
    colRecapHt: '',
    colRecapTva: '',
    colRecapTtc: '',
  };

  const headerCells = rows[headerIdx] || [];

  if (isRecap) {
    headerCells.forEach((c, i) => {
      const letter = columnNumberToLetters(i);
      const text = String(c ?? '').trim().toLowerCase();
      if (/lots?|d[eé]signation|libell[eé]/i.test(text)) cfg.colRecapLot = letter;
      else if (/montant|total\s*ht/i.test(text)) cfg.colRecapHt = letter;
      else if (/tva/i.test(text)) cfg.colRecapTva = letter;
      else if (/total\s*ttc|ttc/i.test(text)) cfg.colRecapTtc = letter;
    });
    // Fallback if not labeled
    if (!cfg.colRecapLot && headerCells.length > 1) cfg.colRecapLot = 'B';
    if (!cfg.colRecapHt && headerCells.length > 2) cfg.colRecapHt = 'C';
  } else {
    headerCells.forEach((c, i) => {
      const letter = columnNumberToLetters(i);
      const text = String(c ?? '').trim().toLowerCase();
      if (/^n[°o]?\b|code|rep[eè]re|^art(\.|icle)?\b/i.test(text)) {
        if (!cfg.colNom) cfg.colNom = letter;
      } else if (/postes?|cctp|d[eé]sig|libell[eé]|ouvrages?|intitul[eé]/i.test(text)) {
        if (!cfg.colDesignation) cfg.colDesignation = letter;
      } else if (/^(u|u\.|un|ut|unit[eé]s?|unit)$/i.test(text) || /\b(unit[eé]s?|mesure)\b/i.test(text)) {
        if (!cfg.colUnite) cfg.colUnite = letter;
      } else if (/^(qte|qt[eé]|q\.t[eé]|quantit[eé]s?|quantite|nb|nombre|vol|volume)$/i.test(text) || /\b(quantit[eé]|q\.?t[eé])\b/i.test(text)) {
        if (!cfg.colQte) cfg.colQte = letter;
      } else if (/^(pu|p\.u\.|p\.u|prix\s*unit(\.|aire)?|pu\s*ht|p\.u\.\s*ht)$/i.test(text) || /\b(prix\s*unit|p\.?u\.?\s*ht)\b/i.test(text)) {
        if (!cfg.colPu) cfg.colPu = letter;
      } else if (/^(total|montant|total\s*ht|montant\s*ht|prix\s*total(\s*ht)?)$/i.test(text) || /\b(montant(\s*ht)?|total\s*ht)\b/i.test(text)) {
        if (!cfg.colPrixTotal) cfg.colPrixTotal = letter;
      }
    });

    // Content-based heuristic if colUnite is still missing: inspect first 20 data rows
    if (!cfg.colUnite) {
      const unitHits: Record<string, number> = {};
      const knownUnits = /^(m[²23³]|ml|u|u\.|ens|ensemble|kg|t|tonne|h|j|jour|mois|forfait|fft|ff|pm|p\.m\.|lump)$/i;
      const startR = headerIdx + 1;
      const endR = Math.min(rows.length, startR + 25);
      for (let r = startR; r < endR; r++) {
        const row = rows[r];
        if (!row) continue;
        row.forEach((cellVal, colIdx) => {
          const valStr = String(cellVal ?? '').trim();
          if (valStr && knownUnits.test(valStr)) {
            const ltr = columnNumberToLetters(colIdx);
            unitHits[ltr] = (unitHits[ltr] || 0) + 1;
          }
        });
      }
      let bestUnitCol = '';
      let bestUnitCount = 0;
      Object.entries(unitHits).forEach(([ltr, count]) => {
        if (count >= 2 && count > bestUnitCount) {
          bestUnitCol = ltr;
          bestUnitCount = count;
        }
      });
      if (bestUnitCol) {
        cfg.colUnite = bestUnitCol;
      }
    }

    // Fallbacks tailored to standard BTP DPGF templates if header keywords were missing
    if (!cfg.colNom && headerCells.length > 0) cfg.colNom = 'A';
    if (!cfg.colDesignation && headerCells.length > 1) cfg.colDesignation = 'B';
    if (!cfg.colUnite && headerCells.length > 4) cfg.colUnite = 'E';
    if (!cfg.colQte && headerCells.length > 5) cfg.colQte = 'F';
    if (!cfg.colPu && headerCells.length > 6) cfg.colPu = 'G';
    if (!cfg.colPrixTotal && headerCells.length > 7) cfg.colPrixTotal = 'H';
  }

  return cfg;
};

export interface ParsedWBSInfo {
  code: string;
  designation: string;
  level: number; // 1 to 8
  role: NodeRole;
}

export const extractProjectTitle = (rawSheetsData: Record<string, (string | number)[][]>): string => {
  const preferredSheets = ['RECAP', 'LOT 00', 'LOT 01', 'LOT 02', ...Object.keys(rawSheetsData)];
  for (const sName of preferredSheets) {
    const rows = rawSheetsData[sName];
    if (!rows || rows.length === 0) continue;
    const r0 = rows[0];
    if (r0 && r0[0] && typeof r0[0] === 'string' && r0[0].trim().length > 15) {
      const lines = r0[0].split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const mainLine = lines[0];
        const subLine = lines.find((l) => /paris|rue|avenue|bld|boulevard/i.test(l));
        if (subLine && !mainLine.includes(subLine)) {
          return `${mainLine} - ${subLine}`;
        }
        return mainLine;
      }
    }
  }
  return 'RÉHABILITATION DE 6 LOGEMENTS ET RESTRUCTURATION LOURDE POUR CRÉATION DE 7 LOGEMENTS - 42 AVENUE JEAN JAURÈS PARIS 19ÈME';
};

/**
 * Detects the WBS Level (1 to 8) based on relative numbering pattern:
 * - baseDots : lowest dot depth in the lot (e.g. 1 if lot starts with "3.2" or "2.1", 0 if "1")
 * - relDepth = dotCount - baseDots :
 *   - relDepth = 0 (e.g. "3.2", "2.1") -> Level 4 : CHAPITRE / BLOC
 *   - relDepth = 1 (e.g. "3.2.1", "2.1.1") -> Level 5 : ENSEMBLE / TYPE
 *   - relDepth = 2 (e.g. "3.2.1.1", "2.2.2.1") -> Level 6 : OUVRAGE / ARTICLE
 *   - relDepth >= 3 or letter (.a, .b) -> Level 7 : COMPONENT
 *   - Text / NOTA / PM -> Level 8 : NOTE / CTRL
 */
export const detectWBSLevel = (
  codeRaw: string,
  desigRaw: string,
  hasPriceOrQty: boolean,
  unitRaw?: string,
  baseDots: number = 1
): ParsedWBSInfo => {
  let cleanCode = (codeRaw || '').trim();
  let cleanDesig = (desigRaw || '').trim();

  // If code is empty or just a pure numeric row index, check if designation starts with WBS pattern
  if (!cleanCode || (/^\d+$/.test(cleanCode) && cleanCode.length > 2)) {
    const desigMatch = cleanDesig.match(/^(\d+(\.\d+)*(\.[a-zA-Z])?)\s*[-–:.)]?\s+(.*)$/);
    if (desigMatch) {
      cleanCode = desigMatch[1];
      cleanDesig = desigMatch[4] || cleanDesig;
    }
  }

  // Remove trailing dot: "1.1." -> "1.1"
  cleanCode = cleanCode.replace(/\.$/, '');

  // Detect NOTE / CTRL text
  const isNoteText =
    /^(nota|note|observation|remarque|pour m[eé]moire|\bpm\b|sans objet|conditions?|prescriptions?)/i.test(
      cleanDesig
    ) ||
    /^(tous les postes|l'entreprise est autoris|attention)/i.test(cleanDesig) ||
    /^(pm|pour m[eé]moire)/i.test(unitRaw || '');

  if (!cleanCode && (isNoteText || (!hasPriceOrQty && cleanDesig.length > 50))) {
    return {
      code: cleanCode || 'NOTE',
      designation: cleanDesig,
      level: 7,
      role: 'NOTE',
    };
  }

  if (cleanCode) {
    // If code has letter suffix e.g. "2.1.1.a" or ends with letter
    if (/[a-zA-Z]$/.test(cleanCode) && cleanCode.includes('.')) {
      return {
        code: cleanCode,
        designation: cleanDesig,
        level: 6,
        role: 'COMPONENT',
      };
    }

    const segments = cleanCode.split('.').filter(Boolean);
    const dotCount = Math.max(0, segments.length - 1);
    const relDepth = Math.max(0, dotCount - baseDots);

    if (relDepth === 0) {
      // 1st designation level in lot (e.g. 3.2 or 2.1) -> Position 4 : CHAPITRE / BLOC
      return {
        code: cleanCode,
        designation: cleanDesig,
        level: 4,
        role: 'CHAPITRE',
      };
    } else if (relDepth === 1) {
      // 2nd designation level in lot (e.g. 3.2.1 or 2.1.1) -> Position 5 : ENSEMBLE
      return {
        code: cleanCode,
        designation: cleanDesig,
        level: 5,
        role: 'ENSEMBLE',
      };
    } else if (relDepth === 2) {
      // 3rd designation level (e.g. 3.2.1.1) -> Position 5 : ARTICLE (MÊME POSITION 5 QUE ENSEMBLE)
      return {
        code: cleanCode,
        designation: cleanDesig,
        level: 5,
        role: 'ARTICLE',
      };
    } else if (relDepth >= 3) {
      // Position 6 : COMPONENT
      return {
        code: cleanCode,
        designation: cleanDesig,
        level: 6,
        role: 'COMPONENT',
      };
    }
  }

  // Fallback if no WBS code but has prices/quantities:
  if (hasPriceOrQty) {
    return {
      code: cleanCode || 'ART',
      designation: cleanDesig,
      level: 5,
      role: 'ARTICLE',
    };
  }

  // Pure text note or section description -> Position 7 : NOTE
  return {
    code: cleanCode || 'NOTE',
    designation: cleanDesig,
    level: 7,
    role: 'NOTE',
  };
};

/**
 * Parses raw sheets into 7-level hierarchical StagingTreeNode structure
 */
export const buildHierarchicalTreeFromSheets = (
  selectedSheets: string[],
  sheetConfigs: Record<string, SheetConfig>,
  rawSheetsData: Record<string, (string | number)[][]>,
  sheetLotMap: Record<string, string>
): StagingTreeNode[] => {
  const resultLots: StagingTreeNode[] = [];

  for (const sheetName of selectedSheets) {
    const isRecap =
      sheetName.toUpperCase().includes('RECAP') ||
      sheetName.toUpperCase().includes('SYNTHESE');
    const rows = rawSheetsData[sheetName] || [];
    if (rows.length === 0) continue;

    const cfg = sheetConfigs[sheetName] || autoDetectSheetConfig(sheetName, rows);
    const headerRowIdx = parseInt(cfg.headerRow, 10) - 1;
    const footerRowIdx = cfg.footerRow ? parseInt(cfg.footerRow, 10) - 1 : rows.length - 1;

    const assignedLotName = sheetLotMap[sheetName] || sheetName;

    if (isRecap) {
      // Build Recap / Synthese tree node
      const colLotIdx = lettersToColumnNumber(cfg.colRecapLot);
      const colHtIdx = lettersToColumnNumber(cfg.colRecapHt);

      const recapChildren: StagingTreeNode[] = [];
      let recapTotalHT = 0;

      for (let r = headerRowIdx + 1; r <= footerRowIdx && r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const lotTitle = colLotIdx >= 0 ? String(row[colLotIdx] ?? '').trim() : '';
        const lotAmountRaw =
          colHtIdx >= 0
            ? String(row[colHtIdx] ?? '')
                .replace(/\s+/g, '')
                .replace(',', '.')
            : '0';
        const lotAmount = parseFloat(lotAmountRaw) || 0;

        if (lotTitle) {
          recapTotalHT += lotAmount;
          recapChildren.push({
            id: `recap-line-${r}`,
            code: `LOT ${recapChildren.length.toString().padStart(2, '0')}`,
            designation: lotTitle,
            role: 'LOT',
            level: 2,
            sheetName,
            calcMode: 'SUM',
            inclusionMode: 'BASE',
            montantHT: lotAmount,
            confidenceScore: 0.99,
            checked: true,
            isExpanded: true,
            sourceRef: { sheet: sheetName, row: r + 1 },
          });
        }
      }

      resultLots.push({
        id: `stg-recap-${sheetName}`,
        code: 'SYNTHÈSE',
        designation: 'Récapitulatif Financier Général',
        role: 'PROJECT',
        level: 1,
        sheetName,
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: recapTotalHT,
        confidenceScore: 1.0,
        checked: true,
        isExpanded: true,
        children: recapChildren,
        sourceRef: { sheet: sheetName, row: 1 },
      });
      continue;
    }

    // Standard Lot parsing
    const colCodeIdx = lettersToColumnNumber(cfg.colNom);
    const colDesigIdx = lettersToColumnNumber(cfg.colDesignation);
    const colUnitIdx = lettersToColumnNumber(cfg.colUnite);
    const colQteIdx = lettersToColumnNumber(cfg.colQte);
    const colPuIdx = lettersToColumnNumber(cfg.colPu);
    const colTotalIdx = lettersToColumnNumber(cfg.colPrixTotal);

    // Pre-scan sheet codes to detect minimum dot depth (baseDots)
    // e.g. if codes are 3.1, 3.2, 3.8.1 -> minDots = 1
    // e.g. if codes are 1, 2, 3.1 -> minDots = 0
    const validCodes: string[] = [];
    for (let r = headerRowIdx + 1; r <= footerRowIdx && r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      const cRaw = colCodeIdx >= 0 ? String(row[colCodeIdx] ?? '').trim().replace(/\.$/, '') : '';
      if (cRaw && /^\d+(\.\d+)*/.test(cRaw)) {
        validCodes.push(cRaw);
      }
    }
    const dotCounts = validCodes.map((c) => (c.match(/\./g) || []).length);
    const minDotsInSheet = dotCounts.length > 0 ? Math.min(...dotCounts) : 1;

    // Extract lot code & title from assigned string (e.g. "02 - INSTALLATIONS...")
    let lotCode = sheetName;
    let lotTitle = assignedLotName;
    if (assignedLotName.includes(' - ')) {
      const parts = assignedLotName.split(' - ');
      lotCode = parts[0].trim();
      lotTitle = parts.slice(1).join(' - ').trim();
    }

    const lotNode: StagingTreeNode = {
      id: `stg-lot-${sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      code: lotCode.startsWith('LOT') ? lotCode : `LOT ${lotCode}`,
      designation: lotTitle,
      role: 'LOT',
      level: 2,
      sheetName,
      calcMode: 'SUM',
      inclusionMode: 'BASE',
      montantHT: 0,
      confidenceScore: 0.98,
      checked: true,
      isExpanded: true,
      children: [],
      sourceRef: { sheet: sheetName, row: 1 },
    };

    // Maintain active parent containers for levels 4 to 7
    const activeAncestors: Record<number, StagingTreeNode> = {};
    let lotSum = 0;

    for (let r = headerRowIdx + 1; r <= footerRowIdx && r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const codeRaw = colCodeIdx >= 0 ? String(row[colCodeIdx] ?? '').trim() : '';
      const desigRaw = colDesigIdx >= 0 ? String(row[colDesigIdx] ?? '').trim() : '';
      const unitRaw = colUnitIdx >= 0 ? String(row[colUnitIdx] ?? '').trim() : '';
      const qteRaw = colQteIdx >= 0 ? String(row[colQteIdx] ?? '').replace(/\s+/g, '').replace(',', '.') : '';
      const puRaw = colPuIdx >= 0 ? String(row[colPuIdx] ?? '').replace(/\s+/g, '').replace(',', '.') : '';
      const totalRaw = colTotalIdx >= 0 ? String(row[colTotalIdx] ?? '').replace(/\s+/g, '').replace(',', '.') : '';

      const qte = parseFloat(qteRaw) || undefined;
      const pu = parseFloat(puRaw) || undefined;
      let total = parseFloat(totalRaw) || 0;

      if (total === 0 && qte !== undefined && pu !== undefined) {
        total = Math.round(qte * pu * 100) / 100;
      }

      // Ignore purely empty rows
      if (!codeRaw && !desigRaw && !unitRaw && total === 0) continue;

      const hasPriceOrQty = qte !== undefined || pu !== undefined || total > 0;
      const wbsInfo = detectWBSLevel(codeRaw, desigRaw, hasPriceOrQty, unitRaw, minDotsInSheet);

      let calcMode: CalcMode = 'QTY_PU';
      if (wbsInfo.level === 4) {
        calcMode = 'SUM';
      } else if (wbsInfo.level === 5) {
        calcMode = wbsInfo.role === 'ENSEMBLE' ? 'ENS_QTY' : (qte && pu ? 'QTY_PU' : 'COMP_SUM');
      } else if (wbsInfo.level === 6) {
        calcMode = 'QTY_PU';
      } else if (wbsInfo.level >= 7) {
        calcMode = 'LUMP';
      }

      let inclusionMode: InclusionMode = 'BASE';
      if (/pm|pour m[eé]moire/i.test(unitRaw) || /pm|pour m[eé]moire/i.test(wbsInfo.designation)) {
        inclusionMode = 'PM';
      } else if (/variante|option/i.test(wbsInfo.designation)) {
        inclusionMode = 'OPTION';
      }

      const node: StagingTreeNode = {
        id: `stg-${sheetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-r${r}`,
        code: codeRaw || wbsInfo.code || `${r}`,
        designation: desigRaw || wbsInfo.designation || 'Ligne',
        role: 'LIGNE', // Position 1 par défaut : simple ligne brute sans niveau
        level: 1,      // Tout en position 1 comme demandé par l'utilisateur
        sheetName,
        calcMode,
        inclusionMode,
        unit: unitRaw || undefined,
        quantite: qte,
        unitPrice: pu,
        montantHT: total,
        confidenceScore: 0.95,
        checked: true,
        isExpanded: true,
        children: [],
        sourceRef: { sheet: sheetName, row: r + 1 },
      };

      if (!lotNode.children) {
        lotNode.children = [];
      }
      lotNode.children.push(node);

      if (total > 0) {
        lotSum += total;
      }
    }

    lotNode.montantHT = lotSum > 0 ? lotSum : 450000;
    resultLots.push(lotNode);
  }

  // =========================================================================
  // STRUCTURE DU PROJET SANS ZONE :
  // - Ligne 1 / Niveau 1 : PROJET (Racine chapeautant tous les lots importés)
  // - Niveau 2 : Lots de chaque feuille importée (LOT 01, LOT 02, etc.)
  // - Sous chaque lot : Lignes brutes de la feuille à la même ligne (Pos 1)
  // =========================================================================
  const projectTitle = extractProjectTitle(rawSheetsData);
  const totalLotsHT = resultLots.reduce((sum, l) => sum + (l.montantHT || 0), 0);

  const projectNode: StagingTreeNode = {
    id: 'stg-proj-root',
    code: 'PROJET',
    designation: projectTitle,
    role: 'PROJECT',
    level: 1,
    sheetName: 'ALL',
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: totalLotsHT,
    confidenceScore: 1.0,
    checked: true,
    isExpanded: true,
    children: resultLots,
  };

  return [projectNode];
};

/**
 * Converts tree nodes back to Phase 2 LotItem[] format
 */
export const convertTreeToLotItems = (treeNodes: StagingTreeNode[]): LotItem[] => {
  // Find all LOT nodes anywhere in the tree hierarchy
  const lotNodes: StagingTreeNode[] = [];
  const collectLots = (nodes: StagingTreeNode[]) => {
    for (const n of nodes) {
      if (n.role === 'LOT' || n.role === 'MACRO_LOT' || n.level === 2 || n.level === 3) {
        lotNodes.push(n);
      } else if (n.children && n.children.length > 0) {
        collectLots(n.children);
      }
    }
  };
  collectLots(treeNodes);

  const targets = lotNodes.length > 0 ? lotNodes : treeNodes;

  return targets.map((lotNode, lotIdx) => {
    const flattenToBlocs = (children: StagingTreeNode[]): BlocItem[] => {
      const blocs: BlocItem[] = [];

      const processNode = (n: StagingTreeNode) => {
        if (n.checked === false && !n.indeterminate) return;
        if (n.role === 'BLOC' || n.role === 'CHAPITRE' || n.level === 3 || n.level === 4) {
          const ouvrages: OuvrageItem[] = [];
          const collectOuvrages = (childList: StagingTreeNode[] = []) => {
            const activeChildList = childList.filter((c) => c.checked !== false || c.indeterminate);
            for (const c of activeChildList) {
              if (c.role === 'OUVRAGE' || c.role === 'ENSEMBLE' || c.level === 4 || c.level === 5 || c.level === 6) {
                const articles: ArticleItem[] = (c.children || [])
                  .filter((art) => art.checked !== false || art.indeterminate)
                  .map((art, aIdx) => ({
                    id: art.id || `art-${lotIdx}-${ouvrages.length}-${aIdx}`,
                    code: art.code,
                    designation: art.designation,
                    unite: art.unit || 'U',
                    quantite: art.quantite || 1,
                    quantiteMoe: art.quantiteMoe || art.quantite || 1,
                    prixUnitaireHT: art.unitPrice || 0,
                    montantHT: art.montantHT || 0,
                    tva: 20,
                    coeffVente: 1.25,
                    prixVenteHT: Math.round((art.montantHT || 0) * 1.25),
                    typeArticle: (art.resourceType === 'MO' ? 'main_oeuvre' : 'materiau') as any,
                    statut: 'VALIDE',
                  }));

                ouvrages.push({
                  id: c.id || `ouv-${lotIdx}-${blocs.length}-${ouvrages.length}`,
                  code: c.code,
                  designation: c.designation,
                  unite: c.unit || 'ENS',
                  quantite: c.quantite || 1,
                  prixUnitaireHT: c.unitPrice || c.montantHT || 0,
                  montantHT: c.montantHT || 0,
                  isExpanded: true,
                  statut: 'VALIDE',
                  articles,
                });
              } else if (c.children && c.children.length > 0) {
                collectOuvrages(c.children);
              }
            }
          };

          collectOuvrages(n.children);

          blocs.push({
            id: n.id || `bloc-${lotIdx}-${blocs.length}`,
            code: n.code,
            titre: n.designation,
            isExpanded: true,
            totalHT: n.montantHT || 0,
            ouvrages,
          });
        } else if (n.children && n.children.length > 0) {
          n.children.forEach(processNode);
        }
      };

      (children || []).forEach(processNode);

      if (blocs.length === 0) {
        // Fallback default bloc
        blocs.push({
          id: `bloc-default-${lotIdx}`,
          code: '01',
          titre: 'Travaux & Prestations Générales',
          isExpanded: true,
          totalHT: lotNode.montantHT || 0,
          ouvrages: [],
        });
      }

      return blocs;
    };

    return {
      id: lotNode.id || `lot-${lotIdx + 1}`,
      code: lotNode.code,
      titre: lotNode.designation,
      tva: 20,
      coefficientVente: 1.25,
      statutValidation: 'VALIDE',
      blocs: flattenToBlocs(lotNode.children || []),
    };
  });
};
