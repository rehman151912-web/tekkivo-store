import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_STORE_SETTINGS } from '../config/store';
import {
  DEFAULT_OWNER_CATALOG_META,
  OwnerProductCostMeta,
} from '../data/ownerCatalogMeta';
import { DEFAULT_PRODUCTS } from '../data/products';
import { auth, db } from '../firebase';
import {
  OrderReceipt,
  OrderStatus,
  Product,
  StoreSettings,
} from '../types/store';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function toSafeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `item_${Date.now()}`;
}

function sanitizeProductPayload(product: Product, isNew: boolean) {
  const safeId = toSafeId(product.id);
  const payload: Record<string, unknown> = {
    id: safeId,
    sku: String(product.sku || '').slice(0, 64),
    title: String(product.title || '').slice(0, 200),
    titleUr: String(product.titleUr || product.title || '').slice(0, 300),
    category: String(product.category || '').slice(0, 80),
    sellingPricePkr: Math.max(0, Number(product.sellingPricePkr) || 0),
    stock: Math.max(0, Math.round(Number(product.stock) || 0)),
    stockConfirmationStatus: product.stockConfirmationStatus,
    isFeatured: Boolean(product.isFeatured),
    isBestSeller: Boolean(product.isBestSeller),
    isNewArrival: Boolean(product.isNewArrival),
    isTrending: Boolean(product.isTrending),
    shortSpec: String(product.shortSpec || '').slice(0, 400),
    description: String(product.description || '').slice(0, 4000),
    descriptionUr: String(
      product.descriptionUr || product.description || ''
    ).slice(0, 4000),
    specs: (product.specs || []).slice(0, 25).map((s) => ({
      label: String(s.label || '').slice(0, 80),
      value: String(s.value || '').slice(0, 240),
    })),
    image: String(product.image || '').slice(0, 150000),
    imageAlt: String(product.imageAlt || product.title || '').slice(0, 300),
    isPublished: product.isPublished !== false,
    isDemoData: Boolean(product.isDemoData),
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  }

  if (
    typeof product.compareAtPricePkr === 'number' &&
    product.compareAtPricePkr > 0
  ) {
    payload.compareAtPricePkr = product.compareAtPricePkr;
  }
  if (product.availableColors && product.availableColors.length > 0) {
    payload.availableColors = product.availableColors
      .slice(0, 15)
      .map((c) => String(c).slice(0, 60));
  }
  if (product.conditionNote && product.conditionNote.trim()) {
    payload.conditionNote = product.conditionNote.trim().slice(0, 400);
  }
  if (product.galleryImages && product.galleryImages.length > 0) {
    payload.galleryImages = product.galleryImages
      .slice(0, 8)
      .map((g) => String(g).slice(0, 150000));
  }

  return { safeId, payload };
}

function sanitizeOwnerMetaPayload(meta: OwnerProductCostMeta) {
  const safeId = toSafeId(meta.productId);
  const payload: Record<string, unknown> = {
    productId: safeId,
    supplierProductId: String(meta.supplierProductId || 'MANUAL').slice(0, 128),
    supplierCostPkr: Math.max(0, Number(meta.supplierCostPkr) || 0),
    listedStock: Math.max(0, Math.round(Number(meta.listedStock) || 0)),
    updatedAt: serverTimestamp(),
  };

  if (meta.supplierName && meta.supplierName.trim()) {
    payload.supplierName = meta.supplierName.trim().slice(0, 120);
  }
  if (meta.dispatchLocation && meta.dispatchLocation.trim()) {
    payload.dispatchLocation = meta.dispatchLocation.trim().slice(0, 120);
  }
  if (meta.inspectionStatus && meta.inspectionStatus.trim()) {
    payload.inspectionStatus = meta.inspectionStatus.trim().slice(0, 120);
  }

  return { safeId, payload };
}

function normalizeTimestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val) return val;
  return new Date().toISOString();
}

export function subscribeToPublicProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'products';
  const q = query(
    collection(db, path),
    where('isPublished', '==', true)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data() as Product;
        return {
          ...data,
          id: d.id,
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToAllProductsAdmin(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const items: Product[] = snap.docs.map((d) => ({
        ...(d.data() as Product),
        id: d.id,
      }));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToStoreSettings(
  onData: (settings: StoreSettings) => void,
  onError?: (err: unknown) => void
) {
  const path = 'store_settings/main';
  return onSnapshot(
    doc(db, 'store_settings', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_STORE_SETTINGS);
        return;
      }
      const data = snap.data() as Partial<StoreSettings>;
      onData({
        standardDeliveryFeePkr:
          typeof data.standardDeliveryFeePkr === 'number'
            ? data.standardDeliveryFeePkr
            : DEFAULT_STORE_SETTINGS.standardDeliveryFeePkr,
        freeDeliveryThresholdPkr:
          typeof data.freeDeliveryThresholdPkr === 'number'
            ? data.freeDeliveryThresholdPkr
            : DEFAULT_STORE_SETTINGS.freeDeliveryThresholdPkr,
        estimatedDeliveryWindow:
          data.estimatedDeliveryWindow ||
          DEFAULT_STORE_SETTINGS.estimatedDeliveryWindow,
        categories:
          Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
            : DEFAULT_STORE_SETTINGS.categories,
      });
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToOwnerMetaAdmin(
  onData: (metaMap: Record<string, OwnerProductCostMeta>) => void,
  onError?: (err: unknown) => void
) {
  const path = 'owner_catalog_meta';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const next: Record<string, OwnerProductCostMeta> = {};
      snap.docs.forEach((d) => {
        next[d.id] = {
          ...(d.data() as OwnerProductCostMeta),
          productId: d.id,
        };
      });
      onData(next);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToOrdersAdmin(
  onData: (orders: OrderReceipt[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'orders';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: OrderReceipt[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          orderRef: String(data.orderRef || d.id),
          createdAt: normalizeTimestampToIso(data.createdAt),
          status: (data.status || 'pending') as OrderStatus,
          hhcFulfillmentRef: String(data.hhcFulfillmentRef || ''),
          ownerNotes: data.ownerNotes ? String(data.ownerNotes) : undefined,
          customer: data.customer,
          items: data.items || [],
          subtotalPkr: Number(data.subtotalPkr || 0),
          shippingFeePkr: Number(data.shippingFeePkr || 0),
          totalPkr: Number(data.totalPkr || 0),
          whatsappMessage: String(data.whatsappMessage || ''),
        };
      });
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveOrderToFirestore(receipt: OrderReceipt): Promise<void> {
  const safeOrderRef = toSafeId(receipt.orderRef);
  const path = `orders/${safeOrderRef}`;

  const customerPayload: Record<string, string> = {
    fullName: receipt.customer.fullName.trim().slice(0, 120),
    phone: receipt.customer.phone.trim().slice(0, 32),
    city: receipt.customer.city.trim().slice(0, 80),
    address: receipt.customer.address.trim().slice(0, 500),
    paymentMethod: 'COD',
  };

  if (receipt.customer.customCity && receipt.customer.customCity.trim()) {
    customerPayload.customCity = receipt.customer.customCity
      .trim()
      .slice(0, 80);
  }
  if (receipt.customer.notes && receipt.customer.notes.trim()) {
    customerPayload.notes = receipt.customer.notes.trim().slice(0, 500);
  }

  const sanitizedItems = receipt.items.slice(0, 50).map((item) => {
    const cleanItem: Record<string, unknown> = {
      productId: String(item.productId).slice(0, 128),
      sku: String(item.sku).slice(0, 64),
      title: String(item.title).slice(0, 200),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      unitPricePkr: Math.max(0, Number(item.unitPricePkr) || 0),
      lineTotalPkr: Math.max(0, Number(item.lineTotalPkr) || 0),
    };
    if (item.selectedColor) {
      cleanItem.selectedColor = String(item.selectedColor).slice(0, 60);
    }
    return cleanItem;
  });

  try {
    await setDoc(doc(db, 'orders', safeOrderRef), {
      orderRef: safeOrderRef,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      hhcFulfillmentRef: '',
      customer: customerPayload,
      items: sanitizedItems,
      subtotalPkr: Math.max(1, Number(receipt.subtotalPkr) || 0),
      shippingFeePkr: Math.max(0, Number(receipt.shippingFeePkr) || 0),
      totalPkr: Math.max(1, Number(receipt.totalPkr) || 0),
      whatsappMessage: String(receipt.whatsappMessage || '').slice(0, 8000),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderInFirestore(
  orderRef: string,
  patch: Partial<Pick<OrderReceipt, 'status' | 'hhcFulfillmentRef' | 'ownerNotes'>>
): Promise<void> {
  const safeRef = toSafeId(orderRef);
  const path = `orders/${safeRef}`;
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.status !== undefined) {
    updateData.status = patch.status;
  }
  if (patch.hhcFulfillmentRef !== undefined) {
    updateData.hhcFulfillmentRef = patch.hhcFulfillmentRef.slice(0, 120);
  }
  if (patch.ownerNotes !== undefined) {
    updateData.ownerNotes = patch.ownerNotes.slice(0, 1000);
  }

  try {
    await updateDoc(doc(db, 'orders', safeRef), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(orderRef: string): Promise<void> {
  const safeRef = toSafeId(orderRef);
  const path = `orders/${safeRef}`;
  try {
    await deleteDoc(doc(db, 'orders', safeRef));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProductToFirestore(
  product: Product,
  supplierMeta?: OwnerProductCostMeta
): Promise<void> {
  const { safeId, payload } = sanitizeProductPayload(product, true);
  const path = `products/${safeId}`;
  try {
    const existingSnap = await getDoc(doc(db, 'products', safeId));
    if (existingSnap.exists()) {
      const { payload: updatePayload } = sanitizeProductPayload(product, false);
      delete updatePayload.id;
      await updateDoc(doc(db, 'products', safeId), updatePayload);
    } else {
      await setDoc(doc(db, 'products', safeId), payload);
    }

    if (supplierMeta) {
      await saveOwnerMetaToFirestore({ ...supplierMeta, productId: safeId });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProductInFirestore(
  productId: string,
  mergedProduct: Product
): Promise<void> {
  const { safeId, payload } = sanitizeProductPayload(
    { ...mergedProduct, id: productId },
    false
  );
  delete payload.id;
  const path = `products/${safeId}`;
  try {
    const existingSnap = await getDoc(doc(db, 'products', safeId));
    if (existingSnap.exists()) {
      await updateDoc(doc(db, 'products', safeId), payload);
    } else {
      const { payload: createPayload } = sanitizeProductPayload(
        { ...mergedProduct, id: productId },
        true
      );
      await setDoc(doc(db, 'products', safeId), createPayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductFromFirestore(
  productId: string
): Promise<void> {
  const safeId = toSafeId(productId);
  const path = `products/${safeId}`;
  try {
    await deleteDoc(doc(db, 'products', safeId));
    await deleteDoc(doc(db, 'owner_catalog_meta', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveOwnerMetaToFirestore(
  meta: OwnerProductCostMeta
): Promise<void> {
  const { safeId, payload } = sanitizeOwnerMetaPayload(meta);
  const path = `owner_catalog_meta/${safeId}`;
  try {
    await setDoc(doc(db, 'owner_catalog_meta', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStoreSettingsToFirestore(
  settings: StoreSettings
): Promise<void> {
  const path = 'store_settings/main';
  const cleanCategories = settings.categories.slice(0, 30).map((cat) => ({
    name: String(cat.name || '').trim().slice(0, 80),
    nameUr: String(cat.nameUr || cat.name || '').trim().slice(0, 120),
    shortDesc: String(cat.shortDesc || '').trim().slice(0, 200),
  }));

  try {
    await setDoc(doc(db, 'store_settings', 'main'), {
      standardDeliveryFeePkr: Math.max(
        0,
        Math.round(Number(settings.standardDeliveryFeePkr) || 0)
      ),
      freeDeliveryThresholdPkr: Math.max(
        0,
        Math.round(Number(settings.freeDeliveryThresholdPkr) || 0)
      ),
      estimatedDeliveryWindow: String(
        settings.estimatedDeliveryWindow ||
          DEFAULT_STORE_SETTINGS.estimatedDeliveryWindow
      ).slice(0, 160),
      categories:
        cleanCategories.length > 0
          ? cleanCategories
          : DEFAULT_STORE_SETTINGS.categories,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSubscriberToFirestore(
  email: string,
  source: 'newsletter' | 'restock_alert',
  productId?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase().slice(0, 160);
  const subId = toSafeId(`sub_${Date.now()}_${cleanEmail.replace(/@.*/, '')}`);
  const path = `subscribers/${subId}`;
  const payload: Record<string, unknown> = {
    email: cleanEmail,
    source,
    createdAt: serverTimestamp(),
  };
  if (productId) {
    payload.productId = toSafeId(productId);
  }

  try {
    await setDoc(doc(db, 'subscribers', subId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Seeds missing starter products and supplier cost metadata into Firestore
 * without overwriting any existing products, prices, or commissions.
 */
export async function seedStarterCatalogIfMissing(): Promise<number> {
  const path = 'products';
  try {
    const existingSnap = await getDocs(collection(db, path));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));

    const batch = writeBatch(db);
    let seededCount = 0;

    for (const product of DEFAULT_PRODUCTS) {
      if (!existingIds.has(product.id)) {
        const { safeId, payload } = sanitizeProductPayload(product, true);
        batch.set(doc(db, 'products', safeId), payload);
        seededCount++;

        const meta = DEFAULT_OWNER_CATALOG_META[product.id];
        if (meta) {
          const { payload: metaPayload } = sanitizeOwnerMetaPayload(meta);
          batch.set(doc(db, 'owner_catalog_meta', safeId), metaPayload);
        }
      }
    }

    const settingsSnap = await getDoc(doc(db, 'store_settings', 'main'));
    if (!settingsSnap.exists()) {
      batch.set(doc(db, 'store_settings', 'main'), {
        standardDeliveryFeePkr: DEFAULT_STORE_SETTINGS.standardDeliveryFeePkr,
        freeDeliveryThresholdPkr:
          DEFAULT_STORE_SETTINGS.freeDeliveryThresholdPkr,
        estimatedDeliveryWindow: DEFAULT_STORE_SETTINGS.estimatedDeliveryWindow,
        categories: DEFAULT_STORE_SETTINGS.categories,
        updatedAt: serverTimestamp(),
      });
    }

    if (seededCount > 0 || !settingsSnap.exists()) {
      await batch.commit();
    }

    return seededCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
