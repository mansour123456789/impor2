import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Bell, MessageSquare, Shield, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  isDarkMode: boolean;
  onToggleTheme: (isDark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack, isDarkMode, onToggleTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  const notifications = [
    { id: 1, title: 'Devis sous-traitant reçu', desc: 'BTP IDF a transmis son devis pour le Lot 02', time: 'Il y a 10 min' },
    { id: 2, title: 'Métré validé', desc: 'Claire Dupont a approuvé les fondations', time: 'Il y a 1h' },
    { id: 3, title: 'Export généré', desc: 'Le rapport DPGF client est prêt pour téléchargement', time: 'Il y a 3h' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Back Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-[#1B4591] hover:text-[#1B4591] hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Retour à la liste des projets"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="hidden text-xs font-medium text-slate-500 sm:block dark:text-slate-400">
            <span>Affaires</span> / <span className="text-[#1B4591] font-semibold">Mes Projets</span> / <span>Détails & Chiffrage</span>
          </div>
        </div>

        {/* Right: Theme Switcher, Notifications, User Menu */}
        <div className="flex items-center gap-3">
          {/* Theme & Notifications Toolbar Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-[#EFF1F8] p-1 dark:border-slate-700 dark:bg-slate-800">
            {/* Dark / Light Toggle Pill */}
            <div className="flex items-center rounded-full bg-white p-0.5 shadow-sm dark:bg-slate-900">
              <button
                type="button"
                onClick={() => onToggleTheme(true)}
                className={`flex h-7 w-8 items-center justify-center rounded-full transition-all ${
                  isDarkMode
                    ? 'bg-[#1B4591] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mode sombre"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme(false)}
                className={`flex h-7 w-8 items-center justify-center rounded-full transition-all ${
                  !isDarkMode
                    ? 'bg-[#1B4591] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mode clair"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

            {/* Message button */}
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-[#1B4591] dark:text-slate-300 dark:hover:bg-slate-700"
              title="Messagerie du projet"
            >
              <MessageSquare className="h-4 w-4" />
            </button>

            {/* Notifications Button with Relative Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-[#1B4591] dark:text-slate-300 dark:hover:bg-slate-700"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                    <button
                      onClick={() => setUnreadNotifs(0)}
                      className="text-xs text-[#1B4591] hover:underline dark:text-sky-400"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-xl bg-[#F8FAFC] p-2.5 transition-colors hover:bg-[#EFF6FF] dark:bg-slate-800">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                        <span className="mt-1 block text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white py-1.5 pl-2 pr-3 shadow-sm transition-all hover:border-[#1B4591] hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#1B4591] to-[#0394D7] text-xs font-bold text-white shadow-sm ring-2 ring-[#ECF4FF]">
                AS
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">Arrouj Samar</div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <Shield className="h-2.5 w-2.5 text-[#1B4591]" />
                  <span>Administrateur</span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Arrouj Samar</p>
                  <p className="text-[11px] text-slate-500">samar.arrouj@eco-pilot.com</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#ECF4FF] hover:text-[#1B4591] dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User className="h-3.5 w-3.5" />
                    Mon Profil
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
