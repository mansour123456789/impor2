import * as XLSX from 'xlsx';
import { LotItem, ProjectInfo } from '../types/dpgf';

export function exportDpgfToExcel(project: ProjectInfo, lots: LotItem[], useVente = true) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Récapitulatif
  const recapData: any[] = [
    ['ECO-PILOT - DÉCOMPOSITION DU PRIX GLOBAL ET FORFAITAIRE (DPGF)'],
    ['PROJET :', project.name],
    ['CLIENT :', project.client],
    ['LOCALISATION :', project.localisation],
    ['SURFACE :', project.surfacePlancher],
    ['DATE D\'ÉMISSION :', new Date().toLocaleDateString('fr-FR')],
    [],
    ['N° LOT', 'DÉSIGNATION DU LOT', 'MONTANT DÉBOURSÉ HT (€)', 'COEFF VENTE', 'PRIX DE VENTE HT (€)', 'TVA (20%) (€)', 'TOTAL TTC (€)'],
  ];

  let totalDebourse = 0;
  let totalVente = 0;

  lots.forEach((lot) => {
    let lotDebourse = 0;
    let lotVente = 0;

    lot.blocs.forEach((bloc) => {
      bloc.ouvrages.forEach((ouv) => {
        ouv.articles.forEach((art) => {
          lotDebourse += art.montantHT;
          lotVente += art.prixVenteHT;
        });
      });
    });

    totalDebourse += lotDebourse;
    totalVente += lotVente;

    const tvaVal = lotVente * (lot.tva / 100);
    const ttcVal = lotVente + tvaVal;

    recapData.push([
      lot.code,
      lot.titre,
      Math.round(lotDebourse),
      lot.coefficientVente,
      Math.round(lotVente),
      Math.round(tvaVal),
      Math.round(ttcVal),
    ]);
  });

  const totalTVA = totalVente * 0.20;
  const totalTTC = totalVente + totalTVA;

  recapData.push([]);
  recapData.push([
    'TOTAL GÉNÉRAL',
    'ENSEMBLE DES TRAVAUX TOUS CORPS D\'ÉTAT',
    Math.round(totalDebourse),
    '-',
    Math.round(totalVente),
    Math.round(totalTVA),
    Math.round(totalTTC),
  ]);

  const wsRecap = XLSX.utils.aoa_to_sheet(recapData);
  XLSX.utils.book_append_sheet(wb, wsRecap, '00_RECAPITULATIF');

  // 2. Sheets for each Lot
  lots.forEach((lot, idx) => {
    const sheetRows: any[] = [
      [`${lot.code} - ${lot.titre.toUpperCase()}`],
      ['Projet : ' + project.name],
      [],
      ['CODE', 'DÉSIGNATION DES TRAVAUX', 'UNITÉ', 'QUANTITÉ', 'P.U. HT (€)', 'TOTAL HT (€)', 'PRIX VENTE HT (€)'],
    ];

    lot.blocs.forEach((bloc) => {
      sheetRows.push([]);
      sheetRows.push([bloc.code, `[BLOC] ${bloc.titre.toUpperCase()}`, '', '', '', '', '']);

      bloc.ouvrages.forEach((ouv) => {
        sheetRows.push([ouv.code, `  ▶ ${ouv.designation}`, ouv.unite || '', ouv.quantite || '', ouv.prixUnitaireHT || '', ouv.montantHT || '', '']);

        ouv.articles.forEach((art) => {
          sheetRows.push([
            art.code,
            `      • ${art.designation}`,
            art.unite,
            art.quantite,
            art.prixUnitaireHT,
            art.montantHT,
            art.prixVenteHT,
          ]);
        });
      });
    });

    const sheetName = `${(idx + 1).toString().padStart(2, '0')}_${lot.code.replace(/\s+/g, '')}`.slice(0, 31);
    const wsLot = XLSX.utils.aoa_to_sheet(sheetRows);
    XLSX.utils.book_append_sheet(wb, wsLot, sheetName);
  });

  // Write and trigger download
  const fileName = `DPGF_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
