import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineGlobeAlt, 
  HiOutlineQrCode, 
  HiOutlineGift, 
  HiOutlineEllipsisHorizontal 
} from 'react-icons/hi2';

const tabs = [
  { label: 'Home', icon: HiOutlineHome, to: '/consumer-ecommerce' },
  { label: 'Online', icon: HiOutlineGlobeAlt, to: '/consumer-ecommerce/delivery' },
  { label: 'Scanner', icon: HiOutlineQrCode, to: '/consumer-ecommerce/scanner' },
  { label: 'Tri Zone', icon: HiOutlineGift, to: '/consumer-ecommerce/tri-zone' },
  { label: 'More', icon: HiOutlineEllipsisHorizontal, to: '/consumer-ecommerce/more' },
];

export default function BottomNav() {
  return (
    <nav className="ce-bottom-nav">
      <div className="ce-bottom-inner">
        {tabs.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/consumer-ecommerce'}
            className={({ isActive }) =>
              `ce-bottom-tab ${isActive ? 'ce-bottom-tab-active' : ''}`
            }
          >
            <Icon className="ce-bottom-icon" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
