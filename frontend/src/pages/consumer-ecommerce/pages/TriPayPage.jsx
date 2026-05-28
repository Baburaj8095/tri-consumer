import {
  LuBadgeIndianRupee,
  LuBanknote,
  LuBus,
  LuCreditCard,
  LuGift,
  LuHotel,
  LuLandmark,
  LuLightbulb,
  LuPlane,
  LuQrCode,
  LuReceiptIndianRupee,
  LuScanLine,
  LuSend,
  LuShieldCheck,
  LuSmartphone,
  LuTicketPercent,
  LuTrainFront,
  LuWalletCards,
} from 'react-icons/lu';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const quickActions = [
  ['Tri Pay UPI', LuBadgeIndianRupee],
  ['Balance', LuWalletCards],
  ['Pay Later', LuBanknote],
  ['Saved Cards', LuCreditCard],
  ['Vouchers', LuTicketPercent],
];

const rewards = [
  ['Cashback Earned', 'Rs. 0', LuGift],
  ['Offers Collected', '0', LuTicketPercent],
  ['Scratch Cards', '0', LuShieldCheck],
];

const transfer = [
  ['Scan Any QR', LuScanLine],
  ['Send Money', LuSend],
  ['Self Transfer', LuQrCode],
  ['Add to Wallet', LuWalletCards],
];

const earn = [
  ['Mobile Recharge', LuSmartphone],
  ['Pay Bills', LuReceiptIndianRupee],
  ['Travel', LuPlane],
  ['Gift Cards', LuGift],
];

const bills = [
  ['Mobile Recharge', LuSmartphone],
  ['Electricity', LuLightbulb],
  ['DTH Recharge', LuReceiptIndianRupee],
  ['Landline', LuSmartphone],
  ['More', LuQrCode],
];

const travel = [
  ['Flights', LuPlane],
  ['Trains', LuTrainFront],
  ['Hotels', LuHotel],
  ['Bus', LuBus],
  ['More', LuQrCode],
];

function UtilityRow({ title, action = 'View all', items }) {
  return (
    <section className="ce-pay-section">
      <div className="ce-pay-section-head">
        <h2>{title}</h2>
        <span>{action}</span>
      </div>
      <div className="ce-pay-icon-row">
        {items.map(([label, Icon]) => (
          <button key={label} className="ce-pay-icon-tile">
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function TriPayPage() {
  return (
    <div className="ce-app ce-tripay-page ce-pay-wireframe">
      <Header />
      <main className="ce-container">
        <section className="ce-pay-balance-card">
          <div>
            <span>Tri Pay Balance</span>
            <h1>Rs. 2,450.00</h1>
            <button>View Details</button>
          </div>
          <div className="ce-pay-balance-side">
            <button>+ Add Money</button>
            <strong>Flat Rs.50 Cashback</strong>
          </div>
        </section>

        <section className="ce-pay-section">
          <h2 className="ce-pay-standalone-title">Quick Actions</h2>
          <div className="ce-pay-quick-grid">
            {quickActions.map(([label, Icon]) => (
              <button key={label} className="ce-pay-quick-tile">
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="ce-pay-section">
          <div className="ce-pay-section-head">
            <h2>Your Rewards</h2>
            <span>View all</span>
          </div>
          <div className="ce-pay-reward-grid">
            {rewards.map(([label, value, Icon]) => (
              <article key={label}>
                <Icon />
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <UtilityRow title="Money Transfer" action="See more" items={transfer} />
        <UtilityRow title="Earn Rewards Every Time You Pay" action="" items={earn} />
        <UtilityRow title="Recharge & Bill Payments" items={bills} />
        <UtilityRow title="Travel" items={travel} />

        <section className="ce-pay-section ce-pay-gift-scan">
          <div>
            <div className="ce-pay-section-head">
              <h2>Gift Cards & Vouchers</h2>
            </div>
            <div className="ce-pay-icon-row">
              {[
                ['All Gift Cards', LuGift],
                ['Brand Gift Cards', LuTicketPercent],
                ['Tri Vouchers', LuReceiptIndianRupee],
                ['More', LuQrCode],
              ].map(([label, Icon]) => (
                <button key={label} className="ce-pay-icon-tile">
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="ce-pay-scan-card">
            <span>Scan & Pay</span>
            <small>Any QR</small>
            <LuQrCode />
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
