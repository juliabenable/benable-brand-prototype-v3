import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  campaignDetailActive,
  campaignContentTab,
  campaignDetailsModalModal,
  addCreatorsModalModal,
} from '../data/capturedHtml.js';
import SayThanksModal from '../components/SayThanksModal.jsx';
import { getPostcard, getPostcardCount, clearAllPostcards } from '../utils/postcardStorage.js';

const BRAND_NAME = 'Pikora';

export default function CampaignDetailPage() {
  const [tab, setTab] = useState('Dashboard'); // 'Dashboard' | 'Content'
  const [modal, setModal] = useState(null); // null | 'details' | 'addCreators'
  const [thanksTarget, setThanksTarget] = useState(null); // { creator, postData } or null
  // bump this to force a re-decoration of the cards after a thank-you is sent
  const [decorTick, setDecorTick] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { id: campaignId = '0' } = useParams();

  const html = tab === 'Content' ? campaignContentTab : campaignDetailActive;

  // Active-tab class patch.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('.workflow-dashboard-tab').forEach((b) => {
      b.classList.toggle('active', b.textContent.trim() === tab);
    });
  }, [tab, html]);

  // ----- Decorate content-post-cards with the Say Thanks button -----
  useEffect(() => {
    if (tab !== 'Content') return;
    const root = ref.current;
    if (!root) return;
    const cards = root.querySelectorAll('.content-post-card');
    cards.forEach((card) => decorateCard(card, campaignId));
  }, [tab, html, campaignId, decorTick, thanksTarget]);

  // ----- Click delegation -----
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e) => {
      // Say thanks button on a card
      const sayThanks = e.target.closest('.say-thanks-overlay');
      if (sayThanks) {
        e.preventDefault();
        e.stopPropagation();
        const card = sayThanks.closest('.content-post-card');
        openThanks(card);
        return;
      }
      // Click anywhere else on a content-post-card → also open thanks
      const card = e.target.closest('.content-post-card');
      if (card) {
        e.preventDefault();
        e.stopPropagation();
        openThanks(card);
        return;
      }

      const tabBtn = e.target.closest('.workflow-dashboard-tab');
      if (tabBtn) {
        e.preventDefault();
        const label = tabBtn.textContent.trim();
        if (label === 'Dashboard' || label === 'Content') setTab(label);
        return;
      }
      const headerEdit = e.target.closest('.workflow-header-edit-btn');
      if (headerEdit) {
        e.preventDefault();
        setModal('details');
        return;
      }
      const button = e.target.closest('button');
      if (button && button.textContent.trim() === 'Add Creators') {
        e.preventDefault();
        setModal('addCreators');
        return;
      }
      const back = e.target.closest('.flow-backlink, .workflow-back-link');
      if (back) {
        e.preventDefault();
        navigate('/brand/tonypikora/campaigns');
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [navigate, html, tab]);

  function openThanks(card) {
    const data = extractCreatorFromCard(card);
    if (!data) return;
    setThanksTarget(data);
  }

  function onSent() {
    setThanksTarget(null);
    setDecorTick((t) => t + 1); // re-decorate cards to show "Thanked" state
  }

  function resetThanks() {
    clearAllPostcards();
    setDecorTick((t) => t + 1);
  }

  const sentCount = getPostcardCount(); // re-reads on every render

  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      {modal === 'details' && (
        <ModalLayer html={campaignDetailsModalModal} onClose={() => setModal(null)} />
      )}
      {modal === 'addCreators' && (
        <ModalLayer html={addCreatorsModalModal} onClose={() => setModal(null)} />
      )}
      {thanksTarget && (
        <SayThanksModal
          campaignId={campaignId}
          brandName={BRAND_NAME}
          creator={thanksTarget.creator}
          postData={thanksTarget.postData}
          onClose={() => setThanksTarget(null)}
          onSent={onSent}
        />
      )}
      {sentCount > 0 && !thanksTarget && (
        <button
          type="button"
          className="reset-thanks-fab"
          onClick={resetThanks}
          aria-label="Reset all sent postcards (demo only)"
          title="Reset all sent postcards — demo only"
        >
          <span aria-hidden="true" className="reset-thanks-fab__icon">↺</span>
          Reset {sentCount} sent postcard{sentCount === 1 ? '' : 's'}
          <span className="reset-thanks-fab__hint">demo</span>
        </button>
      )}
    </>
  );
}

/* Find creator + post info from a card element and attach a "Say thanks"
 * button overlay (or a "Thanked ✓ <date>" version if one's already saved).
 */
function decorateCard(card, campaignId) {
  // Ensure positioning context for the overlay
  if (getComputedStyle(card).position === 'static') {
    card.style.position = 'relative';
  }
  // Remove any existing overlay so we rebuild based on latest state
  card.querySelector('.say-thanks-overlay')?.remove();

  const info = extractCreatorFromCard(card);
  if (!info) return;
  const existing = getPostcard(campaignId, info.creator.handle);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'say-thanks-overlay' + (existing ? ' say-thanks-overlay--thanked' : '');
  if (existing) {
    const date = new Date(existing.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    btn.innerHTML = `<span class="say-thanks-overlay__check">✓</span> Thanked · ${date}`;
    btn.setAttribute('aria-label', `View postcard sent to ${info.creator.name} on ${date}`);
  } else {
    btn.innerHTML = `<span aria-hidden="true">♥</span> Say thanks`;
    btn.setAttribute('aria-label', `Say thanks to ${info.creator.name}`);
  }
  card.appendChild(btn);
}

function extractCreatorFromCard(card) {
  const nameEl = card.querySelector('.content-post-card__name');
  const handleEl = card.querySelector('.content-post-card__handle');
  if (!nameEl || !handleEl) return null;
  const avatarText = card.querySelector('.content-post-card__avatar')?.textContent.trim() || nameEl.textContent.trim().charAt(0);
  const thumb = card.querySelector('.content-post-card__thumb-image')?.getAttribute('src') || '';
  const badge = card.querySelector('.content-post-card__badge')?.textContent.trim() || '';
  return {
    creator: {
      name: nameEl.textContent.trim(),
      handle: handleEl.textContent.trim(),
      avatarInitial: avatarText.charAt(0).toUpperCase(),
    },
    postData: {
      thumbnailUrl: thumb,
      platform: badge,
    },
  };
}

function ModalLayer({ html, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e) => {
      if (e.target.closest('.brand-portal-modal__backdrop, .brand-portal-modal__close')) {
        e.preventDefault();
        onClose();
      }
    };
    root.addEventListener('click', onClick);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.removeEventListener('click', onClick); window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
