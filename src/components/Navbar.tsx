import React, { useState, useRef, useEffect } from 'react';
import { Role, AppNotification } from '../types';
import { 
  Truck, 
  User, 
  Store as StoreIcon, 
  Bell, 
  Volume2, 
  VolumeX, 
  History, 
  MapPin, 
  ShieldCheck,
  PlusCircle,
  Key,
  Sun,
  Moon,
  Globe,
  Settings,
  Check,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/i18n';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeOrderCount: number;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  unreadCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenNewOrder: () => void;
  onOpenApiKeyGuide: () => void;
  hasApiKey: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeOrderCount,
  notifications,
  onOpenNotifications,
  unreadCount,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onOpenNewOrder,
  onOpenApiKeyGuide,
  hasApiKey,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-700 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              S
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {t('appName')}
              </span>
              <span className="hidden sm:inline-block px-3 py-1 bg-slate-800 rounded-full text-[10px] sm:text-xs font-semibold text-blue-400 border border-blue-400/30 uppercase tracking-wider">
                {t('tagline')}
              </span>
            </div>
          </div>

          {/* Role Switcher Pills */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              id="nav-role-client"
              onClick={() => onRoleChange('client')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentRole === 'client'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('clientDispatch')}</span>
            </button>

            <button
              id="nav-role-driver"
              onClick={() => onRoleChange('driver')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentRole === 'driver'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('riderCockpit')}</span>
              {activeOrderCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
              )}
            </button>

            <button
              id="nav-role-store"
              onClick={() => onRoleChange('store')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentRole === 'store'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>{t('storeDispatch')}</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Systems Status Indicator */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-slate-300">Lagos Hub • Techlab Ikeja Active</span>
            </div>

            <div className="hidden lg:block h-6 w-px bg-slate-700"></div>

            {/* Regional Accessibility Language Switcher Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <div className="flex items-center space-x-1 px-1.5 text-slate-400" title="Switch Interface Language (English / French / Yorùbá / Hausa)">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              </div>

              {(['en', 'fr', 'yo', 'ha'] as const).map((lang) => {
                const isSelected = language === lang;
                const labels: Record<Language, string> = {
                  en: 'EN',
                  fr: 'FR',
                  yo: 'YO',
                  ha: 'HA',
                };
                const titles: Record<Language, string> = {
                  en: 'English (UK/Global)',
                  fr: 'Français (French)',
                  yo: 'Yorùbá (Nigeria)',
                  ha: 'Hausa (Nigeria)',
                };

                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    title={titles[lang]}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {labels[lang]}
                  </button>
                );
              })}
            </div>

            {/* New Order Trigger for Client */}
            {currentRole === 'client' && (
              <button
                id="btn-new-delivery"
                onClick={onOpenNewOrder}
                className="hidden sm:flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('newDelivery')}</span>
              </button>
            )}

            {/* Google Maps Key status button */}
            <button
              id="btn-maps-key-status"
              onClick={onOpenApiKeyGuide}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                hasApiKey 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60' 
                  : 'bg-blue-950/40 text-blue-400 border-blue-800/60 hover:bg-blue-900/60'
              }`}
              title="Google Maps API Key Status"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{hasApiKey ? t('mapConnected') : t('setMapsKey')}</span>
            </button>

            {/* History Log Button */}
            <button
              id="btn-open-history"
              onClick={onOpenHistory}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
              title="Delivery History Log"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              aria-label={`Toggle audio notifications, currently ${soundEnabled ? 'enabled' : 'muted'}`}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
              title={soundEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Global Dark / Light Theme Toggle */}
            {onToggleDarkMode && (
              <button
                id="btn-toggle-theme"
                onClick={onToggleDarkMode}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode interface`}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-300" />
                )}
              </button>
            )}

            {/* Notifications Bell */}
            <button
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              aria-label={`Open notifications panel, ${unreadCount} unread items`}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative focus:ring-2 focus:ring-blue-500 focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Settings Dropdown Trigger */}
            <div className="relative" ref={settingsRef}>
              <button
                id="btn-open-settings"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSettingsOpen(false);
                  if ((e.key === 'Enter' || e.key === ' ') && !isSettingsOpen) {
                    e.preventDefault();
                    setIsSettingsOpen(true);
                  }
                }}
                aria-label="Application settings and language switcher"
                aria-expanded={isSettingsOpen}
                aria-haspopup="menu"
                aria-controls="settings-dropdown-menu"
                className={`p-2 rounded-lg transition-all flex items-center space-x-1 focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                  isSettingsOpen 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Application Settings & Language Switcher (Press Enter/Space to open)"
              >
                <Settings className="w-4 h-4" />
                <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Settings Dropdown Card */}
              {isSettingsOpen && (
                <div
                  id="settings-dropdown-menu"
                  role="menu"
                  aria-label="Settings and language options"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSettingsOpen(false);
                  }}
                  className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-4 space-y-4 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                      <h4 className="font-extrabold text-sm text-white">System Settings</h4>
                    </div>
                    <span className="text-[10px] bg-blue-950 text-blue-400 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-800/50">
                      v2.4 Live
                    </span>
                  </div>

                  {/* Language Switcher Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>{t('selectLanguage')} / Èdè / Harshe</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        Nigeria Multi-Lang
                      </span>
                    </div>

                    <div className="space-y-1.5" role="group" aria-label="Language selection options">
                      {[
                        { code: 'en', name: 'English (UK / Global)', desc: 'Standard business logistics terminology' },
                        { code: 'fr', name: 'Français (French)', desc: 'Terminologie logistique en français' },
                        { code: 'yo', name: 'Yorùbá (Nigeria)', desc: 'Ìfiránṣẹ́ àti Pápá Olùwakọ̀ ní Èdè Yorùbá' },
                        { code: 'ha', name: 'Hausa (Nigeria)', desc: 'Tsarin Aikawa da Mai Abin Hawa Harshen Hausa' },
                      ].map((langItem) => {
                        const isSelected = language === langItem.code;
                        return (
                          <button
                            key={langItem.code}
                            role="menuitem"
                            aria-label={`Switch language to ${langItem.name}`}
                            aria-selected={isSelected}
                            onClick={() => {
                              setLanguage(langItem.code as Language);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setLanguage(langItem.code as Language);
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-extrabold flex items-center space-x-1.5">
                                <span>{langItem.name}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">{langItem.desc}</p>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Audio & Visual Preferences */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Controls</p>
                    
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center space-x-2">
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                        <span className="font-semibold">Audio Notifications</span>
                      </div>
                      <button
                        onClick={onToggleSound}
                        aria-label={`Toggle audio notifications, currently ${soundEnabled ? 'on' : 'muted'}`}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all focus:ring-2 focus:ring-blue-400 ${
                          soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {soundEnabled ? 'ON' : 'MUTED'}
                      </button>
                    </div>

                    {onToggleDarkMode && (
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center space-x-2">
                          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
                          <span className="font-semibold">Night Mode Interface</span>
                        </div>
                        <button
                          onClick={onToggleDarkMode}
                          aria-label={`Toggle night mode, currently ${isDarkMode ? 'dark' : 'light'}`}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all focus:ring-2 focus:ring-blue-400 ${
                            isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isDarkMode ? 'DARK' : 'LIGHT'}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onRoleChange('client')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              currentRole === 'client' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Client</span>
          </button>

          <button
            onClick={() => onRoleChange('driver')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              currentRole === 'driver' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Rider</span>
          </button>

          <button
            onClick={() => onRoleChange('store')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              currentRole === 'store' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Store</span>
          </button>
        </div>

      </div>
    </header>
  );
};
