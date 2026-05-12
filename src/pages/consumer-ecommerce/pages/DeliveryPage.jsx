import { Link } from 'react-router-dom';
import {
  LuBaby,
  LuCamera,
  LuChevronLeft,
  LuChevronRight,
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
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import { products } from '../services/mockData.js';
import '../consumerEcommerce.css';

const rail = [
  ['Orders', LuReceiptText],
  ['Buy Again', LuRotateCcw],
  ['Account', LuUser],
  ['Lists', LuList],
  ['Tri Pay', LuPackageCheck],
  ['Tri Zone', LuHeartHandshake],
  ['Online Shop', LuShoppingBag],
  ['Near Store', LuHouse],
];

const topCats = [
  ['Top Picks', LuShoppingBag],
  ['Gold & Silver', LuSparkles],
  ['Electronics', LuSmartphone],
  ['Daily Needs', LuShoppingBag],
  ['Kids & Toys', LuBaby],
  ['Fashion & Beauty', LuShirt],
  ['Sports', LuSparkles],
  ['Furniture', LuSofa],
  ['More', LuList],
];

function ProductMini({ product }) {
  return (
    <Link to={`/consumer-ecommerce/product/${product.id}`} className="ce-online-product">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <strong>{product.newPrice}</strong>
      <span>{product.discount}</span>
    </Link>
  );
}

export default function DeliveryPage() {
  return (
    <div className="ce-app ce-online-page">
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Online Shop</h1>
          <p>Products, brands and daily deals</p>
        </div>
        <span><LuShoppingBag /></span>
      </header>
      <main className="ce-online-shell">
        <aside className="ce-online-rail">
          {rail.map(([label, Icon]) => (
            <Link key={label} to={label === 'Tri Zone' ? '/consumer-ecommerce/tri-zone' : '/consumer-ecommerce/delivery'} className={label === 'Online Shop' ? 'active' : ''}>
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </aside>

        <section className="ce-online-content">
          <label className="ce-online-search">
            <LuSearch />
            <input placeholder="Search for products, brands and more..." />
            <LuCamera />
            <LuMic />
          </label>

          <div className="ce-online-top-cats">
            {topCats.map(([label, Icon]) => (
              <button key={label}>
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <section className="ce-online-sale-banner">
            <div>
              <h2>Mega Sale</h2>
              <p>Up to 70% Off On Bestsellers</p>
              <button>Shop Now <LuChevronRight /></button>
            </div>
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=280&q=80" alt="" />
          </section>

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

          <section className="ce-online-section">
            <div className="ce-online-section-head">
              <h2>Shop by Category</h2>
              <Link to="/consumer-ecommerce/delivery">View all</Link>
            </div>
            <div className="ce-online-category-row">
              {topCats.slice(1, 7).map(([label, Icon]) => (
                <button key={label}><Icon /><span>{label}</span></button>
              ))}
            </div>
          </section>

          <section className="ce-online-section">
            <div className="ce-online-section-head">
              <h2>Best Selling Products</h2>
              <Link to="/consumer-ecommerce/delivery">View all</Link>
            </div>
            <div className="ce-online-product-grid">
              {products.slice(0, 3).map((product) => (
                <ProductMini key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="ce-online-section">
            <div className="ce-online-section-head">
              <h2>Deals of the Day</h2>
              <Link to="/consumer-ecommerce/delivery">View all</Link>
            </div>
            <div className="ce-online-product-grid compact">
              {products.map((product) => (
                <ProductMini key={`deal-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
