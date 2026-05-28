import { Link } from 'react-router-dom';
import {
  LuBriefcaseBusiness,
  LuBus,
  LuChevronLeft,
  LuGraduationCap,
  LuHeartPulse,
  LuHouse,
  LuMic,
  LuPackage,
  LuScanLine,
  LuSearch,
  LuShoppingBag,
  LuSprout,
  LuTruck,
  LuUtensils,
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const rail = ['Home', 'Categories', 'Bag', 'Orders', 'Buy Again', 'Account', 'Tri Pay', 'Online Shop', 'Near Store'];

const top = [
  ['Top Picks', LuShoppingBag],
  ['Tri Services', LuTruck],
  ['Daily Needs', LuPackage],
  ['Finance', LuBriefcaseBusiness],
  ['Community', LuHeartPulse],
];

const services = [
  ['Tri Pay', 'Secure payments and transfers', LuShoppingBag],
  ['Tri Delivery', 'Fast delivery services', LuTruck],
  ['Tri Eat', 'Order food online', LuUtensils],
  ['Tri Travel', 'Book tickets & hotels', LuBus],
  ['Tri Health', 'Medicine & healthcare', LuHeartPulse],
  ['Tri Education', 'Courses & learning', LuGraduationCap],
];

const cats = [
  ['Fashion', LuShoppingBag],
  ['Electronics', LuPackage],
  ['Home', LuHouse],
  ['Beauty', LuHeartPulse],
  ['Sports', LuSprout],
  ['More', LuPackage],
];

export default function TriZonePage() {
  return (
    <div className="ce-app ce-zone-page">
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Tri Zone</h1>
          <p>Everything you need, in one zone</p>
        </div>
        <span><LuShoppingBag /></span>
      </header>

      <main className="ce-zone-shell">
        <aside className="ce-zone-rail">
          {rail.map((item, index) => (
            <Link key={item} className={index === 0 ? 'active' : ''} to="/consumer-ecommerce/tri-zone">
              <span>{item}</span>
            </Link>
          ))}
        </aside>

        <section className="ce-zone-content">
          <label className="ce-zone-search">
            <LuSearch />
            <input placeholder="Search services, products & more..." />
            <LuScanLine />
            <LuMic />
          </label>

          <div className="ce-zone-top-row">
            {top.map(([label, Icon]) => (
              <button key={label}><Icon /><span>{label}</span></button>
            ))}
          </div>

          <section className="ce-zone-service-grid">
            {services.map(([title, copy, Icon]) => (
              <Link key={title} to="/consumer-ecommerce/delivery">
                <Icon />
                <strong>{title}</strong>
                <span>{copy}</span>
              </Link>
            ))}
          </section>

          <section className="ce-zone-section">
            <div>
              <h2>Explore Categories</h2>
              <Link to="/consumer-ecommerce/delivery">View all</Link>
            </div>
            <div className="ce-zone-category-row">
              {cats.map(([label, Icon]) => (
                <button key={label}><Icon /><span>{label}</span></button>
              ))}
            </div>
          </section>

          <section className="ce-zone-offer">
            <div>
              <span>Special Offers</span>
              <h2>Up to 60% Off</h2>
              <p>On top services</p>
              <button>Explore Now</button>
            </div>
            <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=320&q=80" alt="" />
          </section>

          <div className="ce-zone-perks">
            {['Free Delivery', 'Best Quality', 'Easy Returns', 'Secure Payments'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
