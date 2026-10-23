import React, { useState } from 'react';
import { X, PlusCircle, MapPin, Navigation, Sparkles } from 'lucide-react';
import { KebabShop, MeatType, SauceType } from '../types/kebab';
import { CZECH_CITIES } from '../utils/geo';

interface AddKebabModalProps {
  onClose: () => void;
  onAddShop: (shop: KebabShop) => void;
  userLocation: { lat: number; lng: number } | null;
}

export const AddKebabModal: React.FC<AddKebabModalProps> = ({
  onClose,
  onAddShop,
  userLocation,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Praha');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<string>(userLocation ? userLocation.lat.toString() : '50.0755');
  const [lng, setLng] = useState<string>(userLocation ? userLocation.lng.toString() : '14.4378');
  const [durumPrice, setDurumPrice] = useState('145');
  const [meatTypes, setMeatTypes] = useState<MeatType[]>(['chicken', 'beef', 'mix']);
  const [tags, setTags] = useState<string[]>(['Karty berou', 'Vlastní chléb']);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('02:00');
  const [description, setDescription] = useState('');

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const found = CZECH_CITIES.find((c) => c.name === cityName);
    if (found && !userLocation) {
      setLat(found.lat.toString());
      setLng(found.lng.toString());
    }
  };

  const useCurrentGps = () => {
    if (userLocation) {
      setLat(userLocation.lat.toFixed(5));
      setLng(userLocation.lng.toFixed(5));
    }
  };

  const toggleMeat = (meat: MeatType) => {
    if (meatTypes.includes(meat)) {
      setMeatTypes(meatTypes.filter((m) => m !== meat));
    } else {
      setMeatTypes([...meatTypes, meat]);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const parsedLat = parseFloat(lat) || 50.0755;
    const parsedLng = parseFloat(lng) || 14.4378;
    const parsedPrice = parseInt(durumPrice, 10) || 140;

    const newShop: KebabShop = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      city,
      region: `${city}-centrum`,
      address: address.trim(),
      lat: parsedLat,
      lng: parsedLng,
      rating: 4.8,
      reviewCount: 1,
      priceLevel: parsedPrice < 140 ? 1 : parsedPrice <= 170 ? 2 : 3,
      standardDurumPrice: parsedPrice,
      meatTypes: meatTypes.length > 0 ? meatTypes : ['chicken', 'beef'],
      sauces: ['garlic', 'herb', 'spicy'] as SauceType[],
      tags: tags.length > 0 ? tags : ['Karty berou'],
      isShawarma: tags.includes('Shawarma'),
      category: tags.includes('Shawarma') ? 'shawarma' : 'kebab',
      openingHours: {
        monday: { open: openTime, close: closeTime },
        tuesday: { open: openTime, close: closeTime },
        wednesday: { open: openTime, close: closeTime },
        thursday: { open: openTime, close: closeTime },
        friday: { open: openTime, close: closeTime },
        saturday: { open: openTime, close: closeTime },
        sunday: { open: openTime, close: closeTime },
      },
      imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
      verified: false,
      isUserAdded: true,
      description: description.trim() || `Nová ověřená kebabárna v ${city} s poctivou porcí.`,
      menu: [
        { name: 'Klasik Dürüm Tortilla', price: parsedPrice, popular: true },
        { name: 'Kebab v rozpečeném chlebu', price: parsedPrice - 5 },
        { name: 'Kebab Talíř s hranolky', price: parsedPrice + 35 },
      ],
      reviews: [
        {
          id: `rev-${Date.now()}`,
          author: 'Původní objevitel',
          rating: 5,
          date: 'právě teď',
          comment: 'Přidáno do komunitní mapy Kebab Finder. Super místo!',
          recommendedMeat: 'Mix',
        },
      ],
    };

    onAddShop(newShop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Přidat nový kebab do mapy</h3>
              <p className="text-xs text-slate-400">Znáš skvělou kebabárnu, která tu chybí?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Název podniku *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Sultan Kebab Hlavák"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Město</label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                {CZECH_CITIES.filter((c) => c.name !== 'Všechny').map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Adresa / Ulice *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="např. Masarykova 14"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Souřadnice (GPS)</label>
              {userLocation && (
                <button
                  type="button"
                  onClick={useCurrentGps}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Použít mou polohu</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Zeměpisná šířka (lat)"
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-[11px]"
              />
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Zeměpisná délka (lng)"
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Price of Tortilla */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Cena běžné tortilly / dürümu (Kč)
            </label>
            <input
              type="number"
              min="80"
              max="350"
              value={durumPrice}
              onChange={(e) => setDurumPrice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Opening Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Otevírá v</label>
              <input
                type="text"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                placeholder="10:00 nebo 00:00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Zavírá v</label>
              <input
                type="text"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                placeholder="02:00 nebo nonstop"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Meat types */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Druhy masa v nabídce</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'chicken' as MeatType, label: '🍗 Kuřecí' },
                { id: 'beef' as MeatType, label: '🥩 Hovězí/Telecí' },
                { id: 'lamb' as MeatType, label: '🐑 Jehněčí' },
                { id: 'mix' as MeatType, label: '🔥 Mix' },
                { id: 'veggie' as MeatType, label: '🧆 Falafel' },
              ].map((m) => {
                const selected = meatTypes.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMeat(m.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      selected
                        ? 'bg-orange-500/20 border-orange-500 text-orange-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Vlastnosti podniku</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Shawarma',
                'Karty berou',
                'Noční provoz',
                'Vlastní chléb',
                'Yaprak maso',
                'Studentská sleva',
                'Příjemné sezení',
                'Non-stop',
              ].map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      selected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Krátký popis / speciality
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Čím je tento kebab výjimečný? (např. obří porce, super česnekovka)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold shadow-lg shadow-orange-600/30 transition-all cursor-pointer text-sm"
            >
              Uložit a přidat na mapu 🌯
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
