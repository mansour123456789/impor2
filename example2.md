# Next-Gen DPGF Importer & Smart WBS Outliner (example2.md)

> **Document de Spécification, Étude Comparative & Guide de Conception UI/UX**  
> **Objet :** Nouvelle maquette applicative pour l'import de DPGF BTP avec la meilleure expérience utilisateur (UX) du marché et des méthodes ultra-rapides de classification manuelle et assistée des niveaux hiérarchiques.

---

## Sommaire Exécutif

1. [Benchmark International & État de l'Art](#1-benchmark-international--état-de-lart)
   - Analyse comparative des solutions existantes (Spigao, DeviSOC, Onaya, Procore, Autodesk Construction Cloud, Linear, Notion)
   - Les points de douleur majeurs du chiffreur BTP
2. [Philosophie UX : Le « Speed-First & Zero-Friction » Outliner](#2-philosophie-ux--le--speed-first--zero-friction--outliner)
3. [Les 7 Méthodes Ultra-Rapides d'Attribution Manuelle des Niveaux](#3-les-7-méthodes-ultra-rapides-dattribution-manuelle-des-niveaux)
   - Méthode 1 : Le Mode Clavier Direct « Speed-Keys » (Touches 1-7, Tab/Shift+Tab)
   - Méthode 2 : L'Outil Pinceau Dynamique (*Level Painter Brush*)
   - Méthode 3 : La Sélection par Plage (Shift+Clic) & Barre Flottante Contextuelle
   - Méthode 4 : La Règle Visuelle d'Indentation à Glissière (*Visual Indent Ruler*)
   - Méthode 5 : Les Règles de Masque & Regex Express en 1 Clic
   - Méthode 6 : La Cascade Intelligente à Frontières Dynamiques (*Smart Boundary Cascade*)
   - Méthode 7 : Le Glisser-Déposer Hiérarchique avec Ligne Fantôme d'Indentation
4. [Architecture UI de la Nouvelle Maquette (Split-Screen & Cockpit 3 Volets)](#4-architecture-ui-de-la-nouvelle-maquette-split-screen--cockpit-3-volets)
   - Wireframes & Maquette Textuelle Détaillée
   - Palette de Couleurs & Identité Visuelle Premium
5. [Contrôle de Cohérence Financière en Temps Réel (Audit de Chiffrage)](#5-contrôle-de-cohérence-financière-en-temps-réel-audit-de-chiffrage)
6. [Modèle de Données TypeScript & Moteur de Restructuration](#6-modèle-de-données-typescript--moteur-de-restructuration)
7. [Feuille de Route pour le Développement de la Maquette Frontend](#7-feuille-de-route-pour-le-développement-de-la-maquette-frontend)

---

## 1. Benchmark International & État de l'Art

### 1.1. Analyse des Solutions Existantes

| Solution | Origine / Type | Points Forts | Faiblesses Majeures / Frustrations UX |
| :--- | :--- | :--- | :--- |
| **Spigao** | France / Appel d'Offres BTP | Connecté aux plateformes d'AO, standardise les DPGF de marchés publics. | Interface vieillissante (style Windows XP/7), manipulation de masse rigide, lenteur sur les très gros classeurs. |
| **DeviSOC / Attic+** | France / Économie de la Construction | Richesse fonctionnelle, calculs précis, liaison CCTP. | Courbe d'apprentissage élevée, pas de mode « outliner moderne », trop de pop-ups modales. |
| **Onaya / Batigest** | France / ERP & Devis BTP | Structuration comptable solide, gestion des déboursés secs. | Nécessite des dizaines de clics pour reclassements de sections ; pas de raccourcis clavier unifiés. |
| **Autodesk Construction Cloud (ACC)** | USA / BIM & Cost Management | Liaison étroite avec la maquette 3D Revit/IFC. | Import Excel souvent fastidieux si le fichier ne respecte pas exactement le template standard strict. |
| **Procore** | USA / ERP Chantier Mondial | Collaboration cloud, interface web moderne. | Moins adapté aux subtilités françaises (Code de la commande publique, 7 niveaux UNTEC, DPGF à formats libres). |
| **Linear** *(Référence mondiale UX)* | USA / Issue Tracking & Roadmaps | **Vitesse foudroyante**, 100% pilotable au clavier, zéro latence, micro-animations élégantes. | Conçu pour la tech, pas adapté au format DPGF ni aux calculs de prix volumétriques. |
| **Notion / Logseq** | USA / Outliners Hiérarchiques | Manipulation intuitive de blocs imbriqués, `Tab` / `Shift+Tab`, drag & drop fluide. | Pas de tableur financier natif avec contrôles de formules de prix ($Q \times PU = Montant$). |

### 1.2. Les 5 Frustrations Majeures du Métreur BTP lors de l'Import Excel

1. **Le "Click-Hell" (L'enfer des clics) :** Devoir ouvrir un menu déroulant, faire défiler, et cliquer sur le niveau ligne par ligne pour 500 à 2000 lignes de devis.
2. **L'Inconsistance des Fichiers Excel Reçus :** Des architectes qui sautent des niveaux (passant de `1.` directement à `1.1.1.1`), des cellules fusionnées, des lignes de sous-totaux intercalées sans code.
3. **La Peur de Casser l'Arborescence :** Déplacer ou changer le niveau d'un parent sans voir immédiatement l'impact sur ses 30 sous-articles.
4. **L'Absence de Vérification Financière Immédiate :** Ne pas savoir si une ligne reclassée en titre ou en note a exclu son montant du total du lot.
5. **L'Absence d'Annulation Facile (`Ctrl+Z`) :** Si une manipulation en masse est erronée, l'utilisateur est souvent contraint de réimporter tout le fichier Excel.

---

## 2. Philosophie UX : Le « Speed-First & Zero-Friction » Outliner

Pour concevoir **la meilleure expérience utilisateur du monde** pour l'importation et la classification de DPGF, la nouvelle maquette repose sur trois piliers fondamentaux :

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     PILIERS DE LA NOUVELLE EXPÉRIENCE UX                  │
├─────────────────────────┬─────────────────────────┬───────────────────────┤
│    1. VITESSE CLAVIER   │   2. CLARTÉ VISUELLE    │ 3. CONFIANCE AUDITÉE  │
│      (Speed-Keys)       │   (Dynamic Indent)      │ (Realtime Financials) │
├─────────────────────────┼─────────────────────────┼───────────────────────┤
│ • 1 touche = 1 niveau   │ • Indentation colorée   │ • Audit d'écarts      │
│ • Tab / Shift+Tab       │ • Pinceau de style      │ • Contrôle Qte x PU   │
│ • Navigation J / K      │ • Fil d'Ariane direct   │ • Détection sous-total│
│ • Undo/Redo instantané  │ • Split-view Excel/WBS  │ • Alerte de cohérence │
└─────────────────────────┴─────────────────────────┴───────────────────────┘
```

---

## 3. Les 7 Méthodes Ultra-Rapides d'Attribution Manuelle des Niveaux

### Méthode 1 : Le Mode Clavier Direct « Speed-Keys » (Inspiré de Linear & Vim)

C'est la méthode de saisie la plus rapide jamais intégrée à un logiciel de chiffrage. L'utilisateur garde les deux mains sur le clavier sans toucher la souris.

* **Navigation au clavier :**
  * `↓` ou `J` : descendre à la ligne suivante.
  * `↑` ou `K` : monter à la ligne précédente.
  * `Espace` : cocher / décocher la ligne courante.
* **Attribution instantanée de niveau (Frappe directe sans modifier le texte) :**
  * Frapper `1` : Transforme instantanément la ligne en **NIV 1 - PROJET**
  * Frapper `2` : Transforme instantanément la ligne en **NIV 2 - ZONE**
  * Frapper `3` : Transforme instantanément la ligne en **NIV 3 - LOT**
  * Frapper `4` : Transforme instantanément la ligne en **NIV 4 - BLOC / CHAPITRE**
  * Frapper `5` : Transforme instantanément la ligne en **NIV 5 - ENSEMBLE / TYPE**
  * Frapper `6` : Transforme instantanément la ligne en **NIV 6 - ARTICLE**
  * Frapper `7` : Transforme instantanément la ligne en **NIV 7 - COMPOSANT / DÉTAIL**
  * Frapper `N` : Transforme en **NOTE / PRESCRIPTION** (non chiffré)
* **Décalage hiérarchique dynamique :**
  * `Tab` : Indenter d'un cran (Demote / Abaisser de niveau : ex. NIV 4 → NIV 5).
  * `Shift + Tab` : Désindenter d'un cran (Promote / Élever de niveau : ex. NIV 5 → NIV 4).
* **Cascade automatique au clavier :**
  * `Maj + 4` : Applique NIV 4 à la ligne sélectionnée **et cascade automatiquement à toutes les lignes sœurs suivantes de la section**.

---

### Méthode 2 : L'Outil Pinceau Dynamique (*Level Painter Brush*)

Inspiré de l'outil *Reproduire la mise en forme* d'Excel, mais dédié aux niveaux d'arborescence :

```
[ 🖌️ Activer Pinceau ] ──▶ Choisir : [ NIV 6 · ARTICLE ]
                              │
                              ▼
  Curseur transformé en pinceau cyan
  Au simple survol ou clic glissé sur les lignes :
  ┌──────────────────────────────────────────────────────────┐
  │ [x] 2.1.1  Installation base-vie        ──▶ devient NIV 6 │ (Clic)
  │ [x] 2.1.2  Branchements provisoires     ──▶ devient NIV 6 │ (Glisser)
  │ [x] 2.1.3  Étaiements et échafaudages   ──▶ devient NIV 6 │ (Glisser)
  └──────────────────────────────────────────────────────────┘
```

* **Fonctionnement :**
  1. L'utilisateur clique sur l'icône **Pinceau** dans la barre d'outils ou appuie sur le raccourci `B` (*Brush*).
  2. Il sélectionne le niveau cible (ex. `NIV 5 - ENSEMBLE`).
  3. Il clique ou trace une sélection sur les lignes du tableau : celles-ci adoptent le niveau immédiatement avec un effet visuel de surbrillance fluide.
  4. Appuyer sur `Echap` quitte le mode pinceau.

---

### Méthode 3 : La Sélection par Plage (Shift+Clic) & Barre Flottante Contextuelle

Pour modifier 50 lignes en 1 seconde :

1. L'utilisateur clique sur la ligne de départ `2.1.1`.
2. Il maintient `Shift` et clique sur la ligne d'arrivée `2.1.18`.
3. Une **Quick-Action Bar flottante** au design ultra-moderne apparaît immédiatement au bas de l'écran avec un compteur dynamique (*18 lignes sélectionnées*) :

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ✨ 18 lignes sélectionnées │ [1 PROJ] [2 ZONE] [3 LOT] [4 BLOC] [5 ENS] [6 ART] [7 COMP] [NOTE] │
│  Actions rapides : [ ⇥ +1 Niveau ] [ ⇤ -1 Niveau ] [ 🔄 Rénuméroter ] [ 🗑️ Ignorer ] [ ✕ Fermer ]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* Un simple clic sur `[6 ART]` ou l'appui sur la touche `6` réassigne les 18 lignes en bloc !

---

### Méthode 4 : La Règle Visuelle d'Indentation à Glissière (*Visual Indent Ruler*)

Chaque ligne dispose dans sa marge de gauche d'une mini-règle graduée de 7 micro-points discrets :

```
        Règle d'indentation (1 à 7)
        1  2  3  4  5  6  7  N
Row 1:  ●  ○  ○  ○  ○  ○  ○  ○   [NIV 1 - PROJET]
Row 2:  ○  ●  ○  ○  ○  ○  ○  ○   [NIV 2 - ZONE]
Row 3:  ○  ○  ●  ○  ○  ○  ○  ○   [NIV 3 - LOT]
Row 4:  ○  ○  ○  ●  ○  ○  ○  ○   [NIV 4 - CHAPITRE]
Row 5:  ○  ○  ○  ○  ●  ○  ○  ○   [NIV 5 - ENSEMBLE]
Row 6:  ○  ○  ○  ○  ○  ●  ○  ○   [NIV 6 - ARTICLE]
```

* **Interaction tactile & souris directe :** Cliquer sur n'importe quel cran bascule la ligne immédiatement sur ce niveau, avec ajustement instantané de l'indentation et de la couleur du badge.

---

### Méthode 5 : Les Règles de Masque & Regex Express en 1 Clic

Pour les devis de plus de 1000 lignes, l'intelligence contextuelle propose des règles automatiques pré-paramétrées :

* **Bouton « Baguette Magique » (Smart Auto-Classify) :**
  * `Règle 1` : Tout code avec 1 chiffre (ex. `1`, `2`) ➔ **NIV 3 (LOT)**
  * `Règle 2` : Tout code avec 2 chiffres (ex. `2.1`, `3.2`) ➔ **NIV 4 (BLOC / CHAPITRE)**
  * `Règle 3` : Tout code avec 3 chiffres (ex. `2.1.1`) sans sous-détail ➔ **NIV 6 (ARTICLE)**
  * `Règle 4` : Lignes sans code et sans montant (texte seul) ➔ **NOTE**
  * `Règle 5` : Lignes en gras dans le fichier Excel source ➔ Promues d'un niveau supérieur.

---

### Méthode 6 : La Cascade Intelligente à Frontières Dynamiques (*Smart Boundary Cascade*)

Lorsqu'on modifie une ligne comme `2.1.1` :
* Le système calcule la **frontière de section** :
  * Si la ligne `2.1.1` passe de NIV 5 à NIV 4 :
    * Toutes les lignes sœurs directes `2.1.2`, `2.1.3`, ..., `2.1.11` passent aussi en NIV 4 (ou restent sous-ordonnées selon le choix de l'utilisateur).
    * La cascade s'arrête strictement à la ligne `2.2` (qui possède déjà un niveau 4 ou supérieur).
* L'utilisateur peut basculer l'option d'un simple clic grâce à la mention interactive :
  `[x] Cascader sur les lignes suivantes jusqu'au prochain titre supérieur`

---

### Méthode 7 : Le Glisser-Déposer Hiérarchique avec Ligne Fantôme d'Indentation

* En saisissant la poignée de glissement (`:::`) d'une ligne ou d'un groupe de lignes :
  * Glisser vers le bas/haut : réordonne la position.
  * Glisser légèrement vers la droite : affiche une ligne fantôme bleue indentée signalant l'adoption comme sous-élément du bloc supérieur.
  * Glisser vers la gauche : désindente l'élément pour en faire un parent.

---

## 4. Architecture UI de la Nouvelle Maquette (Split-Screen & Cockpit 3 Volets)

### 4.1. Vue Globale de l'Interface

La nouvelle maquette propose un agencement en **3 volets synchronisés** :

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟦 ECO-PILOT DPGF STUDIO v2  │ Projet: Hôtel 4★ Confluence │ Marché: 3 854 200,00 € HT │ [✓ Valider l'Arbre]│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Import Fichier ──▶ 2. Cartographie Colonnes ──▶ 3. Classification & WBS (Actif) ──▶ 4. Contrôle & Export │
├──────────────────────────┬──────────────────────────────────────────────────────┬───────────────────────────┤
│ 📂 SÉLECTEUR LOTS & ZONES │ 📑 TABLEUR CLASSIFICATION RAPIDE (Outliner)          │ 🌳 ARBRE WBS TEMPS RÉEL    │
│                          │                                                      │                           │
│ [Tous les lots] (14)     │ [Tout cocher]  [Pinceau 🖌️]  [Baguette 🪄] [Annuler ↩] │ ▾ Projet Hôtel 4★         │
│                          │                                                      │   ▸ Zone Nord - Bât A     │
│ ▾ ZONE INFRA             │ [Raccourcis : 1..7 Niveaux | Tab/Shift+Tab Indenter]  │   ▾ Zone Sud - Bât B      │
│   • Lot 01 Terrassement  │                                                      │     ▾ LOT 02 Gros Œuvre   │
│   • Lot 02 Gros Œuvre (●)│ [✓] [NIV 4 BLOC] 2.1 Travaux préparatoires           │       ▾ 2.1 Travaux prép. │
│   • Lot 03 Étanchéité    │   │                                                  │         • 2.1.1 Base-vie  │
│                          │   ├── [✓] [NIV 5 ENS] 2.1.1 Installation base-vie    │         • 2.1.2 Branchem. │
│ ▾ ZONE SUPERSTRUCTURE    │   ├── [✓] [NIV 5 ENS] 2.1.2 Branchements provisoires │         • 2.1.3 Levage    │
│   • Lot 04 Façades       │   └── [✓] [NIV 5 ENS] 2.1.3 Manutention et levage    │       ▸ 2.2 Fondations    │
│   • Lot 05 Menuiseries   │                                                      │                           │
│                          │ [✓] [NIV 4 BLOC] 2.2 Terrassements & Fondations      │ ───────────────────────── │
│ [ + Ajouter un Lot ]     │   ├── [✓] [NIV 6 ART] 2.2.1 Fouilles en pleine masse │ 💰 SOUS-TOTAL LOT :       │
│                          │   └── [✓] [NIV 6 ART] 2.2.2 Évacuation des terres    │    842 150,00 € HT        │
├──────────────────────────┴──────────────────────────────────────────────────────┴───────────────────────────┤
│  ⚡ Barre d'État : 421 lignes au total │ 419 classées (99.5%) │ 2 notes │ 0 erreur de formule │ Ctrl+Z Annuler│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2. Code Couleur Normalisé des 7 Niveaux

Pour une ergonomie visuelle sans effort cognitif, chaque niveau dispose de sa signature chromatique :

| Niveau | Rôle Métier | Couleur Badge | Code Hex | Signification Visuelle |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **PROJET** | Bleu Nuit / Violet | `#4F46E5` | Niveau racine suprême de l'opération |
| **2** | **ZONE** | Indigo / Azur | `#2563EB` | Découpage spatial / bâtiment / phase |
| **3** | **LOT** | Bleu Océan | `#0284C7` | Corps d'état d'attribution de marché |
| **4** | **BLOC / CHAPITRE** | Émeraude / Vert forêt | `#059669` | Regroupement fonctionnel de travaux |
| **5** | **ENSEMBLE / TYPE** | Ambre / Ocre | `#D97706` | Macro-ouvrage ou prestation regroupée |
| **6** | **ARTICLE** | Cyan / Turquoise | `#0891B2` | Ligne unitaire chiffrée ($Q \times PU$) |
| **7** | **COMPOSANT** | Rose / Framboise | `#DB2777` | Sous-détail analytique interne |
| **N** | **NOTE** | Gris Ardoise | `#64748B` | Texte descriptif sans incidence financière |

---

## 5. Contrôle de Cohérence Financière en Temps Réel (Audit de Chiffrage)

Un des atouts majeurs de cette maquette est l'**audit instantané des calculs** pendant la classification :

1. **Détection Automatique des Sommes Parents :**
   - Dès qu'une ligne est définie comme **NIV 4 (BLOC)** ou **NIV 3 (LOT)**, son montant devient automatiquement la somme consolidée de ses éléments enfants.
2. **Comparaison avec le Montant Excel d'Origine :**
   - Si le tableur Excel contenait déjà un sous-total pré-calculé (ex: `125 400,00 €`), le moteur compare la somme des articles enfants avec cette valeur :
     - **Écart = 0 € :** Badge vert `✓ Conforme au centime près`.
     - **Écart $\ne$ 0 € :** Badge orange `⚠️ Écart de 1 200,00 € détecté` (ex: une ligne article a été oubliée ou classée en note par erreur).
3. **Indicateur de Quantité Orpheline :**
   - Si une ligne de niveau 6 (ARTICLE) possède un PU mais une quantité vide ou nulle, le système la signale immédiatement par un point d'alerte discret.

---

## 6. Modèle de Données TypeScript & Moteur de Restructuration

Voici l'architecture TypeScript recommandée pour alimenter la nouvelle maquette :

```typescript
// Modèle de données universel d'un poste DPGF
export type DPGFLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 8 = NOTE

export interface DPGFItem {
  id: string;
  excelRowIndex: number;
  code: string;                 // ex: "2.1.1"
  designation: string;          // ex: "Installation de la base-vie"
  level: DPGFLevel;             // 1 à 8
  role: 'PROJECT' | 'ZONE' | 'LOT' | 'BLOC' | 'ENSEMBLE' | 'ARTICLE' | 'COMPOSANT' | 'NOTE';
  unite?: string;               // m², m³, u, fft, etc.
  quantite?: number;
  prixUnitaire?: number;
  montantHT: number;
  isBoldInExcel?: boolean;
  checked?: boolean;
  children?: DPGFItem[];
  metadata?: {
    excelFormula?: string;
    hasDiscrepancy?: boolean;
    discrepancyDelta?: number;
  };
}

// Algorithme O(N) de restructuration instantanée de la hiérarchie
export function buildHierarchyFromFlatItems(flatList: DPGFItem[]): DPGFItem[] {
  const root: DPGFItem[] = [];
  const stack: { node: DPGFItem; level: number }[] = [];

  for (const item of flatList) {
    const node: DPGFItem = { ...item, children: [] };
    const currentLevel = item.level === 8 ? 99 : item.level; // Les notes se rattachent au parent actif

    // Dépilement tant que le haut de la pile est de niveau supérieur ou égal
    while (stack.length > 0 && stack[stack.length - 1].level >= currentLevel) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }

    // Niveaux pouvant avoir des enfants (PROJET, ZONE, LOT, BLOC, ENSEMBLE)
    if (item.level <= 5) {
      stack.push({ node, level: currentLevel });
    }
  }

  return root;
}
```

---

## 7. Feuille de Route pour le Développement de la Maquette Frontend

Pour transformer cette vision en une application interactive complète dans l'environnement de développement :

1. **Étape 1 : Création du Composant Outliner Ultra-Rapide (`FastDpgfOutliner.tsx`)**
   - Écouteur global d'événements clavier (`keydown`) pour les touches `1` à `7`, `N`, `Tab`, `Shift+Tab`, `J`, `K`.
   - Rendu virtuel de liste (via TanStack Virtual ou CSS natif) pour supporter 5 000 lignes avec 60 FPS constants.
2. **Étape 2 : Implémentation du Mode Pinceau (`LevelPainterMode.tsx`)**
   - Curseur personnalisé en forme de pinceau avec pastille colorée du niveau sélectionné.
   - Événements `onMouseEnter` et `onMouseDown` pour appliquer le niveau au passage de la souris.
3. **Étape 3 : Module d'Audit Financier en Temps Réel (`FinancialAuditBar.tsx`)**
   - Calcul des sommes en cascade montante (`Rollup bottom-up`).
   - Comparaison en direct avec les sous-totaux de la colonne Excel d'origine.
4. **Étape 4 : Export & Synchronisation Bi-directionnelle**
   - Export vers Excel enrichi avec volets masquables (`Group / Outline Level` natifs d'Excel).
   - Export JSON structuré prêt pour l'API backend et les modules de devis / situations de travaux.

---

> Ce fichier est prêt à servir de cahier des charges et de plan de conception pour le développement de la nouvelle maquette DPGF.
