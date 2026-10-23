import React from 'react';
import { Flame, Star, PlusCircle, Navigation, MapPin } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  openCount: number;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenAddModal: () => void;
  onLocateUser: () => void;
  isLocating: boolean;
  hasLocation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  openCount,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavorites,
  onOpenAddModal,
  onLocateUser,
  isLocating,
  hasLocation,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
            <span className="text-xl sm:text-2xl select-none">🌯</span>
            <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5 border border-slate-900">
              <Flame className="w-3 h-3 text-amber-200 fill-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-orange-100 to-amber-200 bg-clip-text text-transparent">
                Kebab & Shawarma Finder
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Česko 🇨🇿
              </span>
            </div>
            <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span>{totalCount} kebabáren & shawarem</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-emerald-400 font-medium">{openCount} právě otevřeno</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* GPS Locator */}
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            title={hasLocation ? 'Poloha zaměřena' : 'Zaměřit mou polohu'}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg transition-all border ${
              hasLocation
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-amber-400' : hasLocation ? 'text-blue-400 fill-blue-400' : ''}`} />
            <span className="hidden md:inline">{isLocating ? 'Zaměřuji...' : hasLocation ? 'U mě' : 'Nejbližší'}</span>
          </button>

          {/* Favorites Filter */}
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg transition-all border ${
              showFavoritesOnly
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Oblíbené</span>
            {favoritesCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                showFavoritesOnly ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/30 text-amber-300'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Add New Kebab */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 text-xs font-bold px-3 sm:px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-md shadow-orange-600/25 border border-orange-400/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span className="hidden xs:inline">Přidat kebab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
