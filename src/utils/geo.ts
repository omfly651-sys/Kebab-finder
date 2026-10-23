import { KebabShop, OpeningHours } from '../types/kebab';

// Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km?: number): string {
  if (km === undefined || km === null || isNaN(km)) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Map day index (0 = Sun, 1 = Mon, ..., 6 = Sat) to OpeningHours key
const DAY_MAP: (keyof OpeningHours)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function isShopOpenNow(hours: OpeningHours, now: Date = new Date()): { isOpen: boolean; closesAt?: string; opensAt?: string } {
  const dayIndex = now.getDay();
  const currentKey = DAY_MAP[dayIndex];
  const todayHours = hours[currentKey];

  if (!todayHours || todayHours.close === 'closed') {
    return { isOpen: false };
  }

  if (todayHours.close === 'nonstop' || todayHours.open === 'nonstop') {
    return { isOpen: true, closesAt: 'Non-stop' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const openMinutes = parseTime(todayHours.open);
  let closeMinutes = parseTime(todayHours.close);

  // If closing after midnight (e.g., 02:00 or 04:00)
  if (closeMinutes < openMinutes) {
    // Overnight operation
    // Currently between openMinutes and 23:59
    if (currentMinutes >= openMinutes) {
      return { isOpen: true, closesAt: todayHours.close };
    }
    // Or between 00:00 and closeMinutes next day
    if (currentMinutes < closeMinutes) {
      return { isOpen: true, closesAt: todayHours.close };
    }

    // Check if yesterday opened overnight and hasn't closed yet today
    const prevDayIndex = (dayIndex + 6) % 7;
    const prevKey = DAY_MAP[prevDayIndex];
    const prevHours = hours[prevKey];
    if (prevHours && prevHours.close !== 'closed') {
      const prevCloseMinutes = parseTime(prevHours.close);
      const prevOpenMinutes = parseTime(prevHours.open);
      if (prevCloseMinutes < prevOpenMinutes && currentMinutes < prevCloseMinutes) {
        return { isOpen: true, closesAt: prevHours.close };
      }
    }

    return { isOpen: false, opensAt: todayHours.open };
  } else {
    // Standard daytime operation
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return { isOpen: true, closesAt: todayHours.close };
    }
    return { isOpen: false, opensAt: todayHours.open };
  }
}

// Predefined Czech cities coordinates and default zoom
export const CZECH_CITIES: { name: string; lat: number; lng: number; zoom: number }[] = [
  { name: 'Všechny', lat: 49.8175, lng: 15.473, zoom: 7.5 },
  { name: 'Praha', lat: 50.0755, lng: 14.4378, zoom: 12 },
  { name: 'Brno', lat: 49.1951, lng: 16.6068, zoom: 13 },
  { name: 'Ostrava', lat: 49.8209, lng: 18.2625, zoom: 13 },
  { name: 'Plzeň', lat: 49.7384, lng: 13.3736, zoom: 13 },
  { name: 'Liberec', lat: 50.7663, lng: 15.0543, zoom: 13 },
  { name: 'Olomouc', lat: 49.5938, lng: 17.2509, zoom: 13.5 },
  { name: 'České Budějovice', lat: 48.9745, lng: 14.4743, zoom: 13 },
  { name: 'Hradec Králové', lat: 50.2104, lng: 15.8252, zoom: 13 },
  { name: 'Pardubice', lat: 50.0343, lng: 15.7812, zoom: 13 },
  { name: 'Zlín', lat: 49.2243, lng: 17.6627, zoom: 13 },
  { name: 'Ústí nad Labem', lat: 50.6607, lng: 14.0323, zoom: 13 },
  { name: 'Karlovy Vary', lat: 50.2319, lng: 12.872, zoom: 13 },
  { name: 'Jihlava', lat: 49.3961, lng: 15.5912, zoom: 13 },
  { name: 'Kladno', lat: 50.1473, lng: 14.1029, zoom: 13 },
  { name: 'Teplice', lat: 50.6406, lng: 13.8247, zoom: 13 },
  { name: 'Opava', lat: 49.9388, lng: 17.9042, zoom: 13 },
  { name: 'Havířov', lat: 49.7797, lng: 18.2536, zoom: 13 },
  { name: 'Mladá Boleslav', lat: 50.4112, lng: 14.9034, zoom: 13 },
  { name: 'Tábor', lat: 49.4128, lng: 14.6644, zoom: 13 },
  { name: 'Kolín', lat: 50.0281, lng: 15.2014, zoom: 13 },
  { name: 'Prostějov', lat: 49.4722, lng: 17.1121, zoom: 13 },
  { name: 'Znojmo', lat: 48.8552, lng: 16.0494, zoom: 13 },
  { name: 'Cheb', lat: 50.0792, lng: 12.3705, zoom: 13 },
  { name: 'Frýdek-Místek', lat: 49.6868, lng: 18.3478, zoom: 13 },
];
