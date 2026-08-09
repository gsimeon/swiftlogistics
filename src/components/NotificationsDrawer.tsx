import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, CheckCheck, Truck, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-slideLeft">
      
      {/* Drawer Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-sm text-white">Automated Notifications</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-slate-400 hover:text-emerald-400 font-semibold"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No notifications yet. Alerts will appear here in real time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border text-xs transition-all ${
                n.read
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-950 border-emerald-500/40 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white text-xs">{n.title}</span>
                <span className="text-[9px] text-slate-500 font-mono">{n.timestamp}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
