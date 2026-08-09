import { Store, Driver, Client, DeliveryOrder } from '../types';

// Default coordinates centered around Computer Village Ikeja, Lagos, Nigeria
export const CENTRAL_LOCATION = { lat: 6.5928, lng: 3.3421 };

export const MOCK_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Techlab Innovation Solutions',
    category: 'Electronics & IT Solutions',
    address: 'No 13 Adekpre Street, Computer Village, Ikeja, Lagos, Nigeria',
    location: { lat: 6.5928, lng: 3.3421 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=500&q=80',
    phone: '+234 803 123 4567',
  },
  {
    id: 'store-2',
    name: 'FreshMart Supermarket',
    category: 'Gourmet & Groceries',
    address: 'Allen Avenue, Ikeja, Lagos, Nigeria',
    location: { lat: 6.6018, lng: 3.3512 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
    phone: '+234 812 345 6789',
  },
  {
    id: 'store-3',
    name: 'MedPlus Pharmacy',
    category: 'Medical & Pharmacy',
    address: 'Mobolaji Bank Anthony Way, Ikeja, Lagos, Nigeria',
    location: { lat: 6.5862, lng: 3.3580 },
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=500&q=80',
    phone: '+234 809 876 5432',
  },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'driver-1',
    name: 'Alex Vance',
    phone: '+234 802 888 9901',
    rating: 4.96,
    vehicleType: 'motorcycle',
    vehiclePlate: 'LAG-889-IKJ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    currentLocation: { lat: 6.5850, lng: 3.3530 },
    totalDeliveries: 1420,
    speedKmH: 38,
    isOnline: true,
  },
  {
    id: 'driver-2',
    name: 'Sarah Jenkins',
    phone: '+234 805 654 3210',
    rating: 4.92,
    vehicleType: 'bicycle',
    vehiclePlate: 'ECO-BIKE-LAG',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    currentLocation: { lat: 6.5950, lng: 3.3440 },
    totalDeliveries: 890,
    speedKmH: 22,
    isOnline: true,
  },
  {
    id: 'driver-3',
    name: 'Marcus Reed',
    phone: '+234 807 912 3456',
    rating: 4.88,
    vehicleType: 'van',
    vehiclePlate: 'VAN-77-EPE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    currentLocation: { lat: 6.5810, lng: 3.3550 },
    totalDeliveries: 2310,
    speedKmH: 45,
    isOnline: true,
  },
];

export const CURRENT_CLIENT: Client = {
  id: 'client-1',
  name: 'David Miller',
  phone: '+234 803 301 4492',
  address: 'Suite 12, Isaac John Street, GRA Ikeja, Lagos, Nigeria',
  location: { lat: 6.5822, lng: 3.3572 },
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
};

// Route waypoints connecting Techlab Innovation Solutions (Computer Village) -> Ikeja Underbridge -> GRA Ikeja
export const MOCK_ROUTE_PATH = [
  { lat: 6.5928, lng: 3.3421 }, // Techlab Innovation Solutions, Computer Village Ikeja
  { lat: 6.5900, lng: 3.3460 }, // Awolowo Way / Ikeja Underbridge
  { lat: 6.5875, lng: 3.3495 }, // Simbiat Abiola Way
  { lat: 6.5850, lng: 3.3530 }, // Mobolaji Bank Anthony Way
  { lat: 6.5838, lng: 3.3550 }, // Rider current location in transit
  { lat: 6.5822, lng: 3.3572 }, // Client Destination GRA Ikeja
];

export const INITIAL_ACTIVE_ORDER: DeliveryOrder = {
  id: 'ord-89421',
  orderNumber: 'LP-2026-89421',
  client: CURRENT_CLIENT,
  store: MOCK_STORES[0],
  driver: MOCK_DRIVERS[0],
  items: [
    {
      id: 'item-1',
      name: 'Wireless Noise-Canceling Headphones',
      quantity: 1,
      price: 189.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'item-2',
      name: 'Ultra Fast USB-C Braided Cable 2m',
      quantity: 2,
      price: 14.50,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80',
    },
  ],
  subtotal: 218.99,
  deliveryFee: 8.50,
  tip: 5.00,
  total: 232.49,
  status: 'in_transit',
  createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  estimatedMinutes: 8,
  pickupOtp: '3109',
  deliveryPin: '7842',
  routeCoordinates: MOCK_ROUTE_PATH,
  currentDriverLocation: { lat: 6.5850, lng: 3.3530 },
  paymentStatus: 'held_in_escrow',
  paymentMethod: 'credit_card',
  notes: 'Ring gate bell. Delivering to Techlab client at Isaac John St GRA Ikeja.',
  routeHighlights: [
    {
      id: 'hl-1',
      title: 'Store Counter Pickup Verification',
      category: 'pickup_store',
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      timestamp: '14:02',
      locationName: 'Techlab Computer Village',
      pinnedBy: 'driver',
      notes: 'Headphones and cables inspected and sealed in tamper-proof bag.',
    },
    {
      id: 'hl-2',
      title: 'Alausa Estate Security Gate Clearance',
      category: 'gate_verification',
      imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      timestamp: '14:10',
      locationName: 'Isaac John St GRA Ikeja Gate',
      pinnedBy: 'driver',
      notes: 'Gate entry pin verified with security post.',
    },
  ],
};

export const MOCK_HISTORY_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-88120',
    orderNumber: 'LP-2026-88120',
    client: CURRENT_CLIENT,
    store: MOCK_STORES[1], // FreshMart
    driver: MOCK_DRIVERS[1], // Sarah
    items: [
      { id: 'h1', name: 'Organic Sourdough Bread & Artisanal Butter', quantity: 1, price: 16.50 },
      { id: 'h2', name: 'Fresh Avocado Pack & Organic Espresso Beans', quantity: 2, price: 24.00 },
    ],
    subtotal: 40.50,
    deliveryFee: 4.99,
    tip: 4.00,
    total: 49.49,
    status: 'delivered',
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 2 * 86400 * 1000 + 22 * 60 * 1000).toISOString(),
    estimatedMinutes: 0,
    pickupOtp: '1194',
    deliveryPin: '4481',
    routeCoordinates: [],
    currentDriverLocation: MOCK_STORES[1].location,
    paymentStatus: 'released_to_driver',
    paymentMethod: 'apple_pay',
    rating: 5,
    review: 'Super quick delivery across Ikeja! Items kept fresh.',
    performanceMetrics: {
      actualDurationMinutes: 18,
      estimatedDurationMinutes: 22,
      punctualityScorePct: 98,
      statusBadge: 'Ahead of Schedule',
      avgSpeedKmH: 26,
    },
    confirmationSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 30 10, 60 30 T 110 20 T 160 35" stroke="%2310b981" stroke-width="3" fill="none"/></svg>',
  },
  {
    id: 'ord-87994',
    orderNumber: 'LP-2026-87994',
    client: CURRENT_CLIENT,
    store: MOCK_STORES[2], // MedPlus
    driver: MOCK_DRIVERS[2], // Marcus
    items: [
      { id: 'h3', name: 'First Aid Kit & Immunity Booster Pack', quantity: 1, price: 54.00 },
    ],
    subtotal: 54.00,
    deliveryFee: 6.00,
    tip: 6.00,
    total: 66.00,
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 5 * 86400 * 1000 + 19 * 60 * 1000).toISOString(),
    estimatedMinutes: 0,
    pickupOtp: '9821',
    deliveryPin: '2019',
    routeCoordinates: [],
    currentDriverLocation: MOCK_STORES[2].location,
    paymentStatus: 'released_to_driver',
    paymentMethod: 'credit_card',
    rating: 5,
    review: 'Great service by Marcus in the van along Mobolaji Bank Anthony Way.',
    performanceMetrics: {
      actualDurationMinutes: 19,
      estimatedDurationMinutes: 20,
      punctualityScorePct: 96,
      statusBadge: 'On Time',
      avgSpeedKmH: 34,
    },
    confirmationSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 15 35 Q 40 15, 80 40 T 140 25 T 180 30" stroke="%233b82f6" stroke-width="3" fill="none"/></svg>',
  },
];

