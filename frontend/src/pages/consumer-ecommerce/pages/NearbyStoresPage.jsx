import { Link } from 'react-router-dom';
import {
  LuApple,
  LuBaby,
  LuChevronLeft,
  LuHeartPulse,
  LuHouse,
  LuSearch,
  LuShirt,
  LuShoppingCart,
  LuSofa,
  LuStore,
  LuZap,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import NearbyStoreCard from '../components/NearbyStoreCard.jsx';
import { nearbyStores } from '../services/mockData.js';
import '../consumerEcommerce.css';

const nearbyCats = [
  ['All Stores', LuHouse],
  ['Grocery', LuShoppingCart],
  ['Fruits & Vegetables', LuApple],
  ['Fashion & Beauty', LuShirt],
  ['Electronics', LuZap],
  ['Furniture', LuSofa],
  ['Pharmacy', LuHeartPulse],
  ['Pet Supplies', LuBaby],
  ['Daily Needs', LuStore],
];

export default function NearbyStoresPage() {
  return (
    <div className="ce-app ce-nearby-page">
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Nearby Stores</h1>
          <p>Stores around Indiranagar</p>
        </div>
        <span><LuStore /></span>
      </header>

      <main className="ce-nearby-shell">
        <aside className="ce-nearby-rail">
          {nearbyCats.map(([label, Icon], index) => (
            <button key={label} className={index === 0 ? 'active' : ''}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <section className="ce-nearby-content">
          <label className="ce-nearby-search">
            <LuSearch />
            <input placeholder="Search nearby stores" />
          </label>

          <div className="ce-nearby-heading">
            <h2>Stores near you</h2>
            <span>{nearbyStores.length} found</span>
          </div>

          <div className="ce-nearby-store-list">
            {nearbyStores.map((store) => (
              <NearbyStoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
