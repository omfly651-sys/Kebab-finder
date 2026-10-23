import React from 'react';
import { Star, MapPin, Clock, Heart, ChevronRight, Sparkles } from 'lucide-react';
import { KebabShop } from '../types/kebab';
import { isShopOpenNow, formatDistance } from '../utils/geo';

interface KebabCardProps {
  shop: KebabShop;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (shop: KebabShop) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const KebabCard: React.FC<KebabCardProps> = ({
  shop,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const openStatus = isShopOpenNow(shop.openingHours);

  return (
    <div
      onClick={() => onSelect(shop)}
      className={`group relative rounded-2xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-gradient-to-br from-slate-800 to-slate-800/90 border-orange-500 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/40'
          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex gap-3">
        {/* Thumbnail Image */}
        <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-800">
          <img
            src={shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Price Tag */}
          <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-300 border border-white/10">
            od {shop.standardDurumPrice} Kč
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => onToggleFavorite(shop.id, e)}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/60 backdrop-blur-md hover:bg-slate-950 text-white transition-all"
            title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-300 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Top row: Name + Rating */}
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug truncate group-hover:text-orange-400 transition-colors">
                {shop.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{shop.rating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-400/70 font-normal">({shop.reviewCount})</span>
              </div>
            </div>

            {/* Address & City */}
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-1 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </p>
          </div>

          {/* Tags & Open Status */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              {/* Open indicator */}
              <span
                className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                  openStatus.isOpen
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    openStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {openStatus.isOpen
                  ? openStatus.closesAt === 'Non-stop'
                    ? 'Non-stop'
                    : `Do ${openStatus.closesAt}`
                  : 'Zavřeno'}
              </span>

              {/* Shawarma badge if applicable */}
              {(shop.isShawarma || shop.category === 'shawarma' || shop.tags.includes('Shawarma')) && (
                <span className="text-[10px] font-extrabold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded-md border border-purple-500/30">
                  Shawarma
                </span>
              )}

              {/* Tag highlight */}
              {shop.tags[0] && shop.tags[0] !== 'Shawarma' && (
                <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full truncate border border-slate-700/50">
                  {shop.tags[0]}
                </span>
              )}
            </div>

            {/* Distance if available */}
            {shop.distanceKm !== undefined && (
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0">
                {formatDistance(shop.distanceKm)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
