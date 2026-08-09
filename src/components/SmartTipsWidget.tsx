import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  MapPin, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  ThumbsUp, 
  Check, 
  Zap,
  Navigation
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface SmartTip {
  id: string;
  category: 'traffic' | 'demand' | 'earnings' | 'efficiency';
  title: string;
  description: string;
  impactBadge: string;
  zone?: string;
  timeWindow?: string;
  confidenceScore: number; // e.g. 94%
}

interface SmartTipsWidgetProps {
  onSelectZone?: (zoneName: string) => void;
}

export const SmartTipsWidget: React.FC<SmartTipsWidgetProps> = ({ onSelectZone }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'traffic' | 'demand' | 'earnings'>('all');
  const [likedTips, setLikedTips] = useState<Record<string, boolean>>({});
  const [appliedTipId, setAppliedTipId] = useState<string | null>(null);

  const tipsData: SmartTip[] = [
    {
      id: 'tip-1',
      category: 'traffic',
      title: 'Light Traffic on Mobolaji Bank Anthony Way',
      description: 'Real-time telemetry shows Mobolaji Bank Anthony is currently 14% faster than Awolowo Way. Use this corridor for Ikeja GRA deliveries.',
      impactBadge: '-6 min ETA',
      zone: 'Mobolaji Bank Anthony Corridor',
      timeWindow: 'Active Now until 1:00 PM',
      confidenceScore: 96,
    },
    {
      id: 'tip-2',
      category: 'demand',
      title: 'High Order Volume Forecast in Ikeja GRA',
      description: 'Historical order data predicts a +35% surge in lunch gourmet orders between 12:15 PM and 2:00 PM near Isaac John St.',
      impactBadge: 'Surge +$4.50/trip',
      zone: 'Isaac John St, Ikeja GRA',
      timeWindow: '12:15 PM - 2:00 PM',
      confidenceScore: 92,
    },
    {
      id: 'tip-3',
      category: 'earnings',
      title: 'Electronics Peak at Computer Village',
      description: 'Store orders for high-value gadget escrows peak around 2:30 PM. Positioning within 500m unlocks priority dispatch matching.',
      impactBadge: '+28% Tipping Rate',
      zone: 'Computer Village, Otigba St',
      timeWindow: '2:00 PM - 4:00 PM',
      confidenceScore: 89,
    },
    {
      id: 'tip-4',
      category: 'efficiency',
      title: 'Optimal Escrow PIN Prompting',
      description: 'Drivers who ask clients for the 4-digit PIN upon arrival report a 98% instant completion rate and higher rating scores.',
      impactBadge: '5-Star Rating Booster',
      confidenceScore: 98,
    },
  ];

  const filteredTips = activeCategory === 'all' 
    ? tipsData 
    : tipsData.filter(t => t.category === activeCategory);

  const toggleLike = (tipId: string) => {
    soundService.playNotification();
    setLikedTips(prev => ({ ...prev, [tipId]: !prev[tipId] }));
  };

  const handleApplyTip = (tip: SmartTip) => {
    soundService.playMessagePop();
    setAppliedTipId(tip.id);
    if (tip.zone && onSelectZone) {
      onSelectZone(tip.zone);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-2">
              <span>Driver Smart Advice & Dispatch Intelligence</span>
            </h4>
            <p className="text-xs text-slate-400">
              AI recommendations calculated from 2,400+ historical Ikeja shift logs
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
          {(['all', 'traffic', 'demand', 'earnings'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundService.playNotification();
                setActiveCategory(cat);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tips Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {filteredTips.map((tip) => {
          const isLiked = likedTips[tip.id];
          const isApplied = appliedTipId === tip.id;

          return (
            <div
              key={tip.id}
              className={`p-4 rounded-xl border transition-all space-y-2.5 relative overflow-hidden ${
                isApplied
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{tip.title}</h5>
                    <span className="text-[10px] text-amber-300 font-mono">
                      {tip.confidenceScore}% Dispatch Match Confidence
                    </span>
                  </div>
                </div>

                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-400/30 shrink-0">
                  {tip.impactBadge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tip.description}
              </p>

              {/* Zone / Time Metadata */}
              {(tip.zone || tip.timeWindow) && (
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
                  {tip.zone && (
                    <span className="flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{tip.zone}</span>
                    </span>
                  )}
                  {tip.timeWindow && (
                    <span className="flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{tip.timeWindow}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleLike(tip.id)}
                  className={`flex items-center space-x-1 text-[11px] font-bold transition-colors ${
                    isLiked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-amber-400' : ''}`} />
                  <span>{isLiked ? 'Helpful Tip' : 'Helpful'}</span>
                </button>

                {tip.zone && (
                  <button
                    type="button"
                    onClick={() => handleApplyTip(tip)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      isApplied
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Position Set</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Position Here</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
