import React from 'react';
import { Award, Star, Zap, CheckCircle2, ShieldCheck, Flame, Bike, Truck, ArrowUpRight } from 'lucide-react';
import { MOCK_DRIVERS } from '../data/mockData';
import { Driver } from '../types';

interface TopDriversLeaderboardProps {
  onSelectDriver?: (driver: Driver) => void;
  title?: string;
}

export const TopDriversLeaderboard: React.FC<TopDriversLeaderboardProps> = ({
  onSelectDriver,
  title = "Top-Rated Delivery Champions (Ikeja Fleet)",
}) => {
  // Sort drivers by rating & deliveries
  const sortedDrivers = [...MOCK_DRIVERS].sort((a, b) => b.rating - a.rating || b.totalDeliveries - a.totalDeliveries);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            <p className="text-xs text-slate-500">Gamified performance metrics based on speed, customer satisfaction, and total jobs.</p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center space-x-1">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Fleet Leaderboard</span>
        </span>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedDrivers.map((driver, index) => {
          const rankBadges = [
            { rank: '#1 Gold', bg: 'bg-amber-100 text-amber-900 border-amber-300', badge: '🥇 Top Performer' },
            { rank: '#2 Silver', bg: 'bg-slate-200 text-slate-800 border-slate-300', badge: '🥈 Express Rider' },
            { rank: '#3 Bronze', bg: 'bg-amber-800/10 text-amber-800 border-amber-200', badge: '🥉 Dependable Pro' },
          ];

          const currentRank = rankBadges[index] || { rank: `#${index + 1}`, bg: 'bg-slate-100 text-slate-700', badge: 'Verified Driver' };

          return (
            <div
              key={driver.id}
              onClick={() => onSelectDriver && onSelectDriver(driver)}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 relative overflow-hidden group"
            >
              {/* Rank Header */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentRank.bg}`}>
                  {currentRank.rank}
                </span>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>99.4% On-Time</span>
                </span>
              </div>

              {/* Driver Details */}
              <div className="flex items-center space-x-3">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1">
                    <span>{driver.name}</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600 inline" />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium capitalize flex items-center space-x-1">
                    {driver.vehicleType === 'motorcycle' ? <Bike className="w-3.5 h-3.5 text-blue-600" /> : <Truck className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{driver.vehicleType} • {driver.vehiclePlate}</span>
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Rating</span>
                  <span className="font-bold text-xs text-amber-600 flex items-center justify-center space-x-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{driver.rating}</span>
                  </span>
                </div>

                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Avg Speed</span>
                  <span className="font-bold text-xs text-blue-600 font-mono">{driver.speedKmH} km/h</span>
                </div>

                <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Jobs</span>
                  <span className="font-bold text-xs text-slate-800 font-mono">{driver.totalDeliveries}+</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
