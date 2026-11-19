import { useEffect, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CatalogSection, SortOption } from './components/CatalogSection';
import { CategoryStrip } from './components/CategoryStrip';
import { CheckoutPage } from './components/CheckoutPage';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { NewsletterSection } from './components/NewsletterSection';
import { OwnerPortalPage } from './components/OwnerPortalPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchOverlay } from './components/SearchOverlay';
import { ShoppingCartPage } from './components/ShoppingCartPage';
import { SpecialOffersBanner } from './components/SpecialOffersBanner';
import { WhyChooseTekkivo } from './components/WhyChooseTekkivo';
import { WishlistDrawer } from './components/WishlistDrawer';
import {
  DEFAULT_OWNER_CATALOG_META,
  OwnerProductCostMeta,
} from './data/ownerCatalogMeta';
import { DEFAULT_PRODUCTS } from './data/products';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  CartItem,
  LanguageMode,
  OrderReceipt,
  Product,
  ProductCategory,
} from './types/store';
import {
  addCartItem,
  isProductOrderable,
  isProductPublished,
  removeCartItem,
  updateCartItemQuantity,
} from './utils/cart';

type ActivePage = 'home' | 'cart' | 'checkout' | 'owner';

export default function App() {
  const [language, setLanguage] = useLocalStorage<LanguageMode>(
    'tekkivo_lang_v1',
    'en'
  );
  const [products, setProducts] = useLocalStorage<Product[]>(
    'tekkivo_products_v8',
    DEFAULT_PRODUCTS
  );
  const [ownerMetaMap, setOwnerMetaMap] = useLocalStorage<
    Record<string, OwnerProductCostMeta>
  >('tekkivo_owner_meta_v4', DEFAULT_OWNER_CATALOG_META);

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

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'All'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const publishedProducts = products.filter(isProductPublished);

  const activeProduct =
    activeProductId
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
    scrollToSection('catalog');
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

  const handleUpdateDemoOrder = (
    orderRef: string,
    patch: Partial<
      Pick<OrderReceipt, 'status' | 'hhcFulfillmentRef' | 'ownerNotes'>
    >
  ) => {
    setDemoOrders((prev) =>
      prev.map((order) =>
        order.orderRef === orderRef ? { ...order, ...patch } : order
      )
    );
  };

  const handleDeleteDemoOrder = (orderRef: string) => {
    setDemoOrders((prev) =>
      prev.filter((order) => order.orderRef !== orderRef)
    );
  };

  const handleUpdateProduct = (productId: string, patch: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const next = { ...p, ...patch };
        if (next.sellingPricePkr <= 0) {
          next.isPublished = false;
        }
        return next;
      })
    );
  };

  const handleAddProduct = (
    product: Product,
    supplierMeta: OwnerProductCostMeta
  ) => {
    setProducts((prev) => [...prev, product]);
    setOwnerMetaMap((prev) => ({ ...prev, [product.id]: supplierMeta }));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((c) => c.productId !== productId));
  };

  const handleResetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    setOwnerMetaMap(DEFAULT_OWNER_CATALOG_META);
  };

  const handleUpdateSupplierMeta = (
    productId: string,
    patch: Partial<OwnerProductCostMeta>
  ) => {
    setOwnerMetaMap((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {
          productId,
          supplierProductId: 'MANUAL',
          supplierCostPkr: 0,
          listedStock: 0,
        }),
        ...patch,
      },
    }));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#10243D]">
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => {
          if (activePage === 'cart') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsCartOpen(true);
          }
        }}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        {activePage === 'cart' ? (
          <ShoppingCartPage
            language={language}
            cartItems={cartItems}
            products={products}
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
            onBackToCart={() => navigateToPage('cart')}
            onContinueShopping={() => navigateToPage('home')}
            onSaveDemoOrder={handleSaveDemoOrder}
            onWhatsAppHandoffComplete={handleClearCart}
            onRestoreCartItems={(restored) => setCartItems(restored)}
          />
        ) : activePage === 'owner' ? (
          <OwnerPortalPage
            orders={demoOrders}
            products={products}
            ownerMetaMap={ownerMetaMap}
            onUpdateOrder={handleUpdateDemoOrder}
            onDeleteOrder={handleDeleteDemoOrder}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetCatalog={handleResetCatalog}
            onUpdateSupplierMeta={handleUpdateSupplierMeta}
            onBackToStore={() => navigateToPage('home')}
          />
        ) : (
          <>
            <HeroBanner
              language={language}
              onToggleLanguage={setLanguage}
              onShopCollection={() => scrollToSection('catalog')}
              onBrowseCategories={() => scrollToSection('categories')}
              onSearchSubmit={(query) => {
                setSearchQuery(query);
                setSelectedCategory('All');
                scrollToSection('catalog');
              }}
            />

            <CategoryStrip
              language={language}
              products={publishedProducts}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            <CatalogSection
              language={language}
              products={publishedProducts}
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

            <SpecialOffersBanner
              language={language}
              onViewOffers={() => {
                setSelectedCategory('All');
                setSortBy('available');
                scrollToSection('catalog');
              }}
            />

            <WhyChooseTekkivo language={language} />

            <CustomerReviewsSection language={language} />

            <NewsletterSection language={language} />
          </>
        )}
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenOwnerPortal={() => navigateToPage('owner')}
        onOpenCart={() => navigateToPage('cart')}
      />

      {/* Interactive Drawers & Modals */}
      <SearchOverlay
        isOpen={isSearchOpen}
        products={publishedProducts}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={openProductDetail}
        onApplyToCatalog={(q) => {
          setSearchQuery(q);
          setSelectedCategory('All');
          scrollToSection('catalog');
        }}
      />

      <ProductDetailModal
        product={activeProduct}
        language={language}
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
    </div>
  );
}
