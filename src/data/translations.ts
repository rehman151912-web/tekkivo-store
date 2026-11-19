import { LanguageMode } from '../types/store';

export interface StoreCopy {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  shopCollection: string;
  exploreCategories: string;
  heroTrustNote: string;
  shopByCategoryTitle: string;
  shopByCategorySubtitle: string;
  featuredTitle: string;
  featuredSubtitle: string;
  bestSellersTitle: string;
  bestSellersSubtitle: string;
  newArrivalsTitle: string;
  newArrivalsSubtitle: string;
  specialOfferKicker: string;
  specialOfferTitle: string;
  specialOfferDesc: string;
  specialOfferCta: string;
  whyChooseTitle: string;
  whyChooseSubtitle: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  addToCart: string;
  addedToCart: string;
  outOfStock: string;
  codBadgeText: string;
  checkoutTitle: string;
  whatsappConfirmNote: string;
}

export const COPY: Record<LanguageMode, StoreCopy> = {
  en: {
    heroKicker: 'Pakistan Nationwide Cash on Delivery · Kitchen, Home & Electronics',
    heroTitle: 'Smart Choice. Better Life.',
    heroSubtitle:
      'Shop practical Kitchen Tools, Home Essentials, Electronics, Mobile Accessories, and Wireless Audio priced transparently in PKR—with Cash on Delivery across Pakistan and direct WhatsApp order confirmation.',
    shopCollection: 'Shop Products',
    exploreCategories: 'Browse Categories',
    heroTrustNote:
      'Cash on Delivery across Pakistan · Free delivery on Rs. 5,000+ · WhatsApp order confirmation',
    shopByCategoryTitle: 'Shop by Category',
    shopByCategorySubtitle:
      'Seven dedicated departments across kitchen, home essentials, mobile accessories, and wireless audio.',
    featuredTitle: 'Featured Products',
    featuredSubtitle:
      'Current supplier-listed audio and mobile items with transparent availability status.',
    bestSellersTitle: 'Product Catalog & Best Sellers',
    bestSellersSubtitle:
      'Search products, filter by category, and verify stock status before ordering via Cash on Delivery.',
    newArrivalsTitle: 'New Arrivals',
    newArrivalsSubtitle:
      'Recently listed wireless earbuds and audio accessories available for WhatsApp stock confirmation.',
    specialOfferKicker: 'Nationwide COD Advantage',
    specialOfferTitle: 'Free Cash on Delivery Across Pakistan Above Rs. 5,000',
    specialOfferDesc:
      'Combine electronics, audio gear, and everyday home essentials in one order to waive the Rs. 250 standard courier delivery fee.',
    specialOfferCta: 'Browse Available Items',
    whyChooseTitle: 'Why Shop with TEKKIVO',
    whyChooseSubtitle:
      'Honest stock status, clear PKR pricing, and direct WhatsApp order confirmation before dispatch.',
    reviewsTitle: 'Customer Feedback Layout',
    reviewsSubtitle:
      'Sample review layout templates only. Verified buyer reviews will be published here once live orders are delivered.',
    newsletterTitle: 'Restock & New Category Alerts',
    newsletterSubtitle:
      'Get notified when Kitchen Tools, Home Essentials, and new HHC listings go live.',
    addToCart: 'Add to Cart',
    addedToCart: 'Added',
    outOfStock: 'Out of Stock',
    codBadgeText: 'Cash on Delivery Available',
    checkoutTitle: 'Cash on Delivery Checkout',
    whatsappConfirmNote:
      'Clicking PLACE ORDER opens WhatsApp so you can send your prefilled order summary for stock verification.',
  },
  ur: {
    heroKicker: 'پاکستان بھر میں کیش آن ڈیلیوری · کچن، ہوم اور الیکٹرانکس',
    heroTitle: 'Smart Choice. Better Life.',
    heroSubtitle:
      'کچن ٹولز، گھریلو ضروریات، الیکٹرانکس، موبائل اسیسریز اور آڈیو گیجٹس پاکستانی روپے میں واضح قیمتوں اور کیش آن ڈیلیوری سہولت کے ساتھ خریدیں۔',
    shopCollection: 'مصنوعات دیکھیں',
    exploreCategories: 'کیٹیگریز دیکھیں',
    heroTrustNote:
      'پاکستان بھر میں کیش آن ڈیلیوری · 5,000 روپے سے زائد پر مفت ڈیلیوری · واٹس ایپ تصدیق',
    shopByCategoryTitle: 'کیٹیگری کے مطابق خریداری',
    shopByCategorySubtitle:
      'کچن، گھر، موبائل اسیسریز اور وائرلیس آڈیو کے لیے سات منتخب کیٹیگریز۔',
    featuredTitle: 'نمایاں مصنوعات',
    featuredSubtitle:
      'واضح دستیابی اور قیمتوں کے ساتھ منتخب آڈیو اور موبائل مصنوعات۔',
    bestSellersTitle: 'مکمل کیٹلاگ اور مقبول مصنوعات',
    bestSellersSubtitle:
      'مصنوعات تلاش کریں، کیٹیگری منتخب کریں اور کیش آن ڈیلیوری آرڈر کریں۔',
    newArrivalsTitle: 'نئی آمد (New Arrivals)',
    newArrivalsSubtitle:
      'نئے شامل کیے گئے وائرلیس ایئربڈز اور آڈیو مصنوعات۔',
    specialOfferKicker: 'ڈیلیوری سہولت',
    specialOfferTitle: '5,000 روپے سے زائد آرڈر پر پورے پاکستان میں مفت ڈیلیوری',
    specialOfferDesc:
      'ایک ساتھ مختلف مصنوعات آرڈر کریں اور 250 روپے ڈیلیوری چارجز کی بچت کریں۔',
    specialOfferCta: 'دستیاب مصنوعات دیکھیں',
    whyChooseTitle: 'TEKKIVO کا انتخاب کیوں کریں',
    whyChooseSubtitle:
      'دیانتدار اسٹاک معلومات، واضح PKR قیمتیں اور روانگی سے قبل واٹس ایپ تصدیق۔',
    reviewsTitle: 'کسٹمر ریویوز کا نمونہ',
    reviewsSubtitle:
      'یہ صرف ڈیزائن کا نمونہ ہے۔ اصل آرڈرز کی ترسیل کے بعد یہاں حقیقی صارفین کی آراء شامل کی جائیں گی۔',
    newsletterTitle: 'نئے اسٹاک کی اطلاع حاصل کریں',
    newsletterSubtitle:
      'نئی مصنوعات اور کچن و الیکٹرانکس اسٹاک کی اطلاع کے لیے ای میل درج کریں۔',
    addToCart: 'کارٹ میں شامل کریں',
    addedToCart: 'شامل ہو گیا',
    outOfStock: 'اسٹاک ختم',
    codBadgeText: 'کیش آن ڈیلیوری دستیاب ہے',
    checkoutTitle: 'کیش آن ڈیلیوری آرڈر فارم',
    whatsappConfirmNote:
      'PLACE ORDER پر کلک کرنے سے واٹس ایپ کھل جائے گا تاکہ آپ اپنا آرڈر بھیج سکیں۔',
  },
};
