import React from 'react';
import { Key, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Google Maps API Key Setup</h3>
            <p className="text-xs text-slate-400">Enable full satellite street maps & routes</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            To activate real Google Maps layers, follow these quick steps:
          </p>

          <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 font-medium leading-relaxed">
            <li>
              <strong>Get an API key:</strong>{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold underline inline-flex items-center space-x-1"
              >
                <span>Google Maps Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Open <strong>Settings</strong> (⚙️ gear icon, top-right corner of AI Studio)
            </li>
            <li>
              Select <strong>Secrets</strong>
            </li>
            <li>
              Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as secret name and press <strong>Enter</strong>
            </li>
            <li>
              Paste your API key as value and press <strong>Enter</strong>
            </li>
          </ol>

          <p className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>App automatically incorporates your secret - no page reload required!</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
        >
          Close Guide
        </button>

      </div>
    </div>
  );
};
