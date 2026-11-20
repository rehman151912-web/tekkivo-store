import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OWNER_WHATSAPP_NUMBER,
  PRODUCT_CATEGORIES,
  STORE_CONFIG,
} from '../config/store';
import { DEFAULT_OWNER_CATALOG_META } from '../data/ownerCatalogMeta';
import { DEFAULT_PRODUCTS } from '../data/products';
import { CartItem, OrderReceipt, OrderStatus } from '../types/store';
import {
  addCartItem,
  buildCartSummary,
  isProductOrderable,
  isProductPublished,
  removeCartItem,
  updateCartItemQuantity,
} from './cart';
import {
  buildWhatsAppOrderSummary,
  calculateShippingFee,
  formatPkr,
  formatWhatsAppDisplayNumber,
  generateOrderReference,
  getWhatsAppUrl,
} from './currency';
import { buildOrdersCsv, calculateOrderFinancials } from './ownerOrders';
import {
  validateCheckoutForm,
  validatePakistaniPhone,
} from './validation';

test('Store configuration uses TEKKIVO brand, Smart Choice. Better Life. tagline, WhatsApp 923462796879, tekkivo.store@gmail.com, and 12 main categories', () => {
  assert.equal(STORE_CONFIG.brandName, 'TEKKIVO');
  assert.equal(STORE_CONFIG.tagline, 'Smart Choice. Better Life.');
  assert.equal(STORE_CONFIG.ownerWhatsAppNumber, '923462796879');
  assert.equal(STORE_CONFIG.supportEmail, 'tekkivo.store@gmail.com');
  assert.equal(OWNER_WHATSAPP_NUMBER, '923462796879');
  assert.equal(
    formatWhatsAppDisplayNumber(OWNER_WHATSAPP_NUMBER),
    '+92 346 2796879'
  );

  const categoryNames = PRODUCT_CATEGORIES.map((c) => c.name);
  assert.deepEqual(categoryNames, [
    'Electronics & Gadgets',
    'Kitchen Tools & Appliances',
    'Home & Living',
    'Beauty & Personal Care',
    'Fashion & Accessories',
    'Baby & Kids',
    'Mobile Accessories',
    'Grocery & Food Items',
    'Health & Personal Care',
    'Toys & Games',
    'Sports & Outdoor',
    'Cleaning & Household Essentials',
  ]);
});

test('8 catalog listings exist, Gionee is out of stock, RAF Electric Stove is Rs. 2,029, Moon Lamp is Rs. 1,010, and Youngcome Lotion is Rs. 600', () => {
  assert.equal(DEFAULT_PRODUCTS.length, 8);

  const gionee = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771681')!;
  assert.equal(gionee.title, 'Gionee Type-C Handsfree');
  assert.equal(gionee.stockConfirmationStatus, 'out_of_stock');
  assert.equal(gionee.stock, 0);
  assert.equal(isProductOrderable(gionee), false);

  let cart: CartItem[] = [];
  cart = addCartItem(cart, DEFAULT_PRODUCTS, gionee.id, 1);
  assert.equal(cart.length, 0);

  const tTech = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771373')!;
  assert.equal(tTech.title, 'T-Tech Wireless Earbuds');
  assert.equal(tTech.sellingPricePkr, 1499);
  assert.equal(tTech.conditionNote, 'Without Box');
  assert.deepEqual(tTech.availableColors, ['Black', 'White']);
  assert.equal(tTech.stockConfirmationStatus, 'pending_confirmation');
  assert.equal(tTech.image, '/assets/products/t-tech-wireless-earbuds.jpg');
  assert.equal(isProductOrderable(tTech), true);

  const p9 = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771421')!;
  assert.equal(p9.sellingPricePkr, 1499);
  assert.equal(p9.image, '/assets/products/p9-wireless-headphones.jpg');

  const u39 = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771747')!;
  assert.equal(u39.sellingPricePkr, 1599);
  assert.equal(u39.image, '/assets/products/u39-wireless-earbuds.jpg');

  assert.equal(
    gionee.image,
    '/assets/aistudio/photo_1794983484395_0_66f84968.jpg'
  );

  const pixelBuds = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771881')!;
  assert.equal(
    pixelBuds.title,
    'Google Pixel Buds Pro Wireless Earbuds (ANC)'
  );
  assert.equal(pixelBuds.sellingPricePkr, 1799);
  assert.equal(
    pixelBuds.image,
    '/assets/aistudio/photo_1794982099344_0_bdddb3bf.webp'
  );
  assert.equal(pixelBuds.galleryImages?.length, 4);
  assert.ok(
    pixelBuds.conditionNote?.includes('Not claimed as genuine/original Google')
  );

  const rafStove = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3754493')!;
  assert.equal(
    rafStove.title,
    'RAF Electric Stove | 1000W Hot Plate | Heats in 2 Mins | Automatic & Easy to Clean'
  );
  assert.equal(rafStove.category, 'Kitchen Tools & Appliances');
  assert.equal(rafStove.sellingPricePkr, 2029);
  assert.equal(rafStove.isPublished, true);
  assert.equal(rafStove.stock, 2);
  assert.equal(rafStove.galleryImages?.length, 2);
  assert.equal(isProductPublished(rafStove), true);
  assert.equal(isProductOrderable(rafStove), true);

  // Price guard still blocks if price is zeroed or unpublished
  const zeroPricedList = DEFAULT_PRODUCTS.map((p) =>
    p.id === rafStove.id ? { ...p, sellingPricePkr: 0 } : p
  );
  assert.equal(
    isProductOrderable(zeroPricedList.find((p) => p.id === rafStove.id)!),
    false
  );
  cart = addCartItem(cart, zeroPricedList, rafStove.id, 1);
  assert.equal(cart.length, 0);

  // Published at Rs. 2,029 orders cleanly up to storefront stock of 2
  cart = addCartItem(cart, DEFAULT_PRODUCTS, rafStove.id, 5);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  // Supplier metadata & Rs. 700 commission stay strictly inside ownerCatalogMeta
  const rafMeta = DEFAULT_OWNER_CATALOG_META[rafStove.id];
  assert.equal(rafMeta.supplierProductId, '3754493');
  assert.equal(rafMeta.supplierCostPkr, 1329);
  assert.equal(rafStove.sellingPricePkr - rafMeta.supplierCostPkr, 700);
  assert.equal(rafMeta.listedStock, 88);

  // Moon Earth Projection Lamp (hhc-3765576)
  const lamp = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3765576')!;
  assert.equal(
    lamp.title,
    'USB Ceiling Moon Earth Projection Atmosphere Light Starry Sky Lamp – 6 Lenses'
  );
  assert.equal(lamp.category, 'Home & Living');
  assert.equal(lamp.sellingPricePkr, 1010);
  assert.equal(lamp.stock, 945);
  assert.equal(lamp.stockConfirmationStatus, 'pending_confirmation');
  assert.equal(lamp.isPublished, true);
  assert.equal(lamp.galleryImages?.length, 3);
  assert.equal(
    lamp.image,
    '/assets/aistudio/2026_09_15_8d60c5097981457c8a749953922d7f62_715bd886.jpeg'
  );
  const lensesSpec = lamp.specs.find((s) =>
    s.label.includes('Included Lenses')
  );
  assert.ok(lensesSpec?.value.includes('Moon'));
  assert.ok(lensesSpec?.value.includes('Earth'));
  assert.ok(lensesSpec?.value.includes('Mars'));
  assert.ok(lensesSpec?.value.includes('Jupiter'));
  assert.ok(lensesSpec?.value.includes('Saturn'));
  assert.ok(lensesSpec?.value.includes('Starry Nebula'));
  assert.equal(isProductOrderable(lamp), true);

  let lampCart = addCartItem([], DEFAULT_PRODUCTS, lamp.id, 1);
  assert.equal(lampCart.length, 1);
  const lampSummary = buildCartSummary(lampCart, DEFAULT_PRODUCTS);
  assert.equal(lampSummary.subtotalPkr, 1010);

  const lampMeta = DEFAULT_OWNER_CATALOG_META[lamp.id];
  assert.equal(lampMeta.supplierProductId, '3765576');
  assert.equal(lampMeta.supplierCostPkr, 510);
  assert.equal(lamp.sellingPricePkr - lampMeta.supplierCostPkr, 500);
  assert.equal(lampMeta.listedStock, 945);
  assert.equal(lampMeta.dispatchLocation, 'Karachi, Pakistan');

  const lampOrderMsg = buildWhatsAppOrderSummary({
    orderRef: 'TKV-261118-445566',
    createdAt: '2026-11-18T12:00:00.000Z',
    status: 'pending',
    hhcFulfillmentRef: '',
    customer: {
      fullName: 'Zainab Tariq',
      phone: '0321-7654321',
      city: 'Lahore',
      address: 'House 5, Model Town, Lahore',
      paymentMethod: 'COD',
    },
    items: [
      {
        productId: lamp.id,
        sku: lamp.sku,
        title: lamp.title,
        quantity: 1,
        unitPricePkr: 1010,
        lineTotalPkr: 1010,
      },
    ],
    subtotalPkr: 1010,
    shippingFeePkr: STORE_CONFIG.standardDeliveryFeePkr,
    totalPkr: 1010 + STORE_CONFIG.standardDeliveryFeePkr,
  });
  assert.ok(lampOrderMsg.includes('Rs. 1,010'));
  assert.ok(!lampOrderMsg.includes('510'));
  assert.ok(!lampOrderMsg.includes('500'));
  assert.ok(!lampOrderMsg.includes('3765576'));

  // Youngcome Face & Body Whitening Lotion 60ml (tkv-youngcome-60ml)
  const lotion = DEFAULT_PRODUCTS.find((p) => p.id === 'tkv-youngcome-60ml')!;
  assert.equal(lotion.title, 'Youngcome Face & Body Whitening Lotion 60ml');
  assert.equal(
    lotion.description,
    'Face and body moisturizing lotion with collagen and milk formula, marketed for uneven skin tone and dark spots.'
  );
  assert.equal(lotion.category, 'Beauty & Personal Care');
  assert.equal(lotion.sellingPricePkr, 600);
  assert.equal(lotion.stock, 2);
  assert.equal(lotion.isPublished, true);
  assert.equal(lotion.galleryImages?.length, 2);
  assert.equal(
    lotion.image,
    '/assets/aistudio/2026_09_21_5ba51237c3c64bfc2cec0d1d3d34f0e9_af456f38.png'
  );
  assert.equal(isProductOrderable(lotion), true);

  const lotionMeta = DEFAULT_OWNER_CATALOG_META[lotion.id];
  assert.equal(lotionMeta.supplierCostPkr, 423);
  assert.equal(lotion.sellingPricePkr - lotionMeta.supplierCostPkr, 177);

  let lotionCart = addCartItem([], DEFAULT_PRODUCTS, lotion.id, 1);
  assert.equal(lotionCart.length, 1);
  const lotionSummary = buildCartSummary(lotionCart, DEFAULT_PRODUCTS);
  assert.equal(lotionSummary.subtotalPkr, 600);
});

test('PKR currency formatting and configurable COD shipping fee threshold', () => {
  assert.equal(formatPkr(1499), 'Rs. 1,499');
  assert.equal(formatPkr(0), 'Rs. 0');
  assert.equal(calculateShippingFee(0), 0);
  assert.equal(calculateShippingFee(1499), STORE_CONFIG.standardDeliveryFeePkr);
  assert.equal(calculateShippingFee(5000), 0);
  assert.equal(calculateShippingFee(6500), 0);
  assert.equal(
    calculateShippingFee(2500, {
      standardDeliveryFeePkr: 350,
      freeDeliveryThresholdPkr: 3000,
    }),
    350
  );
  assert.equal(
    calculateShippingFee(3000, {
      standardDeliveryFeePkr: 350,
      freeDeliveryThresholdPkr: 3000,
    }),
    0
  );
});

test('Pakistani mobile number validation accepts local & +92 formats and rejects invalid numbers', () => {
  const validLocal = validatePakistaniPhone('03462796879');
  assert.equal(validLocal.valid, true);
  assert.equal(validLocal.normalizedLocal, '0346-2796879');

  const validIntl = validatePakistaniPhone('+92 333 5551234');
  assert.equal(validIntl.valid, true);
  assert.equal(validIntl.normalizedLocal, '0333-5551234');

  assert.equal(validatePakistaniPhone('02134567890').valid, false);
  assert.equal(validatePakistaniPhone('030012345').valid, false);
  assert.equal(validatePakistaniPhone('0300-abcdefg').valid, false);
});

test('Shopping cart handles color variants, increment, decrement, stock clamp (max 2), remove, and totals', () => {
  const tTech = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771373')!;
  const p9 = DEFAULT_PRODUCTS.find((p) => p.id === 'hhc-3771421')!;

  let cart: CartItem[] = [];
  cart = addCartItem(cart, DEFAULT_PRODUCTS, tTech.id, 1, 'White');
  assert.equal(cart[0].selectedColor, 'White');

  let summary = buildCartSummary(cart, DEFAULT_PRODUCTS);
  assert.equal(summary.subtotalPkr, tTech.sellingPricePkr);
  assert.equal(summary.shippingFeePkr, STORE_CONFIG.standardDeliveryFeePkr);

  cart = addCartItem(cart, DEFAULT_PRODUCTS, p9.id, 2, 'Blue');
  cart = addCartItem(cart, DEFAULT_PRODUCTS, tTech.id, 1, 'Black');
  summary = buildCartSummary(cart, DEFAULT_PRODUCTS);

  const expectedSubtotal = tTech.sellingPricePkr * 2 + p9.sellingPricePkr * 2;
  assert.equal(summary.totalItemCount, 4);
  assert.equal(summary.subtotalPkr, expectedSubtotal);
  assert.equal(summary.shippingFeePkr, 0);
  assert.equal(summary.totalPkr, expectedSubtotal);

  // Stock clamp to listed stock (2) per line item
  cart = updateCartItemQuantity(cart, DEFAULT_PRODUCTS, p9.id, 99, 'Blue');
  assert.equal(
    cart.find((c) => c.productId === p9.id && c.selectedColor === 'Blue')
      ?.quantity,
    p9.stock
  );

  // Remove specific color variant
  cart = removeCartItem(cart, tTech.id, 'White');
  assert.equal(cart.length, 2);
  assert.ok(
    cart.some((c) => c.productId === tTech.id && c.selectedColor === 'Black')
  );

  cart = updateCartItemQuantity(cart, DEFAULT_PRODUCTS, p9.id, 0, 'Blue');
  assert.equal(cart.length, 1);

  cart = removeCartItem(cart, tTech.id, 'Black');
  assert.equal(cart.length, 0);
});

test('Empty cart checkout is prevented and invalid customer details fail cleanly', () => {
  const emptyResult = validateCheckoutForm(
    {
      fullName: 'Hamza Tariq',
      phone: '03001234567',
      city: 'Lahore',
      address: 'House 14, Street 6, DHA Phase 5, Lahore',
    },
    0
  );
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.cart);

  const invalidFields = validateCheckoutForm(
    {
      fullName: 'A',
      phone: '12345',
      city: 'Other City',
      customCity: '',
      address: 'Short',
    },
    1
  );
  assert.equal(invalidFields.valid, false);
  assert.ok(invalidFields.errors.fullName);
  assert.ok(invalidFields.errors.phone);
  assert.ok(invalidFields.errors.customCity);
  assert.ok(invalidFields.errors.address);
});

test('WhatsApp order message includes SKU, color, price, total, excludes supplier IDs/costs, and uses wa.me/923462796879', () => {
  const tTech = DEFAULT_PRODUCTS[0];
  const orderRef = generateOrderReference();
  assert.match(orderRef, /^TKV-\d{6}-\d{6}$/);

  const baseReceipt: Omit<OrderReceipt, 'whatsappMessage'> = {
    orderRef,
    createdAt: '2026-11-17T12:00:00.000Z',
    status: 'pending',
    hhcFulfillmentRef: '',
    customer: {
      fullName: 'Bilal Ahmed',
      phone: '0333-9876543',
      city: 'Islamabad',
      address: 'House 22, Street 18, F-10/2, Islamabad',
      notes: 'Deliver after 4 PM',
      paymentMethod: 'COD',
    },
    items: [
      {
        productId: tTech.id,
        sku: tTech.sku,
        title: tTech.title,
        selectedColor: 'White',
        quantity: 2,
        unitPricePkr: tTech.sellingPricePkr,
        lineTotalPkr: tTech.sellingPricePkr * 2,
      },
    ],
    subtotalPkr: tTech.sellingPricePkr * 2,
    shippingFeePkr: STORE_CONFIG.standardDeliveryFeePkr,
    totalPkr: tTech.sellingPricePkr * 2 + STORE_CONFIG.standardDeliveryFeePkr,
  };

  const message = buildWhatsAppOrderSummary(baseReceipt);
  assert.ok(message.includes(orderRef));
  assert.ok(message.includes('Bilal Ahmed'));
  assert.ok(message.includes('0333-9876543'));
  assert.ok(message.includes('Islamabad'));
  assert.ok(message.includes('House 22, Street 18, F-10/2, Islamabad'));
  assert.ok(message.includes('T-Tech Wireless Earbuds (White)'));
  assert.ok(message.includes(`SKU: ${tTech.sku}`));
  assert.ok(message.includes('Qty: 2'));
  assert.ok(message.includes(formatPkr(tTech.sellingPricePkr)));
  assert.ok(message.includes(formatPkr(baseReceipt.totalPkr)));
  assert.ok(message.includes('Cash on Delivery (COD)'));

  // Ensure private supplier metadata is NOT exposed in customer-facing WhatsApp message
  assert.ok(!message.includes('HHC'));
  assert.ok(!message.includes('3771373'));
  assert.ok(!message.includes('855'));

  const waUrl = getWhatsAppUrl(OWNER_WHATSAPP_NUMBER, message);
  assert.ok(waUrl.startsWith('https://wa.me/923462796879?text='));
});

test('Owner financials, supplier meta, order statuses, HHC fulfillment reference, and CSV export work cleanly', () => {
  const tTech = DEFAULT_PRODUCTS[0];
  const ownerMeta = DEFAULT_OWNER_CATALOG_META[tTech.id];
  assert.equal(ownerMeta.supplierProductId, '3771373');
  assert.equal(ownerMeta.supplierCostPkr, 855);
  assert.equal(ownerMeta.listedStock, 2);

  const statuses: OrderStatus[] = [
    'pending',
    'submitted',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];
  assert.equal(statuses.length, 6);

  const sampleOrder: OrderReceipt = {
    orderRef: 'TKV-261117-901234',
    createdAt: '2026-11-17T15:30:00.000Z',
    status: 'processing',
    hhcFulfillmentRef: 'HHC-ORD-77881',
    ownerNotes: 'Confirmed supplier stock (Without Box)',
    customer: {
      fullName: 'Sana Tariq',
      phone: '0321-1122334',
      city: 'Lahore',
      address: 'House 88, Block K, Gulberg III, Lahore',
      notes: 'Ring bell twice',
      paymentMethod: 'COD',
    },
    items: [
      {
        productId: tTech.id,
        sku: tTech.sku,
        title: tTech.title,
        selectedColor: 'Black',
        quantity: 2,
        unitPricePkr: tTech.sellingPricePkr,
        lineTotalPkr: tTech.sellingPricePkr * 2,
      },
    ],
    subtotalPkr: tTech.sellingPricePkr * 2,
    shippingFeePkr: STORE_CONFIG.standardDeliveryFeePkr,
    totalPkr: tTech.sellingPricePkr * 2 + STORE_CONFIG.standardDeliveryFeePkr,
    whatsappMessage: 'test',
  };

  const financials = calculateOrderFinancials(
    sampleOrder,
    DEFAULT_OWNER_CATALOG_META
  );
  assert.equal(financials.supplierCostTotalPkr, 855 * 2);
  assert.equal(
    financials.estimatedProfitPkr,
    sampleOrder.subtotalPkr - 855 * 2
  );

  const csv = buildOrdersCsv([sampleOrder], DEFAULT_OWNER_CATALOG_META);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[0].includes('HHC Fulfillment Ref'));
  assert.ok(lines[0].includes('Supplier Cost (PKR)'));
  assert.ok(lines[0].includes('Estimated Profit (PKR)'));
  assert.ok(lines[1].includes('TKV-261117-901234'));
  assert.ok(lines[1].includes('processing'));
  assert.ok(lines[1].includes('HHC-ORD-77881'));
  assert.ok(lines[1].includes('(Black)'));
  assert.ok(lines[1].includes('"House 88, Block K, Gulberg III, Lahore"'));
});
