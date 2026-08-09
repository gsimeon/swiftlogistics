import React, { useState } from 'react';
import { RouteHighlight } from '../types';
import { Camera, MapPin, Pin, Plus, X, Image as ImageIcon, CheckCircle2, Building2, ShieldCheck, Tag } from 'lucide-react';
import { soundService } from '../services/soundService';

interface RouteHighlightsGalleryProps {
  orderId: string;
  highlights?: RouteHighlight[];
  userRole: 'driver' | 'client' | 'store';
  onAddHighlight?: (highlight: RouteHighlight) => void;
}

const PRESET_PHOTOS = [
  {
    title: 'Doorstep Drop-off Verification',
    category: 'dropoff_spot' as const,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    locationName: '14 Alausa Drive, Ikeja',
    notes: 'Package safely placed at doorstep near security bell.',
  },
  {
    title: 'Store Counter Pickup',
    category: 'pickup_store' as const,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    locationName: 'Ikeja City Mall - Food Hall',
    notes: 'Picked up order #3942 directly from manager.',
  },
  {
    title: 'Estate Security Gate Landmark',
    category: 'gate_verification' as const,
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    locationName: 'Alausa Estate West Gate',
    notes: 'Verified clearance code with estate guard.',
  },
];

export const RouteHighlightsGallery: React.FC<RouteHighlightsGalleryProps> = ({
  orderId,
  highlights = [],
  userRole,
  onAddHighlight,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<RouteHighlight | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'pickup_store' | 'landmark' | 'dropoff_spot' | 'gate_verification'>('dropoff_spot');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].imageUrl);
  const [locationName, setLocationName] = useState('Ikeja Delivery Route');
  const [notes, setNotes] = useState('');

  const handleCreateHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newHighlight: RouteHighlight = {
      id: `hl-${Date.now()}`,
      title,
      category,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locationName,
      pinnedBy: userRole,
      notes,
    };

    if (onAddHighlight) {
      onAddHighlight(newHighlight);
    }
    soundService.playNotification();
    setIsModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const handleSelectPreset = (preset: typeof PRESET_PHOTOS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    setLocationName(preset.locationName);
    setNotes(preset.notes);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Route Highlights & Landmark Photos</h3>
            <p className="text-xs text-slate-500">Visual proof of pickup, estate landmarks, and drop-off spot photos.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-transform active:scale-95 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Pin Landmark Photo</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {highlights.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">No route highlight photos pinned yet.</p>
          <p className="text-[11px] text-slate-400">Drivers and clients can attach drop-off spot photos & landmark verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              onClick={() => setSelectedImage(hl)}
              className="group relative bg-slate-900 border border-slate-200 rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                <img
                  src={hl.imageUrl}
                  alt={hl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Pin className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>{hl.pinnedBy}</span>
                </span>
              </div>

              <div className="p-3 text-white space-y-1">
                <div className="font-bold text-xs truncate">{hl.title}</div>
                <div className="flex items-center text-[11px] text-slate-300 space-x-1 truncate">
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{hl.locationName}</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-0.5">{hl.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pin New Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden space-y-5">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-white">Pin Landmark / Drop-off Photo</h3>
              <p className="text-xs text-slate-400">Capture or attach a photo to verify pickup location or doorstep drop-off spot.</p>
            </div>

            {/* Quick Presets Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Quick Photo Presets</label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={preset.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-xs text-white block">{preset.title}</span>
                        <span className="text-[10px] text-slate-400">{preset.locationName}</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold">Use Photo</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCreateHighlight} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Highlight Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Front Porch Package Placement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="dropoff_spot">Doorstep Drop-off</option>
                    <option value="pickup_store">Store Pickup</option>
                    <option value="gate_verification">Gate Clearance</option>
                    <option value="landmark">Corridor Landmark</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Location Name</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Alausa Estate Gate B"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Notes / Verification Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ring doorbell twice upon placement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-98"
              >
                <Pin className="w-4 h-4 fill-slate-950" />
                <span>Pin Photo to Order History</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Full Photo Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-lg text-white">{selectedImage.title}</h4>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                  {selectedImage.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedImage.locationName} • Pinned at {selectedImage.timestamp} by {selectedImage.pinnedBy}</span>
              </p>
              {selectedImage.notes && (
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mt-2">
                  "{selectedImage.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
