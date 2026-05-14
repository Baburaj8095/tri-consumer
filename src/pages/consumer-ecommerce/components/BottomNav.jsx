import { NavLink } from 'react-router-dom';
import {
  LuHouse,
  LuScanLine,
  LuShoppingBag,
  LuStore,
  LuBoxes,
} from 'react-icons/lu';

const tabs = [
  { label: 'Home', icon: LuHouse, to: '/consumer-ecommerce' },
  { label: 'Tri Zone', icon: LuBoxes, to: '/consumer-ecommerce/tri-zone' },
  { label: 'Scanner', icon: LuScanLine, to: '/consumer-ecommerce/scanner', center: true },
  { label: 'Online', icon: LuShoppingBag, to: '/consumer-ecommerce/delivery' },
  { label: 'Nearby', icon: LuStore, to: '/consumer-ecommerce/nearby-stores' },
];

export default function BottomNav({ activeLabel }) {
  return (
    <nav className="ce-bottom-nav">
      <div className="ce-bottom-inner">
        {tabs.map(({ label, icon: Icon, to, badge, center }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/consumer-ecommerce'}
            className={({ isActive }) =>
              `ce-bottom-tab ${center ? 'ce-bottom-tab-center' : ''} ${(activeLabel ? activeLabel === label : isActive) ? 'ce-bottom-tab-active' : ''}`
            }
          >
            <span className="ce-bottom-icon-wrap">
              <Icon className="ce-bottom-icon" />
              {badge && <span className="ce-bottom-badge">{badge}</span>}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
