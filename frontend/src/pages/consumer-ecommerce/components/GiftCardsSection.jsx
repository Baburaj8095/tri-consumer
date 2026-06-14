import { useState } from 'react';
import { LuTv, LuGift, LuBuilding2, LuSmartphone, LuSparkles, LuPlus, LuPackage } from 'react-icons/lu';
import HubbleGiftCardModal from './HubbleGiftCardModal';

/**
 * GiftCardsSection
 *
 * Clicking any gift card opens the Hubble SDK modal.
 * The modal calls Java backend GET /api/hubble/iframe-url
 * which generates an RS256 SSO JWT and returns the full Hubble iframe URL.
 */
const giftCards = [
  { id: 1, name: 'Trikonekt Gift Card',  icon: LuGift,      hubble: true },
  { id: 2, name: 'Reliance',             icon: LuBuilding2, hubble: true },
  { id: 3, name: 'Amazon',               icon: LuBuilding2, hubble: true },
  { id: 4, name: 'JIO',                  icon: LuSmartphone, hubble: true },
  { id: 5, name: 'Jio Allstar',          icon: LuSparkles,  hubble: true },
  { id: 6, name: 'Coffee Play',          icon: LuPackage,   hubble: true },
  { id: 7, name: 'More',                 icon: LuPlus,      hubble: true },
];

export default function GiftCardsSection() {
  const [modalOpen, setModalOpen]     = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    if (card.hubble) {
      setSelectedCard(card);
      setModalOpen(true);
    }
  };

  return (
    <>
      <section className="ce-gift-cards-section">
        <div className="ce-section-heading-row">
          <div>
            <h2 className="ce-section-title">Gift cards</h2>
            <p className="ce-section-subtitle">Simple treats and partner rewards</p>
          </div>
          <button
            type="button"
            className="ce-section-link ce-watch-link"
            onClick={() => { setSelectedCard({ name: 'Gift Cards' }); setModalOpen(true); }}
            aria-label="Browse all Gift Cards"
          >
            <LuTv /> Watch
          </button>
        </div>

        <div className="ce-gift-cards-grid">
          {giftCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                className="ce-gift-card ce-gift-card--clickable"
                onClick={() => handleCardClick(card)}
                aria-label={`Open ${card.name} gift cards`}
              >
                <div className="ce-gift-card-icon">
                  <Icon />
                </div>
                <p className="ce-gift-card-name">{card.name}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hubble SDK Modal */}
      <HubbleGiftCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cardName={selectedCard?.name || 'Gift Cards'}
      />
    </>
  );
}
