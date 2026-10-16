import React, { useState, useEffect } from 'react';
import { ProjectPhase, LotItem, ProjectInfo, SubcontractorConsultation, ProjectFile, ProjectHistoryEvent, OuvrageItem } from './types/dpgf';
import {
  INITIAL_PROJECT,
  INITIAL_LOTS,
  MOCK_CONSULTATIONS,
  MOCK_PROJECT_FILES,
  MOCK_HISTORY_EVENTS,
} from './data/mockHotelDpgf';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProjectTopBar } from './components/layout/ProjectTopBar';
import { ProjectStepper } from './components/layout/ProjectStepper';
import { ProjectSummaryPanel } from './components/layout/ProjectSummaryPanel';
import { Phase1Import } from './components/phases/Phase1Import';
import { Phase2Metres } from './components/phases/Phase2Metres';
import { Phase3Consultations } from './components/phases/Phase3Consultations';
import { Phase4Chiffrage } from './components/phases/Phase4Chiffrage';
import { Phase5Export } from './components/phases/Phase5Export';

// Modals
import { FilesModal } from './components/modals/FilesModal';
import { HistorySidebar } from './components/modals/HistorySidebar';
import { ValidationApproveModal } from './components/modals/ValidationApproveModal';
import { ValidationRejectModal } from './components/modals/ValidationRejectModal';
import { AddLotModal } from './components/modals/AddLotModal';
import { AddOuvrageModal } from './components/modals/AddOuvrageModal';
import { ConsultationModal } from './components/modals/ConsultationModal';
import { FloatingChatWidget } from './components/modals/FloatingChatWidget';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-slate-800">
          <div className="max-w-2xl w-full bg-white rounded-2xl p-6 shadow-xl border border-rose-200">
            <h2 className="text-lg font-bold text-rose-700 mb-2">Une erreur est survenue</h2>
            <p className="text-xs text-slate-800 mb-2 font-mono bg-slate-100 p-3 rounded-lg overflow-auto font-bold">
              {this.state.error?.message || 'Erreur inattendue'}
            </p>
            <pre className="text-[10px] text-slate-600 mb-4 font-mono bg-slate-50 p-3 rounded-lg overflow-auto max-h-72 whitespace-pre-wrap">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1B4591] text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-[#163a7a]"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  // Phase state: default 'import' matching ?phase=import
  const [activePhase, setActivePhase] = useState<ProjectPhase>('import');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Core data states
  const [project, setProject] = useState<ProjectInfo>(INITIAL_PROJECT);
  const [lots, setLots] = useState<LotItem[]>(INITIAL_LOTS);
  const [consultations, setConsultations] = useState<SubcontractorConsultation[]>(MOCK_CONSULTATIONS);
  const [files, setFiles] = useState<ProjectFile[]>(MOCK_PROJECT_FILES);
  const [historyEvents, setHistoryEvents] = useState<ProjectHistoryEvent[]>(MOCK_HISTORY_EVENTS);

  // Validation statuses
  const [metresValidationStatus, setMetresValidationStatus] = useState<'VALIDE' | 'EN_COURS' | 'REJETE' | 'EN_ATTENTE'>('EN_COURS');
  const [metresMotifRejet, setMetresMotifRejet] = useState<string>('');
  const [chiffrageStatus, setChiffrageStatus] = useState<'VALIDE' | 'EN_COURS' | 'REJETE' | 'EN_ATTENTE'>('EN_COURS');

  // Modals state
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);
  const [isAddOuvrageModalOpen, setIsAddOuvrageModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Demo switcher: Toggle between Hotel project and Buanderie Chevilly-Larue
  const handleSwitchProjectDemo = () => {
    if (project.name.includes('Hôtel')) {
      setProject({
        ...project,
        name: 'Buanderie Chevilly Larue',
        description: 'Réhabilitation du bâtiment buanderie - Lots Génie Civil & Gros Œuvre',
        client: 'Ecobat Conseils',
        deadline: '31 / 07 / 2026',
        status: 'En attente',
      });
    } else {
      setProject(INITIAL_PROJECT);
    }
  };

  // Add event helper
  const addHistoryEvent = (action: string, type: ProjectHistoryEvent['type'], details: string) => {
    const newEvt: ProjectHistoryEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      relativeTime: "À l'instant",
      user: 'Samar Arrouj',
      action,
      type,
      details,
    };
    setHistoryEvents((prev) => [newEvt, ...prev]);
  };

  // Handle Approve
  const handleConfirmApprove = () => {
    if (activePhase === 'metres') {
      setMetresValidationStatus('VALIDE');
      addHistoryEvent('Validation des Métrés', 'validation', "L'ensemble des quantitatifs a été validé et verrouillé par Samar Arrouj.");
    } else if (activePhase === 'chiffrage') {
      setChiffrageStatus('VALIDE');
      setProject((p) => ({ ...p, status: 'Validé' }));
      addHistoryEvent('Validation du Chiffrage', 'chiffrage', 'Le chiffrage financier et les coefficients ont été approuvés.');
    }
  };

  // Handle Reject
  const handleConfirmReject = (reason: string) => {
    if (activePhase === 'metres') {
      setMetresValidationStatus('REJETE');
      setMetresMotifRejet(reason);
      addHistoryEvent('Refus des Métrés', 'rejet', `Métrés rejetés pour le motif suivant : ${reason}`);
    } else if (activePhase === 'chiffrage') {
      setChiffrageStatus('REJETE');
      addHistoryEvent('Refus du Chiffrage', 'rejet', `Chiffrage rejeté : ${reason}`);
    }
  };

  // Add new Lot
  const handleAddLot = (newLot: LotItem) => {
    setLots((prev) => [...prev, newLot]);
    addHistoryEvent(`Création du Lot ${newLot.code}`, 'update', `Nouveau lot ${newLot.titre} ajouté à la DPGF.`);
  };

  // Add new Ouvrage
  const handleAddOuvrage = (lotId: string, blocId: string, newOuvrage: OuvrageItem) => {
    const updated = lots.map((l) => {
      if (l.id !== lotId) return l;
      return {
        ...l,
        blocs: l.blocs.map((b) => {
          if (b.id !== blocId) return b;
          const newOuvrages = [...b.ouvrages, newOuvrage];
          return {
            ...b,
            ouvrages: newOuvrages,
            totalHT: newOuvrages.reduce((acc, curr) => acc + curr.montantHT, 0),
          };
        }),
      };
    });
    setLots(updated);
    addHistoryEvent(`Ajout ouvrage ${newOuvrage.code}`, 'update', `Ouvrage "${newOuvrage.designation}" ajouté.`);
  };

  // Add consultation
  const handleAddConsultation = (newConsult: SubcontractorConsultation) => {
    setConsultations((prev) => [newConsult, ...prev]);
    addHistoryEvent('Consultation sous-traitant', 'consultation', `Consultation lancée auprès de ${newConsult.entreprise}.`);
  };

  // Retain offer
  const handleRetainOffer = (id: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statut: 'Retenu' } : c))
    );
    const retained = consultations.find((c) => c.id === id);
    if (retained) {
      addHistoryEvent('Offre sous-traitant retenue', 'consultation', `L'offre de ${retained.entreprise} (${retained.montantDevisHT.toLocaleString('fr-FR')} € HT) a été retenue.`);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#EFF1F8] text-[#263248] dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main App Container */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={(dark) => setIsDarkMode(dark)}
          onBack={() => setActivePhase('import')}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1920px] w-full mx-auto">
          
          {/* Project Details Top Bar */}
          <ProjectTopBar
            project={project}
            onOpenFiles={() => setIsFilesModalOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            summaryOpen={summaryOpen}
            onToggleSummary={() => setSummaryOpen(!summaryOpen)}
            onSwitchProjectDemo={handleSwitchProjectDemo}
          />

          {/* 5-Phase Horizontal Stepper */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <ProjectStepper
              currentPhase={activePhase}
              onPhaseChange={(phase) => setActivePhase(phase)}
            />
          </div>

          {/* Phase Body + Summary Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Active Phase View */}
            <div className="flex-1 w-full min-w-0">
              {activePhase === 'import' && (
                <Phase1Import
                  existingLots={lots}
                  onImportComplete={(imported) => {
                    if (imported && imported.length > 0) {
                      setLots(imported);
                    }
                    setActivePhase('metres');
                    addHistoryEvent('Import DPGF validé', 'import', "DPGF importée via l'Arbre Universel v2 avec sélection sélective.");
                  }}
                />
              )}

              {activePhase === 'metres' && (
                <Phase2Metres
                  lots={lots}
                  onUpdateLots={setLots}
                  onOpenApproveModal={() => setIsApproveModalOpen(true)}
                  onOpenRejectModal={() => setIsRejectModalOpen(true)}
                  onOpenAddLotModal={() => setIsAddLotModalOpen(true)}
                  onOpenAddOuvrageModal={() => setIsAddOuvrageModalOpen(true)}
                  validationStatus={metresValidationStatus}
                  motifRejet={metresMotifRejet}
                />
              )}

              {activePhase === 'consultation' && (
                <Phase3Consultations
                  consultations={consultations}
                  onOpenNewConsultation={() => setIsConsultModalOpen(true)}
                  onRetainOffer={handleRetainOffer}
                />
              )}

              {activePhase === 'chiffrage' && (
                <Phase4Chiffrage
                  project={project}
                  lots={lots}
                  onUpdateLots={setLots}
                  onOpenApproveModal={() => setIsApproveModalOpen(true)}
                  onOpenRejectModal={() => setIsRejectModalOpen(true)}
                  chiffrageStatus={chiffrageStatus}
                />
              )}

              {activePhase === 'export' && (
                <Phase5Export
                  project={project}
                  lots={lots}
                />
              )}
            </div>

            {/* Collapsible Right Summary Panel */}
            {summaryOpen && (
              <ProjectSummaryPanel
                project={project}
                lots={lots}
                onClose={() => setSummaryOpen(false)}
                onNavigatePhase={(p) => setActivePhase(p)}
              />
            )}

          </div>

        </main>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />

      {/* All Popups and Modals */}
      <FilesModal
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        files={files}
        onUploadFile={(newFile) => setFiles((prev) => [newFile, ...prev])}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        events={historyEvents}
      />

      <ValidationApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title={
          activePhase === 'chiffrage'
            ? 'Confirmer la validation du Chiffrage'
            : 'Confirmer la validation des Métrés'
        }
      />

      <ValidationRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title={
          activePhase === 'chiffrage'
            ? 'Motif du rejet du chiffrage'
            : 'Motif du rejet des métrés'
        }
      />

      <AddLotModal
        isOpen={isAddLotModalOpen}
        onClose={() => setIsAddLotModalOpen(false)}
        onAddLot={handleAddLot}
        nextLotNumber={lots.length + 1}
      />

      <AddOuvrageModal
        isOpen={isAddOuvrageModalOpen}
        onClose={() => setIsAddOuvrageModalOpen(false)}
        lots={lots}
        onAddOuvrage={handleAddOuvrage}
      />

      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        lots={lots}
        onAddConsultation={handleAddConsultation}
      />

      </div>
    </ErrorBoundary>
  );
}
