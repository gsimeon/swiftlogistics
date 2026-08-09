import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Send, 
  Sparkles, 
  Download, 
  ChevronRight, 
  UserPlus, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { useLanguage } from '../context/LanguageContext';

export interface ReferredRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'car' | 'van';
  joinedDate: string;
  completedTrips: number;
  requiredTrips: number;
  bonusAmountNgn: number;
  status: 'verifying' | 'in_progress' | 'completed' | 'paid';
}

interface ReferADriverProps {
  driverName?: string;
  driverCode?: string;
  onClose?: () => void;
}

export const ReferADriver: React.FC<ReferADriverProps> = ({
  driverName = 'Marcus Vance',
  driverCode = 'SWIFT-LAGOS-882',
  onClose,
}) => {
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState(driverCode);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderVehicle, setNewRiderVehicle] = useState<'bike' | 'car' | 'van'>('bike');
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const referralLink = `https://swiftlogix.app/onboard?ref=${referralCode}`;

  const [referredRiders, setReferredRiders] = useState<ReferredRider[]>([
    {
      id: 'ref-101',
      name: 'Tunde Bakare',
      phone: '+234 803 123 4567',
      vehicleType: 'bike',
      joinedDate: 'Aug 2, 2026',
      completedTrips: 10,
      requiredTrips: 10,
      bonusAmountNgn: 15000,
      status: 'paid',
    },
    {
      id: 'ref-102',
      name: 'Amina Ibrahim',
      phone: '+234 812 987 6543',
      vehicleType: 'van',
      joinedDate: 'Aug 5, 2026',
      completedTrips: 8,
      requiredTrips: 10,
      bonusAmountNgn: 15000,
      status: 'in_progress',
    },
    {
      id: 'ref-103',
      name: 'Chidi Okeke',
      phone: '+234 701 555 0192',
      vehicleType: 'car',
      joinedDate: 'Yesterday',
      completedTrips: 2,
      requiredTrips: 10,
      bonusAmountNgn: 15000,
      status: 'in_progress',
    },
  ]);

  // Generate Canvas QR Code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render pseudo high-density QR grid matrix
    const size = canvas.width;
    const gridCount = 21;
    const cellSize = size / gridCount;

    // Seeded random matrix for QR look
    ctx.fillStyle = '#0f172a';

    // Position Finder Patterns (Top-Left, Top-Right, Bottom-Left)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fillStyle = '#0f172a';
    };

    drawFinderPattern(1, 1);
    drawFinderPattern(13, 1);
    drawFinderPattern(1, 13);

    // Data modules
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        // Skip finder zones
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;

        // Hash pattern based on code
        const hash = (r * 31 + c * 17 + referralCode.length * 7) % 3;
        if (hash === 0 || (r + c) % 2 === 0) {
          ctx.fillStyle = (r + c) % 5 === 0 ? '#1d4ed8' : '#0f172a';
          ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Center Logo Badge
    const centerSize = 5 * cellSize;
    const centerX = (size - centerSize) / 2;
    const centerY = (size - centerSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 2, centerY - 2, centerSize + 4, centerSize + 4);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(centerX, centerY, centerSize, centerSize, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', size / 2, size / 2);
  }, [referralCode]);

  // Copy helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    soundService.playNotification();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    soundService.playNotification();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    soundService.playNotification();
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `SwiftLogix-Rider-QR-${referralCode}.png`;
    link.click();
  };

  const handleSimulateAddRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName.trim()) return;

    soundService.playNotification();
    const newEntry: ReferredRider = {
      id: `ref-${Date.now().toString().slice(-4)}`,
      name: newRiderName,
      phone: newRiderPhone || '+234 800 000 0000',
      vehicleType: newRiderVehicle,
      joinedDate: 'Just now',
      completedTrips: 0,
      requiredTrips: 10,
      bonusAmountNgn: 15000,
      status: 'in_progress',
    };

    setReferredRiders([newEntry, ...referredRiders]);
    setNewRiderName('');
    setNewRiderPhone('');
    setShowAddRiderModal(false);
  };

  const handleSimulateTripProgress = (riderId: string) => {
    soundService.playNotification();
    setReferredRiders((prev) =>
      prev.map((rider) => {
        if (rider.id === riderId) {
          const updatedTrips = Math.min(rider.requiredTrips, rider.completedTrips + 1);
          const isNowPaid = updatedTrips >= rider.requiredTrips;
          return {
            ...rider,
            completedTrips: updatedTrips,
            status: isNowPaid ? 'paid' : 'in_progress',
          };
        }
        return rider;
      })
    );
  };

  // Metrics calculations
  const totalPaidNgn = referredRiders
    .filter((r) => r.status === 'paid')
    .reduce((acc, r) => acc + r.bonusAmountNgn, 0);

  const totalPendingNgn = referredRiders
    .filter((r) => r.status === 'in_progress')
    .reduce((acc, r) => acc + r.bonusAmountNgn, 0);

  const completedCount = referredRiders.filter((r) => r.status === 'paid').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn space-y-6 p-4 sm:p-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 text-white font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⚡ Courier Network Expansion
              </span>
              <span className="text-amber-400 font-bold text-xs flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Earn ₦15,000 / $25 per Rider</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-2 tracking-tight text-white">
              {t('referADriver')} & Earnings Bonus
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Invite friend couriers to join SwiftLogix Nigeria. Receive instant ₦15,000 cash bonus directly into your payout balance when your referral completes their first 10 successful deliveries!
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowAddRiderModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Simulate Referral</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Referral Code & QR Code Interactive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* QR Code Canvas Card (1 Col) */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-4 flex flex-col items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-blue-700 font-bold uppercase tracking-wider block flex items-center justify-center space-x-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>{t('scanQrToOnboard')}</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              New riders scan this QR code with their mobile camera to auto-populate your referral code during sign up.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-blue-200 shadow-md relative group">
            <canvas ref={canvasRef} width={180} height={180} className="rounded-lg" />
            <div className="mt-2 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {referralCode}
            </div>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadQr}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download Printable QR Poster</span>
            </button>
          </div>
        </div>

        {/* Share Link & Code Generator (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Your Custom Referral Identity</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your code or direct onboarding web link with bike, car, or van riders across Nigeria.
              </p>
            </div>

            {/* Referral Code Box */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Unique Referral Code</span>
                <span className="font-mono text-lg font-extrabold text-blue-700 tracking-wider">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Direct Link Box */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Direct Onboarding Link</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono px-3 py-2 rounded-lg"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 ${
                    copiedLink ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* One-click WhatsApp & SMS share buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hey! Join SwiftLogix as a delivery courier rider and earn great payouts in Lagos. Use my referral code *${referralCode}* or sign up here: ${referralLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <a
                href={`sms:?body=${encodeURIComponent(
                  `Sign up as a rider on SwiftLogix using code ${referralCode}: ${referralLink}`
                )}`}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Send SMS Invite</span>
              </a>
            </div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Pro Tip:</strong> WhatsApp groups for rider communities in Computer Village, Ikeja, and Lekki yield the highest conversion rates!
            </span>
          </div>
        </div>

      </div>

      {/* Bonus Financial Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>{t('totalEarnings')}</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            ₦{totalPaidNgn.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{completedCount} Payouts Settled</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>{t('pendingBonuses')}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">
            ₦{totalPendingNgn.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">In active delivery qualification</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Referred Riders</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {referredRiders.length}
          </div>
          <span className="text-[10px] text-blue-600 font-bold">Couriers Registered</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Rider Tier Level</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-extrabold text-slate-800">
            Gold Leader ⭐
          </div>
          <span className="text-[10px] text-purple-600 font-bold">+₦5,000 Tier 3 Milestone</span>
        </div>
      </div>

      {/* Referred Riders List & Live Progress Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Referred Courier Onboarding Roster</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Requirements: 10 completed orders per rider for ₦15,000 payout
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
          {referredRiders.map((rider) => {
            const pct = Math.round((rider.completedTrips / rider.requiredTrips) * 100);

            return (
              <div key={rider.id} className="p-4 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {rider.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800">{rider.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono capitalize">
                          {rider.vehicleType}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block">{rider.phone} • Joined {rider.joinedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {rider.status === 'paid' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bonus Paid: ₦{rider.bonusAmountNgn.toLocaleString()}</span>
                      </span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending ({rider.completedTrips}/{rider.requiredTrips} Trips)</span>
                        </span>

                        <button
                          onClick={() => handleSimulateTripProgress(rider.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          title="Simulate 1 completed trip for this rider"
                        >
                          +1 Trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Trip Qualification Progress</span>
                    <span className="font-mono font-bold text-slate-700">{pct}% ({rider.completedTrips}/{rider.requiredTrips} trips)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Simulate Adding New Referral */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Simulate Rider Referral Sign-up</span>
              </h4>
              <button
                onClick={() => setShowAddRiderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateAddRider} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Emeka Nwosu"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+234 809 111 2233"
                  value={newRiderPhone}
                  onChange={(e) => setNewRiderPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vehicle Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bike', 'car', 'van'] as const).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setNewRiderVehicle(vt)}
                      className={`py-2 rounded-xl border font-bold capitalize ${
                        newRiderVehicle === vt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddRiderModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Register Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
