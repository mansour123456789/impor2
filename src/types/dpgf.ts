export type ProjectPhase = 'import' | 'metres' | 'consultation' | 'chiffrage' | 'export';

export type ImportSubStep = 'import' | 'association' | 'identification' | 'arborescence' | 'verification';

export type CalcMode =
  | 'SUM'
  | 'QTY_PU'
  | 'LUMP'
  | 'COMP_UNIT'
  | 'COMP_SUM'
  | 'ENS_QTY'
  | 'ENS_GLOBAL'
  | 'RATIO'
  | 'PERCENT'
  | 'RATE_ONLY';

export type InclusionMode =
  | 'BASE'
  | 'OPTION'
  | 'PSE'
  | 'VARIANTE'
  | 'PROVISION'
  | 'PM'
  | 'INCLUS'
  | 'INFO';

export type NodeRole =
  | 'PROJECT'
  | 'TRANCHE'
  | 'ZONE'
  | 'LOCATION'
  | 'MACRO_LOT'
  | 'LOT'
  | 'CHAPITRE'
  | 'BLOC'
  | 'ENSEMBLE'
  | 'TYPE'
  | 'OUVRAGE'
  | 'ARTICLE'
  | 'COMPONENT'
  | 'COMPONENT_ENS'
  | 'COMPONENT_ART'
  | 'NOTE'
  | 'CTRL'
  | 'LIGNE';

export type ResourceType = 'MO' | 'FOURN' | 'MATERIEL' | 'ST' | 'TRANSPORT';

export interface MetreDimensionLine {
  id: string;
  libelle: string;
  localisation: string;
  planRef?: string;
  nombre: number;
  longueur?: number;
  largeur?: number;
  hauteur?: number;
  formule?: string;
  signe: '+' | '-';
  resultat: number;
  commentaire?: string;
}

export interface StagingTreeNode {
  id: string;
  code: string;
  designation: string;
  role: NodeRole;
  level?: number; // 1 to 7: 1=PROJECT, 2=ZONE, 3=LOT, 4=BLOC, 5=ENSEMBLE & ARTICLE (même position), 6=COMPONENT, 7=NOTE/CTRL
  sheetName?: string;
  calcMode: CalcMode;
  inclusionMode: InclusionMode;
  unit?: string;
  quantite?: number;
  quantiteMoe?: number;
  unitPrice?: number;
  montantHT: number;
  confidenceScore: number; // 0 to 1
  alertCodes?: string[]; // e.g. ['V01', 'V07', 'V02']
  alertMessage?: string;
  tags?: { axis: 'LOCALISATION' | 'CLASSIF_UNTEC' | 'TRANCHE' | 'REPERE'; value: string }[];
  children?: StagingTreeNode[];
  checked: boolean;
  indeterminate?: boolean;
  multiplier?: number;
  resourceType?: ResourceType;
  isExpanded?: boolean;
  sourceRef?: { file?: string; sheet: string; row: number };
}

export interface ImportIntegrationOptions {
  targetLotId: string;
  conflictMode: 'remplacer' | 'fusionner' | 'dupliquer';
  priceMode: 'importer' | 'ignorer' | 'appliquer_k';
  coeffK: number;
  qtyMode: 'importer' | 'zero' | 'conserver';
  hierarchyMode: 'conserver_chemin' | 'aplatir';
}

export interface ArticleItem {
  id: string;
  code: string;
  designation: string;
  unite: string;
  quantite: number;
  quantiteMoe?: number;
  quantiteEntreprise?: number;
  quantiteRetenue?: number;
  quantiteExecutee?: number;
  prixUnitaireHT: number;
  montantHT: number;
  tva: number;
  coeffVente: number;
  prixVenteHT: number;
  typeArticle: 'materiau' | 'main_oeuvre' | 'materiel' | 'sous_traitance' | 'mixte';
  resourceType?: ResourceType;
  calcMode?: CalcMode;
  inclusionMode?: InclusionMode;
  level?: number; // Level 4 (Article) or Level 5 (Composant)
  components?: ArticleItem[]; // Nested Level 5 components
  metreLines?: MetreDimensionLine[];
  ratioParentId?: string;
  ratioValue?: number; // e.g. 95 kg/m3
  statut: 'VALIDE' | 'EN_COURS' | 'REJETE';
  motifRejet?: string;
  notes?: string;
  localisation?: string;
}

export interface OuvrageItem {
  id: string;
  code: string;
  designation: string;
  unite?: string;
  quantite?: number;
  quantiteMoe?: number;
  quantiteEntreprise?: number;
  quantiteRetenue?: number;
  quantiteExecutee?: number;
  prixUnitaireHT?: number;
  montantHT: number;
  articles: ArticleItem[];
  isExpanded: boolean;
  statut: 'VALIDE' | 'EN_COURS' | 'REJETE';
  motifRejet?: string;
  calcMode?: CalcMode;
  inclusionMode?: InclusionMode;
  role?: NodeRole;
  metreLines?: MetreDimensionLine[];
  localisation?: string;
  toleranceAlert?: string;
}

export interface BlocItem {
  id: string;
  code: string;
  titre: string;
  ouvrages: OuvrageItem[];
  isExpanded: boolean;
  totalHT: number;
  localisation?: string;
}

export interface LotItem {
  id: string;
  code: string;
  titre: string;
  iconName?: string;
  blocs: BlocItem[];
  tva: number; // e.g. 20
  coefficientVente: number; // e.g. 1.25
  statutValidation: 'VALIDE' | 'EN_COURS' | 'REJETE' | 'EN_ATTENTE';
  motifRejet?: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  client: string;
  deadline: string;
  status: 'En attente' | 'En cours' | 'Validé' | 'Terminé';
  teamMembers: string[];
  budgetEstimeHT: number;
  tauxMargeEstime: number;
  localisation: string;
  surfacePlancher: string;
}

export interface SubcontractorConsultation {
  id: string;
  lotId: string;
  lotName: string;
  entreprise: string;
  contact: string;
  email: string;
  telephone: string;
  dateEnvoi: string;
  dateReponse?: string;
  montantDevisHT: number;
  budgetEstimeHT: number;
  ecartPourcentage: number;
  delaiSemaines: number;
  statut: 'Reçu' | 'En négociation' | 'Retenu' | 'Rejeté' | 'En attente';
  scoreTechnique: number; // /10
  commentaire?: string;
}

export interface ProjectFile {
  id: string;
  nom: string;
  taille: string;
  dateAjout: string;
  type: 'xlsx' | 'pdf' | 'dwg' | 'docx';
  categorie: 'DPGF Excel' | 'CCTP' | 'Plans Béton' | 'Rapport Géotechnique' | 'DCE';
  url?: string;
}

export interface ProjectHistoryEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  user: string;
  action: string;
  type: 'import' | 'validation' | 'rejet' | 'consultation' | 'chiffrage' | 'export' | 'update';
  details: string;
}
