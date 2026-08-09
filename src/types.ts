export type DeliveryStatus = 
  | 'order_placed'
  | 'driver_assigned'
  | 'store_pickup'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

export type VehicleType = 'motorcycle' | 'van' | 'bicycle' | 'car';

export type Role = 'client' | 'driver' | 'store';

export interface LocationPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  location: LocationPoint;
  rating: number;
  image: string;
  phone: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicleType: VehicleType;
  vehiclePlate: string;
  avatar: string;
  currentLocation: LocationPoint;
  totalDeliveries: number;
  speedKmH: number;
  isOnline: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  location: LocationPoint;
  avatar: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  client: Client;
  store: Store;
  driver?: Driver;
  items: DeliveryItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: DeliveryStatus;
  createdAt: string;
  estimatedMinutes: number;
  pickupOtp: string;
  deliveryPin: string;
  routeCoordinates: LocationPoint[];
  currentDriverLocation: LocationPoint;
  paymentStatus: 'pending' | 'held_in_escrow' | 'released_to_driver' | 'refunded';
  paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'wallet';
  confirmationSignature?: string;
  notes?: string;
  rating?: number;
  review?: string;
  closedAt?: string;
  routeHighlights?: RouteHighlight[];
  performanceMetrics?: {
    actualDurationMinutes: number;
    estimatedDurationMinutes: number;
    punctualityScorePct: number;
    statusBadge: 'Ahead of Schedule' | 'On Time' | 'Minor Delay' | 'Delayed';
    avgSpeedKmH?: number;
  };
}

export interface RouteHighlight {
  id: string;
  title: string;
  category: 'pickup_store' | 'landmark' | 'dropoff_spot' | 'gate_verification';
  imageUrl: string;
  timestamp: string;
  locationName: string;
  pinnedBy: 'driver' | 'client' | 'store';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  deliveryId: string;
  senderRole: Role;
  senderName: string;
  text: string;
  timestamp: string;
  isAudioAlert?: boolean;
  audioUrl?: string;
  audioDurationSeconds?: number;
  isVoiceNote?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'pickup' | 'transit' | 'arrived' | 'delivered';
  read: boolean;
}
