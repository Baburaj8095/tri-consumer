import { useEffect, useRef, useState, useCallback } from 'react';
import { LuX, LuGift, LuRefreshCw, LuAlertTriangle } from 'react-icons/lu';
import { fetchHubbleIframeUrl } from '../services/hubbleService';

/**
 * HubbleGiftCardModal
 *
 * Full-screen modal that:
 *  1. Calls Java backend GET /api/hubble/iframe-url  (which signs an RS256 Hubble SSO JWT)
 *  2. Renders the Hubble SDK experience inside an <iframe>
 *  3. Handles loading / error / close states gracefully
 *
 * Props:
 *   isOpen   (bool)   — whether to show the modal
 *   onClose  (func)   — callback to close the modal
 *   cardName (string) — title shown in the header (e.g. "Gift Cards")
 */
export default function HubbleGiftCardModal({ isOpen, onClose, cardName = 'Gift Cards' }) {
  const [iframeUrl, setIframeUrl]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const overlayRef                  = useRef(null);

  // Fetch iframe URL whenever modal opens
  const loadIframeUrl = useCallback(async () => {
    setLoading(true);
    setError('');
    setIframeUrl('');
    try {
      const { iframeUrl: url } = await fetchHubbleIframeUrl();
      setIframeUrl(url);
    } catch (err) {
      setError(err.message || 'Failed to load Gift Cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadIframeUrl();
    else { setIframeUrl(''); setError(''); }
  }, [isOpen, loadIframeUrl]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="hubble-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${cardName} — Hubble Gift Cards`}
    >
      <div className="hubble-modal-container">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="hubble-modal-header">
          <div className="hubble-modal-header-title">
            <LuGift className="hubble-modal-header-icon" />
            <span>{cardName}</span>
          </div>
          <button
            className="hubble-modal-close"
            onClick={onClose}
            aria-label="Close Gift Cards"
            type="button"
          >
            <LuX />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="hubble-modal-body">

          {/* Loading skeleton */}
          {loading && (
            <div className="hubble-modal-loading">
              <div className="hubble-modal-spinner" />
              <p>Loading Gift Cards&hellip;</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="hubble-modal-error">
              <LuAlertTriangle className="hubble-modal-error-icon" />
              <h3>Could not load Gift Cards</h3>
              <p>{error}</p>
              <button
                type="button"
                className="hubble-modal-retry-btn"
                onClick={loadIframeUrl}
              >
                <LuRefreshCw /> Try Again
              </button>
            </div>
          )}

          {/* Hubble SDK iframe */}
          {!loading && !error && iframeUrl && (
            <iframe
              className="hubble-modal-iframe"
              src={iframeUrl}
              title="Hubble Gift Cards"
              allow="payment; camera"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
            />
          )}
        </div>
      </div>
    </div>
  );
}
