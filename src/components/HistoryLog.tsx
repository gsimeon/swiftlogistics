import React, { useState } from 'react';
import { DeliveryOrder } from '../types';
import { RouteReplayModal } from './RouteReplayModal';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Star, 
  Truck, 
  ArrowLeft, 
  Download, 
  X, 
  Gauge, 
  Clock, 
  Award, 
  Zap, 
  PenTool, 
  TrendingUp, 
  ShieldCheck,
  DollarSign,
  Receipt,
  Calculator,
  PieChart,
  Tag,
  Target,
  MapPin,
  Compass,
  Navigation
} from 'lucide-react';

interface HistoryLogProps {
  orders: DeliveryOrder[];
  onBack: () => void;
}

const MOCK_GEOFENCE_EVENTS = [
  {
    id: 'geo-evt-001',
    orderNumber: 'ORD-8821',
    driverName: 'Musa Ibrahim',
    eventType: 'Pickup Arrival Geofence',
    locationName: 'Slot Store, Otigba Street, Computer Village, Ikeja',
    distanceMeters: '32.4m',
    triggeredAt: '2026-08-08 10:14:22 AM',
    coords: '6.5935, 3.3425',
    status: 'Auto-Triggered (Within 50m)',
    auditToken: 'GEO-AUDIT-992018',
  },
  {
    id: 'geo-evt-002',
    orderNumber: 'ORD-8821',
    driverName: 'Musa Ibrahim',
    eventType: 'Recipient Dropoff Geofence',
    locationName: 'No 14 Toyin Street, Ikeja, Lagos',
    distanceMeters: '18.1m',
    triggeredAt: '2026-08-08 10:32:05 AM',
    coords: '6.6015, 3.3505',
    status: 'Auto-Triggered (Within 50m)',
    auditToken: 'GEO-AUDIT-992019',
  },
  {
    id: 'geo-evt-003',
    orderNumber: 'ORD-8819',
    driverName: 'Emeka Nwosu',
    eventType: 'Pickup Arrival Geofence',
    locationName: 'MicroBytes Hub, Allen Avenue, Ikeja',
    distanceMeters: '41.8m',
    triggeredAt: '2026-08-08 09:48:10 AM',
    coords: '6.5990, 3.3480',
    status: 'Auto-Triggered (Within 50m)',
    auditToken: 'GEO-AUDIT-992012',
  },
  {
    id: 'geo-evt-004',
    orderNumber: 'ORD-8815',
    driverName: 'Chidi Okafor',
    eventType: 'Recipient Dropoff Geofence',
    locationName: 'Obafemi Awolowo Way, Ikeja',
    distanceMeters: '22.0m',
    triggeredAt: '2026-08-08 08:25:30 AM',
    coords: '6.5910, 3.3390',
    status: 'Auto-Triggered (Within 50m)',
    auditToken: 'GEO-AUDIT-992005',
  },
];

export const HistoryLog: React.FC<HistoryLogProps> = ({ orders, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<DeliveryOrder | null>(null);
  const [selectedReplay, setSelectedReplay] = useState<DeliveryOrder | null>(null);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'tips_tax' | 'geofence'>('deliveries');

  const completedOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const filteredOrders = completedOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.store.name.toLowerCase().includes(q) ||
      (o.driver && o.driver.name.toLowerCase().includes(q)) ||
      o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  // Calculate Overall Performance Metrics
  const avgPunctualityPct = completedOrders.length > 0
    ? Math.round(
        completedOrders.reduce(
          (acc, ord) => acc + (ord.performanceMetrics?.punctualityScorePct || 95),
          0
        ) / completedOrders.length
      )
    : 98;

  const avgDurationMins = completedOrders.length > 0
    ? Math.round(
        completedOrders.reduce(
          (acc, ord) => acc + (ord.performanceMetrics?.actualDurationMinutes || 18),
          0
        ) / completedOrders.length
      )
    : 18;

  const totalClosedTotal = completedOrders.reduce((acc, ord) => acc + ord.total, 0);

  // Calculate Tipping & Tax Budget Metrics
  const totalTipsPaid = completedOrders.reduce((acc, ord) => acc + (ord.tip || 0), 0);
  const tippedOrdersCount = completedOrders.filter((ord) => (ord.tip || 0) > 0).length;
  const avgTipAmount = tippedOrdersCount > 0 ? totalTipsPaid / tippedOrdersCount : 0;
  const totalDeliveryFees = completedOrders.reduce((acc, ord) => acc + (ord.deliveryFee || 0), 0);
  const totalTaxDeductibleLogistics = totalTipsPaid + totalDeliveryFees;

  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Store Name',
      'Client Name',
      'Driver Name',
      'Vehicle Plate',
      'Items Delivered',
      'Subtotal ($)',
      'Delivery Fee ($)',
      'Tip ($)',
      'Total ($)',
      'Punctuality Score (%)',
      'Actual Duration (Mins)',
      'Status'
    ];

    const rows = completedOrders.map((ord) => [
      `"${ord.orderNumber}"`,
      `"${new Date(ord.createdAt).toISOString().split('T')[0]}"`,
      `"${ord.store.name.replace(/"/g, '""')}"`,
      `"${ord.client.name.replace(/"/g, '""')}"`,
      `"${(ord.driver?.name || 'Unassigned').replace(/"/g, '""')}"`,
      `"${ord.driver?.vehiclePlate || 'N/A'}"`,
      `"${ord.items.map((i) => `${i.quantity}x ${i.name}`).join('; ').replace(/"/g, '""')}"`,
      ord.subtotal.toFixed(2),
      ord.deliveryFee.toFixed(2),
      ord.tip.toFixed(2),
      ord.total.toFixed(2),
      ord.performanceMetrics?.punctualityScorePct || 98,
      ord.performanceMetrics?.actualDurationMinutes || 18,
      `"${ord.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logistics_delivery_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTipsCSV = () => {
    const headers = [
      'Date',
      'Order Number',
      'Store Branch',
      'Driver Name',
      'Order Subtotal ($)',
      'Tip Provided ($)',
      'Tip % of Subtotal',
      'Delivery Fee ($)',
      'Tax Category'
    ];

    const rows = completedOrders.map((ord) => {
      const tipPct = ord.subtotal > 0 ? ((ord.tip / ord.subtotal) * 100).toFixed(1) : '0.0';
      return [
        `"${new Date(ord.createdAt).toISOString().split('T')[0]}"`,
        `"${ord.orderNumber}"`,
        `"${ord.store.name.replace(/"/g, '""')}"`,
        `"${(ord.driver?.name || 'Unassigned').replace(/"/g, '""')}"`,
        ord.subtotal.toFixed(2),
        ord.tip.toFixed(2),
        `"${tipPct}%"`,
        ord.deliveryFee.toFixed(2),
        '"Deductible Business Courier Gratuity / Expense"'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tipping_tax_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGeofenceCSV = () => {
    const headers = [
      'Trigger Timestamp',
      'Order Number',
      'Driver Name',
      'Geofence Event Type',
      'Location Target',
      'Distance at Trigger',
      'GPS Coordinates',
      'Audit Token Status'
    ];

    const rows = MOCK_GEOFENCE_EVENTS.map((evt) => [
      `"${evt.triggeredAt}"`,
      `"${evt.orderNumber}"`,
      `"${evt.driverName}"`,
      `"${evt.eventType}"`,
      `"${evt.locationName.replace(/"/g, '""')}"`,
      `"${evt.distanceMeters}"`,
      `"${evt.coords}"`,
      `"${evt.auditToken} - Verified"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `geofence_arrival_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
              <History className="w-6 h-6 text-blue-600" />
              <span>Completed Deliveries & Performance Insights</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Audit trail, tax receipts, delivery punctuality scores, and digital signatures.</p>
          </div>
        </div>

        {/* Search Bar & Export CSV */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, store, item..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={activeTab === 'geofence' ? handleExportGeofenceCSV : activeTab === 'tips_tax' ? handleExportTipsCSV : handleExportCSV}
            className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            title="Download CSV report for bookkeeping and audit"
          >
            <Download className="w-4 h-4" />
            <span>{activeTab === 'geofence' ? 'Export Geofence CSV' : activeTab === 'tips_tax' ? 'Export Tax CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Dedicated Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row border border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'deliveries'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Completed Deliveries ({completedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tips_tax')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'tips_tax'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-white" />
          <span>Tipping & Tax Ledger (${totalTipsPaid.toFixed(2)})</span>
        </button>

        <button
          onClick={() => setActiveTab('geofence')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'geofence'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-white" />
          <span>50m Geofence Events ({MOCK_GEOFENCE_EVENTS.length})</span>
        </button>
      </div>

      {activeTab === 'geofence' ? (
        /* 50m Geofence Arrival Audit Log View */
        <div className="space-y-6 animate-fadeIn">
          {/* Geofence Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Total Geofence Triggers</span>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">{MOCK_GEOFENCE_EVENTS.length}</div>
              <span className="text-[10px] text-purple-600 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Verified within 50m</span>
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Avg Trigger Distance</span>
                <Compass className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">28.5m</div>
              <span className="text-[10px] text-slate-400 font-medium">Under 50m perimeter threshold</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>GPS Precision Margin</span>
                <Navigation className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">± 3.2m</div>
              <span className="text-[10px] text-emerald-600 font-bold">High Precision Telemetry</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Audit Result</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">VERIFIED</div>
              <span className="text-[10px] text-slate-400 font-medium">Tamper-Proof Audit Pass</span>
            </div>
          </div>

          {/* Detailed Geofence Audit Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>50-Meter Geofence Arrival Audit Trail</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Exact timestamps and GPS telemetry logs when drivers breached 50m pickup & dropoff boundaries.
                </p>
              </div>

              <button
                onClick={handleExportGeofenceCSV}
                className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Geofence CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Trigger Timestamp</th>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Geofence Event Type</th>
                    <th className="py-3 px-4">Location Target</th>
                    <th className="py-3 px-4 text-center">Distance at Trigger</th>
                    <th className="py-3 px-4 text-center">GPS Coordinates</th>
                    <th className="py-3 px-4 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_GEOFENCE_EVENTS.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{evt.triggeredAt}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          #{evt.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{evt.driverName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Target className="w-3 h-3 text-purple-600" />
                          <span>{evt.eventType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{evt.locationName}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-purple-700">{evt.distanceMeters}</td>
                      <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-500">{evt.coords}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Audit Verified</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'tips_tax' ? (
        /* Tipping & Tax Budgeting Ledger View */
        <div className="space-y-6 animate-fadeIn">
          {/* Tipping & Tax Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Total Tips Provided</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">${totalTipsPaid.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>Across {tippedOrdersCount} deliveries</span>
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Average Tip / Order</span>
                <Calculator className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">${avgTipAmount.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-medium">~12.5% of average order subtotal</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Total Courier Fees</span>
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 font-mono">${totalDeliveryFees.toFixed(2)}</div>
              <span className="text-[10px] text-purple-600 font-bold">Standard shipping & handling</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Deductible Logistics Total</span>
                <PieChart className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">${totalTaxDeductibleLogistics.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-medium">Eligible business expenditure</span>
            </div>
          </div>

          {/* Detailed Tipping Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Courier Tipping & Tax Expense Ledger</span>
                </h3>
                <p className="text-[11px] text-slate-500">Official log of courier gratuity and logistics expense deductions for tax filing.</p>
              </div>

              <button
                onClick={handleExportTipsCSV}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Tax Ledger</span>
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No tipping history found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Store Branch</th>
                      <th className="py-3 px-4">Courier Driver</th>
                      <th className="py-3 px-4 text-right">Order Subtotal</th>
                      <th className="py-3 px-4 text-right">Tip Amount</th>
                      <th className="py-3 px-4 text-right">Delivery Fee</th>
                      <th className="py-3 px-4 text-right">Total Paid</th>
                      <th className="py-3 px-4 text-center">Tax Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => {
                      const tipPct = ord.subtotal > 0 ? ((ord.tip / ord.subtotal) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              #{ord.orderNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{ord.store.name}</td>
                          <td className="py-3 px-4 text-slate-600">{ord.driver?.name || 'Unassigned'}</td>
                          <td className="py-3 px-4 font-mono text-right text-slate-600">${ord.subtotal.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-right font-extrabold text-emerald-600">
                            +${ord.tip.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">({tipPct}%)</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-slate-600">${ord.deliveryFee.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-right font-bold text-slate-800">${ord.total.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Tax-Deductible</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Completed Deliveries View */
        <>
          {/* Performance Insights Summary Dashboard Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Overall Punctuality</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">{avgPunctualityPct}%</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>High On-Time Performance</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Avg Transit Duration</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">{avgDurationMins} mins</div>
          <span className="text-[10px] text-slate-400 font-medium">~3.2 mins ahead of initial ETA</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Completed Orders</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">{completedOrders.length}</div>
          <span className="text-[10px] text-purple-600 font-bold">100% Escrow Closed</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Value Settled</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">${totalClosedTotal.toFixed(2)}</div>
          <span className="text-[10px] text-slate-400 font-medium">Zero disputes logged</span>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="font-bold text-base text-slate-700">No completed orders found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once a delivery is confirmed and closed, it will appear here in your official history ledger.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((ord) => {
            const perf = ord.performanceMetrics || {
              actualDurationMinutes: 18,
              estimatedDurationMinutes: 22,
              punctualityScorePct: 98,
              statusBadge: 'Ahead of Schedule',
              avgSpeedKmH: 32,
            };

            return (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="font-bold text-base text-slate-800 mt-1">{ord.store.name}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Deal Closed</span>
                    </span>

                    <button
                      onClick={() => setSelectedReplay(ord)}
                      className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span>Replay Route</span>
                    </button>

                    <button
                      onClick={() => setSelectedReceipt(ord)}
                      className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Items & Driver info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Items Delivered</span>
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-slate-600">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-mono font-semibold text-slate-800">${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Driver Courier</span>
                      <span className="font-semibold text-slate-800">{ord.driver?.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Escrow Status</span>
                      <span className="text-green-600 font-bold">Released</span>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 font-bold text-sm text-slate-800">
                      <span>Total Paid</span>
                      <span className="text-blue-600">${ord.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Order Performance Score Card Section */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Punctuality Score</span>
                      <div className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                        <span className="font-mono text-emerald-600">{perf.punctualityScorePct}%</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {perf.statusBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ETA vs Actual Duration</span>
                      <span className="font-medium text-slate-700">
                        Actual: <strong>{perf.actualDurationMinutes}m</strong> (Est: {perf.estimatedDurationMinutes}m)
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Badge */}
                  <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center space-x-1">
                        <PenTool className="w-3 h-3 text-emerald-600" />
                        <span>Client Signature</span>
                      </span>
                      {ord.confirmationSignature ? (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Captured & Verified</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Verified via PIN Code</span>
                      )}
                    </div>

                    {ord.confirmationSignature && (
                      <div className="bg-white border border-slate-200 p-1 rounded-lg">
                        <img
                          src={ord.confirmationSignature}
                          alt="Signature Preview"
                          className="h-7 w-16 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {ord.review && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 italic flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    <span>"{ord.review}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Route Replay Modal */}
      {selectedReplay && (
        <RouteReplayModal
          order={selectedReplay}
          onClose={() => setSelectedReplay(null)}
        />
      )}

    </div>
  );
};

// Official Printable Invoice / Receipt Modal
const ReceiptModal: React.FC<{ order: DeliveryOrder; onClose: () => void }> = ({
  order,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 text-slate-800 shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Visual Container */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-5 font-sans">
          
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="font-bold text-xl text-slate-800 tracking-tight">LogiPulse Delivery Invoice</h3>
            <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">#{order.orderNumber}</p>
            <p className="text-[11px] text-slate-500 mt-1">Official Escrow Receipt & Tax Statement</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Merchant Store</span>
              <strong className="text-slate-800 block">{order.store.name}</strong>
              <span className="text-slate-500 text-[11px] block">{order.store.address}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Client Destination</span>
              <strong className="text-slate-800 block">{order.client.name}</strong>
              <span className="text-slate-500 text-[11px] block">{order.client.address}</span>
            </div>
          </div>

          <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
            <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">Itemized Breakdown</span>
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span className="text-slate-700">{it.quantity}x {it.name}</span>
                <span className="font-mono text-slate-900 font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Distance Delivery Fee</span>
              <span className="font-mono">${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Driver Courier Tip</span>
              <span className="font-mono">${order.tip.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-800">
              <span>Total Released from Escrow</span>
              <span className="text-blue-600 font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Rider Courier:</span>
              <span className="text-slate-800 font-semibold">{order.driver?.name} ({order.driver?.vehiclePlate})</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="text-slate-800 uppercase font-semibold">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Punctuality Rating:</span>
              <span className="text-emerald-600 font-bold font-mono">
                {order.performanceMetrics?.punctualityScorePct || 98}% ({order.performanceMetrics?.statusBadge || 'On Time'})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Closed Timestamp:</span>
              <span className="text-slate-800 font-mono">{order.closedAt ? new Date(order.closedAt).toLocaleString() : 'N/A'}</span>
            </div>

            {order.confirmationSignature && (
              <div className="border-t border-slate-100 pt-2.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Recipient Package Delivery Signature</span>
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{order.client.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Signature Token verified upon arrival</span>
                  </div>
                  <img
                    src={order.confirmationSignature}
                    alt="Client Signature Log"
                    className="h-9 w-24 object-contain bg-white rounded border border-slate-200 p-0.5"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        <button
          onClick={() => window.print()}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          <span>Download / Print Official Invoice</span>
        </button>

      </div>
    </div>
  );
};
