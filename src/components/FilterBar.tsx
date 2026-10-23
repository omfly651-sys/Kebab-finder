import React from 'react';
import { Search, X, SlidersHorizontal, Moon, ShieldCheck, CreditCard, Sparkles, Clock, ArrowDownWideNarrow } from 'lucide-react';
import { FilterState, MeatType } from '../types/kebab';
import { CZECH_CITIES } from '../utils/geo';

interface FilterBarProps {
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onSelectCity: (cityName: string) => void;
  hasLocation: boolean;
  totalFilteredCount: number;
}

const MEAT_OPTIONS: { id: MeatType; label: string; emoji: string }[] = [
  { id: 'chicken', label: 'Kuřecí', emoji: '🍗' },
  { id: 'beef', label: 'Hovězí / Telecí', emoji: '🥩' },
  { id: 'lamb', label: 'Jehněčí', emoji: '🐑' },
  { id: 'mix', label: 'Mix maso', emoji: '🔥' },
  { id: 'veggie', label: 'Falafel / Veggie', emoji: '🧆' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onUpdateFilters,
  onSelectCity,
  hasLocation,
  totalFilteredCount,
}) => {
  const toggleMeat = (meat: MeatType) => {
    const exists = filters.meatTypes.includes(meat);
    const updated = exists
      ? filters.meatTypes.filter((m) => m !== meat)
      : [...filters.meatTypes, meat];
    onUpdateFilters({ meatTypes: updated });
  };

  const clearAllFilters = () => {
    onUpdateFilters({
      searchQuery: '',
      city: 'Všechny',
      meatTypes: [],
      onlyOpenNow: false,
      onlyLateNight: false,
      onlyYaprakOrHandmadeBread: false,
      onlyShawarma: false,
      cardsAcceptedOnly: false,
      minRating: 0,
      maxPrice: 250,
      sortBy: 'rating',
      favoritesOnly: false,
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.city !== 'Všechny' ||
    filters.meatTypes.length > 0 ||
    filters.onlyOpenNow ||
    filters.onlyLateNight ||
    filters.onlyYaprakOrHandmadeBread ||
    filters.onlyShawarma ||
    filters.cardsAcceptedOnly ||
    filters.minRating > 0 ||
    filters.favoritesOnly;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-3 sm:px-6 py-3 space-y-3">
      {/* City Chips Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] shrink-0 mr-1 hidden sm:inline">
          Město:
        </span>
        {CZECH_CITIES.map((city) => {
          const isSelected = filters.city === city.name;
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city.name)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all text-xs cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 ring-1 ring-orange-400'
                  : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Search Bar + Quick Toggles Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Hledat kebab (název, ulice, město, specialita)..."
            className="w-full bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-800/100 border border-slate-700 focus:border-orange-500 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilters({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Attribute Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {/* Only Shawarma */}
          <button
            onClick={() => onUpdateFilters({ onlyShawarma: !filters.onlyShawarma })}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filters.onlyShawarma
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/70 shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span>🌯</span>
            <span>Shawarma / Šavarma</span>
          </button>

          {/* Open Now */}
          <button
            onClick={() => onUpdateFilters({ onlyOpenNow: !filters.onlyOpenNow })}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${
              filters.onlyOpenNow
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${filters.onlyOpenNow ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Otevřeno teď</span>
          </button>

          {/* Late Night */}
          <button
            onClick={() => onUpdateFilters({ onlyLateNight: !filters.onlyLateNight })}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${
              filters.onlyLateNight
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${filters.onlyLateNight ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Noční kebab</span>
          </button>

          {/* Handmade Bread / Yaprak */}
          <button
            onClick={() =>
              onUpdateFilters({
                onlyYaprakOrHandmadeBread: !filters.onlyYaprakOrHandmadeBread,
              })
            }
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${
              filters.onlyYaprakOrHandmadeBread
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${filters.onlyYaprakOrHandmadeBread ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Vlastní chléb / Yaprak</span>
          </button>

          {/* Cards accepted */}
          <button
            onClick={() => onUpdateFilters({ cardsAcceptedOnly: !filters.cardsAcceptedOnly })}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${
              filters.cardsAcceptedOnly
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <CreditCard className={`w-3.5 h-3.5 ${filters.cardsAcceptedOnly ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>Karty</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="rating">★ Nejlépe hodnocené</option>
              {hasLocation && <option value="distance">📍 Nejbližší</option>}
              <option value="price">💰 Nejlevnější</option>
              <option value="reviews">💬 Nejvíce recenzí</option>
            </select>
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              title="Resetovat všechny filtry"
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 px-2 py-1.5 text-xs font-medium hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Meat Selection Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1 hidden sm:inline">
          Maso:
        </span>
        {MEAT_OPTIONS.map((meat) => {
          const isSelected = filters.meatTypes.includes(meat.id);
          return (
            <button
              key={meat.id}
              onClick={() => toggleMeat(meat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/60 font-semibold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{meat.emoji}</span>
              <span>{meat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
