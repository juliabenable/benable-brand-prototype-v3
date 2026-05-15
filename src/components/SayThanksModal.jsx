import { useEffect, useState } from 'react';
import { PolaroidPostcard, VintagePostcard } from './Postcards.jsx';
import {
  getPostcard,
  savePostcard,
  getPreferredStyle,
  setPreferredStyle,
} from '../utils/postcardStorage.js';

const ANIM_DURATION_MS = 4600;
const MESSAGE_MAX = 140;
const SIGNOFF_MAX = 40;

export default function SayThanksModal({
  campaignId,
  creator,        // { name, handle, avatarInitial, avatarUrl }
  postData,       // { thumbnailUrl, platform }
  brandName,
  onClose,
  onSent,
}) {
  // Was this creator already thanked? If so, view-only mode.
  const existing = getPostcard(campaignId, creator.handle);
  const viewOnly = !!existing;

  const [style, setStyle] = useState(
    viewOnly ? existing.style : getPreferredStyle()
  );
  const [message, setMessage] = useState(
    viewOnly ? existing.message : 'We loved what you made! Thank you for sharing it with your community.'
  );
  const [signoff, setSignoff] = useState(
    viewOnly ? existing.signoff : `xoxo the ${brandName} team`
  );
  const [phase, setPhase] = useState(viewOnly ? 'view' : 'edit'); // edit | sending | view

  // Persist style preference whenever the user toggles
  const onStyleChange = (next) => {
    setStyle(next);
    if (!viewOnly) setPreferredStyle(next);
  };

  // Escape closes (unless sending)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && phase !== 'sending') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, onClose]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onSend = () => {
    setPhase('sending');
    setTimeout(() => {
      const sentAt = new Date().toISOString();
      const record = { style, message, signoff, sentAt };
      savePostcard(campaignId, creator.handle, record);
      onSent && onSent(record);
      onClose();
    }, ANIM_DURATION_MS);
  };

  // Click-on-backdrop closes
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget && phase !== 'sending') onClose();
  };

  const postcardProps = {
    thumbnailUrl: postData?.thumbnailUrl,
    platform: postData?.platform,
    brandName,
    message,
    signoff,
    date: viewOnly ? new Date(existing.sentAt) : new Date(),
  };

  const renderPostcard = () =>
    style === 'polaroid'
      ? <PolaroidPostcard {...postcardProps} />
      : <VintagePostcard {...postcardProps} />;

  // ------ SENDING (animation) ------
  if (phase === 'sending') {
    return (
      <div className="thanks-overlay" role="dialog" aria-label="Sending postcard">
        <div className="thanks-modal">
          <div className="send-anim-stage">
            <div className="send-anim__envelope">
              <div className="send-anim__envelope-back" />
              <div className="send-anim__card-clip">
                <div className="send-anim__card">
                  {renderPostcard()}
                </div>
              </div>
              <div className="send-anim__envelope-front" />
              <div className="send-anim__envelope-flap" />
              <div className="send-anim__envelope-seal" />
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`send-anim__cp ${i % 2 ? 'send-anim__cp--square' : 'send-anim__cp--round'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ------ EDIT / VIEW ------
  return (
    <div className="thanks-overlay" role="dialog" aria-label={viewOnly ? 'Postcard sent' : 'Compose thank-you postcard'} onClick={onBackdropClick}>
      <div className="thanks-modal">
        <div className="thanks-modal__topbar">
          <h2 className="thanks-modal__title">
            {viewOnly ? 'Postcard sent to' : 'Say thanks to'} <strong>{creator.name}</strong>
          </h2>
          <button className="thanks-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {!viewOnly && (
          <div className="thanks-modal__picker">
            <button
              className={`thanks-modal__picker-btn ${style === 'polaroid' ? 'thanks-modal__picker-btn--active' : ''}`}
              onClick={() => onStyleChange('polaroid')}
            >
              Polaroid keepsake
            </button>
            <button
              className={`thanks-modal__picker-btn ${style === 'vintage' ? 'thanks-modal__picker-btn--active' : ''}`}
              onClick={() => onStyleChange('vintage')}
            >
              Vintage × Pastel
            </button>
          </div>
        )}

        <div className="thanks-modal__stage">
          {renderPostcard()}
        </div>

        {viewOnly ? (
          <div className="thanks-modal__sent-footer">
            <span>Sent on {new Date(existing.sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <button className="thanks-modal__sent-close" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="thanks-modal__edit">
              <div className="thanks-modal__field">
                <label htmlFor="postcard-message">Your message</label>
                <textarea
                  id="postcard-message"
                  rows={3}
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="we love what you made!"
                />
                <div className="thanks-modal__field-hint">{message.length} / {MESSAGE_MAX}</div>
              </div>
              <div className="thanks-modal__field">
                <label htmlFor="postcard-signoff">Sign-off</label>
                <input
                  id="postcard-signoff"
                  type="text"
                  maxLength={SIGNOFF_MAX}
                  value={signoff}
                  onChange={(e) => setSignoff(e.target.value)}
                  placeholder={`xoxo the ${brandName} team`}
                />
                <div className="thanks-modal__field-hint">We'll auto-add the date and your brand name where the design needs them.</div>
              </div>
            </div>
            <div className="thanks-modal__sendbar">
              <button className="thanks-modal__cancel" onClick={onClose}>Cancel</button>
              <button
                className="thanks-modal__send"
                onClick={onSend}
                disabled={!message.trim()}
              >
                Send postcard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
