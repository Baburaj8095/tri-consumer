import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlineDocumentPlus, 
  HiOutlineSquare3Stack3D, 
  HiOutlineQrCode, 
  HiOutlineChartBar, 
  HiOutlineArrowTrendingUp,
  HiOutlinePlus,
  HiOutlineClock
} from 'react-icons/hi2';
import '../consumerEcommerce.css';

const stats = [
  { id: 1, label: 'Total Items', value: '1,284', color: '#3b82f6' },
  { id: 2, label: 'Low Stock', value: '12', color: '#ef4444' },
  { id: 3, label: 'Revenue (MTD)', value: '₹4.2L', color: '#10b981' },
];

const recentInvoices = [
  { id: 'INV-001', customer: 'Rahul Sharma', amount: '₹1,250', status: 'Paid', time: '10 mins ago' },
  { id: 'INV-002', customer: 'Anita Singh', amount: '₹450', status: 'Pending', time: '1 hour ago' },
  { id: 'INV-003', customer: 'Kirana Store', amount: '₹12,400', status: 'Paid', time: '3 hours ago' },
];

export default function TriInventoryBillingPage() {
  const navigate = useNavigate();

  return (
    <div className="ce-app">
      <header className="ce-header">
        <div className="ce-header-inner">
          <button onClick={() => navigate(-1)} className="ce-icon-btn" aria-label="Go back">
            <HiOutlineArrowLeft />
          </button>
          <div className="ce-header-title-container" style={{ marginLeft: '10px' }}>
            <h1 className="ce-header-title" style={{ fontSize: '18px' }}>Inventory & Billing</h1>
            <span className="ce-header-subtitle">Manage your shop operations</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="ce-icon-btn ce-icon-btn-sm" style={{ background: 'var(--ce-primary)', color: '#fff' }}>
              <HiOutlinePlus />
            </button>
          </div>
        </div>
      </header>

      <main className="ce-container" style={{ paddingTop: '80px', paddingBottom: '30px' }}>
        {/* Stats Row */}
        <section className="ce-section-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {stats.map(stat => (
            <div key={stat.id} style={{ background: '#fff', padding: '12px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--ce-shadow)' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: 'var(--ce-muted)', textTransform: 'uppercase' }}>{stat.label}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '900', color: stat.color }}>{stat.value}</h3>
            </div>
          ))}
        </section>

        {/* Quick Actions Grid */}
        <div className="ce-section-heading-row" style={{ marginBottom: '12px' }}>
          <h2 className="ce-section-title" style={{ fontSize: '15px' }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <button style={{ background: '#fff', border: '1px solid var(--ce-soft)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <HiOutlineDocumentPlus />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ce-text)' }}>New Invoice</span>
          </button>
          <button style={{ background: '#fff', border: '1px solid var(--ce-soft)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <HiOutlineSquare3Stack3D />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ce-text)' }}>Add Stock</span>
          </button>
          <button style={{ background: '#fff', border: '1px solid var(--ce-soft)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <HiOutlineQrCode />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ce-text)' }}>Barcode Scan</span>
          </button>
          <button style={{ background: '#fff', border: '1px solid var(--ce-soft)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <HiOutlineChartBar />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ce-text)' }}>GSTR Reports</span>
          </button>
        </div>

        {/* Recent Invoices */}
        <div className="ce-section-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="ce-section-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineClock style={{ fontSize: '14px', opacity: 0.6 }} /> Recent Invoices
          </h2>
          <button style={{ background: 'transparent', border: 0, color: 'var(--ce-primary)', fontSize: '12px', fontWeight: '800' }}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentInvoices.map(inv => (
            <div key={inv.id} style={{ background: '#fff', padding: '14px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--ce-soft)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--ce-text)' }}>{inv.customer}</span>
                <span style={{ fontSize: '11px', color: 'var(--ce-muted)', fontWeight: '600' }}>{inv.id} • {inv.time}</span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--ce-text)' }}>{inv.amount}</span>
                <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', background: inv.status === 'Paid' ? '#f0fdf4' : '#fff7ed', color: inv.status === 'Paid' ? '#16a34a' : '#ea580c', display: 'inline-block' }}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Card */}
        <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', borderRadius: '20px', padding: '20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>Monthly Analytics</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>Your sales grew by 15% this week!</p>
            <button style={{ marginTop: '16px', background: '#fff', color: 'var(--ce-primary)', border: 0, padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineArrowTrendingUp /> View Detailed Report
            </button>
          </div>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '100px', opacity: 0.1 }}>
            <HiOutlineArrowTrendingUp />
          </div>
        </div>
      </main>
    </div>
  );
}
