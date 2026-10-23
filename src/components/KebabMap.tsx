import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { KebabShop } from '../types/kebab';
import { Layers, Navigation, RotateCcw, MapPin, Star, Clock } from 'lucide-react';
import { isShopOpenNow } from '../utils/geo';

interface KebabMapProps {
  shops: KebabShop[];
  selectedShop: KebabShop | null;
  onSelectShop: (shop: KebabShop) => void;
  userLocation: { lat: number; lng: number } | null;
  center: { lat: number; lng: number; zoom: number };
  onLocateUser: () => void;
  isLocating: boolean;
}

type TileTheme = 'osm' | 'voyager' | 'dark';

const TILE_PROVIDERS: Record<TileTheme, { url: string; attribution: string; name: string; subdomains: string[] }> = {
  osm: {
    name: 'Klasická mapa (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> přispěvatelé (bez API)',
    subdomains: ['a', 'b', 'c'],
  },
  voyager: {
    name: 'Světlý styl (Carto Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  },
  dark: {
    name: 'Tmavá mapa (Noční režim)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd'],
  },
};

export const KebabMap: React.FC<KebabMapProps> = ({
  shops,
  selectedShop,
  onSelectShop,
  userLocation,
  center,
  onLocateUser,
  isLocating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Default to standard normal OpenStreetMap (no API key needed, standard street view)
  const [activeTheme, setActiveTheme] = useState<TileTheme>('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: center.zoom,
      zoomControl: false,
    });

    // Add zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer - 100% free OpenStreetMap without any API key or token
    const provider = TILE_PROVIDERS[activeTheme];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Invalidate size immediately and after slight layout delays to prevent blank/gray tiles
    const timer1 = setTimeout(() => map.invalidateSize(), 50);
    const timer2 = setTimeout(() => map.invalidateSize(), 200);
    const timer3 = setTimeout(() => map.invalidateSize(), 600);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // ResizeObserver on map container
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when activeTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[activeTheme];
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeTheme]);

  // Handle external Center/Zoom changes (e.g., clicking on a city)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], center.zoom, {
      animate: true,
      duration: 0.8,
    });
  }, [center]);

  // Create custom marker icons
  const createKebabIcon = (shop: KebabShop, isSelected: boolean) => {
    const isTopRated = shop.rating >= 4.8;
    const isShawarma = shop.isShawarma || shop.category === 'shawarma' || shop.tags.includes('Shawarma');
    const openStatus = isShopOpenNow(shop.openingHours);

    const pinBg = isSelected
      ? isShawarma
        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 ring-4 ring-purple-400/50 shadow-2xl scale-110'
        : 'bg-gradient-to-r from-orange-500 to-red-600 ring-4 ring-orange-400/50 shadow-2xl scale-110'
      : isShawarma
      ? 'bg-gradient-to-r from-purple-700 to-indigo-800 border border-purple-400/60 shadow-lg'
      : isTopRated
      ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg'
      : 'bg-slate-800 border border-slate-600 shadow-md';

    const statusDot = openStatus.isOpen
      ? '<span class="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 absolute -top-0.5 -right-0.5"></span>'
      : '<span class="w-2 h-2 rounded-full bg-slate-500 ring-2 ring-slate-900 absolute -top-0.5 -right-0.5"></span>';

    const html = `
      <div class="kebab-marker-pin ${isSelected ? 'active' : ''}">
        <div class="relative flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold ${pinBg}">
          <span class="text-xs">${isShawarma ? '🌯' : '🥙'}</span>
          <span class="text-[11px] font-extrabold tracking-tight">${shop.rating.toFixed(1)}</span>
          ${statusDot}
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'kebab-custom-div-icon',
      html,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
      popupAnchor: [0, -18],
    });
  };

  // Render Kebab Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers that no longer exist
    const currentShopIds = new Set(shops.map((s) => s.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentShopIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    shops.forEach((shop) => {
      const isSelected = selectedShop?.id === shop.id;
      const isShawarma = shop.isShawarma || shop.category === 'shawarma' || shop.tags.includes('Shawarma');
      let marker = markersRef.current.get(shop.id);

      if (!marker) {
        marker = L.marker([shop.lat, shop.lng], {
          icon: createKebabIcon(shop, isSelected),
        }).addTo(map);

        marker.bindTooltip(`<b>${shop.name}</b>${isShawarma ? ' <span style="background:#7e22ce;padding:1px 4px;border-radius:4px;font-size:9px">SHAWARMA</span>' : ''}<br/><span style="color:#f59e0b">★ ${shop.rating.toFixed(1)}</span> · od ${shop.standardDurumPrice} Kč`, {
          direction: 'top',
          offset: [0, -14],
          className: 'kebab-map-tooltip',
        });

        marker.on('click', () => {
          onSelectShop(shop);
        });

        markersRef.current.set(shop.id, marker);
      } else {
        marker.setIcon(createKebabIcon(shop, isSelected));
        if (isSelected) {
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
        }
      }
    });
  }, [shops, selectedShop]);

  // When selectedShop changes, pan map to it smoothly
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedShop) return;
    mapInstanceRef.current.panTo([selectedShop.lat, selectedShop.lng], {
      animate: true,
      duration: 0.6,
    });
  }, [selectedShop]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: 'user-location-custom-icon',
          html: `
            <div class="user-location-pulse">
              <div class="user-location-wave"></div>
              <div class="user-location-dot"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 2000,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  const handleResetCzechView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([49.8175, 15.473], 7.5, {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Přepnout styl mapy"
            className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Layers className="w-5 h-5 text-orange-400" />
          </button>

          {showLayerMenu && (
            <div className="absolute top-12 left-0 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 w-40 text-xs z-50">
              {(Object.keys(TILE_PROVIDERS) as TileTheme[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => {
                    setActiveTheme(themeKey);
                    setShowLayerMenu(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                    activeTheme === themeKey
                      ? 'bg-orange-500 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {TILE_PROVIDERS[themeKey].name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Locate Me Button */}
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          title="Najít mou polohu"
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Navigation
            className={`w-5 h-5 ${
              isLocating ? 'animate-spin text-amber-400' : userLocation ? 'text-blue-400 fill-blue-400' : 'text-slate-300'
            }`}
          />
        </button>

        {/* Reset to Entire Czech Republic */}
        <button
          onClick={handleResetCzechView}
          title="Zobrazit celé Česko"
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-300 hover:text-orange-400" />
        </button>
      </div>

      {/* Floating Map Legend / Counter Bottom-Right */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300 shadow-xl pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Otevřeno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span>Zavřeno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></span>
          <span>Top hodnocení (4.8+)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
          <span>🗺️ OpenStreetMap (bez API)</span>
        </div>
      </div>
    </div>
  );
};
