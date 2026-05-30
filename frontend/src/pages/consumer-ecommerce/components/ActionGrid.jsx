import { Link } from 'react-router-dom';
import {
  LuBadgePercent,
  LuGlobe,
  LuPackageCheck,
  LuTruck,
} from 'react-icons/lu';

const actions = [
  {
    id: 1,
    title: 'Trizone Shopping',
    subtitle: 'Member-only finds',
    icon: LuBadgePercent,
    link: '/consumer-ecommerce',
  },
  {
    id: 2,
    title: 'Delivery Tracking',
    subtitle: 'Follow your order',
    icon: LuTruck,
    link: '/consumer-ecommerce/delivery',
  },
  {
    id: 3,
    title: 'Online Shopping',
    subtitle: 'Premium picks',
    icon: LuGlobe,
    link: '/consumer-ecommerce/delivery',
  },
  {
    id: 4,
    title: 'Private Delivery Tracking',
    subtitle: 'Secure tracking',
    icon: LuPackageCheck,
    link: '/consumer-ecommerce/delivery',
  },
];

export default function ActionGrid() {
  return (
    <section className="ce-content-section">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Helpful shortcuts</h2>
          <p className="ce-section-subtitle">Fast actions for everyday shopping</p>
        </div>
      </div>
      <div className="ce-action-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.id} to={action.link} className="ce-action-grid-btn">
              <span className="ce-action-grid-icon"><Icon /></span>
              <span>
                <strong>{action.title}</strong>
                <small>{action.subtitle}</small>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
