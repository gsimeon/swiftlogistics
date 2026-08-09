import React, { useState } from 'react';
import { 
  Package, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  AlertTriangle, 
  Box, 
  Thermometer, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { DeliveryItem } from '../types';
import { soundService } from '../services/soundService';

interface PackingMaterialRule {
  id: string;
  name: string;
  category: string;
  requiredFor: string[]; // keywords in item name
  description: string;
  isMandatory: boolean;
}

interface PackingGuideWidgetProps {
  items: DeliveryItem[];
  orderNotes?: string;
}

export const PackingGuideWidget: React.FC<PackingGuideWidgetProps> = ({
  items,
  orderNotes,
}) => {
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});
  const [isPackValidated, setIsPackValidated] = useState<boolean>(false);

  // Material rules engine
  const allRules: PackingMaterialRule[] = [
    {
      id: 'mat-1',
      name: 'Double-Layer Bubble Wrap (10mm)',
      category: 'Electronics / Fragile',
      requiredFor: ['headphone', 'charger', 'phone', 'laptop', 'electronics', 'gadget', 'screen', 'glass'],
      description: 'Wrap electronic housing at least twice to prevent vibration shock during motorcycle transit.',
      isMandatory: true,
    },
    {
      id: 'mat-2',
      name: 'Anti-Static ESD Shielding Pouch',
      category: 'Sensitive Tech',
      requiredFor: ['charger', 'headphone', 'phone', 'chip', 'circuit', 'cable', 'battery'],
      description: 'Protects delicate circuit boards from static charge build-up during express dispatch.',
      isMandatory: false,
    },
    {
      id: 'mat-3',
      name: 'Thermal Insulated Foil Bag + Ice Gel Pack',
      category: 'Food / Beverages / Perishables',
      requiredFor: ['food', 'lunch', 'cake', 'gourmet', 'meal', 'drink', 'beverage', 'ice'],
      description: 'Maintains hot or cold temperature for up to 45 minutes across Lagos traffic corridors.',
      isMandatory: true,
    },
    {
      id: 'mat-4',
      name: 'Tamper-Proof Serialized Security Seal',
      category: 'Escrow Security',
      requiredFor: ['headphone', 'phone', 'valuable', 'luxury', 'document', 'escrow'],
      description: 'Ensures client can verify package was unopened prior to entering 4-digit PIN.',
      isMandatory: true,
    },
    {
      id: 'mat-5',
      name: 'Heavy-Duty Corrugated Outer Box (5-Ply)',
      category: 'Structural Protection',
      requiredFor: ['headphone', 'box', 'heavy', 'set', 'combo'],
      description: 'Protects contents against stacking weight in cargo vans or dispatch saddlebags.',
      isMandatory: false,
    },
    {
      id: 'mat-6',
      name: 'Waterproof Vinyl Cover & Fragile Sticker',
      category: 'Weatherization',
      requiredFor: ['paper', 'document', 'headphone', 'box', 'electronics'],
      description: 'Guards against sudden rain showers in Ikeja delivery zone.',
      isMandatory: true,
    },
  ];

  // Evaluate applicable rules based on items in order
  const recommendedMaterials = allRules.filter((rule) => {
    const itemNamesLower = items.map((i) => i.name.toLowerCase()).join(' ');
    return rule.requiredFor.some((kw) => itemNamesLower.includes(kw));
  });

  // Fallback default rules if no specific keywords match
  const displayMaterials = recommendedMaterials.length > 0 ? recommendedMaterials : [
    allRules[3], // Security Seal
    allRules[5], // Waterproof Vinyl
  ];

  const toggleMaterialCheck = (id: string) => {
    soundService.playNotification();
    setCheckedMaterials((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleValidatePacking = () => {
    soundService.playMessagePop();
    setIsPackValidated(true);
  };

  const completedCount = displayMaterials.filter((m) => checkedMaterials[m.id]).length;
  const isAllChecked = completedCount === displayMaterials.length;

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center space-x-2">
              <span>Smart Order Packing & Material Guide</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Item-Tailored Checklist
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Automated packaging recommendations based on {items.length} item(s) in package manifest
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs font-bold text-slate-600">
          {completedCount} / {displayMaterials.length} Materials Packed
        </div>
      </div>

      {/* Recommended Materials List */}
      <div className="space-y-2 text-xs">
        {displayMaterials.map((mat) => {
          const isChecked = !!checkedMaterials[mat.id];
          return (
            <div
              key={mat.id}
              onClick={() => toggleMaterialCheck(mat.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                isChecked
                  ? 'bg-emerald-50/80 border-emerald-300 text-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <button type="button" className="mt-0.5 text-slate-500 shrink-0">
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {mat.name}
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                    mat.isMandatory
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {mat.isMandatory ? 'Mandatory' : 'Recommended'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {mat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Banner */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Proper packing reduces damage claims by 99.4% in express transit.</span>
        </div>

        <button
          type="button"
          onClick={handleValidatePacking}
          disabled={!isAllChecked || isPackValidated}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
            isPackValidated
              ? 'bg-emerald-600 text-white shadow-xs'
              : isAllChecked
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isPackValidated ? (
            <>
              <Check className="w-4 h-4" />
              <span>Packing Verified & Certified</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Certify Package Sealed</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
