import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LuBaby,
  LuChevronLeft,
  LuHeartHandshake,
  LuHouse,
  LuList,
  LuMic,
  LuPackageCheck,
  LuReceiptText,
  LuRotateCcw,
  LuSearch,
  LuShirt,
  LuShoppingBag,
  LuSmartphone,
  LuSofa,
  LuSparkles,
  LuTruck,
  LuUser,
  LuShoppingBasket,
  LuActivity,
  LuHeart,
  LuPlane,
  LuTicket,
  LuShieldCheck,
  LuLeaf,
  LuGamepad,
  LuLaptop,
  LuGift,
  LuCar,
  LuPenTool,
  LuBookOpen,
  LuWrench,
  LuCpu,
  LuShoppingCart,
  LuStore,
  LuTag,
  LuX,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL =
  process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

const TOP_CATS_STATIC = [
  ['Top Picks', LuShoppingBag],
  ['Gold & Silver', LuSparkles],
  ['Electronics', LuSmartphone],
  ['Daily Needs', LuShoppingBasket],
  ['Kids & Toys', LuBaby],
  ['Fashion & Beauty', LuShirt],
  ['Sports', LuActivity],
  ['Furniture', LuSofa],
  ['More', LuList],
];

const getCatIcon = (name) => {
  const n = String(name || '').toLowerCase();
  if (n.includes('elect') || n.includes('gadget') || n.includes('device')) return LuSmartphone;
  if (n.includes('fashion') || n.includes('cloth') || n.includes('shirt')) return LuShirt;
  if (n.includes('grocer') || n.includes('daily') || n.includes('kirana')) return LuShoppingBasket;
  if (n.includes('furniture') || n.includes('sofa') || n.includes('home')) return LuSofa;
  if (n.includes('kid') || n.includes('toy') || n.includes('baby')) return LuBaby;
  if (n.includes('sport') || n.includes('fitness') || n.includes('gym')) return LuActivity;
  if (n.includes('book') || n.includes('station')) return LuBookOpen;
  if (n.includes('gift')) return LuGift;
  if (n.includes('car') || n.includes('auto')) return LuCar;
  return LuTag;
};

function addToCart(product) {
  try {
    let cart = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"shopId":null,"shopName":"","items":[]}');
      if (cart.shopId && String(cart.shopId) !== String(product.shop_id)) {
        const confirmed = window.confirm(
          `Your cart has items from "${cart.shopName}". Starting a new cart will remove them. Continue?`
        );
        if (!confirmed) return false;
        cart = { shopId: product.shop_id, shopName: product.shop_name || 'Online Shop', items: [], orderChannel: 'ONLINE_DELIVERY' };
      }
    if (!cart.shopId) {
      cart.shopId = product.shop_id;
      cart.shopName = product.shop_name || 'Online Shop';
      cart.orderChannel = 'ONLINE_DELIVERY';
    }
    const existing = cart.items.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        image: product.image || product.image_url || FALLBACK_IMAGE,
        quantity: 1,
      });
    }
    localStorage.setItem('tri_consumer_cart', JSON.stringify(cart));
    return true;
  } catch (_) {
    return false;
  }
}

function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const img = product.image || product.image_url || FALLBACK_IMAGE;

  return (
    <div className="ce-online-product" style={{ position: 'relative', cursor: 'pointer', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
      <div 
        style={{ width: '100%', paddingTop: '100%', position: 'relative', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
        onClick={() => navigate(`/consumer-ecommerce/product/${product.id}`)}
      >
        <img
          src={img}
          alt={product.title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: '10px' }}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        {hasDiscount && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: '#ef4444', color: '#fff',
            fontSize: '0.65rem', fontWeight: 800,
            padding: '4px 8px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
          }}>
            {Math.round(product.discount_percent)}% OFF
          </span>
        )}
      </div>
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}
          onClick={() => navigate(`/consumer-ecommerce/product/${product.id}`)}
        >
          {product.title}
        </h3>
        {product.shop_name && (
          <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
            <LuStore size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#ea580c' }} />
            {product.shop_name}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <strong style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 900 }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </strong>
          {hasDiscount && product.mrp > product.price && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onAdd(product)}
        style={{
          width: 'calc(100% - 24px)', margin: '0 12px 12px',
          padding: '8px 0', borderRadius: '8px',
          background: '#f97316',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontWeight: 800, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#ea580c'}
        onMouseOut={(e) => e.currentTarget.style.background = '#f97316'}
      >
        <LuShoppingCart size={15} /> Add to Cart
      </button>
    </div>
  );
}

const rail = [
  ['Orders', LuReceiptText],
  ['Buy Again', LuRotateCcw],
  ['Account', LuUser],
  ['Lists', LuList],
  ['Tri Pay', LuPackageCheck],
  ['Tri Zone', LuHeartHandshake],
  ['Online Shop', LuShoppingBag],
  ['Near Store', LuHouse],
  ['Grocery', LuShoppingBasket],
  ['Pharmacy', LuActivity],
  ['Pet Care', LuHeart],
  ['Recharge', LuSmartphone],
  ['Bill Payments', LuReceiptText],
  ['Travel', LuPlane],
  ['Tickets', LuTicket],
  ['Insurance', LuShieldCheck],
  ['Fresh Veggies', LuLeaf],
  ['Gaming Zone', LuGamepad],
  ['Digital Hub', LuLaptop],
  ['Gift Store', LuGift],
  ['Furniture', LuSofa],
  ['Auto Gear', LuCar],
  ['Baby Care', LuBaby],
  ['Stationery', LuPenTool],
  ['Books', LuBookOpen],
  ['Local Services', LuWrench],
  ['Device Repair', LuCpu],
  ['Laundry', LuShirt],
  ['Courier', LuTruck],
];

/* ─── Skeleton card ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      background: '#f1f5f9', border: '1px solid #e2e8f0',
    }}>
      <div style={{ height: 140, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '8px 10px 12px' }}>
        <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, width: '60%', marginBottom: 8 }} />
        <div style={{ height: 18, background: '#fed7aa', borderRadius: 6, width: '40%' }} />
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ search, category, onClear }) {
  return (
    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 16px' }}>
      <LuShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
      <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', margin: '0 0 6px' }}>
        {search ? `No results for "${search}"` : category ? `No products in "${category}"` : 'No products available'}
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px' }}>
        {search || category ? 'Try a different search or category' : 'Check back soon'}
      </p>
      {(search || category) && (
        <button
          onClick={onClear}
          style={{
            padding: '8px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg,#ea580c,#f97316)',
            color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer',
          }}
        >
          Show all products
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DeliveryPage() {
  const [categories, setCategories]   = useState([]);
  const [products, setProducts]       = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [activeCat, setActiveCat]     = useState('');   // '' = All
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cartCount, setCartCount]     = useState(0);
  const [toast, setToast]             = useState('');
  const searchTimerRef                = useRef(null);

  /* ── cart count badge ─────────────────────────────────────────────────── */
  useEffect(() => {
    const sync = () => {
      try {
        const c = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"items":[]}');
        setCartCount(c.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0);
      } catch { setCartCount(0); }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  /* ── fetch categories ─────────────────────────────────────────────────── */
  useEffect(() => {
    setLoadingCats(true);
    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/categories`)
      .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  /* ── fetch products ───────────────────────────────────────────────────── */
  const fetchProducts = useCallback((cat, q) => {
    setLoadingProds(true);
    const params = new URLSearchParams({ limit: 60, offset: 0 });
    if (cat) params.set('category', cat);
    if (q)   params.set('search', q);
    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/products?${params}`)
      .then(r => {
        const arr = Array.isArray(r.data) ? r.data
          : Array.isArray(r.data?.products) ? r.data.products
          : Array.isArray(r.data?.results)  ? r.data.results
          : [];
        setProducts(arr);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProds(false));
  }, []);

  useEffect(() => { fetchProducts(activeCat, search); }, [activeCat, search, fetchProducts]);

  /* ── debounced search ─────────────────────────────────────────────────── */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearch(val.trim()), 400);
  };

  /* ── add to cart ──────────────────────────────────────────────────────── */
  const handleAdd = (product) => {
    const ok = addToCart(product);
    if (ok) {
      setToast(`"${product.title}" added to cart`);
      setCartCount(c => c + 1);
      setTimeout(() => setToast(''), 2200);
    }
  };

  const handleClear = () => { setActiveCat(''); setSearch(''); setSearchInput(''); };

  /* ── dynamic category pills (API categories only) ─────────────────────── */
  const catPills = loadingCats ? [] : categories;

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className="ce-app ce-online-page">
      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .ce-cat-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 14px;
          border-radius:999px; border:1.5px solid #e2e8f0; background:#fff;
          font-size:0.78rem; font-weight:700; color:#475569; cursor:pointer;
          white-space:nowrap; transition:all .15s; flex-shrink:0; }
        .ce-cat-pill:hover,.ce-cat-pill.active { border-color:#ea580c; background:#fff7ed; color:#ea580c; }
        .ce-toast-bar { position:fixed; bottom:72px; left:50%; transform:translateX(-50%);
          background:#0f172a; color:#fff; padding:10px 20px; border-radius:999px;
          font-size:0.82rem; font-weight:700; z-index:9999;
          animation:slideUp .25s ease; pointer-events:none; white-space:nowrap; }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* Header */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Online Shop</h1>
          <p>Products &amp; daily deals</p>
        </div>
        <Link to="/consumer-ecommerce/cart" style={{ position: 'relative', color: 'inherit' }}>
          <LuShoppingCart size={22} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#ea580c', color: '#fff',
              fontSize: '0.6rem', fontWeight: 900,
              borderRadius: '50%', width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </Link>
      </header>

      <main className="ce-online-shell">
        {/* Left rail nav */}
        <aside className="ce-online-rail" style={{ overflowY: 'auto' }}>
          <Link to="/consumer-ecommerce/my-orders">
            <LuReceiptText /><span>Orders</span>
          </Link>
          <Link to="/consumer-ecommerce/tri-zone">
            <LuHeartHandshake /><span>Tri Zone</span>
          </Link>
          <Link to="/consumer-ecommerce/delivery" className="active">
            <LuShoppingBag /><span>Online Shop</span>
          </Link>

          <div style={{ margin: '16px 16px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</div>
          
          <div 
            onClick={() => { setActiveCat(''); setSearch(''); fetchProducts('', ''); }}
            className={activeCat === '' ? 'active' : ''}
            style={{ 
              display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 12, cursor: 'pointer', 
              color: activeCat === '' ? '#ea580c' : '#475569', 
              fontWeight: activeCat === '' ? 800 : 600, 
              background: activeCat === '' ? '#fff7ed' : 'transparent', 
              borderRight: activeCat === '' ? '3px solid #ea580c' : '3px solid transparent' 
            }}
          >
            <LuList size={20} />
            <span style={{ fontSize: '0.8rem' }}>All Products</span>
          </div>

          {categories.map((c) => {
            const Icon = getCatIcon(c.name);
            const isActive = activeCat === c.name;
            return (
              <div
                key={c.id || c.name}
                onClick={() => { setActiveCat(c.name); setSearch(''); fetchProducts(c.name, ''); }}
                className={isActive ? 'active' : ''}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 12, cursor: 'pointer', 
                  color: isActive ? '#ea580c' : '#475569', 
                  fontWeight: isActive ? 800 : 600, 
                  background: isActive ? '#fff7ed' : 'transparent', 
                  borderRight: isActive ? '3px solid #ea580c' : '3px solid transparent' 
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <section className="ce-online-content">

          {/* Search bar */}
          <label className="ce-online-search">
            <LuSearch />
            <input
              placeholder="Search products, brands…"
              value={searchInput}
              onChange={handleSearchChange}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <LuX size={16} style={{ color: '#94a3b8' }} />
              </button>
            )}
            <LuMic />
          </label>

          {/* Perks strip */}
          <div className="ce-online-perks">
            {[
              ['Free Delivery', LuTruck],
              ['Easy Returns', LuRotateCcw],
              ['Pay on Delivery', LuPackageCheck],
              ['Top Brands', LuSparkles],
            ].map(([label, Icon]) => (
              <span key={label}><Icon />{label}</span>
            ))}
          </div>

          {/* Category pills */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6,
            scrollbarWidth: 'none', margin: '8px 0',
          }}>
            <button
              className={`ce-cat-pill${activeCat === '' ? ' active' : ''}`}
              onClick={() => setActiveCat('')}
            >
              <LuShoppingBag size={13} /> All
            </button>
            {catPills.map((cat) => {
              const name = typeof cat === 'string' ? cat : cat.name || cat;
              const Icon = getCatIcon(name);
              return (
                <button
                  key={name}
                  className={`ce-cat-pill${activeCat === name ? ' active' : ''}`}
                  onClick={() => setActiveCat(activeCat === name ? '' : name)}
                >
                  <Icon size={13} /> {name}
                </button>
              );
            })}
          </div>

          {/* Active filter indicator */}
          {(activeCat || search) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px', flexWrap: 'wrap' }}>
              {activeCat && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  fontSize: '0.75rem', fontWeight: 700, color: '#ea580c',
                }}>
                  {activeCat}
                  <LuX size={11} style={{ cursor: 'pointer' }} onClick={() => setActiveCat('')} />
                </span>
              )}
              {search && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  fontSize: '0.75rem', fontWeight: 700, color: '#16a34a',
                }}>
                  "{search}"
                  <LuX size={11} style={{ cursor: 'pointer' }} onClick={() => { setSearch(''); setSearchInput(''); }} />
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                {loadingProds ? '…' : `${products.length} result${products.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* Product grid */}
          <section className="ce-online-section" style={{ marginTop: 4 }}>
            {!activeCat && !search && (
              <div className="ce-online-section-head" style={{ marginBottom: 10 }}>
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>
                  {loadingProds ? 'Loading products…' : `All Online Products (${products.length})`}
                </h2>
              </div>
            )}

            <div className="ce-online-product-grid">
              {loadingProds
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : products.length === 0
                  ? <EmptyState search={search} category={activeCat} onClear={handleClear} />
                  : products.map((product) => (
                      <ProductCard key={product.id} product={product} onAdd={handleAdd} />
                    ))
              }
            </div>
          </section>

        </section>
      </main>

      {/* Toast */}
      {toast && <div className="ce-toast-bar">{toast}</div>}

      <BottomNav />
    </div>
  );
}