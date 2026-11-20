import { Product } from '../types/store';

/**
 * TEKKIVO CUSTOMER-FACING HHC PRODUCT CATALOG
 * -------------------------------------------
 * Starter listings reflect the 5 exact HHC supplier items provided.
 * - No invented specifications or fake product ratings.
 * - Supplier prices and supplier product IDs are stored strictly separately
 *   in `src/data/ownerCatalogMeta.ts` and are never shown to customers.
 * - Exact HHC supplier product photos for T-Tech, P9, U39, and Pixel Buds Pro
 *   are cropped cleanly from the uploaded supplier screenshots (stored in
 *   `/public/assets/products/`), removing supplier prices and supplier IDs.
 * - Gionee Type-C Handsfree remains out of stock with no loaded product photo yet.
 */
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'hhc-3771373',
    sku: 'TKV-AUD-01',
    title: 'T-Tech Wireless Earbuds',
    titleUr: 'ٹی ٹیک وائرلیس ایئربڈز',
    category: 'Electronics & Gadgets',
    sellingPricePkr: 1499,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    availableColors: ['Black', 'White'],
    conditionNote: 'Without Box',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    shortSpec:
      'LED Digital Display · Smart Touch Control · HD Sound · Type-C Charging Case · Without Box',
    description:
      'T-Tech Wireless Earbuds featuring LED Digital Display, Smart Touch Control, HD Sound, and a Type-C Charging Case. Supplied without retail box. Available in Black and White.',
    descriptionUr:
      'ایل ای ڈی ڈیجیٹل ڈسپلے، اسمارٹ ٹچ کنٹرول، ایچ ڈی ساؤنڈ اور ٹائپ سی چارجنگ کیس کے ساتھ۔ نوٹ: بغیر باکس کے فراہم کیے جائیں گے۔ رنگ: بلیک اور وائٹ۔',
    specs: [
      { label: 'Display', value: 'LED Digital Display' },
      { label: 'Controls', value: 'Smart Touch Control' },
      { label: 'Audio', value: 'HD Sound' },
      { label: 'Charging Case', value: 'Type-C Charging Case' },
      { label: 'Packaging', value: 'Without Box' },
      { label: 'Available Colours', value: 'Black, White' },
    ],
    image: '/assets/products/t-tech-wireless-earbuds.jpg',
    imageAlt: 'T-Tech Wireless Earbuds with LED Digital Display charging case',
    isDemoData: true,
  },
  {
    id: 'hhc-3771421',
    sku: 'TKV-AUD-02',
    title: 'P9 Wireless Bluetooth Headphones',
    titleUr: 'P9 وائرلیس بلوٹوتھ ہیڈفونز',
    category: 'Electronics & Gadgets',
    sellingPricePkr: 1499,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    availableColors: ['Black', 'Blue', 'Green', 'Red', 'Silver'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: false,
    shortSpec:
      'Wireless Bluetooth Headphones · Premium ABS Plastic · Black, Blue, Green, Red & Silver',
    description:
      'P9 Wireless Bluetooth Headphones built with Premium ABS Plastic. Available in Black, Blue, Green, Red, and Silver colour options.',
    descriptionUr:
      'پریمیم ABS پلاسٹک باڈی کے ساتھ P9 وائرلیس بلوٹوتھ ہیڈفونز۔ دستیاب رنگ: بلیک، بلیو، گرین، ریڈ اور سلور۔',
    specs: [
      { label: 'Connectivity', value: 'Wireless Bluetooth' },
      { label: 'Material', value: 'Premium ABS Plastic' },
      {
        label: 'Available Colours',
        value: 'Black, Blue, Green, Red, Silver',
      },
    ],
    image: '/assets/products/p9-wireless-headphones.jpg',
    imageAlt: 'P9 Wireless Bluetooth Headphones in Black, Silver, Red, Blue and Green',
    isDemoData: true,
  },
  {
    id: 'hhc-3771681',
    sku: 'TKV-MOB-03',
    title: 'Gionee Type-C Handsfree',
    titleUr: 'جیونی ٹائپ سی ہینڈز فری',
    category: 'Mobile Accessories',
    sellingPricePkr: 799,
    stock: 0,
    stockConfirmationStatus: 'out_of_stock',
    conditionNote:
      'Supplier has reported this product as currently OUT OF STOCK. Unavailable until supplier reconfirms stock.',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isTrending: false,
    shortSpec: 'Type-C Handsfree · Currently Out of Stock (Supplier Reported)',
    description:
      'Gionee Type-C Handsfree. Currently unavailable because the supplier has reported this item out of stock. Ordering remains disabled until supplier restock is reconfirmed.',
    descriptionUr:
      'جیونی ٹائپ سی ہینڈز فری فی الحال سپلائر کے پاس دستیاب نہیں (Out of Stock)۔ اسٹاک کی تصدیق تک آرڈر بند ہے۔',
    specs: [
      { label: 'Connector', value: 'USB Type-C' },
      {
        label: 'Supplier Status',
        value: 'Currently Out of Stock — Unavailable',
      },
    ],
    image: '/assets/aistudio/photo_1794983484395_0_66f84968.jpg',
    imageAlt: 'Gionee Type-C Handsfree — white USB-C wired earphones (currently out of stock)',
    galleryImages: [
      '/assets/aistudio/photo_1794983484395_0_66f84968.jpg',
      '/assets/aistudio/photo_1794983504299_1_c4d2b05a.jpg',
      '/assets/aistudio/photo_1794983509640_2_6e910065.jpeg',
    ],
    isDemoData: true,
  },
  {
    id: 'hhc-3771747',
    sku: 'TKV-AUD-04',
    title: 'U39 True Wireless Bluetooth Earbuds',
    titleUr: 'U39 ٹرو وائرلیس بلوٹوتھ ایئربڈز',
    category: 'Electronics & Gadgets',
    sellingPricePkr: 1599,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    availableColors: ['Random'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: false,
    shortSpec:
      'Magnetic Suction Design · Bluetooth 5.3 · IPX4 · Touch Control · Type-C Charging',
    description:
      'U39 True Wireless Bluetooth Earbuds featuring Magnetic Suction Design, Bluetooth 5.3 connectivity, IPX4 rating, Touch Control, and Type-C Charging. Supplied in Random colour.',
    descriptionUr:
      'میگنیٹک سکشَن ڈیزائن، بلوٹوتھ 5.3، IPX4، ٹچ کنٹرول اور ٹائپ سی چارجنگ کے ساتھ U39 وائرلیس ایئربڈز۔ رنگ: رینڈم۔',
    specs: [
      { label: 'Design', value: 'Magnetic Suction Design' },
      { label: 'Bluetooth', value: '5.3' },
      { label: 'Water Resistance', value: 'IPX4' },
      { label: 'Controls', value: 'Touch Control' },
      { label: 'Charging', value: 'Type-C Charging' },
      { label: 'Colour', value: 'Random' },
    ],
    image: '/assets/products/u39-wireless-earbuds.jpg',
    imageAlt: 'U39 True Wireless Bluetooth Earbuds with yellow and black charging case',
    isDemoData: true,
  },
  {
    id: 'hhc-3771881',
    sku: 'TKV-AUD-05',
    title: 'Google Pixel Buds Pro Wireless Earbuds (ANC)',
    titleUr: 'گوگل پکسل بڈز پرو وائرلیس ایئربڈز (ANC)',
    category: 'Electronics & Gadgets',
    sellingPricePkr: 1799,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    conditionNote:
      'Not claimed as genuine/original Google unless verified by supplier.',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isTrending: true,
    shortSpec:
      'Active Noise Cancellation (ANC) · Unverified Brand Authenticity',
    description:
      'Wireless earbuds listed as Google Pixel Buds Pro Wireless Earbuds (ANC). Authenticity is not claimed as genuine or original Google unless explicitly verified by the supplier.',
    descriptionUr:
      'ایکٹیو نوائز کینسلیشن (ANC) کے ساتھ وائرلیس ایئربڈز۔ سپلائر کی تصدیق کے بغیر اوریجنل گوگل ہونے کا دعویٰ نہیں کیا جاتا۔',
    specs: [
      { label: 'Feature', value: 'Active Noise Cancellation (ANC)' },
      {
        label: 'Authenticity Notice',
        value: 'Not claimed genuine/original Google unless verified by supplier',
      },
    ],
    image: '/assets/aistudio/photo_1794982099344_0_bdddb3bf.webp',
    imageAlt: 'Google Pixel Buds Pro Wireless Earbuds (ANC) retail box and charging case',
    galleryImages: [
      '/assets/aistudio/photo_1794982099344_0_bdddb3bf.webp',
      '/assets/aistudio/photo_1794982129954_1_9074157e.webp',
      '/assets/aistudio/photo_1794982134753_2_42415985.webp',
      '/assets/aistudio/photo_1794982136137_3_98424478.jpg',
    ],
    isDemoData: true,
  },
  {
    id: 'hhc-3754493',
    sku: 'TKV-KIT-06',
    title:
      'RAF Electric Stove | 1000W Hot Plate | Heats in 2 Mins | Automatic & Easy to Clean',
    titleUr:
      'آر اے ایف (RAF) الیکٹرک چولہا R.8010B | 1000 واٹ ہاٹ پلیٹ',
    category: 'Kitchen Tools & Appliances',
    sellingPricePkr: 2029,
    isPublished: true,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    conditionNote:
      'Limited storefront display quantity (2 units). Supplier stock availability is subject to confirmation prior to Cash on Delivery dispatch.',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    shortSpec:
      'RAF R.8010B · 1000W Single Hot Plate · Heats in 2 Mins · Adjustable Heat Control · Uniform Heating · 0.3 kg',
    description:
      'RAF Electric Stove R.8010B is a compact 1000W single-plate electric hot plate designed for everyday cooking across Pakistan. It heats in 2 minutes with uniform heating, adjustable heat control, simple operation, an easy-to-clean surface, and a lightweight 0.3 kg build.',
    descriptionUr:
      'آر اے ایف (RAF) الیکٹرک چولہا R.8010B روزمرہ کھانا پکانے کے لیے 1000 واٹ کا سنگل ہاٹ پلیٹ اسٹوو ہے۔ 2 منٹ میں تیز اور یکساں حرارت، ایڈجسٹ ایبل ہیٹ کنٹرول، آسان استعمال اور صفائی کے ساتھ ہلکا پھلکا 0.3 کلوگرام ڈیزائن۔',
    specs: [
      { label: 'Brand', value: 'RAF' },
      { label: 'Model', value: 'R.8010B' },
      { label: 'Power', value: '1000W Electric Hot Plate' },
      { label: 'Cooking Plate', value: 'Single Cooking Plate' },
      { label: 'Heating Speed', value: 'Heats in 2 Mins · Uniform Heating' },
      { label: 'Controls', value: 'Adjustable Heat Control · Simple Operation' },
      { label: 'Maintenance', value: 'Automatic & Easy to Clean' },
      { label: 'Weight', value: '0.3 kg' },
      { label: 'Dispatch Location', value: 'Karachi, Pakistan' },
    ],
    image: '/assets/aistudio/2025_12_17_08a1977cec497809d74af5ecd055a3fb_1d3b4c47.webp',
    imageAlt:
      'RAF Electric Stove R.8010B 1000W single hot plate promotional image showing the stove and cooking plate',
    galleryImages: [
      '/assets/aistudio/2025_12_17_08a1977cec497809d74af5ecd055a3fb_1d3b4c47.webp',
      '/assets/aistudio/2025_12_17_ca7089ae0224064aa7ca968be1d26861_c64b2d46.webp',
    ],
    isDemoData: true,
  },
  {
    id: 'hhc-3765576',
    sku: 'TKV-HOM-07',
    title:
      'USB Ceiling Moon Earth Projection Atmosphere Light Starry Sky Lamp – 6 Lenses',
    titleUr:
      'یو ایس بی سیلنگ مون ارتھ پروجیکشن اسٹاری اسکائی لیمپ – 6 لینز',
    category: 'Home & Living',
    sellingPricePkr: 1010,
    isPublished: true,
    stock: 945,
    stockConfirmationStatus: 'pending_confirmation',
    conditionNote:
      'Home Decor / Smart Lighting · Stock pending supplier confirmation prior to Cash on Delivery dispatch.',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    shortSpec:
      '6 Replaceable Lenses (Moon, Earth, Mars, Jupiter, Saturn, Starry Nebula) · 360° Rotating USB Lamp · Flexible Cable · Plug & Play',
    description:
      'Transform your bedroom or living space into a soothing starry sky with the USB Ceiling Moon Earth Projection Atmosphere Light. Comes with 6 replaceable projection lenses (Moon, Earth, Mars, Jupiter, Saturn, and Starry Nebula), a 360° rotating flexible USB gooseneck cable, and soft eye-care ambient lighting—just plug and play with Cash on Delivery across Pakistan.',
    descriptionUr:
      'یو ایس بی سیلنگ مون ارتھ پروجیکشن اسٹاری اسکائی لیمپ کے ساتھ اپنے کمرے کی چھت کو خوبصورت ستاروں اور سیاروں کے منظر میں تبدیل کریں۔ 6 تبدیل ہونے والے لینز (چاند، زمین، مریخ، مشتری، زحل اور نیبولا)، 360 ڈگری گھومنے والی لچکدار یو ایس بی کیبل اور آنکھوں کے لیے نرم روشنی کے ساتھ۔',
    specs: [
      { label: 'Category Focus', value: 'Home Decor / Smart Lighting' },
      {
        label: 'Included Lenses (6)',
        value: 'Moon, Earth, Mars, Jupiter, Saturn, Starry Nebula',
      },
      {
        label: 'Projection & Angle',
        value: '360° Rotating USB Lamp · Clear Planet Projection',
      },
      {
        label: 'Cable & Setup',
        value: 'Flexible USB Cable · Plug & Play · Replaceable Film Slides',
      },
      {
        label: 'Lighting Experience',
        value: 'Soft Light Eye Care · Immersive Bedtime Atmosphere',
      },
      { label: 'Dispatch Location', value: 'Karachi, Pakistan' },
      { label: 'Payment', value: 'Cash on Delivery (Pakistan only)' },
    ],
    image:
      '/assets/aistudio/2026_09_15_8d60c5097981457c8a749953922d7f62_715bd886.jpeg',
    imageAlt:
      'USB Ceiling Moon Earth Projection Atmosphere Light Starry Sky Lamp with 6 planet scene lenses',
    galleryImages: [
      '/assets/aistudio/2026_09_15_8d60c5097981457c8a749953922d7f62_715bd886.jpeg',
      '/assets/aistudio/2026_09_15_59dbe947ae42c7de59eea8ea798bcc3f_c510a95f.jpeg',
      '/assets/aistudio/2026_09_15_a0868b37d9e893d3c6fb991dfe4829a0_6dbba4d2.jpeg',
    ],
    isDemoData: true,
  },
  {
    id: 'tkv-youngcome-60ml',
    sku: 'TKV-BTY-08',
    title: 'Youngcome Face & Body Whitening Lotion 60ml',
    titleUr: 'ینگ کم فیس اینڈ باڈی وائٹننگ لوشن 60 ملی لیٹر',
    category: 'Beauty & Personal Care',
    sellingPricePkr: 600,
    isPublished: true,
    stock: 2,
    stockConfirmationStatus: 'pending_confirmation',
    conditionNote:
      'Stock display: 2 units · Availability subject to confirmation prior to Cash on Delivery dispatch.',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: false,
    shortSpec:
      '60ml · Collagen & Milk Formula · Face & Body Moisturizing Lotion for Uneven Skin Tone & Dark Spots',
    description:
      'Face and body moisturizing lotion with collagen and milk formula, marketed for uneven skin tone and dark spots.',
    descriptionUr:
      'کولیجن اور ملک فارمولے پر مشتمل فیس اینڈ باڈی موئسچرائزنگ لوشن (60 ملی لیٹر)، جو غیر ہموار اسکن ٹون اور ڈارک اسپاٹس کے لیے تیار کیا گیا ہے۔',
    specs: [
      { label: 'Brand', value: 'YOUNGCOME' },
      { label: 'Volume', value: '60ml' },
      { label: 'Formula', value: 'Collagen & Milk' },
      { label: 'Application', value: 'Face & Body' },
      { label: 'Marketed For', value: 'Uneven Skin Tone & Dark Spots' },
      { label: 'Payment', value: 'Cash on Delivery (Pakistan)' },
    ],
    image:
      '/assets/aistudio/2026_09_21_5ba51237c3c64bfc2cec0d1d3d34f0e9_af456f38.png',
    imageAlt:
      'Youngcome Face & Body Whitening Lotion 60ml with Collagen & Milk formula',
    galleryImages: [
      '/assets/aistudio/2026_09_21_5ba51237c3c64bfc2cec0d1d3d34f0e9_af456f38.png',
      '/assets/aistudio/2026_09_21_44fa38b2d10a99c42e9cb9b62c45152a_2ab3088b.png',
    ],
    isDemoData: true,
  },
];

export const PRODUCTS: Product[] = DEFAULT_PRODUCTS;
