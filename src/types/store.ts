export type DefaultProductCategory =
  | 'Electronics & Gadgets'
  | 'Kitchen Tools & Appliances'
  | 'Home & Living'
  | 'Beauty & Personal Care'
  | 'Fashion & Accessories'
  | 'Baby & Kids'
  | 'Mobile Accessories'
  | 'Grocery & Food Items'
  | 'Health & Personal Care'
  | 'Toys & Games'
  | 'Sports & Outdoor'
  | 'Cleaning & Household Essentials';

export type ProductCategory = string;

export interface CategoryDefinition {
  name: ProductCategory;
  shortLabel?: string;
  nameUr: string;
  shortDesc: string;
}

export interface StoreSettings {
  standardDeliveryFeePkr: number;
  freeDeliveryThresholdPkr: number;
  estimatedDeliveryWindow: string;
  categories: CategoryDefinition[];
}

export type LanguageMode = 'en' | 'ur';

export type StockConfirmationStatus =
  | 'confirmed'
  | 'pending_confirmation'
  | 'out_of_stock';

export type OrderStatus =
  | 'pending'
  | 'submitted'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ProductSpec {
  label: string;
  value: string;
}

/**
 * Customer-facing product catalog model.
 * Supplier prices and supplier product IDs are kept strictly separate
 * in src/data/ownerCatalogMeta.ts (and /owner_catalog_meta in Firestore)
 * and never exposed to customers.
 */
export interface Product {
  id: string;
  sku: string;
  title: string;
  titleUr: string;
  category: ProductCategory;
  sellingPricePkr: number;
  compareAtPricePkr?: number;
  stock: number;
  stockConfirmationStatus: StockConfirmationStatus;
  availableColors?: string[];
  conditionNote?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  shortSpec: string;
  description: string;
  descriptionUr: string;
  specs: ProductSpec[];
  image: string;
  imageAlt: string;
  galleryImages?: string[];
  isPublished?: boolean;
  isDemoData?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedColor?: string;
}

export interface CustomerOrderDetails {
  fullName: string;
  phone: string;
  city: string;
  customCity?: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD';
}

export interface OrderLineItem {
  productId: string;
  sku: string;
  title: string;
  selectedColor?: string;
  quantity: number;
  unitPricePkr: number;
  lineTotalPkr: number;
}

export interface OrderReceipt {
  orderRef: string;
  createdAt: string;
  status: OrderStatus;
  hhcFulfillmentRef: string;
  ownerNotes?: string;
  customer: CustomerOrderDetails;
  items: OrderLineItem[];
  subtotalPkr: number;
  shippingFeePkr: number;
  totalPkr: number;
  whatsappMessage: string;
}
