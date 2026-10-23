export type MeatType = 'chicken' | 'beef' | 'lamb' | 'mix' | 'veggie';

export type SauceType =
  | 'garlic'
  | 'herb'
  | 'spicy'
  | 'extra_spicy'
  | 'samurai'
  | 'tzatziki'
  | 'curry'
  | 'toum'
  | 'tahini';

export type DishCategory = 'kebab' | 'shawarma' | 'both';

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  recommendedMeat?: string;
}

export interface MenuItem {
  name: string;
  price: number; // in CZK
  description?: string;
  popular?: boolean;
}

export interface DayHours {
  open: string; // "10:00"
  close: string; // "02:00" or "nonstop" or "closed"
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface KebabShop {
  id: string;
  name: string;
  city: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  rating: number; // 1.0 - 5.0
  reviewCount: number;
  priceLevel: 1 | 2 | 3; // 1: <140 Kč, 2: 140-170 Kč, 3: >170 Kč
  standardDurumPrice: number; // standard Tortilla / Shawarma price in CZK
  meatTypes: MeatType[];
  sauces: SauceType[];
  tags: string[]; // "Vlastní chléb", "Yaprak maso", "Noční provoz", "Karty berou", "Studentská sleva", "Rozvoz", "Sezení", "Shawarma", "Syrská", "Libanonská"
  openingHours: OpeningHours;
  phone?: string;
  imageUrl: string;
  verified: boolean;
  isUserAdded?: boolean;
  category?: DishCategory;
  isShawarma?: boolean;
  reviews: Review[];
  menu: MenuItem[];
  description: string;
  distanceKm?: number;
}

export interface FilterState {
  searchQuery: string;
  city: string;
  meatTypes: MeatType[];
  onlyOpenNow: boolean;
  onlyLateNight: boolean;
  onlyYaprakOrHandmadeBread: boolean;
  onlyShawarma: boolean;
  cardsAcceptedOnly: boolean;
  minRating: number;
  maxPrice: number;
  sortBy: 'rating' | 'distance' | 'price' | 'reviews';
  favoritesOnly: boolean;
}
