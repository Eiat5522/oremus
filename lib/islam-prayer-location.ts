export type SavedPrayerLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export const PRAYER_LOCATION_STORAGE_KEY = '@oremus/islam-prayer-location-v1';

export const PRAYER_LOCATION_PRESETS: SavedPrayerLocation[] = [
  { id: 'new-york-us', label: 'New York, US', latitude: 40.7128, longitude: -74.006 },
  { id: 'los-angeles-us', label: 'Los Angeles, US', latitude: 34.0522, longitude: -118.2437 },
  { id: 'chicago-us', label: 'Chicago, US', latitude: 41.8781, longitude: -87.6298 },
  { id: 'london-uk', label: 'London, UK', latitude: 51.5072, longitude: -0.1276 },
  { id: 'cairo-eg', label: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 },
  { id: 'bangkok-th', label: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018 },
  { id: 'mecca-sa', label: 'Mecca, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { id: 'jakarta-id', label: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 },
];
