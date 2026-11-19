import { STORE_CONFIG } from '../config/store';
import { CartItem, Product } from '../types/store';
import { calculateShippingFee } from './currency';

export interface DetailedCartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  lineTotalPkr: number;
}

export interface CartSummary {
  detailedItems: DetailedCartItem[];
  totalItemCount: number;
  subtotalPkr: number;
  shippingFeePkr: number;
  totalPkr: number;
  remainingForFreeDeliveryPkr: number;
  freeProgressPct: number;
}

export function isProductPublished(product: Product): boolean {
  return product.isPublished !== false && product.sellingPricePkr > 0;
}

export function isProductOrderable(product: Product): boolean {
  return (
    isProductPublished(product) &&
    product.stockConfirmationStatus !== 'out_of_stock' &&
    product.stock > 0
  );
}

export function addCartItem(
  items: CartItem[],
  products: Product[],
  productId: string,
  quantityToAdd = 1,
  selectedColor?: string
): CartItem[] {
  if (quantityToAdd <= 0) return items;
  const product = products.find((p) => p.id === productId);
  if (!product || !isProductOrderable(product)) return items;

  const resolvedColor =
    selectedColor ||
    (product.availableColors && product.availableColors.length > 0
      ? product.availableColors[0]
      : undefined);

  const existing = items.find(
    (item) =>
      item.productId === productId &&
      (item.selectedColor || undefined) === (resolvedColor || undefined)
  );

  if (existing) {
    const nextQty = Math.min(product.stock, existing.quantity + quantityToAdd);
    return items.map((item) =>
      item.productId === productId &&
      (item.selectedColor || undefined) === (resolvedColor || undefined)
        ? { ...item, quantity: nextQty }
        : item
    );
  }

  return [
    ...items,
    {
      productId,
      quantity: Math.min(product.stock, quantityToAdd),
      selectedColor: resolvedColor,
    },
  ];
}

export function updateCartItemQuantity(
  items: CartItem[],
  products: Product[],
  productId: string,
  nextQty: number,
  selectedColor?: string
): CartItem[] {
  if (nextQty <= 0) {
    return removeCartItem(items, productId, selectedColor);
  }
  const product = products.find((p) => p.id === productId);
  if (!product || !isProductOrderable(product)) {
    return removeCartItem(items, productId, selectedColor);
  }

  const clampedQty = Math.min(product.stock, nextQty);
  return items.map((item) => {
    const colorMatches =
      selectedColor === undefined ||
      (item.selectedColor || undefined) === (selectedColor || undefined);
    return item.productId === productId && colorMatches
      ? { ...item, quantity: clampedQty }
      : item;
  });
}

export function removeCartItem(
  items: CartItem[],
  productId: string,
  selectedColor?: string
): CartItem[] {
  return items.filter((item) => {
    if (item.productId !== productId) return true;
    if (selectedColor === undefined) return false;
    return (item.selectedColor || undefined) !== (selectedColor || undefined);
  });
}

export function buildCartSummary(
  items: CartItem[],
  products: Product[]
): CartSummary {
  const detailedItems = items
    .map((ci): DetailedCartItem | null => {
      const product = products.find((p) => p.id === ci.productId);
      if (!product || ci.quantity <= 0 || !isProductOrderable(product)) {
        return null;
      }
      const safeQty = Math.min(product.stock, ci.quantity);
      if (safeQty <= 0) return null;
      return {
        product,
        quantity: safeQty,
        selectedColor: ci.selectedColor,
        lineTotalPkr: product.sellingPricePkr * safeQty,
      };
    })
    .filter((entry): entry is DetailedCartItem => entry !== null);

  const totalItemCount = detailedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const subtotalPkr = detailedItems.reduce(
    (sum, item) => sum + item.lineTotalPkr,
    0
  );
  const shippingFeePkr = calculateShippingFee(subtotalPkr);
  const totalPkr = subtotalPkr + shippingFeePkr;
  const remainingForFreeDeliveryPkr = Math.max(
    0,
    STORE_CONFIG.freeDeliveryThresholdPkr - subtotalPkr
  );
  const freeProgressPct = Math.min(
    100,
    Math.round((subtotalPkr / STORE_CONFIG.freeDeliveryThresholdPkr) * 100)
  );

  return {
    detailedItems,
    totalItemCount,
    subtotalPkr,
    shippingFeePkr,
    totalPkr,
    remainingForFreeDeliveryPkr,
    freeProgressPct,
  };
}
