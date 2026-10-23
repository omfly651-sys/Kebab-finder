import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Phone,
  Clock,
  Compass,
  Heart,
  Share2,
  CheckCircle,
  MessageSquarePlus,
  Flame,
  Calendar,
  Utensils,
  ExternalLink,
} from 'lucide-react';
import { KebabShop, Review, MeatType, SauceType } from '../types/kebab';
import { isShopOpenNow, formatDistance } from '../utils/geo';

interface KebabDetailModalProps {
  shop: KebabShop | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddReview: (shopId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const DAY_NAMES: Record<string, string> = {
  monday: 'Pondělí',
  tuesday: 'Úterý',
  wednesday: 'Středa',
  thursday: 'Čtvrtek',
  friday: 'Pátek',
  saturday: 'Sobota',
  sunday: 'Neděle',
};

const MEAT_LABELS: Record<MeatType, string> = {
  chicken: '🍗 Kuřecí',
  beef: '🥩 Hovězí/Telecí',
  lamb: '🐑 Jehněčí',
  mix: '🔥 Mix maso',
  veggie: '🧆 Falafel / Veggie',
};

const SAUCE_LABELS: Record<SauceType, string> = {
  garlic: '🧄 Česneková',
  herb: '🌿 Bylinková',
  spicy: '🌶️ Pálivá',
  extra_spicy: '🔥 Extra pálivá',
  samurai: '⚔️ Samuraj',
  tzatziki: '🥒 Tzatziki',
  curry: '🍛 Kari omáčka',
  toum: '🧄 Toum (libanonský česnekový krém)',
  tahini: '🌱 Tahini (sezamová omáčka)',
};

export const KebabDetailModal: React.FC<KebabDetailModalProps> = ({
  shop,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddReview,
}) => {
  if (!shop) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMeat, setReviewMeat] = useState('Mix');
  const [copiedShare, setCopiedShare] = useState(false);

  const openStatus = isShopOpenNow(shop.openingHours);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;
  const mapyCzUrl = `https://mapy.cz/zakladni?q=${shop.lat},${shop.lng}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${shop.name} | Kebab Finder`,
        text: `Podívej se na kebab ${shop.name} na ${shop.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shop.name} - ${shop.address} (${shop.rating}★ na Kebab Finder)`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    onAddReview(shop.id, {
      author: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      recommendedMeat: reviewMeat,
    });

    setReviewName('');
    setReviewComment('');
    setShowReviewForm(false);
  };

  const todayIndex = new Date().getDay();
  const dayKeys: (keyof typeof shop.openingHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const todayKey = dayKeys[todayIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image Section */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden bg-slate-950">
          <img
            src={shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />

          {/* Action Top Bar */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white backdrop-blur-md transition-all border border-white/10"
              title="Sdílet kebab"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(shop.id)}
              className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white backdrop-blur-md transition-all border border-white/10"
              title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-200'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white backdrop-blur-md transition-all border border-white/10"
              title="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {copiedShare && (
            <div className="absolute top-14 right-3 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg font-medium shadow-lg animate-in fade-in">
              Odkaz zkopírován!
            </div>
          )}

          {/* Basic Info over image */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-xs font-extrabold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>{shop.rating.toFixed(1)}</span>
                <span className="text-slate-800 font-semibold">({shop.reviewCount} recenzí)</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-500/30 text-orange-200 border border-orange-400/30">
                Dürüm od {shop.standardDurumPrice} Kč
              </span>
              {shop.isUserAdded && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/40 text-indigo-200 border border-indigo-400/40">
                  Přidáno komunitou
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              {shop.name}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5 drop-shadow">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{shop.address}</span>
              {shop.distanceKm !== undefined && (
                <span className="text-blue-300 font-semibold">({formatDistance(shop.distanceKm)} od vás)</span>
              )}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 shrink-0 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Přehled & Info
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Menu & Ceny ({shop.menu.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-orange-500 text-orange-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recenze ({shop.reviews.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'info' && (
            <>
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                {shop.description}
              </p>

              {/* Status & Quick Actions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Live Status Card */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      openStatus.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Aktuální stav</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          openStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                      />
                      {openStatus.isOpen ? (
                        <span className="text-emerald-400">
                          Otevřeno {openStatus.closesAt ? `(do ${openStatus.closesAt})` : ''}
                        </span>
                      ) : (
                        <span className="text-rose-400">
                          Nyní zavřeno {openStatus.opensAt ? `(otevírá v ${openStatus.opensAt})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* External Maps Navigator Buttons */}
                <div className="flex gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-3 py-2 text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Google Mapy</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                  <a
                    href={mapyCzUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-2xl px-3 py-2 text-xs font-bold transition-all shadow-md shadow-red-600/20"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Mapy.cz</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>

              {/* Meats & Sauces available */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Dostupná masa
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {shop.meatTypes.map((m) => (
                      <span
                        key={m}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-200 border border-slate-700"
                      >
                        {MEAT_LABELS[m]}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Dostupné omáčky
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {shop.sauces.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {SAUCE_LABELS[s]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features & Tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Vlastnosti & Výhody
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {shop.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opening Hours Table */}
              <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>Otevírací doba v týdnu</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(shop.openingHours).map(([dayKey, hours]) => {
                    const isToday = dayKey === todayKey;
                    const hoursFormatted =
                      hours.close === 'nonstop'
                        ? 'Non-stop'
                        : hours.close === 'closed'
                        ? 'Zavřeno'
                        : `${hours.open} – ${hours.close}`;

                    return (
                      <div
                        key={dayKey}
                        className={`flex items-center justify-between py-1 px-2 rounded-lg ${
                          isToday
                            ? 'bg-orange-500/20 text-orange-200 font-bold border border-orange-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>}
                          <span>{DAY_NAMES[dayKey]}</span>
                        </span>
                        <span>{hoursFormatted}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phone contact if available */}
              {shop.phone && (
                <div className="flex items-center justify-between bg-slate-800/30 rounded-2xl p-3 border border-slate-800">
                  <span className="text-xs text-slate-400">Telefonická objednávka:</span>
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{shop.phone}</span>
                  </a>
                </div>
              )}
            </>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Aktuální orientační nabídka prodejny:
              </div>
              {shop.menu.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      {item.popular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Bestseller
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-amber-300 whitespace-nowrap">
                    {item.price} Kč
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Hodnocení zákazníků</div>
                  <div className="text-xs text-slate-400">{shop.reviews.length} recenzí</div>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{showReviewForm ? 'Zavřít formulář' : 'Napsat recenzi'}</span>
                </button>
              </div>

              {/* Add Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-slate-800/80 border border-orange-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                    Vaše hodnocení kebabu
                  </h4>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Vaše jméno nebo přezdívka</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="např. Honza K."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Hodnocení (hvězdy)</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Vynikající</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5) - Velmi dobré</option>
                        <option value={3}>⭐⭐⭐ (3/5) - Průměr</option>
                        <option value={2}>⭐⭐ (2/5) - Slabé</option>
                        <option value={1}>⭐ (1/5) - Zklamání</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Doporučené maso</label>
                      <select
                        value={reviewMeat}
                        onChange={(e) => setReviewMeat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Kuřecí">Kuřecí</option>
                        <option value="Hovězí/Telecí">Hovězí/Telecí</option>
                        <option value="Jehněčí">Jehněčí</option>
                        <option value="Mix">Mix maso</option>
                        <option value="Falafel">Falafel / Veggie</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Váš komentář</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Jak vám chutnalo? Jaká byla porce, maso, chléb a omáčka?"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Odeslat recenzi
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {shop.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{r.author}</span>
                        {r.recommendedMeat && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-amber-200">
                            Maso: {r.recommendedMeat}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{r.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
                    <div className="text-[10px] text-slate-500">{r.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
