import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, ShieldCheck, Percent, Download, Calendar, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

interface TripEarningsBreakdown {
  id: string;
  orderNumber: string;
  date: string;
  grossFare: number;
  platformCommission: number; // 15%
  netDriverEarnings: number;
  tips: number;
  totalPayout: number;
  payoutStatus: 'Paid Out' | 'Processing' | 'Held in Escrow';
}

const MOCK_PAayout_TRIPS: TripEarningsBreakdown[] = [
  {
    id: 'pay-101',
    orderNumber: 'LP-2026-9482',
    date: 'Today, 02:45 PM',
    grossFare: 28.50,
    platformCommission: 4.28,
    netDriverEarnings: 24.22,
    tips: 5.00,
    totalPayout: 29.22,
    payoutStatus: 'Paid Out',
  },
  {
    id: 'pay-102',
    orderNumber: 'LP-2026-8831',
    date: 'Today, 11:20 AM',
    grossFare: 19.00,
    platformCommission: 2.85,
    netDriverEarnings: 16.15,
    tips: 3.50,
    totalPayout: 19.65,
    payoutStatus: 'Paid Out',
  },
  {
    id: 'pay-103',
    orderNumber: 'LP-2026-7290',
    date: 'Yesterday, 06:15 PM',
    grossFare: 34.00,
    platformCommission: 5.10,
    netDriverEarnings: 28.90,
    tips: 8.00,
    totalPayout: 36.90,
    payoutStatus: 'Paid Out',
  },
  {
    id: 'pay-104',
    orderNumber: 'LP-2026-6104',
    date: 'Yesterday, 03:00 PM',
    grossFare: 14.50,
    platformCommission: 2.18,
    netDriverEarnings: 12.32,
    tips: 2.00,
    totalPayout: 14.32,
    payoutStatus: 'Paid Out',
  },
  {
    id: 'pay-105',
    orderNumber: 'LP-2026-5512',
    date: '06 Aug 2026',
    grossFare: 42.00,
    platformCommission: 6.30,
    netDriverEarnings: 35.70,
    tips: 10.00,
    totalPayout: 45.70,
    payoutStatus: 'Paid Out',
  },
];

export const DriverPayoutLedger: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'this_week' | 'last_week'>('this_week');
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  // Totals calculations
  const totalGross = MOCK_PAayout_TRIPS.reduce((acc, t) => acc + t.grossFare, 0);
  const totalCommission = MOCK_PAayout_TRIPS.reduce((acc, t) => acc + t.platformCommission, 0);
  const totalNetFare = MOCK_PAayout_TRIPS.reduce((acc, t) => acc + t.netDriverEarnings, 0);
  const totalTips = MOCK_PAayout_TRIPS.reduce((acc, t) => acc + t.tips, 0);
  const netWeeklyPayout = totalNetFare + totalTips;

  const handleDownloadStatement = (id?: string) => {
    soundService.playNotification();
    setDownloadingReceiptId(id || 'all');
    setTimeout(() => {
      setDownloadingReceiptId(null);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Driver Payout Ledger & Net Earnings</h3>
            <p className="text-xs text-slate-500">
              Net earnings breakdown after deducting 15% platform commission fees & client tips
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownloadStatement()}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingReceiptId === 'all' ? 'Generating PDF...' : 'Download Statement'}</span>
          </button>
        </div>
      </div>

      {/* Net Payout Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Gross Fare */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Fares</span>
          <div className="text-lg font-extrabold font-mono text-slate-800">${totalGross.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500 font-medium">100% Total Booking Fares</span>
        </div>

        {/* 15% Platform Commission Fee */}
        <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Platform Fee</span>
            <span className="text-[9px] font-mono font-bold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">-15%</span>
          </div>
          <div className="text-lg font-extrabold font-mono text-rose-600">-${totalCommission.toFixed(2)}</div>
          <span className="text-[10px] text-rose-700 font-medium">Tech & Dispatch Overhead</span>
        </div>

        {/* Client Tips & Bonuses */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Tips & Bonuses</span>
            <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">100% Yours</span>
          </div>
          <div className="text-lg font-extrabold font-mono text-amber-700">+${totalTips.toFixed(2)}</div>
          <span className="text-[10px] text-amber-800 font-medium">Direct Client Gratitude</span>
        </div>

        {/* Net Take-Home Payout */}
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md space-y-1">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Net Take-Home Payout</span>
          <div className="text-xl font-extrabold font-mono text-white">${netWeeklyPayout.toFixed(2)}</div>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-100 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            <span>GTBank Direct Deposit ****4821</span>
          </div>
        </div>
      </div>

      {/* Itemized Trip Earnings Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Itemized Trip Ledger & Commission Breakdown</h4>
          <span className="text-[11px] text-slate-500">Showing {MOCK_PAayout_TRIPS.length} completed trips</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Trip Ref</th>
                <th className="p-3">Date / Time</th>
                <th className="p-3">Gross Fare</th>
                <th className="p-3">15% Fee</th>
                <th className="p-3">Tips</th>
                <th className="p-3">Net Payout</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {MOCK_PAayout_TRIPS.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{trip.orderNumber}</td>
                  <td className="p-3 text-slate-500 text-[11px] font-sans">{trip.date}</td>
                  <td className="p-3 font-semibold text-slate-800">${trip.grossFare.toFixed(2)}</td>
                  <td className="p-3 text-rose-600 font-semibold">-${trip.platformCommission.toFixed(2)}</td>
                  <td className="p-3 text-amber-600 font-semibold">+${trip.tips.toFixed(2)}</td>
                  <td className="p-3 text-emerald-600 font-extrabold">${trip.totalPayout.toFixed(2)}</td>
                  <td className="p-3 text-right font-sans">
                    <button
                      onClick={() => handleDownloadStatement(trip.id)}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[10px] rounded-lg transition-colors inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{downloadingReceiptId === trip.id ? 'Saving...' : 'PDF Slip'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
