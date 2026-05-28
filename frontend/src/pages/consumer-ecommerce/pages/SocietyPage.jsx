import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LuChevronLeft, 
  LuUsers, 
  LuGraduationCap, 
  LuCompass, 
  LuCalendar, 
  LuLifeBuoy, 
  LuHeartHandshake 
} from 'react-icons/lu';
import { 
  FaYoutube, 
  FaWhatsapp, 
  FaInstagram, 
  FaFacebook, 
  FaTelegram 
} from 'react-icons/fa';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

export default function SocietyPage() {
  const navigate = useNavigate();

  const societyFeatures = [
    {
      id: 'meeting',
      title: 'Meeting',
      subtitle: 'Community Call',
      icon: LuUsers,
      color: '#6366F1', 
      bg: 'rgba(99, 102, 241, 0.08)',
      desc: 'Join weekly discussions & town halls',
      action: () => alert('Initiating community meeting setup...'),
    },
    {
      id: 'training',
      title: 'Training',
      subtitle: 'Skills & Resources',
      icon: LuGraduationCap,
      color: '#06B6D4', 
      bg: 'rgba(6, 182, 212, 0.08)',
      desc: 'Skill development programs & guides',
      action: () => alert('Opening community training resources...'),
    },
    {
      id: 'career',
      title: 'Career Guidance',
      subtitle: 'Mentorship & Support',
      icon: LuCompass,
      color: '#10B981', 
      bg: 'rgba(16, 185, 129, 0.08)',
      desc: 'Connect with career mentors & advisors',
      action: () => alert('Connecting with career counselors...'),
    },
    {
      id: 'events',
      title: 'Events',
      subtitle: 'Upcoming Drives',
      icon: LuCalendar,
      color: '#F43F5E', 
      bg: 'rgba(244, 63, 94, 0.08)',
      desc: 'Explore social drives & gatherings',
      action: () => alert('Loading upcoming community events...'),
    },
    {
      id: 'helpdesk',
      title: 'Helpdesk',
      subtitle: 'Support Center',
      icon: LuLifeBuoy,
      color: '#F59E0B', 
      bg: 'rgba(245, 158, 11, 0.08)',
      desc: '24/7 volunteer & administrative support',
      action: () => alert('Opening helpdesk support center...'),
    },
    {
      id: 'youtube',
      title: 'YouTube',
      subtitle: 'Watch Initiatives',
      icon: FaYoutube,
      color: '#EF4444', 
      bg: 'rgba(239, 68, 68, 0.08)',
      desc: 'Subscribe to our informative videos',
      action: () => window.open('https://youtube.com', '_blank'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Connect Instantly',
      icon: FaWhatsapp,
      color: '#22C55E', 
      bg: 'rgba(34, 197, 94, 0.08)',
      desc: 'Join the instant chat community group',
      action: () => window.open('https://whatsapp.com', '_blank'),
    },
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: 'Daily Updates',
      icon: FaInstagram,
      color: '#D946EF', 
      bg: 'rgba(217, 70, 239, 0.08)',
      desc: 'Follow our photo stories & updates',
      action: () => window.open('https://instagram.com', '_blank'),
    },
    {
      id: 'facebook',
      title: 'Facebook',
      subtitle: 'Community Page',
      icon: FaFacebook,
      color: '#1877F2', 
      bg: 'rgba(24, 119, 242, 0.08)',
      desc: 'Like our page and share initiatives',
      action: () => window.open('https://facebook.com', '_blank'),
    },
    {
      id: 'telegram',
      title: 'Telegram',
      subtitle: 'Broadcast Channel',
      icon: FaTelegram,
      color: '#3B82F6', 
      bg: 'rgba(59, 130, 246, 0.08)',
      desc: 'Get fast broadcasts & text notices',
      action: () => window.open('https://telegram.org', '_blank'),
    },
  ];

  return (
    <div className="ce-app ce-commerce-home">
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back">
          <LuChevronLeft />
        </Link>
        <div>
          <h1>For Better Society</h1>
          <p>Make an impact today</p>
        </div>
        <span><LuHeartHandshake /></span>
      </header>

      <main className="ce-container ce-society-page-container">
        <div className="ce-society-hero-banner">
          <div className="ce-society-hero-overlay" />
          <div className="ce-society-hero-content">
            <span className="ce-society-hero-tag">Community Hub</span>
            <h2>Together We Build a Better World</h2>
            <p>Participate in local initiatives, get career mentorship, join training modules, and follow us on our social platforms.</p>
          </div>
        </div>

        <div className="ce-society-grid">
          {societyFeatures.map(feat => {
            const Icon = feat.icon;
            return (
              <button 
                key={feat.id} 
                className="ce-society-card"
                onClick={feat.action}
                type="button"
              >
                <div className="ce-society-card-icon-wrap" style={{ background: feat.bg, color: feat.color }}>
                  <Icon />
                </div>
                <div className="ce-society-card-info">
                  <h3>{feat.title}</h3>
                  <span className="subtitle">{feat.subtitle}</span>
                  <p>{feat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}