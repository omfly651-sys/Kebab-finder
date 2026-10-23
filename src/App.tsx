import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_KEBAB_SHOPS } from './data/kebabData';
import { KebabShop, FilterState, Review } from './types/kebab';
import { calculateDistanceKm, isShopOpenNow, CZECH_CITIES } from './utils/geo';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { KebabCard } from './components/KebabCard';
import { KebabMap } from './components/KebabMap';
import { KebabDetailModal } from './components/KebabDetailModal';
import { AddKebabModal } from './components/AddKebabModal';
import { MapPin, SlidersHorizontal, List, Map as MapIcon, Utensils, AlertCircle } from 'lucide-react';

const STORAGE_FAVORITES_KEY = 'kebab_finder_favorites_v1';
const STORAGE_CUSTOM_SHOPS_KEY = 'kebab_finder_custom_shops_v1';

export default function App() {
  // Load custom shops and favorites from localStorage
  const [shops, setShops] = useState<KebabShop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_SHOPS_KEY);
      if (saved) {
        const custom = JSON.parse(saved);
        return [...custom, ...INITIAL_KEBAB_SHOPS];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KEBAB_SHOPS;
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return new Set();
  });

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Map viewport center
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 49.8175,
    lng: 15.473,
    zoom: 7.5,
  });

  // Selected shop for drawer/modal
  const [selectedShop, setSelectedShop] = useState<KebabShop | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);

  // Mobile view switch (map vs list)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Trigger map resize recalculation when switching to mobile map view
  useEffect(() => {
    if (mobileView === 'map') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileView]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    city: 'Všechny',
    meatTypes: [],
    onlyOpenNow: false,
    onlyLateNight: false,
    onlyYaprakOrHandmadeBread: false,
    onlyShawarma: false,
    cardsAcceptedOnly: false,
    minRating: 0,
    maxPrice: 300,
    sortBy: 'rating',
    favoritesOnly: false,
  });

  // Save favorites to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Request user location
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolokace není vaším prohlížečem podporována');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        setMapCenter({ lat: coords.lat, lng: coords.lng, zoom: 14 });
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Nepodařilo se získat vaši polohu. Zkontrolujte oprávnění v prohlížeči.');
        setTimeout(() => setLocationError(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle favorite
  const handleToggleFavorite = (shopId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(shopId)) {
        next.delete(shopId);
      } else {
        next.add(shopId);
      }
      return next;
    });
  };

  // Add a new shop
  const handleAddShop = (newShop: KebabShop) => {
    const updated = [newShop, ...shops];
    setShops(updated);
    try {
      const existingCustom = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_SHOPS_KEY) || '[]');
      localStorage.setItem(STORAGE_CUSTOM_SHOPS_KEY, JSON.stringify([newShop, ...existingCustom]));
    } catch (e) {
      console.error(e);
    }
    // Fly to new shop
    setMapCenter({ lat: newShop.lat, lng: newShop.lng, zoom: 15 });
    setSelectedShop(newShop);
    setShowDetailModal(true);
  };

  // Add review to a shop
  const handleAddReview = (shopId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    const fullReview: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: 'právě teď',
    };

    setShops((prev) =>
      prev.map((s) => {
        if (s.id === shopId) {
          const updatedReviews = [fullReview, ...s.reviews];
          const avgRating =
            updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
          return {
            ...s,
            reviews: updatedReviews,
            reviewCount: s.reviewCount + 1,
            rating: Math.round(avgRating * 10) / 10,
          };
        }
        return s;
      })
    );

    if (selectedShop && selectedShop.id === shopId) {
      setSelectedShop((prev) => {
        if (!prev) return null;
        const updatedReviews = [fullReview, ...prev.reviews];
        const avgRating =
          updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
        return {
          ...prev,
          reviews: updatedReviews,
          reviewCount: prev.reviewCount + 1,
          rating: Math.round(avgRating * 10) / 10,
        };
      });
    }
  };

  // City selection from chips
  const handleSelectCity = (cityName: string) => {
    setFilters((prev) => ({ ...prev, city: cityName }));
    const cityCoord = CZECH_CITIES.find((c) => c.name === cityName);
    if (cityCoord) {
      setMapCenter({ lat: cityCoord.lat, lng: cityCoord.lng, zoom: cityCoord.zoom });
    }
  };

  // Filter & Sort shops
  const processedShops = useMemo(() => {
    let result = shops.map((s) => {
      let distanceKm: number | undefined;
      if (userLocation) {
        distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
      }
      return { ...s, distanceKm };
    });

    // Favorites only filter
    if (filters.favoritesOnly) {
      result = result.filter((s) => favorites.has(s.id));
    }

    // City filter
    if (filters.city && filters.city !== 'Všechny') {
      result = result.filter((s) => s.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Search query filter (name, address, city, tags, menu items)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.description.toLowerCase().includes(q) ||
          s.menu.some((m) => m.name.toLowerCase().includes(q))
      );
    }

    // Meat type filter
    if (filters.meatTypes.length > 0) {
      result = result.filter((s) =>
        filters.meatTypes.some((meat) => s.meatTypes.includes(meat))
      );
    }

    // Open now filter
    if (filters.onlyOpenNow) {
      result = result.filter((s) => isShopOpenNow(s.openingHours).isOpen);
    }

    // Late night filter
    if (filters.onlyLateNight) {
      result = result.filter(
        (s) =>
          s.tags.includes('Noční provoz') ||
          s.tags.includes('Non-stop') ||
          Object.values(s.openingHours).some(
            (h) => h.close === 'nonstop' || h.close.startsWith('02:') || h.close.startsWith('03:') || h.close.startsWith('04:') || h.close.startsWith('05:') || h.close.startsWith('06:')
          )
      );
    }

    // Handmade bread or Yaprak filter
    if (filters.onlyYaprakOrHandmadeBread) {
      result = result.filter(
        (s) =>
          s.tags.includes('Vlastní chléb') ||
          s.tags.includes('Yaprak maso') ||
          s.tags.includes('Kultovní místo')
      );
    }

    // Shawarma filter
    if (filters.onlyShawarma) {
      result = result.filter(
        (s) =>
          s.isShawarma ||
          s.category === 'shawarma' ||
          s.category === 'both' ||
          s.name.toLowerCase().includes('shawarma') ||
          s.name.toLowerCase().includes('šavarma') ||
          s.tags.some((t) => t.toLowerCase().includes('shawarma'))
      );
    }

    // Cards accepted
    if (filters.cardsAcceptedOnly) {
      result = result.filter((s) => s.tags.includes('Karty berou'));
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'distance' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (filters.sortBy === 'price') {
        return a.standardDurumPrice - b.standardDurumPrice;
      }
      if (filters.sortBy === 'reviews') {
        return b.reviewCount - a.reviewCount;
      }
      // default: rating
      return b.rating - a.rating;
    });

    return result;
  }, [shops, filters, userLocation, favorites]);

  const currentlyOpenCount = useMemo(() => {
    return shops.filter((s) => isShopOpenNow(s.openingHours).isOpen).length;
  }, [shops]);

  const handleSelectShop = (shop: KebabShop) => {
    setSelectedShop(shop);
    setShowDetailModal(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Navbar */}
      <Navbar
        totalCount={shops.length}
        openCount={currentlyOpenCount}
        favoritesCount={favorites.size}
        showFavoritesOnly={filters.favoritesOnly}
        onToggleFavorites={() =>
          setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))
        }
        onOpenAddModal={() => setShowAddModal(true)}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        hasLocation={userLocation !== null}
      />

      {/* Filter and City Bar */}
      <FilterBar
        filters={filters}
        onUpdateFilters={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onSelectCity={handleSelectCity}
        hasLocation={userLocation !== null}
        totalFilteredCount={processedShops.length}
      />

      {/* Geolocation Error Alert if any */}
      {locationError && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="text-amber-400 font-bold hover:underline"
          >
            Zavřít
          </button>
        </div>
      )}

      {/* Main Content: Split Desktop / Mobile Tabs */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Kebab Shop List (Always visible on desktop, tabbed on mobile) */}
        <aside
          className={`w-full md:w-[420px] lg:w-[460px] xl:w-[500px] h-full flex flex-col bg-slate-950 border-r border-slate-800 shrink-0 z-10 transition-all ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header with Stats */}
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">
              Nalezeno <span className="text-orange-400 font-bold">{processedShops.length}</span> kebabáren
              {filters.city !== 'Všechny' && ` v ${filters.city}`}
            </span>
            {userLocation && (
              <span className="text-blue-400 font-medium">📍 Seřazeno dle vzdálenosti</span>
            )}
          </div>

          {/* Cards Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {processedShops.length > 0 ? (
              processedShops.map((shop) => (
                <KebabCard
                  key={shop.id}
                  shop={shop}
                  isSelected={selectedShop?.id === shop.id}
                  isFavorite={favorites.has(shop.id)}
                  onSelect={handleSelectShop}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-3xl">
                  🌯
                </div>
                <h4 className="font-bold text-white text-base">Žádný kebab nenalezen</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Zkuste upravit zadaná kritéria filtru, vyhledávání nebo vyberte jiné město.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      city: 'Všechny',
                      meatTypes: [],
                      onlyOpenNow: false,
                      onlyLateNight: false,
                      onlyYaprakOrHandmadeBread: false,
                      onlyShawarma: false,
                      cardsAcceptedOnly: false,
                      minRating: 0,
                      maxPrice: 300,
                      sortBy: 'rating',
                      favoritesOnly: false,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 border border-orange-500/40 text-xs font-bold transition-all"
                >
                  Resetovat filtry
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Interactive Leaflet Map */}
        <main
          className={`flex-1 h-full relative ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <KebabMap
            shops={processedShops}
            selectedShop={selectedShop}
            onSelectShop={handleSelectShop}
            userLocation={userLocation}
            center={mapCenter}
            onLocateUser={handleLocateUser}
            isLocating={isLocating}
          />
        </main>

        {/* Mobile Floating View Toggle Button */}
        <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-2xl shadow-orange-600/50 border border-orange-400/40 backdrop-blur-md active:scale-95 transition-all"
          >
            {mobileView === 'map' ? (
              <>
                <List className="w-4 h-4" />
                <span>Zobrazit seznam ({processedShops.length})</span>
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4" />
                <span>Zobrazit mapu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Kebab Detail Modal */}
      {showDetailModal && (
        <KebabDetailModal
          shop={selectedShop}
          onClose={() => setShowDetailModal(false)}
          isFavorite={selectedShop ? favorites.has(selectedShop.id) : false}
          onToggleFavorite={handleToggleFavorite}
          onAddReview={handleAddReview}
        />
      )}

      {/* Add New Kebab Modal */}
      {showAddModal && (
        <AddKebabModal
          onClose={() => setShowAddModal(false)}
          onAddShop={handleAddShop}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
