import React, { useState } from 'react';
import { 
  LuUser, 
  LuPhone, 
  LuStore, 
  LuMapPin, 
  LuMapPinHouse, 
  LuBriefcase, 
  LuCheck, 
  LuShieldCheck, 
  LuCircleAlert 
} from 'react-icons/lu';
import '../consumerEcommerce.css';

export default function BusinessRegistrationModal({ open, onClose }) {
  const [form, setForm] = useState({ fullName: '', mobileNumber: '', category: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    { 
      id: 'store', 
      name: 'Store/Shop', 
      icon: LuStore, 
      desc: 'Retail outlets, local shops, supermarkets' 
    },
    { 
      id: 'street', 
      name: 'Street Business', 
      icon: LuMapPin, 
      desc: 'Street vendors, food carts, mobile stalls' 
    },
    { 
      id: 'homemade', 
      name: 'Homemade Business', 
      icon: LuMapPinHouse, 
      desc: 'Home kitchens, handmade crafts, cottage industries' 
    },
    { 
      id: 'service', 
      name: 'Service provider', 
      icon: LuBriefcase, 
      desc: 'Plumbers, technicians, salon, cleaners' 
    },
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!form.category) newErrors.category = 'Please select a business category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulate Admin notification API callback schedule
      await new Promise(r => setTimeout(r, 1200));
      setSuccess(true);
    } catch (err) {
      setErrors({ api: err.message || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="ce-app ce-commerce-home ce-biz-modal-backdrop">
      <div className="ce-biz-modal-container">
        <button className="ce-biz-modal-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {success ? (
          <div className="ce-biz-success-view">
            <div className="ce-biz-success-icon-wrap">
              <LuCheck />
            </div>
            <h2>Registration Successful!</h2>
            <p className="ce-biz-success-desc">
              Thank you, <strong>{form.fullName}</strong>. We have received your request to list your business.
            </p>
            <div className="ce-biz-success-callback-card">
              <LuPhone className="callback-icon" />
              <div>
                <strong>Admin Callback Scheduled</strong>
                <p>Our agent will call you shortly on <strong>+91 {form.mobileNumber}</strong> to collect remaining details and verify your business listing as a <strong>{form.category}</strong>.</p>
              </div>
            </div>
            <button className="ce-biz-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ce-biz-form">
            <div className="ce-biz-header">
              <div className="ce-biz-badge">
                <LuShieldCheck />
                <span>Admin callback verification</span>
              </div>
              <h2>List Your Business</h2>
              <p>Introduce your business in 3 simple steps. Our team will call you to verify and publish it.</p>
            </div>

            <div className="ce-biz-form-fields">
              {/* Full Name */}
              <div className="ce-biz-field">
                <label htmlFor="fullName">Full Name *</label>
                <div className={`ce-biz-input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
                  <span className="ce-biz-input-icon"><LuUser /></span>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <span className="ce-biz-error-msg">
                    <LuCircleAlert /> {errors.fullName}
                  </span>
                )}
              </div>

              {/* Mobile Number */}
              <div className="ce-biz-field">
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <div className={`ce-biz-input-wrapper ${errors.mobileNumber ? 'has-error' : ''}`}>
                  <span className="ce-biz-input-icon"><LuPhone /></span>
                  <span className="ce-biz-country-code">+91</span>
                  <input
                    id="mobileNumber"
                    type="tel"
                    maxLength={10}
                    value={form.mobileNumber}
                    onChange={e => setForm({ ...form, mobileNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="10-digit mobile number"
                  />
                </div>
                {errors.mobileNumber && (
                  <span className="ce-biz-error-msg">
                    <LuCircleAlert /> {errors.mobileNumber}
                  </span>
                )}
              </div>

              {/* Business Category */}
              <div className="ce-biz-field">
                <label>Business Category *</label>
                <div className="ce-biz-category-grid">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = form.category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`ce-biz-category-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setForm({ ...form, category: cat.name })}
                      >
                        <div className="card-selection-indicator">
                          {isSelected && <LuCheck />}
                        </div>
                        <span className="category-card-icon"><Icon /></span>
                        <div className="category-card-info">
                          <strong>{cat.name}</strong>
                          <small>{cat.desc}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <span className="ce-biz-error-msg">
                    <LuCircleAlert /> {errors.category}
                  </span>
                )}
              </div>
            </div>

            {errors.api && <div className="ce-biz-api-error">{errors.api}</div>}

            <button
              type="submit"
              className="ce-biz-btn-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Business'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}