# Eco-Pilot Studio v2 - Next-Gen DPGF Importer & Smart WBS Outliner (dossier example2)

Cette application est la version **Next-Gen** de l'import DPGF, bâtie avec le **même design** épuré et professionnel qu'Eco-Pilot, et intégrant toutes les innovations de rapidité et d'expérience utilisateur spécifiées dans [example2.md](file:///c:/Users/USER/Desktop/v1/example2.md).

---

## 🚀 Démarrage Rapide

### Port Dédié :
👉 **http://localhost:3200** (conteneur `ecopilot-hotel-dpgf-v2`)

```bash
cd example2
docker compose up -d --build
```

---

## ⚡ Les Innovations Clés de example2 :

1. **Mode Clavier Direct « Speed-Keys » (100% sans souris) :**
   - **Touches `1` à `7`** : assignation instantanée du niveau hiérarchique à la ligne active.
   - **Touche `N`** : assignation instantanée en **NOTE** (non chiffrée).
   - **`Tab`** : Indenter / Abaisser de niveau (+1).
   - **`Shift + Tab`** : Désindenter / Promouvoir de niveau (-1).
   - **Flèches `↑` / `↓` ou touches `J` / `K`** : navigation fluide de ligne en ligne.
   - **`Espace`** : cocher / décocher la ligne courante.
   - **`Ctrl + Z`** : Annulation instantanée (Undo).

2. **Outil Pinceau Dynamique (*Level Painter Brush*) :**
   - Raccourci **Touche `B`** ou bouton `[ 🖌️ Pinceau : NIV X ]`.
   - Cliquez ou glissez sur les lignes pour leur appliquer directement le niveau sélectionné.

3. **Sélection par Plage (`Shift + Clic`) & Barre Flottante d'Actions Groupées :**
   - Cliquez une ligne de départ, `Shift + Clic` sur la ligne d'arrivée.
   - Dock flottant au bas de l'écran avec boutons d'assignation directe `[4 BLOC]`, `[5 ENS]`, `[6 ART]`, etc.

4. **Règle Visuelle d'Indentation (*Visual Indent Ruler*) :**
   - Micro-règle de 7 points colorés (`1..7 + N`) sur chaque ligne pour un changement en 1 tap tactile ou souris.

5. **Cockpit Split-Screen Arbre WBS & Audit Financier en Direct :**
   - Volet latéral synchronisé en temps réel avec recalcul instantané des sous-totaux.
   - Contrôle d'écart de boucle (`0,00 € · 100% Conforme au centime près`).

6. **Bouton Baguette Magique (*Smart Auto-Classifier*) :**
   - Détection et classification automatique intelligente en 1 clic selon les masques de code (`X.X` -> BLOC, `X.X.X` -> ENSEMBLE/ARTICLE).

---

### Option 2 : En Local avec Node.js

```bash
npm install
npm run dev
```

L'application sera accessible sur :  
👉 **http://localhost:5173**

---

## 🌟 Fonctionnalités Implémentées

### 1. Navigation & Identité Visuelle
- **Barre supérieure (Header)** :
  - Bouton retour arrière aux projets.
  - Basculeur de thème dynamique (Mode Clair / Mode Sombre avec pill lune/soleil).
  - Centre de notifications avec badge et popover déroulant.
  - Messagerie instantanée.
  - Menu Profil utilisateur : **Arrouj Samar** (Administrateur).
- **Barre latérale (Sidebar)** :
  - Logo Eco-Pilot officiel avec repli / déploiement (Collapsible).
  - Navigation par rubriques : *Accueil*, *Affaires* (*Mes Projets* actif en pill bleue, *Historique*, *Clients*, *Fournisseurs*), *Catalogue* (*Bibliothèque*, *Favoris*, *Référentiel*, *Articles en attente*), *Organisation* (*Employés*, *Configuration*), et *Aide et support*.
- **En-tête de Projet (Top Bar)** :
  - Titre dynamique : **Construction Hôtel Grand Confort 4★** (basculable en 1 clic sur **Buanderie Chevilly Larue**).
  - Badge de statut coloré (*En attente*, *En cours*, *Validé*).
  - Métadonnées complètes : Maître d'ouvrage (*Ecobat Conseils*), Délai (*31 / 07 / 2026*), Avatars de l'équipe (*CD*, *YT*, *AS*).
  - Bouton **Fichiers** ouvrant la modale documentaire.
  - Bouton **Historique** ouvrant le panneau latéral d'audit trail.
  - Bouton **Afficher / Masquer Récapitulatif** financier.

---

### 2. Le Stepper des 5 Phases Complètes

1. **Phase 1 : Import DPGF**
   - Stepper des 5 sous-étapes :
     1. *Import* (Zone de glisser-déposer avec ellipses concentriques dégradées, 3 fiches de réassurance : *Import rapide*, *Fichier sécurisé*, *Analyse assistée*, et bouton de chargement automatique démo).
     2. *Association des lots* (Détection des feuilles Excel du classeur et affectation aux lots).
     3. *Identification des colonnes* (Correspondance N° Article, Désignation, Unité, Quantité, PU, Total HT).
     4. *Classification des éléments* (Reconnaissance Lots, Blocs, Ouvrages, Articles).
     5. *Vérification* (Récapitulatif et passage direct à la phase Métrés).

2. **Phase 2 : Métrés (Validation des quantitatifs)**
   - Navigation par onglets entre les lots :
     - **LOT 01** : Terrassements, Soutènement & VRD
     - **LOT 02** : Gros Œuvre & Structure Béton Armé (Hôtel R+5)
     - **LOT 03** : Façades, ITE & Menuiseries Extérieures
     - **LOT 04** : Plâtrerie, Cloisons Séparatives & Faux-Plafonds
     - **LOT 05** : VRD, Voiries Lourdes & Aménagements Extérieurs
   - Arborescence hiérarchique : **Lots ➔ Blocs ➔ Ouvrages ➔ Articles**.
   - Édition directe en ligne (Inline editing) des quantités et prix unitaires avec recalcul instantané des sous-totaux.
   - Boutons d'action : *Valider les métrés*, *Refuser les métrés*, *Nouveau Lot*, *Nouvel Ouvrage*.

3. **Phase 3 : Consultations (Sous-traitants & Fournisseurs)**
   - Tableau comparatif des offres reçues (*BTP Métropole IDF*, *Spie Batignolles*, *Vinci Construction*, *Eiffage Grands Projets*).
   - Indicateurs d'écart budgétaire en temps réel (+/- % avec badges vert/rouge).
   - Délais de réalisation et scores techniques (/10).
   - Possibilité de retenir une offre ou de lancer une nouvelle consultation.

4. **Phase 4 : Chiffrage (Rentabilité & Marges)**
   - Décomposition des coûts par nature : *Matériaux* (44%), *Main d'œuvre* (32%), *Matériel* (12%), *Sous-traitance* (12%).
   - Curseurs interactifs en direct :
     - Coefficient multiplicateur de vente général (ex. `1.26`).
     - Frais généraux d'entreprise (ex. `10.0 %`).
     - Marge nette visée (ex. `13.5 %`).
     - Provision pour aléas (ex. `2.5 %`).
   - Cartes KPI récapitulatives : Déboursé Sec HT, Marge Brute, Prix de Vente HT, TVA 20%, Prix Total TTC.

5. **Phase 5 : Export DPGF**
   - Génération et téléchargement en direct d'un **véritable classeur Excel `.xlsx` multi-onglets** via SheetJS (*00_RECAPITULATIF*, feuilles détaillées par lot).
   - Bascule d'affichage : Vue Client (Prix de vente) vs Vue Interne (Déboursé sec & marges).
   - Mode impression / PDF prêt à l'emploi.

---

### 3. Popups & Modales Incluses
- 📁 **Modale Fichiers** : Consultation et téléchargement des DCE, CCTP, Plans de coffrage `.dwg`, et rapports géotechniques.
- 🕒 **Panneau coulissant Historique** : Journal chronologique des actions horodatées.
- ✅ **Modale de Validation** : Confirmation avec récapitulatif.
- ❌ **Modale de Rejet** : Formulaire obligatoire avec saisie du motif de refus.
- ➕ **Modale Nouveau Lot** : Définition du code, intitulé, TVA et coefficient.
- 📦 **Modale Nouvel Ouvrage** : Ajout d'un ouvrage avec choix du bloc, unité et quantitatif.
- 🚚 **Modale Consultation Sous-traitant** : Enregistrement d'un devis partenaire.
- 💬 **Widget Chat Flottant (en bas à droite)** : Bulle d'assistance interactive sur le projet.

---

## 🛠️ Stack Technique
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Vite**
- **Lucide Icons**
- **XLSX (SheetJS)** pour l'export Excel natif
- **Docker & Nginx Alpine**
