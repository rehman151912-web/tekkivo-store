import { ProductCategory } from '../types/store';

/**
 * TEKKIVO CENTRAL STORE SETTINGS
 * ------------------------------
 * Edit this file to update your business WhatsApp number, delivery fees,
 * and store details before deploying to Netlify.
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
  supportEmail: 'orders@tekkivo.pk',
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

export const PRODUCT_CATEGORIES: ReadonlyArray<{
  name: ProductCategory;
  nameUr: string;
  shortDesc: string;
}> = [
  {
    name: 'Kitchen Tools',
    nameUr: 'کچن ٹولز',
    shortDesc: 'Prep utensils, peelers, knives & countertop tools',
  },
  {
    name: 'Kitchen Appliances',
    nameUr: 'کچن اپلائنسز',
    shortDesc: 'Compact kettles, blenders & daily kitchen tech',
  },
  {
    name: 'Cookware & Bakeware',
    nameUr: 'کک ویئر اور بیک ویئر',
    shortDesc: 'Non-stick pans, trays & everyday cooking ware',
  },
  {
    name: 'Home Essentials',
    nameUr: 'ہوم اسینشلز',
    shortDesc: 'Storage organizers, lamps & household utilities',
  },
  {
    name: 'Electronics & Gadgets',
    nameUr: 'الیکٹرانکس اور گیجٹس',
    shortDesc: 'Smart home gear, chargers & everyday tech',
  },
  {
    name: 'Mobile Accessories',
    nameUr: 'موبائل اسیسریز',
    shortDesc: 'Cables, Type-C handsfree, stands & power gear',
  },
  {
    name: 'Audio & Headphones',
    nameUr: 'آڈیو اور ہیڈفونز',
    shortDesc: 'Wireless earbuds, ANC audio & Bluetooth headphones',
  },
];

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
