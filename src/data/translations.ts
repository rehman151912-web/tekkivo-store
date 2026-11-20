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
      'Twelve general store departments across electronics, kitchen, home, beauty, fashion, baby & kids, grocery, health, toys, sports, and household essentials.',
    featuredTitle: 'Featured Products',
    featuredSubtitle:
      'Current supplier-listed electronics, home & kitchen items with transparent availability status.',
    bestSellersTitle: 'Product Catalog & Best Sellers',
    bestSellersSubtitle:
      'Search products, filter by category, and verify stock status before ordering via Cash on Delivery.',
    newArrivalsTitle: 'New Arrivals',
    newArrivalsSubtitle:
      'Recently listed appliances, lighting, and wireless audio gear available for WhatsApp stock confirmation.',
    specialOfferKicker: 'Nationwide COD Advantage',
    specialOfferTitle: 'Free Cash on Delivery Across Pakistan Above Rs. 5,000',
    specialOfferDesc:
      'Combine electronics, kitchen appliances, and everyday home essentials in one order to waive the courier delivery fee.',
    specialOfferCta: 'Browse Available Items',
    whyChooseTitle: 'Why Shop with TEKKIVO',
    whyChooseSubtitle:
      'Honest stock status, clear PKR pricing, and direct WhatsApp order confirmation before dispatch.',
    reviewsTitle: 'Customer Feedback Layout',
    reviewsSubtitle:
      'Sample review layout templates only. Verified buyer reviews will be published here once live orders are delivered.',
    newsletterTitle: 'Stay in the Loop',
    newsletterSubtitle:
      'Subscribe for Restock Alerts and updates when new products across all 12 categories go live.',
    addToCart: 'Add to Cart',
    addedToCart: 'Added',
    outOfStock: 'Out of Stock',
    codBadgeText: 'Cash on Delivery Available',
    checkoutTitle: 'Cash on Delivery Checkout',
    whatsappConfirmNote:
      'Clicking PLACE ORDER opens WhatsApp so you can send your prefilled order summary for stock verification.',
  },
  ur: {
    heroKicker: 'پاکستان بھر میں کیش آن ڈیلیوری · آن لائن جنرل اسٹور',
    heroTitle: 'Smart Choice. Better Life.',
    heroSubtitle:
      'الیکٹرانکس، کچن ٹولز، گھریلو ضروریات، بیوٹی، فیشن، بے بی کیئر، گروسری اور روزمرہ مصنوعات پاکستانی روپے میں واضح قیمتوں اور کیش آن ڈیلیوری کے ساتھ خریدیں۔',
    shopCollection: 'مصنوعات دیکھیں',
    exploreCategories: 'کیٹیگریز دیکھیں',
    heroTrustNote:
      'پاکستان بھر میں کیش آن ڈیلیوری · مقررہ حد سے زائد آرڈر پر مفت ڈیلیوری · واٹس ایپ تصدیق',
    shopByCategoryTitle: 'کیٹیگری کے مطابق خریداری',
    shopByCategorySubtitle:
      'الیکٹرانکس، کچن، گھر، بیوٹی، فیشن، بچوں کی اشیاء، گروسری، ہیلتھ، کھلونے اور اسپورٹس سمیت بارہ کیٹیگریز۔',
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
