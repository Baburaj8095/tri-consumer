import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLocationCrosshairs, FaMagnifyingGlass, FaLocationDot, FaHotel, FaWrench, FaStethoscope, FaUtensils, FaScissors } from 'react-icons/fa6';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const services = [
  { id: 1, name: 'Hotels & Stay', icon: FaHotel, color: '#3b82f6' },
  { id: 2, name: 'Restaurants', icon: FaUtensils, color: '#f59e0b' },
  { id: 3, name: 'Mechanics', icon: FaWrench, color: '#64748b' },
  { id: 4, name: 'Clinics', icon: FaStethoscope, color: '#ef4444' },
  { id: 5, name: 'Salons', icon: FaScissors, color: '#d946ef' },
];

export default function NearMePage() {
  return (
    <div className="ce-app">
      <header className="ce-header">
        <div className="ce-header-inner ce-page-header-inner" style={{ gridTemplateColumns: '42px minmax(0, 1fr) auto', display: 'grid', alignItems: 'center', gap: '6px' }}>
          <Link to="/consumer-ecommerce" className="ce-icon-btn" aria-label="Back to dashboard">
            <FaArrowLeft />
          </Link>
          <div className="ce-page-title-wrap" style={{ textAlign: 'center' }}>
            <h1 className="ce-delivery-title" style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Near Me</h1>
            <p className="ce-delivery-location" style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FaLocationCrosshairs style={{ color: '#fff' }} />
              Search services around you
            </p>
          </div>
          <span className="ce-icon-btn ce-icon-btn-primary" aria-hidden="true" style={{ background: 'rgba(255, 255, 255, 0.14)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <FaLocationDot />
          </span>
        </div>
      </header>

      <main className="ce-container">
        <label className="ce-delivery-search">
          <FaMagnifyingGlass className="ce-primary-text" />
          <input className="ce-input" placeholder="Search hotels, services, etc." style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, padding: '8px 0' }} />
        </label>

        <section className="ce-delivery-section" style={{ marginTop: '20px' }}>
          <h2 className="ce-section-title" style={{ marginBottom: '16px' }}>Categories</h2>
          <div className="services-scroll">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                  <service.icon size={24} />
                </div>
                <span className="service-name">{service.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
