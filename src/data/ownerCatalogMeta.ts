/**
 * STORE OWNER PRIVATE SUPPLIER METADATA (INTERNAL USE ONLY)
 * ---------------------------------------------------------
 * Keeps supplier product IDs, supplier prices, and listed stock counts
 * strictly separate from customer-facing catalog components.
 * Never import this module into customer storefront UI.
 */
export interface OwnerProductCostMeta {
  productId: string;
  supplierProductId: string;
  supplierName?: string;
  supplierCostPkr: number;
  listedStock: number;
  dispatchLocation?: string;
  inspectionStatus?: string;
}

export const DEFAULT_OWNER_CATALOG_META: Record<string, OwnerProductCostMeta> = {
  'hhc-3771373': {
    productId: 'hhc-3771373',
    supplierProductId: '3771373',
    supplierCostPkr: 855,
    listedStock: 2,
  },
  'hhc-3771421': {
    productId: 'hhc-3771421',
    supplierProductId: '3771421',
    supplierCostPkr: 855,
    listedStock: 2,
  },
  'hhc-3771681': {
    productId: 'hhc-3771681',
    supplierProductId: '3771681',
    supplierCostPkr: 391,
    listedStock: 2,
  },
  'hhc-3771747': {
    productId: 'hhc-3771747',
    supplierProductId: '3771747',
    supplierCostPkr: 909,
    listedStock: 2,
  },
  'hhc-3771881': {
    productId: 'hhc-3771881',
    supplierProductId: '3771881',
    supplierCostPkr: 1050,
    listedStock: 2,
  },
  'hhc-3754493': {
    productId: 'hhc-3754493',
    supplierProductId: '3754493',
    supplierName: 'HHC Dropshipping',
    supplierCostPkr: 1329,
    listedStock: 88,
    dispatchLocation: 'Karachi, Pakistan',
    inspectionStatus: 'N/A',
  },
  'hhc-3765576': {
    productId: 'hhc-3765576',
    supplierProductId: '3765576',
    supplierName: 'HHC Dropshipping',
    supplierCostPkr: 510,
    listedStock: 945,
    dispatchLocation: 'Karachi, Pakistan',
    inspectionStatus: 'Pending Confirmation',
  },
  'tkv-youngcome-60ml': {
    productId: 'tkv-youngcome-60ml',
    supplierProductId: 'YOUNGCOME-60ML',
    supplierName: 'HHC Dropshipping',
    supplierCostPkr: 423,
    listedStock: 2,
    dispatchLocation: 'Karachi, Pakistan',
    inspectionStatus: 'Pending Confirmation',
  },
};

export const OWNER_CATALOG_META = DEFAULT_OWNER_CATALOG_META;
