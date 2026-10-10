import axios from 'axios';

export interface RouteModeDetails {
  mode: 'flight' | 'train' | 'bus' | 'car';
  label: string;
  durationText: string;
  durationMinutes: number;
  distanceKm: number;
  distanceText: string;
  speedKmH: number;
  recommended: boolean;
  notes?: string;
}

export interface RouteDetails {
  origin: string;
  destination: string;
  straightDistanceKm: number;
  roadDistanceKm: number;
  distanceText: string;
  primaryMode: 'flight' | 'train' | 'bus' | 'car';
  primaryDurationText: string;
  primaryDurationMinutes: number;
  modes: RouteModeDetails[];
  googleMapsUrl: string;
  embedMapUrl: string;
}

// Built-in coordinate database for instant, zero-latency resolution
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Northern India
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  noida: { lat: 28.5355, lng: 77.391 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  manali: { lat: 32.2432, lng: 77.1892 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  jaisalmer: { lat: 26.9157, lng: 70.9083 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  prayagraj: { lat: 25.4358, lng: 81.8463 },
  allahabad: { lat: 25.4358, lng: 81.8463 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  jammu: { lat: 32.7266, lng: 74.857 },
  leh: { lat: 34.1526, lng: 77.5771 },

  // Western India
  mumbai: { lat: 19.076, lng: 72.8777 },
  bombay: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  goa: { lat: 15.2993, lng: 74.124 },
  panaji: { lat: 15.4909, lng: 73.8278 },

  // Southern India
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  madras: { lat: 13.0827, lng: 80.2707 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  trivandrum: { lat: 8.5241, lng: 76.9366 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  ooty: { lat: 11.4102, lng: 76.695 },
  kodaikanal: { lat: 10.2381, lng: 77.4892 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },

  // Eastern India
  kolkata: { lat: 22.5726, lng: 88.3639 },
  calcutta: { lat: 22.5726, lng: 88.3639 },
  darjeeling: { lat: 27.041, lng: 88.2663 },
  gangtok: { lat: 27.3389, lng: 88.6065 },
  puri: { lat: 19.8135, lng: 85.8312 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  shillong: { lat: 25.5788, lng: 91.8933 },
  patna: { lat: 25.5941, lng: 85.1376 },
  ranchi: { lat: 23.3441, lng: 85.3096 },

  // Central India
  bhopal: { lat: 23.2599, lng: 77.4126 },
  indore: { lat: 22.7196, lng: 75.8577 },
  gwalior: { lat: 26.2183, lng: 78.1828 },
  jabalpur: { lat: 23.1815, lng: 79.9864 },
  raipur: { lat: 21.2514, lng: 81.6296 },

  // International popular spots
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  phuket: { lat: 7.8804, lng: 98.3923 },
  bali: { lat: -8.3405, lng: 115.092 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  'new york': { lat: 40.7128, lng: -74.006 },
};

function normalizeCityName(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)[0]; // First token for compound names like "Delhi, India"
}

// Haversine straight-line formula
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export class RouteService {
  /**
   * Resolves coordinates using local database with graceful Nominatim fallback
   */
  static async getCoordinates(cityName: string): Promise<{ lat: number; lng: number }> {
    const rawNormalized = cityName.trim().toLowerCase();
    const token = normalizeCityName(cityName);

    if (CITY_COORDINATES[rawNormalized]) {
      return CITY_COORDINATES[rawNormalized];
    }
    if (CITY_COORDINATES[token]) {
      return CITY_COORDINATES[token];
    }

    // Attempt online lookup from OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cityName
      )}&format=json&limit=1`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'TripWise-Planner/1.0' },
        timeout: 3000,
      });

      if (res.data && res.data.length > 0) {
        return {
          lat: parseFloat(res.data[0].lat),
          lng: parseFloat(res.data[0].lon),
        };
      }
    } catch {
      // Ignore network error and return fallback
    }

    // Default fallback to center of India
    return { lat: 20.5937, lng: 78.9629 };
  }

  /**
   * Computes accurate distance and realistic travel times between origin and destination
   */
  static async calculateRoute(
    origin: string,
    destination: string,
    preferredMode: string = 'bus'
  ): Promise<RouteDetails> {
    const origCoords = await this.getCoordinates(origin);
    const destCoords = await this.getCoordinates(destination);

    const straightDist = calculateHaversineDistance(
      origCoords.lat,
      origCoords.lng,
      destCoords.lat,
      destCoords.lng
    );

    // Realistic road curvature multiplier in India (1.20 - 1.28)
    const roadDist = Math.max(15, Math.round(straightDist * 1.23));

    // Travel Modes calculation
    // 1. Flight: ~750 km/h cruising + 120 mins airport security & boarding buffer
    const flightDurationMinutes =
      straightDist > 150
        ? Math.round((straightDist / 750) * 60) + 120
        : 120; // Short hops

    // 2. Train: average express/Rajdhani speed ~65-75 km/h + 30 mins station buffer
    const trainDistance = Math.round(straightDist * 1.18);
    const trainDurationMinutes = Math.round((trainDistance / 68) * 60) + 30;

    // 3. Bus: average speed 46 km/h with highway rest stops
    const busDurationMinutes = Math.round((roadDist / 48) * 60);

    // 4. Car / Cab: average speed 62 km/h
    const carDurationMinutes = Math.round((roadDist / 62) * 60);

    const modes: RouteModeDetails[] = [
      {
        mode: 'flight',
        label: 'By Flight',
        durationText: formatMinutes(flightDurationMinutes),
        durationMinutes: flightDurationMinutes,
        distanceKm: straightDist,
        distanceText: `${straightDist.toLocaleString()} km (Air)`,
        speedKmH: 750,
        recommended: straightDist > 500,
        notes: straightDist > 500 ? 'Fastest option for long distance' : 'Short distance flight',
      },
      {
        mode: 'train',
        label: 'By Train',
        durationText: formatMinutes(trainDurationMinutes),
        durationMinutes: trainDurationMinutes,
        distanceKm: trainDistance,
        distanceText: `${trainDistance.toLocaleString()} km (Rail)`,
        speedKmH: 68,
        recommended: straightDist >= 200 && straightDist <= 1200,
        notes: 'Comfortable & scenic journey',
      },
      {
        mode: 'bus',
        label: 'By Bus',
        durationText: formatMinutes(busDurationMinutes),
        durationMinutes: busDurationMinutes,
        distanceKm: roadDist,
        distanceText: `${roadDist.toLocaleString()} km (Road)`,
        speedKmH: 48,
        recommended: straightDist < 500 || preferredMode === 'bus',
        notes: 'Affordable sleeper / AC Volvo coaches',
      },
      {
        mode: 'car',
        label: 'By Road (Car / Cab)',
        durationText: formatMinutes(carDurationMinutes),
        durationMinutes: carDurationMinutes,
        distanceKm: roadDist,
        distanceText: `${roadDist.toLocaleString()} km (Road)`,
        speedKmH: 62,
        recommended: straightDist < 350,
        notes: 'Door-to-door flexibility via expressways',
      },
    ];

    // Determine primary mode
    let normalizedPref: 'flight' | 'train' | 'bus' | 'car' = 'bus';
    if (preferredMode.includes('flight') || preferredMode.includes('air')) normalizedPref = 'flight';
    else if (preferredMode.includes('train') || preferredMode.includes('rail')) normalizedPref = 'train';
    else if (preferredMode.includes('bus')) normalizedPref = 'bus';
    else if (preferredMode.includes('car') || preferredMode.includes('drive') || preferredMode.includes('rental'))
      normalizedPref = 'car';

    const selectedMode = modes.find((m) => m.mode === normalizedPref) || modes[2];

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;

    const embedMapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(
      origin
    )}&daddr=${encodeURIComponent(destination)}&output=embed`;

    return {
      origin,
      destination,
      straightDistanceKm: straightDist,
      roadDistanceKm: roadDist,
      distanceText: `${roadDist.toLocaleString()} km`,
      primaryMode: selectedMode.mode,
      primaryDurationText: selectedMode.durationText,
      primaryDurationMinutes: selectedMode.durationMinutes,
      modes,
      googleMapsUrl,
      embedMapUrl,
    };
  }
}
