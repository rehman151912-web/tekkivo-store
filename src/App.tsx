import { useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { MessageCircle } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { CatalogSection, SortOption } from './components/CatalogSection';
import { CategoryStrip } from './components/CategoryStrip';
import { CheckoutPage } from './components/CheckoutPage';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewsletterSection } from './components/NewsletterSection';
import { OwnerPortalPage } from './components/OwnerPortalPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShoppingCartPage } from './components/ShoppingCartPage';
import { StoreInfoModal, StoreInfoModalType } from './components/StoreInfoModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { WhyChooseTekkivo } from './components/WhyChooseTekkivo';
import { WishlistDrawer } from './components/WishlistDrawer';
import { DEFAULT_STORE_SETTINGS, STORE_CONFIG } from './config/store';
import {
  DEFAULT_OWNER_CATALOG_META,
  OwnerProductCostMeta,
} from './data/ownerCatalogMeta';
import { DEFAULT_PRODUCTS } from './data/products';
import { ADMIN_PRIMARY_EMAIL, auth, googleProvider } from './firebase';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  CartItem,
  LanguageMode,
  OrderReceipt,
  Product,
  ProductCategory,
  StoreSettings,
} from './types/store';
import {
  addCartItem,
  isProductOrderable,
  isProductPublished,
  removeCartItem,
  updateCartItemQuantity,
} from './utils/cart';
import { getWhatsAppUrl } from './utils/currency';
import {
  deleteOrderFromFirestore,
  deleteProductFromFirestore,
  saveOwnerMetaToFirestore,
  saveProductToFirestore,
  saveStoreSettingsToFirestore,
  seedStarterCatalogIfMissing,
  subscribeToAllProductsAdmin,
  subscribeToOrdersAdmin,
  subscribeToOwnerMetaAdmin,
  subscribeToPublicProducts,
  subscribeToStoreSettings,
  updateOrderInFirestore,
  updateProductInFirestore,
} from './utils/firestoreService';

type ActivePage = 'home' | 'cart' | 'checkout' | 'owner';

export default function App() {
  const [language, setLanguage] = useLocalStorage<LanguageMode>(
    'tekkivo_lang_v1',
    'en'
  );
  const [products, setProducts] = useLocalStorage<Product[]>(
    'tekkivo_products_v10',
    DEFAULT_PRODUCTS
  );
  const [ownerMetaMap, setOwnerMetaMap] = useLocalStorage<
    Record<string, OwnerProductCostMeta>
  >('tekkivo_owner_meta_v5', DEFAULT_OWNER_CATALOG_META);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(
    DEFAULT_STORE_SETTINGS
  );

  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    'tekkivo_cart_v2',
    []
  );
  const [wishlistIds, setWishlistIds] = useLocalStorage<string[]>(
    'tekkivo_wishlist_v2',
    []
  );
  const [demoOrders, setDemoOrders] = useLocalStorage<OrderReceipt[]>(
    'tekkivo_demo_orders_v1',
    []
  );
  const [cloudOrders, setCloudOrders] = useState<OrderReceipt[]>([]);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [cloudStatusText, setCloudStatusText] = useState(
    'Connected to Cloud Firestore.'
  );
  const autoSeededRef = useRef(false);

  const isAdmin = Boolean(
    firebaseUser &&
      firebaseUser.emailVerified &&
      firebaseUser.email === ADMIN_PRIMARY_EMAIL
  );

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'All'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] =
    useState<StoreInfoModalType>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Public Store Settings subscription
  useEffect(() => {
    const unsubSettings = subscribeToStoreSettings(
      (nextSettings) => {
        setStoreSettings(nextSettings);
      },
      () => {
        // Keep default settings if offline
      }
    );
    return () => unsubSettings();
  }, []);

  // Public vs Admin Products, Owner Meta, and Orders subscriptions
  useEffect(() => {
    if (!isAdmin) {
      const unsubPublic = subscribeToPublicProducts(
        (cloudProducts) => {
          if (cloudProducts.length > 0) {
            const newStarter = DEFAULT_PRODUCTS.find(
              (p) => p.id === 'tkv-youngcome-60ml'
            );
            const needsInitialSync =
              newStarter &&
              cloudProducts.length === 7 &&
              !cloudProducts.some((p) => p.id === 'tkv-youngcome-60ml');
            setProducts(
              needsInitialSync ? [...cloudProducts, newStarter] : cloudProducts
            );
          }
        },
        () => {
          // Retain cached/starter products if offline
        }
      );
      return () => unsubPublic();
    }

    if (!autoSeededRef.current) {
      autoSeededRef.current = true;
      void seedStarterCatalogIfMissing()
        .then((seeded) => {
          setCloudStatusText(
            seeded > 0
              ? `Synced ${seeded} starter product(s) into Cloud Firestore.`
              : 'All products, categories, delivery fees, and orders are synced live.'
          );
        })
        .catch(() => {
          setCloudStatusText('Cloud Firestore active (local backup enabled).');
        });
    }

    const unsubAdminProducts = subscribeToAllProductsAdmin((allProducts) => {
      if (allProducts.length > 0) {
        setProducts(allProducts);
      }
    });
    const unsubMeta = subscribeToOwnerMetaAdmin((meta) => {
      if (Object.keys(meta).length > 0) {
        setOwnerMetaMap(meta);
      }
    });
    const unsubOrders = subscribeToOrdersAdmin((ordersList) => {
      setCloudOrders(ordersList);
    });

    return () => {
      unsubAdminProducts();
      unsubMeta();
      unsubOrders();
    };
  }, [isAdmin, setOwnerMetaMap, setProducts]);

  const publishedProducts = products.filter(isProductPublished);

  const activeProduct = activeProductId
    ? publishedProducts.find((p) => p.id === activeProductId) || null
    : null;

  const setHashSafely = (hash: string) => {
    try {
      window.history.replaceState(null, '', hash);
    } catch {
      // Ignore history restriction in sandboxed environments
    }
  };

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash === '#cart') {
        setActivePage('cart');
        setActiveProductId(null);
      } else if (hash === '#checkout') {
        setActivePage('checkout');
        setActiveProductId(null);
      } else if (hash === '#owner') {
        setActivePage('owner');
        setActiveProductId(null);
      } else if (hash.startsWith('#product=')) {
        const productId = hash.replace('#product=', '');
        setActiveProductId(productId);
      } else {
        setActiveProductId(null);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSignInWithGoogle = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in popup was cancelled or blocked.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCloudOrders([]);
  };

  const openProductDetail = (product: Product) => {
    setActiveProductId(product.id);
    setHashSafely(`#product=${product.id}`);
  };

  const closeProductDetail = () => {
    setActiveProductId(null);
    if (window.location.hash.startsWith('#product=')) {
      const fallbackHash =
        activePage === 'cart'
          ? '#cart'
          : activePage === 'checkout'
          ? '#checkout'
          : activePage === 'owner'
          ? '#owner'
          : '#';
      setHashSafely(fallbackHash);
    }
  };

  const navigateToPage = (page: ActivePage) => {
    setActivePage(page);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsTrackOrderOpen(false);
    setActiveProductId(null);
    if (page === 'cart') {
      setHashSafely('#cart');
    } else if (page === 'checkout') {
      setHashSafely('#checkout');
    } else if (page === 'owner') {
      setHashSafely('#owner');
    } else {
      setHashSafely('#');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    if (activePage !== 'home') {
      setActivePage('home');
      setHashSafely('#');
      window.setTimeout(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return;
    }

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (category: ProductCategory | 'All') => {
    setSelectedCategory(category);
    if (activePage !== 'home') {
      navigateToPage('home');
      if (category !== 'All') {
        window.setTimeout(() => {
          document
            .getElementById('catalog')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
      return;
    }
    if (category !== 'All') {
      window.setTimeout(() => {
        document
          .getElementById('catalog')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  const handleAddToCart = (
    productId: string,
    quantityToAdd = 1,
    selectedColor?: string
  ) => {
    setCartItems((prev) =>
      addCartItem(prev, products, productId, quantityToAdd, selectedColor)
    );
  };

  const handleUpdateCartQuantity = (
    productId: string,
    nextQty: number,
    selectedColor?: string
  ) => {
    setCartItems((prev) =>
      updateCartItemQuantity(prev, products, productId, nextQty, selectedColor)
    );
  };

  const handleRemoveFromCart = (productId: string, selectedColor?: string) => {
    setCartItems((prev) => removeCartItem(prev, productId, selectedColor));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleMoveWishlistToCart = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || !isProductOrderable(prod)) return;
    handleAddToCart(productId, 1);
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleBuyNowCod = (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || !isProductOrderable(prod)) return;
    handleAddToCart(productId, quantity, selectedColor);
    closeProductDetail();
    navigateToPage('checkout');
  };

  const handleSaveDemoOrder = (order: OrderReceipt) => {
    setDemoOrders((prev) => [order, ...prev]);
  };

  const handleUpdateOrder = (
    orderRef: string,
    patch: Partial<
      Pick<OrderReceipt, 'status' | 'hhcFulfillmentRef' | 'ownerNotes'>
    >
  ) => {
    setCloudOrders((prev) =>
      prev.map((order) =>
        order.orderRef === orderRef ? { ...order, ...patch } : order
      )
    );
    setDemoOrders((prev) =>
      prev.map((order) =>
        order.orderRef === orderRef ? { ...order, ...patch } : order
      )
    );
    if (isAdmin) {
      void updateOrderInFirestore(orderRef, patch).catch(() => {});
    }
  };

  const handleDeleteOrder = (orderRef: string) => {
    setCloudOrders((prev) => prev.filter((o) => o.orderRef !== orderRef));
    setDemoOrders((prev) => prev.filter((o) => o.orderRef !== orderRef));
    if (isAdmin) {
      void deleteOrderFromFirestore(orderRef).catch(() => {});
    }
  };

  const handleUpdateProduct = (productId: string, patch: Partial<Product>) => {
    let mergedProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const next = { ...p, ...patch };
        if (next.sellingPricePkr <= 0) {
          next.isPublished = false;
        }
        mergedProduct = next;
        return next;
      })
    );
    if (isAdmin && mergedProduct) {
      void updateProductInFirestore(productId, mergedProduct).catch(() => {});
    }
  };

  const handleAddProduct = (
    product: Product,
    supplierMeta: OwnerProductCostMeta
  ) => {
    setProducts((prev) => [...prev, product]);
    setOwnerMetaMap((prev) => ({ ...prev, [product.id]: supplierMeta }));
    if (isAdmin) {
      void saveProductToFirestore(product, supplierMeta).catch(() => {});
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((c) => c.productId !== productId));
    if (isAdmin) {
      void deleteProductFromFirestore(productId).catch(() => {});
    }
  };

  const handleResetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    setOwnerMetaMap(DEFAULT_OWNER_CATALOG_META);
    if (isAdmin) {
      void Promise.all(
        DEFAULT_PRODUCTS.map((prod) =>
          saveProductToFirestore(prod, DEFAULT_OWNER_CATALOG_META[prod.id])
        )
      ).catch(() => {});
    }
  };

  const handleUpdateSupplierMeta = (
    productId: string,
    patch: Partial<OwnerProductCostMeta>
  ) => {
    const existing = ownerMetaMap[productId] || {
      productId,
      supplierProductId: 'MANUAL',
      supplierCostPkr: 0,
      listedStock: 0,
    };
    const merged: OwnerProductCostMeta = { ...existing, ...patch };
    setOwnerMetaMap((prev) => ({
      ...prev,
      [productId]: merged,
    }));
    if (isAdmin) {
      void saveOwnerMetaToFirestore(merged).catch(() => {});
    }
  };

  const handleUpdateStoreSettings = (next: StoreSettings) => {
    setStoreSettings(next);
    if (isAdmin) {
      void saveStoreSettingsToFirestore(next).catch(() => {});
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const adminOrders = isAdmin && cloudOrders.length > 0 ? cloudOrders : demoOrders;
  const floatingWhatsAppUrl = getWhatsAppUrl(
    STORE_CONFIG.ownerWhatsAppNumber,
    'Assalam-o-Alaikum TEKKIVO, I would like assistance with shopping or Cash on Delivery.'
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-[#10243D] pb-14 md:pb-0">
      <Header
        language={language}
        onToggleLanguage={setLanguage}
        searchQuery={searchQuery}
        onSearchSubmit={(query) => {
          setSearchQuery(query);
          if (activePage !== 'home') {
            navigateToPage('home');
          }
        }}
        onSelectCategory={handleSelectCategory}
        freeDeliveryThresholdPkr={storeSettings.freeDeliveryThresholdPkr}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => {
          if (activePage === 'cart') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsCartOpen(true);
          }
        }}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenOwnerPortal={() => navigateToPage('owner')}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        {activePage === 'cart' ? (
          <ShoppingCartPage
            language={language}
            cartItems={cartItems}
            products={products}
            storeSettings={storeSettings}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onContinueShopping={() => navigateToPage('home')}
            onProceedToCheckout={() => {
              if (cartItems.length > 0) {
                navigateToPage('checkout');
              }
            }}
            onInspectProduct={openProductDetail}
          />
        ) : activePage === 'checkout' ? (
          <CheckoutPage
            language={language}
            cartItems={cartItems}
            products={products}
            storeSettings={storeSettings}
            onBackToCart={() => navigateToPage('cart')}
            onContinueShopping={() => navigateToPage('home')}
            onSaveDemoOrder={handleSaveDemoOrder}
            onWhatsAppHandoffComplete={handleClearCart}
            onRestoreCartItems={(restored) => setCartItems(restored)}
          />
        ) : activePage === 'owner' ? (
          <OwnerPortalPage
            user={firebaseUser}
            isAdmin={isAdmin}
            authLoading={authLoading}
            authError={authError}
            onSignInWithGoogle={handleSignInWithGoogle}
            onSignOut={handleSignOut}
            orders={adminOrders}
            products={products}
            ownerMetaMap={ownerMetaMap}
            storeSettings={storeSettings}
            cloudStatusText={cloudStatusText}
            onSeedStarterCatalog={seedStarterCatalogIfMissing}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetCatalog={handleResetCatalog}
            onUpdateSupplierMeta={handleUpdateSupplierMeta}
            onUpdateStoreSettings={handleUpdateStoreSettings}
            onBackToStore={() => navigateToPage('home')}
          />
        ) : (
          <>
            <HeroBanner
              language={language}
              freeDeliveryThresholdPkr={storeSettings.freeDeliveryThresholdPkr}
              onShopNow={() => scrollToSection('featured-products')}
              onBrowseCategories={() => scrollToSection('categories')}
            />

            <CategoryStrip
              language={language}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            <CatalogSection
              language={language}
              products={publishedProducts}
              categories={storeSettings.categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={(id) => handleAddToCart(id, 1)}
              onOpenDetail={openProductDetail}
            />

            <WhyChooseTekkivo language={language} />

            <NewsletterSection language={language} />

            <ContactSection language={language} />
          </>
        )}
      </main>

      <Footer
        storeSettings={storeSettings}
        onNavigateSection={(sectionId) => {
          if (
            sectionId === 'featured-products' ||
            sectionId === 'new-arrivals' ||
            sectionId === 'best-sellers' ||
            sectionId === 'special-deals' ||
            sectionId === 'catalog'
          ) {
            setSelectedCategory('All');
            setSearchQuery('');
          }
          scrollToSection(sectionId);
        }}
        onOpenOwnerPortal={() => navigateToPage('owner')}
        onOpenCart={() => navigateToPage('cart')}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenInfoModal={(type) => setActiveInfoModal(type)}
      />

      {/* Desktop Floating WhatsApp Contact CTA (mobile uses MobileBottomNav) */}
      {activePage !== 'owner' && (
        <a
          href={floatingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with TEKKIVO on WhatsApp"
          className="hidden md:inline-flex fixed bottom-5 right-5 z-30 h-12 px-4 rounded-full bg-[#10243D] hover:bg-[#183558] text-white shadow-lg border border-white/15 items-center gap-2 text-sm font-semibold transition-transform hover:scale-[1.03]"
        >
          <MessageCircle className="w-5 h-5 text-[#F47721]" />
          <span>WhatsApp Us</span>
        </a>
      )}

      {/* Mobile Bottom Navigation: Home, Categories, Cart, WhatsApp */}
      {activePage !== 'owner' && (
        <MobileBottomNav
          categories={storeSettings.categories}
          selectedCategory={selectedCategory}
          cartCount={totalCartCount}
          onGoHome={() => {
            setSelectedCategory('All');
            setSearchQuery('');
            navigateToPage('home');
          }}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            if (activePage !== 'home') {
              navigateToPage('home');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Interactive Drawers & Modals */}
      <ProductDetailModal
        product={activeProduct}
        language={language}
        storeSettings={storeSettings}
        isWishlisted={
          activeProduct ? wishlistIds.includes(activeProduct.id) : false
        }
        onClose={closeProductDetail}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNowCod={handleBuyNowCod}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        products={products}
        storeSettings={storeSettings}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCartPage={() => navigateToPage('cart')}
        onProceedToCheckout={() => {
          if (cartItems.length > 0) {
            navigateToPage('checkout');
          }
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistIds={wishlistIds}
        products={publishedProducts}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onOpenProduct={openProductDetail}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        orders={adminOrders}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <StoreInfoModal
        modalType={activeInfoModal}
        freeDeliveryThresholdPkr={storeSettings.freeDeliveryThresholdPkr}
        standardDeliveryFeePkr={storeSettings.standardDeliveryFeePkr}
        onClose={() => setActiveInfoModal(null)}
      />
    </div>
  );
}
