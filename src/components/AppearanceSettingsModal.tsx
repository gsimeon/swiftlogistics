import React, { useState, useEffect } from 'react';
import { Palette, Moon, Sun, Map, Layers, ShieldCheck, Check, Sparkles, X } from 'lucide-react';
import { soundService } from '../services/soundService';

export type MapThemeId = 'standard' | 'midnight' | 'satellite' | 'retro' | 'cyberpunk';

interface MapThemeOption {
  id: MapThemeId;
  name: string;
  description: string;
  previewBg: string;
  badge: string;
  isNightOptimized: boolean;
}

export const MAP_THEMES: MapThemeOption[] = [
  {
    id: 'standard',
    name: 'Standard Light Navigation',
    description: 'Clean vector streets with high contrast landmarks.',
    previewBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badge: 'Daytime',
    isNightOptimized: false,
  },
  {
    id: 'midnight',
    name: 'Midnight Dark Drive',
    description: 'Ultra-low eye strain dark canvas for night-time driving.',
    previewBg: 'bg-slate-950 text-indigo-300 border-indigo-900',
    badge: 'Night Mode',
    isNightOptimized: true,
  },
  {
    id: 'satellite',
    name: 'High-Contrast Satellite Hybrid',
    description: 'Real-world aerial imagery with glowing street vectors.',
    previewBg: 'bg-emerald-950 text-emerald-200 border-emerald-800',
    badge: 'Hybrid',
    isNightOptimized: true,
  },
  {
    id: 'retro',
    name: 'Retro Warm Navigation',
    description: 'Warm sepia tones for reduced glare during dusk/dawn.',
    previewBg: 'bg-amber-950 text-amber-200 border-amber-800',
    badge: 'Eye Care',
    isNightOptimized: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Vector',
    description: 'High-visibility neon routes with dark contrast backdrops.',
    previewBg: 'bg-violet-950 text-cyan-300 border-cyan-800',
    badge: 'High Contrast',
    isNightOptimized: true,
  },
];

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapTheme: MapThemeId;
  onSelectMapTheme: (theme: MapThemeId) => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  isOpen,
  onClose,
  currentMapTheme,
  onSelectMapTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Appearance & Map Theme Settings</h3>
              <p className="text-xs text-slate-500">
                Force specific map display themes independent of global app theme for night driving accessibility.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Theme Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Map Vector Overlay Theme Override
          </label>

          <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {MAP_THEMES.map((theme) => {
              const isSelected = currentMapTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    soundService.playNotification();
                    onSelectMapTheme(theme.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs ${theme.previewBg}`}>
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{theme.name}</span>
                        <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                          theme.isNightOptimized ? 'bg-indigo-900 text-indigo-200' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{theme.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 bg-indigo-600 text-white rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Night Drive Toggle Info */}
        <div className="bg-indigo-950 text-indigo-100 p-3.5 rounded-xl border border-indigo-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Moon className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-white block">Night-Drive High Contrast Active</span>
              <span className="text-[10px] text-indigo-300">
                Reduces OLED power consumption and limits headlight glare while driving.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playNotification();
              onSelectMapTheme('midnight');
            }}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shrink-0 shadow"
          >
            Force Midnight
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            Apply & Save
          </button>
        </div>

      </div>
    </div>
  );
};
