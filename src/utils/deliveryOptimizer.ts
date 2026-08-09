import { LocationPoint } from '../types';

export interface DeliveryStop {
  id: string;
  title: string;
  recipientName: string;
  address: string;
  location: LocationPoint;
  stopType: 'pickup' | 'dropoff';
  orderNumber: string;
  estimatedMinutes?: number;
}

export interface OptimizationResult {
  optimizedStops: DeliveryStop[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  timeSavedMinutes: number;
}

// Calculate distance using Haversine formula
export function calculateHaversineDistanceKm(p1: LocationPoint, p2: LocationPoint): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Total distance for a sequence of stops starting from startLocation
export function calculateTotalSequenceDistance(
  startLocation: LocationPoint,
  stops: DeliveryStop[]
): number {
  if (stops.length === 0) return 0;
  let totalDist = calculateHaversineDistanceKm(startLocation, stops[0].location);
  for (let i = 0; i < stops.length - 1; i++) {
    totalDist += calculateHaversineDistanceKm(stops[i].location, stops[i + 1].location);
  }
  return totalDist;
}

// Nearest Neighbor TSP optimization algorithm
export function calculateOptimalDeliverySequence(
  startLocation: LocationPoint,
  stops: DeliveryStop[],
  speedKmH: number = 35
): OptimizationResult {
  if (stops.length <= 1) {
    const dist = calculateTotalSequenceDistance(startLocation, stops);
    return {
      optimizedStops: [...stops],
      originalDistanceKm: dist,
      optimizedDistanceKm: dist,
      distanceSavedKm: 0,
      timeSavedMinutes: 0,
    };
  }

  const originalDistanceKm = calculateTotalSequenceDistance(startLocation, stops);

  const unvisited = [...stops];
  const optimizedStops: DeliveryStop[] = [];
  let currentLocation = startLocation;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateHaversineDistanceKm(currentLocation, unvisited[0].location);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateHaversineDistanceKm(currentLocation, unvisited[i].location);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    optimizedStops.push(nextStop);
    currentLocation = nextStop.location;
  }

  const optimizedDistanceKm = calculateTotalSequenceDistance(startLocation, optimizedStops);
  const distanceSavedKm = Math.max(0, originalDistanceKm - optimizedDistanceKm);
  
  // Estimate time saved based on average vehicle speed (km/h) + traffic buffer
  const timeSavedMinutes = Math.round((distanceSavedKm / speedKmH) * 60);

  return {
    optimizedStops,
    originalDistanceKm: parseFloat(originalDistanceKm.toFixed(2)),
    optimizedDistanceKm: parseFloat(optimizedDistanceKm.toFixed(2)),
    distanceSavedKm: parseFloat(distanceSavedKm.toFixed(2)),
    timeSavedMinutes,
  };
}

// Mock multi-stop delivery points for demonstration (Ikeja, Lagos, Nigeria)
export const MOCK_MULTI_STOPS: DeliveryStop[] = [
  {
    id: 'stop-1',
    title: 'Dropoff #1 (David Miller)',
    recipientName: 'David Miller',
    address: 'Suite 12, Isaac John Street, GRA Ikeja, Lagos',
    location: { lat: 6.5822, lng: 3.3572 },
    stopType: 'dropoff',
    orderNumber: 'LP-2026-89421',
    estimatedMinutes: 8,
  },
  {
    id: 'stop-2',
    title: 'Dropoff #2 (Blessing Adebayo)',
    recipientName: 'Blessing Adebayo',
    address: '42 Toyin Street, Ikeja, Lagos',
    location: { lat: 6.5980, lng: 3.3505 },
    stopType: 'dropoff',
    orderNumber: 'LP-2026-89425',
    estimatedMinutes: 14,
  },
  {
    id: 'stop-3',
    title: 'Pickup #2 (Techlab Innovation Solutions)',
    recipientName: 'Techlab Store Merchant',
    address: 'No 13 Adekpre Street, Computer Village, Ikeja, Lagos',
    location: { lat: 6.5928, lng: 3.3421 },
    stopType: 'pickup',
    orderNumber: 'LP-2026-89426',
    estimatedMinutes: 5,
  },
  {
    id: 'stop-4',
    title: 'Dropoff #3 (Oluwaseun Kalu)',
    recipientName: 'Oluwaseun Kalu',
    address: '18 Allen Avenue, Ikeja, Lagos',
    location: { lat: 6.6018, lng: 3.3512 },
    stopType: 'dropoff',
    orderNumber: 'LP-2026-89427',
    estimatedMinutes: 22,
  },
];
