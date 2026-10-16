import { StagingTreeNode, MetreDimensionLine } from '../types/dpgf';

/**
 * Arbre Universel v2 complet à 5 NIVEAUX HIÉRARCHIQUES DISTINCTS
 * Chaque niveau possède un rôle et une couleur claire spécifique :
 * - NIVEAU 1 : LOT              (Bleu Royal)
 * - NIVEAU 2 : BLOC / CHAPITRE  (Violet / Pourpre)
 * - NIVEAU 3 : OUVRAGE / ENSEMBLE (Émeraude / Orange)
 * - NIVEAU 4 : ARTICLE / MODULE (Cyan / Bleu Ciel)
 * - NIVEAU 5 : COMPOSANT        (Ambre / Jaune Or)
 */
const MOCK_RAW_LOTS: StagingTreeNode[] = [
  // =========================================================================
  // LOT 01 : TERRASSEMENTS & SOUTÈNEMENT (5 NIVEAUX COMPLETS)
  // =========================================================================
  {
    id: 'stg-lot-01',
    code: 'LOT 01',
    sheetName: 'LOT 01',
    designation: '01 - CURAGE',
    role: 'LOT', // NIVEAU 1
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: 443500,
    confidenceScore: 0.98,
    checked: true,
    isExpanded: true,
    tags: [
      { axis: 'CLASSIF_UNTEC', value: '01' },
      { axis: 'LOCALISATION', value: 'Infras & Extérieurs' },
    ],
    children: [
      {
        id: 'stg-1-1',
        code: '1.1',
        designation: 'Parois de soutènement & Blindage périphérique',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 228000,
        confidenceScore: 0.97,
        checked: true,
        isExpanded: true,
        tags: [{ axis: 'LOCALISATION', value: 'Sous-Sol - R-1' }],
        children: [
          {
            id: 'stg-1-1-1',
            code: '1.1.1',
            designation: 'Paroi berlinoise avec profilés IPE 360 (entraxe 2.50m) et blindage bois',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'COMP_SUM',
            inclusionMode: 'BASE',
            unit: 'm²',
            quantite: 950,
            quantiteMoe: 920,
            unitPrice: 240.0,
            montantHT: 228000,
            confidenceScore: 0.95,
            checked: true,
            isExpanded: true,
            tags: [{ axis: 'LOCALISATION', value: 'Sous-Sol R-1' }],
            children: [
              {
                id: 'stg-1-1-1-1',
                code: '1.1.1.1',
                designation: 'Forage préalable et pose profilés IPE 360 (longueur 12m)',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'ml',
                quantite: 456,
                unitPrice: 185.0,
                montantHT: 84360,
                confidenceScore: 0.99,
                checked: true,
                isExpanded: true,
                children: [
                  {
                    id: 'stg-1-1-1-1-a',
                    code: '1.1.1.1.a',
                    designation: 'Forage à la foreuse rotary Ø250mm profondeur 12m avec tube guide',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MATERIEL',
                    unit: 'ml',
                    quantite: 456,
                    unitPrice: 95.0,
                    montantHT: 43320,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-1-1-1-1-b',
                    code: '1.1.1.1.b',
                    designation: 'Profilés aciers laminés IPE 360 qualité S275JR livrés façonnés',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'ml',
                    quantite: 456,
                    unitPrice: 62.0,
                    montantHT: 28272,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-1-1-1-1-c',
                    code: '1.1.1.1.c',
                    designation: 'Équipe de poseurs spécialisés calage et scellement d\'aplomb',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'ml',
                    quantite: 456,
                    unitPrice: 28.0,
                    montantHT: 12768,
                    confidenceScore: 0.98,
                    checked: true,
                  },
                ],
              },
              {
                id: 'stg-1-1-1-2',
                code: '1.1.1.2',
                designation: 'Tirants d\'ancrage précontraints provisoires lg 15m scellés au coulis',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'u',
                quantite: 38,
                unitPrice: 1950.0,
                montantHT: 74100,
                confidenceScore: 0.96,
                checked: true,
                isExpanded: true,
                children: [
                  {
                    id: 'stg-1-1-1-2-a',
                    code: '1.1.1.2.a',
                    designation: 'Têtes d\'ancrage orientables et platines d\'appui sur profilés',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'u',
                    quantite: 38,
                    unitPrice: 420.0,
                    montantHT: 15960,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-1-1-1-2-b',
                    code: '1.1.1.2.b',
                    designation: 'Forage incliné, torons acier T15S et injection coulis sous pression',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'ST',
                    unit: 'u',
                    quantite: 38,
                    unitPrice: 1530.0,
                    montantHT: 58140,
                    confidenceScore: 0.95,
                    checked: true,
                  },
                ],
              },
              {
                id: 'stg-1-1-1-3',
                code: '1.1.1.3',
                designation: 'Blindage bois madriers ép. 80mm traités classe 4 et calage',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'm²',
                quantite: 950,
                unitPrice: 73.2,
                montantHT: 69540,
                confidenceScore: 0.97,
                checked: true,
                isExpanded: true,
                children: [
                  {
                    id: 'stg-1-1-1-3-a',
                    code: '1.1.1.3.a',
                    designation: 'Madriers bois résineux ép. 80mm traitement autoclave classe 4',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'm²',
                    quantite: 950,
                    unitPrice: 48.0,
                    montantHT: 45600,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-1-1-1-3-b',
                    code: '1.1.1.3.b',
                    designation: 'Main d\'œuvre glissage, coinçage et calage à l\'avancement',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'm²',
                    quantite: 950,
                    unitPrice: 25.2,
                    montantHT: 23940,
                    confidenceScore: 0.96,
                    checked: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'stg-1-2',
        code: '1.2',
        designation: 'Fouilles en grande masse & Évacuation ISDI',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 215500,
        confidenceScore: 0.95,
        checked: true,
        isExpanded: false,
        children: [
          {
            id: 'stg-1-2-1',
            code: '1.2.1',
            designation: 'Terrassement pleine masse à la pelle 25T avec chargement camion',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            unit: 'm³',
            quantite: 4200,
            quantiteMoe: 4000,
            unitPrice: 18.5,
            montantHT: 77700,
            confidenceScore: 0.98,
            checked: true,
            children: [
              {
                id: 'stg-1-2-1-1',
                code: '1.2.1.1',
                designation: 'Extraction mécanique et chargement direct sur semi-remorques',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'm³',
                quantite: 4200,
                unitPrice: 18.5,
                montantHT: 77700,
                confidenceScore: 0.99,
                checked: true,
                children: [
                  {
                    id: 'stg-1-2-1-1-a',
                    code: '1.2.1.1.a',
                    designation: 'Pelle hydraulique chenillée 25T avec chauffeur et carburant',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MATERIEL',
                    unit: 'm³',
                    quantite: 4200,
                    unitPrice: 18.5,
                    montantHT: 77700,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                ],
              },
            ],
          },
          {
            id: 'stg-1-2-2',
            code: '1.2.2',
            designation: 'Transport et mise en décharge agréée ISDI classe 3 (BSD)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            unit: 'm³',
            quantite: 4200,
            unitPrice: 32.8,
            montantHT: 137800,
            confidenceScore: 0.99,
            checked: true,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LOT 02 : GROS ŒUVRE & GÉNIE CIVIL (5 NIVEAUX COMPLETS)
  // =========================================================================
  {
    id: 'stg-lot-02',
    code: 'LOT 02',
    sheetName: 'LOT 02',
    designation: 'Gros Œuvre, Fondations Spéciales & Béton Armé',
    role: 'LOT', // NIVEAU 1
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: 1485600,
    confidenceScore: 0.92,
    checked: true,
    isExpanded: true,
    tags: [
      { axis: 'CLASSIF_UNTEC', value: '02' },
      { axis: 'LOCALISATION', value: 'Ensemble du complexe hôtelier' },
    ],
    children: [
      {
        id: 'stg-2-1',
        code: '2.1',
        designation: 'Fondations superficielles & Radier général étanche',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 272287,
        confidenceScore: 0.88,
        checked: true,
        isExpanded: true,
        tags: [{ axis: 'LOCALISATION', value: 'Infrastructure R-1' }],
        children: [
          {
            id: 'stg-2-1-1',
            code: '2.1.1',
            designation: 'Béton de propreté C16/20 dosé à 200 kg/m³ ép. 10cm sous radier',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            unit: 'm²',
            quantite: 1350,
            quantiteMoe: 1350,
            unitPrice: 18.5,
            montantHT: 24975,
            confidenceScore: 1.0,
            checked: true,
            children: [
              {
                id: 'stg-2-1-1-1',
                code: '2.1.1.1',
                designation: 'Coulage et tirage du béton de propreté sur fond nivelé',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'm²',
                quantite: 1350,
                unitPrice: 18.5,
                montantHT: 24975,
                confidenceScore: 1.0,
                checked: true,
                children: [
                  {
                    id: 'stg-2-1-1-1-a',
                    code: '2.1.1.1.a',
                    designation: 'Béton C16/20 prêt à l\'emploi livré par camion toupie',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'm²',
                    quantite: 1350,
                    unitPrice: 12.5,
                    montantHT: 16875,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-2-1-1-1-b',
                    code: '2.1.1.1.b',
                    designation: 'Équipe maçons tirage et nivellement laser',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'm²',
                    quantite: 1350,
                    unitPrice: 6.0,
                    montantHT: 8100,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                ],
              },
            ],
          },
          {
            id: 'stg-2-1-2',
            code: '2.1.2',
            designation: 'Radier général étanche en béton armé C30/37 ép. 45cm (608 m³)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'COMP_SUM',
            inclusionMode: 'BASE',
            unit: 'm³',
            quantite: 608,
            quantiteMoe: 600,
            unitPrice: 390.32,
            montantHT: 237312,
            confidenceScore: 0.82,
            alertCodes: ['V01', 'V02'],
            alertMessage: 'Écart détecté : Montant source 249 280 € vs Σ composants 237 312 € (écart 11 968 €). PU affiché dérivé 390,32 €/m³.',
            checked: true,
            isExpanded: true,
            tags: [
              { axis: 'CLASSIF_UNTEC', value: '02.1.2' },
              { axis: 'LOCALISATION', value: 'Niveau R-1' },
            ],
            children: [
              {
                id: 'stg-2-1-2-1',
                code: '2.1.2.1',
                designation: 'Bétonnage en grande masse et armatures de structure (COMP_SUM)',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'COMP_SUM',
                inclusionMode: 'BASE',
                unit: 'm³',
                quantite: 608,
                unitPrice: 350.25,
                montantHT: 212952,
                confidenceScore: 0.94,
                checked: true,
                isExpanded: true,
                children: [
                  {
                    id: 'stg-2-1-2-1-a',
                    code: '2.1.2.1.a',
                    designation: 'Béton C30/37 hydrofuge pompé avec adjuvants étanches',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'm³',
                    quantite: 608,
                    unitPrice: 165.0,
                    montantHT: 100320,
                    confidenceScore: 0.98,
                    checked: true,
                  },
                  {
                    id: 'stg-2-1-2-1-b',
                    code: '2.1.2.1.b',
                    designation: 'Armatures HA B500B façonnées (ratio lié 95 kg/m³)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'RATIO',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'kg',
                    quantite: 57760,
                    unitPrice: 1.95,
                    montantHT: 112632,
                    confidenceScore: 0.95,
                    checked: true,
                  },
                ],
              },
              {
                id: 'stg-2-1-2-2',
                code: '2.1.2.2',
                designation: 'Étanchéité des reprises de coulage & main d\'œuvre de finition',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'COMP_SUM',
                inclusionMode: 'BASE',
                unit: 'fft',
                quantite: 1,
                unitPrice: 24360.0,
                montantHT: 24360,
                confidenceScore: 0.97,
                checked: true,
                isExpanded: true,
                children: [
                  {
                    id: 'stg-2-1-2-2-a',
                    code: '2.1.2.2.a',
                    designation: 'Joint Waterstop PVC de reprise étanche 240mm avec soudures',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'ml',
                    quantite: 240,
                    unitPrice: 34.0,
                    montantHT: 8160,
                    confidenceScore: 0.99,
                    checked: true,
                  },
                  {
                    id: 'stg-2-1-2-2-b',
                    code: '2.1.2.2.b',
                    designation: 'Main d\'œuvre coulage, vibration à l\'aiguille et talochage laser',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'h',
                    quantite: 360,
                    unitPrice: 45.0,
                    montantHT: 16200,
                    confidenceScore: 0.94,
                    checked: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'stg-2-2',
        code: '2.2',
        designation: 'Superstructure Gros Œuvre RDC & Étages Courants',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 1118313,
        confidenceScore: 0.94,
        checked: true,
        isExpanded: true,
        tags: [{ axis: 'LOCALISATION', value: 'Superstructure RDC à R+5' }],
        children: [
          {
            id: 'stg-2-2-1',
            code: '2.2.1',
            designation: 'Voiles périphériques BA banchés ép. 20cm (avec déductions baies)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            unit: 'm²',
            quantite: 3240,
            quantiteMoe: 3300,
            unitPrice: 128.5,
            montantHT: 416340,
            confidenceScore: 0.98,
            checked: true,
            isExpanded: true,
            children: [
              {
                id: 'stg-2-2-1-1',
                code: '2.2.1.1',
                designation: 'Banchage, ferraillage et coulage des voiles de façade',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'm²',
                quantite: 3240,
                unitPrice: 128.5,
                montantHT: 416340,
                confidenceScore: 0.98,
                checked: true,
                children: [
                  {
                    id: 'stg-2-2-1-1-a',
                    code: '2.2.1.1.a',
                    designation: 'Banches métalliques grande hauteur avec sécurité (MATERIEL)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MATERIEL',
                    unit: 'm²',
                    quantite: 3240,
                    unitPrice: 32.5,
                    montantHT: 105300,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-2-2-1-1-b',
                    code: '2.2.1.1.b',
                    designation: 'Béton prêt à l\'emploi C25/30 et armatures préassemblées (FOURN)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'm²',
                    quantite: 3240,
                    unitPrice: 56.0,
                    montantHT: 181440,
                    confidenceScore: 0.99,
                    checked: true,
                  },
                  {
                    id: 'stg-2-2-1-1-c',
                    code: '2.2.1.1.c',
                    designation: 'Main d\'œuvre équipe de coffreurs bancheurs qualifiés (MO)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'm²',
                    quantite: 3240,
                    unitPrice: 40.0,
                    montantHT: 129600,
                    confidenceScore: 0.97,
                    checked: true,
                  },
                ],
              },
            ],
          },
          {
            id: 'stg-2-2-2',
            code: '2.2.2',
            designation: 'Dalles pleines BA coulées en place ép. 20cm (trémies déduites)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'QTY_PU',
            inclusionMode: 'BASE',
            unit: 'm²',
            quantite: 5120,
            quantiteMoe: 5200,
            unitPrice: 98.0,
            montantHT: 501760,
            confidenceScore: 0.97,
            checked: true,
          },
          {
            id: 'stg-2-2-3',
            code: '2.2.3',
            designation: 'Installation de chantier, grues et compte prorata (Convention A : 2.5%)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'PERCENT',
            inclusionMode: 'BASE',
            unit: 'fft',
            quantite: 1,
            unitPrice: 30000.0,
            montantHT: 30000,
            confidenceScore: 0.91,
            checked: true,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LOT 04 : REVÊTEMENTS & CARRELAGE (5 NIVEAUX COMPLETS)
  // =========================================================================
  {
    id: 'stg-lot-04',
    code: 'LOT 04',
    sheetName: 'LOT 04',
    designation: 'Revêtements Durs, Carrelages & Faïences',
    role: 'LOT', // NIVEAU 1
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: 185400,
    confidenceScore: 0.93,
    checked: true,
    isExpanded: false,
    tags: [{ axis: 'CLASSIF_UNTEC', value: '04' }],
    children: [
      {
        id: 'stg-4-1',
        code: '4.1',
        designation: 'Carrelage des espaces communs & sanitaires',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 185400,
        confidenceScore: 0.94,
        checked: true,
        children: [
          {
            id: 'stg-4-1-1',
            code: '4.1.1',
            designation: 'Fourniture & Pose de carrelage grès cérame 60x60 R10 (COMP_UNIT)',
            role: 'OUVRAGE', // NIVEAU 3
            calcMode: 'COMP_UNIT',
            inclusionMode: 'BASE',
            unit: 'm²',
            quantite: 2750,
            unitPrice: 67.34,
            montantHT: 185185,
            confidenceScore: 0.92,
            checked: true,
            isExpanded: true,
            children: [
              {
                id: 'stg-4-1-1-1',
                code: '4.1.1.1',
                designation: 'Complexe colle déformable C2S1 et carreaux pleine masse',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'COMP_UNIT',
                inclusionMode: 'BASE',
                unit: 'm²',
                quantite: 2750,
                unitPrice: 67.34,
                montantHT: 185185,
                confidenceScore: 0.95,
                checked: true,
                children: [
                  {
                    id: 'stg-4-1-1-1-a',
                    code: '4.1.1.1.a',
                    designation: 'Main d\'œuvre carreleur qualifié (0.55 h/m² à 38 €/h)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'MO',
                    unit: 'h',
                    quantite: 0.55,
                    unitPrice: 38.0,
                    montantHT: 20.9,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-4-1-1-1-b',
                    code: '4.1.1.1.b',
                    designation: 'Carreaux grès cérame pleine masse avec pertes 5%',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'm²',
                    quantite: 1.05,
                    unitPrice: 24.0,
                    montantHT: 25.2,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-4-1-1-1-c',
                    code: '4.1.1.1.c',
                    designation: 'Mortier colle C2S1 déformable (5 kg/m² à 0.90 €/kg)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'kg',
                    quantite: 5.0,
                    unitPrice: 0.9,
                    montantHT: 4.5,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-4-1-1-1-d',
                    code: '4.1.1.1.d',
                    designation: 'Joint hydrofuge époxy fin (0.5 kg/m² à 2.40 €/kg)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'kg',
                    quantite: 0.5,
                    unitPrice: 2.4,
                    montantHT: 1.2,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LOT 05 : CVC & MODULES PRÉFABRIQUÉS (5 NIVEAUX COMPLETS)
  // =========================================================================
  {
    id: 'stg-lot-05',
    code: 'LOT 05',
    sheetName: 'LOT 05',
    designation: 'CVC, Plomberie & Modules Préfabriqués',
    role: 'LOT', // NIVEAU 1
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: 1340000,
    confidenceScore: 0.87,
    checked: true,
    isExpanded: false,
    tags: [{ axis: 'CLASSIF_UNTEC', value: '05' }],
    children: [
      {
        id: 'stg-5-2',
        code: '5.2',
        designation: 'Salles de bains préfabriquées modulaires (ENS_QTY)',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 1020000,
        confidenceScore: 0.94,
        checked: true,
        children: [
          {
            id: 'stg-5-2-1',
            code: '5.2.1',
            designation: 'Cabines de salles de bains préfabriquées complètes (120 unités)',
            role: 'ENSEMBLE', // NIVEAU 3
            calcMode: 'ENS_QTY',
            inclusionMode: 'BASE',
            unit: 'u',
            multiplier: 120,
            quantite: 120,
            unitPrice: 8500,
            montantHT: 1020000,
            confidenceScore: 0.96,
            checked: true,
            isExpanded: true,
            children: [
              {
                id: 'stg-5-2-1-1',
                code: '5.2.1.1',
                designation: 'Cabine modulaire d\'usine prête à raccorder avec finitions',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'BASE',
                unit: 'u',
                quantite: 120,
                unitPrice: 8500,
                montantHT: 1020000,
                confidenceScore: 0.98,
                checked: true,
                children: [
                  {
                    id: 'stg-5-2-1-1-a',
                    code: '5.2.1.1.a',
                    designation: 'Cabine préfabriquée carrelée équipée prête à brancher',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'FOURN',
                    unit: 'u',
                    quantite: 1,
                    unitPrice: 6800,
                    montantHT: 6800,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-5-2-1-1-b',
                    code: '5.2.1.1.b',
                    designation: 'Raccordements hydrauliques & évacuation acoustique ST',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'BASE',
                    resourceType: 'ST',
                    unit: 'ens',
                    quantite: 1,
                    unitPrice: 1700,
                    montantHT: 1700,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'stg-5-1',
        code: '5.1',
        designation: 'Production de chaleur & Traitement d\'air (ENS_GLOBAL)',
        role: 'BLOC', // NIVEAU 2
        calcMode: 'SUM',
        inclusionMode: 'BASE',
        montantHT: 320000,
        confidenceScore: 0.85,
        checked: true,
        children: [
          {
            id: 'stg-5-1-1',
            code: '5.1.1',
            designation: 'Centrale de traitement d\'air CVC 350 kW et PAC réversible 4 tubes',
            role: 'ENSEMBLE', // NIVEAU 3
            calcMode: 'ENS_GLOBAL',
            inclusionMode: 'BASE',
            unit: 'ens',
            quantite: 1,
            unitPrice: 320000,
            montantHT: 320000,
            confidenceScore: 0.81,
            alertCodes: ['V07'],
            alertMessage: 'Ensemble à prix global : Composants listés = 240 200 € vs Prix global = 320 000 €. Écart de 79 800 € pour compléments forfaitaires (régulation, mise en service).',
            checked: true,
            isExpanded: true,
            children: [
              {
                id: 'stg-5-1-1-1',
                code: '5.1.1.1',
                designation: 'Équipements thermodynamiques et distribution primaire',
                role: 'ARTICLE', // NIVEAU 4
                calcMode: 'QTY_PU',
                inclusionMode: 'INFO',
                unit: 'ens',
                quantite: 1,
                unitPrice: 240200,
                montantHT: 240200,
                confidenceScore: 0.95,
                checked: true,
                children: [
                  {
                    id: 'stg-5-1-1-1-a',
                    code: '5.1.1.1.a',
                    designation: 'Pompe à chaleur réversible 4 tubes 350 kW (informatif)',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'INFO',
                    resourceType: 'MATERIEL',
                    unit: 'u',
                    quantite: 2,
                    unitPrice: 95000,
                    montantHT: 190000,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-5-1-1-1-b',
                    code: '5.1.1.1.b',
                    designation: 'Ballon tampon primaire 3 000 L',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'INFO',
                    resourceType: 'FOURN',
                    unit: 'u',
                    quantite: 2,
                    unitPrice: 12500,
                    montantHT: 25000,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                  {
                    id: 'stg-5-1-1-1-c',
                    code: '5.1.1.1.c',
                    designation: 'Réseau primaire calorifugé acier DN100',
                    role: 'COMPONENT', // NIVEAU 5
                    calcMode: 'QTY_PU',
                    inclusionMode: 'INFO',
                    resourceType: 'FOURN',
                    unit: 'ml',
                    quantite: 120,
                    unitPrice: 210,
                    montantHT: 25200,
                    confidenceScore: 1.0,
                    checked: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Helper to assign proper 6-position roles and level numbers
// Pos 1: Projet, Pos 2: Zone, Pos 3: Lot, Pos 4: Bloc, Pos 5: Ensemble & Article (Même position 5), Pos 6: Composant, Pos 7: Note
const enrichNodeLevels = (
  node: StagingTreeNode,
  currentLevel: number = 3,
  sheetName?: string
): StagingTreeNode => {
  let role = node.role;
  let level = currentLevel;
  const currentSheetName = node.sheetName || sheetName || (currentLevel === 3 ? node.code : undefined);

  if (currentLevel === 3) {
    role = 'LOT';
    level = 3;
  } else if (currentLevel === 4) {
    role = 'BLOC';
    level = 4;
  } else if (currentLevel === 5) {
    // Both ENSEMBLE and ARTICLE have Level 5 (Position 5)
    if (role === 'ARTICLE' || role === 'OUVRAGE') {
      role = 'ARTICLE';
    } else {
      role = 'ENSEMBLE';
    }
    level = 5;
  } else if (currentLevel === 6) {
    role = 'COMPONENT';
    level = 6;
  }

  if (/note|pm|pour m/i.test(node.code) || /note|pour m/i.test(node.designation)) {
    role = 'NOTE';
    level = 7;
  }

  // Next level determination:
  // Children of Ensemble can be Article (both at Level 5!)
  // Children of Article are Components (Level 6!)
  let nextLevel = currentLevel + 1;
  if (currentLevel === 5 && (role === 'ENSEMBLE' || role === 'TYPE')) {
    nextLevel = 5; // Articles are in the same level/position 5
  } else if (currentLevel === 5 && (role === 'ARTICLE' || role === 'OUVRAGE')) {
    nextLevel = 6; // Components are in level/position 6
  }

  const children = node.children
    ? node.children.map((c) => enrichNodeLevels(c, nextLevel, currentSheetName))
    : undefined;

  return {
    ...node,
    role,
    level,
    sheetName: currentSheetName,
    children,
  };
};

/**
 * Initialise toutes les lignes des lots à la Position 1 (lignes brutes sans niveaux pré-affectés)
 * conformément à la demande : "mettre tout en position 1 et n'affecter pas des niveaux, juste des lignes"
 */
export const flattenLotChildrenToPosition1 = (lot: StagingTreeNode): StagingTreeNode => {
  const flatChildren: StagingTreeNode[] = [];
  const walk = (nodes: StagingTreeNode[] = []) => {
    for (const n of nodes) {
      flatChildren.push({
        ...n,
        role: 'LIGNE',
        level: 1, // Position 1 brute
        calcMode: n.calcMode || 'QTY_PU',
        children: [],
      });
      if (n.children && n.children.length > 0) {
        walk(n.children);
      }
    }
  };
  walk(lot.children);
  return {
    ...lot,
    role: 'LOT',
    level: 2, // Niveau 2 : les lots de chaque feuille
    children: flatChildren,
  };
};

export const enrichedLots = MOCK_RAW_LOTS.map((l) => flattenLotChildrenToPosition1(l));

/**
 * Niveau 1 : Nom du projet (première ligne)
 * Niveau 2 : Directement les lots de chaque feuille importée (sans niveau Zone)
 */
export const MOCK_STAGING_TREE: StagingTreeNode[] = [
  {
    id: 'stg-proj-root',
    code: 'PROJET',
    designation:
      'RÉHABILITATION DE 6 LOGEMENTS ET RESTRUCTURATION LOURDE POUR CRÉATION DE 7 LOGEMENTS - 42 AVENUE JEAN JAURÈS PARIS 19ÈME',
    role: 'PROJECT',
    level: 1,
    sheetName: 'ALL',
    calcMode: 'SUM',
    inclusionMode: 'BASE',
    montantHT: enrichedLots.reduce((sum, l) => sum + (l.montantHT || 0), 0),
    confidenceScore: 1.0,
    checked: true,
    isExpanded: true,
    children: enrichedLots,
  },
];

/**
 * Carnets de Métré de référence en Génie Civil avec déductions géométriques
 */
export const MOCK_METRE_LINES_RADIER: MetreDimensionLine[] = [
  {
    id: 'm-rad-1',
    libelle: 'Emprise radier zone hôtel principale (Axe A-F / 1-12)',
    localisation: 'Sous-Sol R-1',
    planRef: 'PE-GC-101 Ind. C',
    nombre: 1,
    longueur: 48.0,
    largeur: 25.0,
    hauteur: 0.45,
    signe: '+',
    resultat: 540.0,
    commentaire: 'Béton C30/37 épaisseur nominale 45 cm',
  },
  {
    id: 'm-rad-2',
    libelle: 'Bêche périphérique d\'ancrage au pourtour',
    localisation: 'Pourtour R-1',
    planRef: 'PE-GC-102 Coupe 3-3',
    nombre: 1,
    longueur: 146.0,
    largeur: 0.6,
    hauteur: 0.8,
    signe: '+',
    resultat: 70.08,
    commentaire: 'Section 0.60 x 0.80m sous radier',
  },
  {
    id: 'm-rad-3',
    libelle: 'Déduction fosse d\'ascenseur duplex (-1.40m sous radier)',
    localisation: 'Noyau central',
    planRef: 'PE-GC-105',
    nombre: 2,
    longueur: 2.2,
    largeur: 2.1,
    hauteur: 0.45,
    signe: '-',
    resultat: 4.158,
    commentaire: 'Déduction épaisseur radier dans la trémie de fosse',
  },
  {
    id: 'm-rad-4',
    libelle: 'Radier fosse ascenseur décaissée (sur-épaisseur)',
    localisation: 'Fosse ascenseur',
    planRef: 'PE-GC-105',
    nombre: 2,
    longueur: 2.2,
    largeur: 2.1,
    hauteur: 0.25,
    signe: '+',
    resultat: 2.31,
    commentaire: 'Sur-bétonnage pour étanchéité fosse',
  },
];

export const MOCK_METRE_LINES_VOILES: MetreDimensionLine[] = [
  {
    id: 'm-v-1',
    libelle: 'Voiles périphériques banchés - Façade Sud Axe A (lg 48m, h 2.80m)',
    localisation: 'Superstructure RDC',
    planRef: 'PE-CO-201',
    nombre: 1,
    longueur: 48.0,
    largeur: 1.0,
    hauteur: 2.8,
    signe: '+',
    resultat: 134.4,
    commentaire: 'Surface brute de banche',
  },
  {
    id: 'm-v-2',
    libelle: 'Voiles périphériques banchés - Façade Nord Axe F (lg 48m, h 2.80m)',
    localisation: 'Superstructure RDC',
    planRef: 'PE-CO-201',
    nombre: 1,
    longueur: 48.0,
    largeur: 1.0,
    hauteur: 2.8,
    signe: '+',
    resultat: 134.4,
    commentaire: 'Surface brute de banche',
  },
  {
    id: 'm-v-3',
    libelle: 'Voiles pignons Est & Ouest (2 x lg 25m, h 2.80m)',
    localisation: 'Superstructure RDC',
    planRef: 'PE-CO-202',
    nombre: 2,
    longueur: 25.0,
    largeur: 1.0,
    hauteur: 2.8,
    signe: '+',
    resultat: 140.0,
    commentaire: 'Pignons aveugles',
  },
  {
    id: 'm-v-4',
    libelle: 'Déduction des baies vitrées RDC (10 baies 2.40 x 2.15m)',
    localisation: 'Façade Sud',
    planRef: 'PE-MEN-301',
    nombre: 10,
    longueur: 2.4,
    largeur: 1.0,
    hauteur: 2.15,
    signe: '-',
    resultat: 51.6,
    commentaire: 'Déduction trémies vitrées conformément aux normes UNTEC',
  },
  {
    id: 'm-v-5',
    libelle: 'Déduction des portes de service et sorties de secours (4 portes 0.93 x 2.04m)',
    localisation: 'Circulations',
    planRef: 'PE-CO-204',
    nombre: 4,
    longueur: 0.93,
    largeur: 1.0,
    hauteur: 2.04,
    signe: '-',
    resultat: 7.5888,
    commentaire: 'Portes tiercées',
  },
];
