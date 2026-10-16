import React from 'react';
import {
  Home,
  FolderOpen,
  Clock,
  Users,
  Truck,
  BookOpen,
  Heart,
  Bookmark,
  Hourglass,
  UserCheck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeItem?: string;
  onNavigate?: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeItem = 'mesprojets',
  onNavigate,
}) => {
  const sections = [
    {
      title: null,
      items: [{ key: 'home', label: 'Accueil', icon: Home }],
    },
    {
      title: 'Affaires',
      items: [
        { key: 'mesprojets', label: 'Mes Projets', icon: FolderOpen },
        { key: 'historique', label: 'Historique', icon: Clock },
        { key: 'client', label: 'Clients', icon: Users },
        { key: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { key: 'bibliotheque', label: 'Bibliothèque', icon: BookOpen },
        { key: 'favoris', label: 'Favoris', icon: Heart },
        { key: 'referentiel', label: 'Référentiel', icon: Bookmark },
        { key: 'articles-attente', label: 'Articles en attentes', icon: Hourglass },
      ],
    },
    {
      title: 'Organisation',
      items: [
        { key: 'employes', label: 'Employés', icon: UserCheck },
        { key: 'config', label: 'Configuration', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#E6EAF2] bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Logo and Collapse Button */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F1F4F9] px-4 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            {/* Eco-Pilot SVG Logo Brand */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B4591] to-[#0394D7] text-white shadow-md">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" fillOpacity="0.2"/>
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#1B4591] dark:text-sky-400">
                ECO-PILOT
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                BTP & Génie Civil
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B4591] to-[#0394D7] text-white shadow-md">
            <span className="font-black text-sm">EP</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Nav Items List */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-4">
            {section.title && !collapsed && (
              <div className="px-3 pb-1.5 pt-2 text-[11px] font-bold tracking-wider text-[#2762C4] uppercase dark:text-sky-400">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate?.(item.key)}
                    className={`group flex w-full items-center gap-3 rounded-full text-xs font-semibold transition-all ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-[#1B4591] text-white shadow-sm'
                        : 'text-[#263248] hover:bg-[#F2F5FB] hover:text-[#1B4591] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-[#6D7A91] group-hover:text-[#1B4591] dark:text-slate-400'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support Link */}
      <div className="shrink-0 border-t border-[#F1F4F9] p-3 dark:border-slate-800">
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-full py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 ${
            collapsed ? 'justify-center px-0' : 'px-3.5'
          }`}
          title="Aide et support"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-[#1B4591]" />
          {!collapsed && <span>Aide et support</span>}
        </button>
      </div>
    </aside>
  );
};
