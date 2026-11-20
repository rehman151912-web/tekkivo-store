import { CategoryDefinition, StoreSettings } from '../types/store';

/**
 * TEKKIVO CENTRAL STORE SETTINGS
 * ------------------------------
 * Edit this file to update your business WhatsApp number, default delivery fees,
 * and store details. Delivery fees and categories can also be configured live
 * by the store administrator inside the Admin Dashboard (#owner).
 */
export const STORE_CONFIG = {
  brandName: 'TEKKIVO',
  tagline: 'Smart Choice. Better Life.',
  taglineUr: 'بہتر انتخاب، بہتر زندگی۔',
  /**
   * Store Owner WhatsApp number for Cash on Delivery order handoff.
   * Format: Country code + mobile number without '+' or spaces.
   */
  ownerWhatsAppNumber: '923462796879',
  supportEmail: 'tekkivo.store@gmail.com',
  operatingHours: 'Mon – Sat · 10:00 AM – 8:00 PM PKT',
  currencyCode: 'PKR',
  currencyPrefix: 'Rs.',
  freeDeliveryThresholdPkr: 5000,
  standardDeliveryFeePkr: 250,
  estimatedDeliveryWindow: '3–5 Business Days across Pakistan',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
  },
} as const;

/** Convenience named export for the editable store owner WhatsApp number */
export const OWNER_WHATSAPP_NUMBER = STORE_CONFIG.ownerWhatsAppNumber;

export const PRODUCT_CATEGORIES: ReadonlyArray<CategoryDefinition> = [
  {
    name: 'Electronics & Gadgets',
    shortLabel: 'Electronics',
    nameUr: 'الیکٹرانکس اور گیجٹس',
    shortDesc: 'Wireless audio, smart lamps, gadgets & daily tech',
  },
  {
    name: 'Kitchen Tools & Appliances',
    shortLabel: 'Kitchen',
    nameUr: 'کچن ٹولز اور اپلائنسز',
    shortDesc: 'Electric hot plates, prep utensils & kitchen appliances',
  },
  {
    name: 'Home & Living',
    shortLabel: 'Home',
    nameUr: 'ہوم اور لیونگ',
    shortDesc: 'Ambient lamps, room decor & everyday home organizers',
  },
  {
    name: 'Beauty & Personal Care',
    shortLabel: 'Beauty',
    nameUr: 'بیوٹی اور پرسنل کیئر',
    shortDesc: 'Skincare essentials, grooming tools & daily beauty care',
  },
  {
    name: 'Fashion & Accessories',
    shortLabel: 'Fashion',
    nameUr: 'فیشن اور اسیسریز',
    shortDesc: 'Watches, bags, sunglasses & everyday style accessories',
  },
  {
    name: 'Baby & Kids',
    shortLabel: 'Baby & Kids',
    nameUr: 'بے بی اور کڈز',
    shortDesc: 'Safe baby care utilities, feeding gear & kids essentials',
  },
  {
    name: 'Mobile Accessories',
    shortLabel: 'Mobile Accessories',
    nameUr: 'موبائل اسیسریز',
    shortDesc: 'Type-C handsfree, cables, stands & charging gear',
  },
  {
    name: 'Grocery & Food Items',
    shortLabel: 'Grocery',
    nameUr: 'گروسری اور فوڈ آئٹمز',
    shortDesc: 'Pantry staples, packaged snacks & dry food essentials',
  },
  {
    name: 'Health & Personal Care',
    shortLabel: 'Health',
    nameUr: 'ہیلتھ اور پرسنل کیئر',
    shortDesc: 'Wellness monitors, personal hygiene & everyday health',
  },
  {
    name: 'Toys & Games',
    shortLabel: 'Toys & Games',
    nameUr: 'کھلونے اور گیمز',
    shortDesc: 'Learning toys, family board games & creative play sets',
  },
  {
    name: 'Sports & Outdoor',
    shortLabel: 'Sports',
    nameUr: 'اسپورٹس اور آؤٹ ڈور',
    shortDesc: 'Fitness gear, water bottles & outdoor travel equipment',
  },
  {
    name: 'Cleaning & Household Essentials',
    shortLabel: 'Cleaning',
    nameUr: 'صفائی اور گھریلو ضروریات',
    shortDesc: 'Cleaning brushes, laundry tools & household upkeep items',
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  standardDeliveryFeePkr: STORE_CONFIG.standardDeliveryFeePkr,
  freeDeliveryThresholdPkr: STORE_CONFIG.freeDeliveryThresholdPkr,
  estimatedDeliveryWindow: STORE_CONFIG.estimatedDeliveryWindow,
  categories: PRODUCT_CATEGORIES.map((c) => ({ ...c })),
};

export const PAKISTAN_CITIES: ReadonlyArray<string> = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Other City',
];
