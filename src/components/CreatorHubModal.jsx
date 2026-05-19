import { useEffect, useState } from 'react';
import { PolaroidPostcard, VintagePostcard } from './Postcards.jsx';
import {
  getCreatorState,
  savePostcard,
  setPaidRights,
  setShortlisted,
  setInvitedNext,
  getPreferredStyle,
  setPreferredStyle,
} from '../utils/postcardStorage.js';

const ANIM_DURATION_MS = 4600;
const MESSAGE_MAX = 140;
const SIGNOFF_MAX = 40;
const PAID_RIGHTS_PRICE = '$200';

/**
 * Creator hub: clicking a content tile opens this. Left = carousel of all the
 * creator's posts. Right = three focused tabs (Postcard / Rights / Re-collab).
 */
export default function CreatorHubModal({
  campaignId,
  creator,     // { name, handle, avatarInitial }
  posts,       // [{ thumbnailUrl, platform, caption, timeAgo, postUrl }]
  brandName,
  onClose,
  onChanged,
}) {
  const [tab, setTab] = useState('postcard'); // postcard | rights | recollab
  const [idx, setIdx] = useState(0);
  const [sending, setSending] = useState(false);
  // local mirror of persisted state so the UI updates immediately
  const [state, setState] = useState(() => getCreatorState(campaignId, creator.handle));

  const post = posts[idx] || posts[0] || {};

  function refresh() {
    setState(getCreatorState(campaignId, creator.handle));
    onChanged && onChanged();
  }

  // Escape closes (unless mid-send)
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !sending) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [sending, onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget && !sending) onClose();
  };

  // ---- send animation overlay ----
  const [animPostcard, setAnimPostcard] = useState(null);
  if (sending && animPostcard) {
    const PC = animPostcard.style === 'polaroid' ? PolaroidPostcard : VintagePostcard;
    return (
      <div className="hub-overlay" role="dialog" aria-label="Sending postcard">
        <div className="send-anim-stage">
          <div className="send-anim__envelope">
            <div className="send-anim__envelope-back" />
            <div className="send-anim__card-clip">
              <div className="send-anim__card">
                <PC {...animPostcard.props} />
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
    );
  }

  return (
    <div className="hub-overlay" role="dialog" aria-label={`Creator hub for ${creator.name}`} onClick={onBackdrop}>
      <div className="hub-modal">
        <div className="hub-topbar">
          <span className="hub-avatar" aria-hidden="true">{creator.avatarInitial}</span>
          <div className="hub-id">
            <div className="hub-name">{creator.name}</div>
            <div className="hub-handle">{creator.handle} · {posts.length} post{posts.length === 1 ? '' : 's'}</div>
          </div>
          <button className="hub-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="hub-body">
          {/* ---- LEFT: carousel ---- */}
          <div className="hub-carousel">
            <div
              className="hub-carousel__thumb"
              style={post.thumbnailUrl ? { backgroundImage: `url(${post.thumbnailUrl})` } : undefined}
            >
              {post.platform && <span className="hub-carousel__platform">{post.platform}</span>}
              {posts.length > 1 && (
                <div className="hub-carousel__arrows">
                  <button
                    aria-label="Previous post"
                    onClick={() => setIdx((i) => (i - 1 + posts.length) % posts.length)}
                  >‹</button>
                  <button
                    aria-label="Next post"
                    onClick={() => setIdx((i) => (i + 1) % posts.length)}
                  >›</button>
                </div>
              )}
              {posts.length > 1 && (
                <div className="hub-carousel__dots">
                  {posts.map((_, i) => (
                    <span key={i} className={i === idx ? 'on' : ''} />
                  ))}
                </div>
              )}
            </div>
            <div className="hub-carousel__meta">
              <div className="hub-carousel__count">
                {post.platform || 'Post'} · {idx + 1} of {posts.length}{post.timeAgo ? ` · ${post.timeAgo}` : ''}
              </div>
              <p className="hub-carousel__caption">{post.caption || 'No caption.'}</p>
              {post.postUrl && (
                <a className="hub-carousel__link" href={post.postUrl} target="_blank" rel="noopener noreferrer">
                  View original post ↗
                </a>
              )}
            </div>
          </div>

          {/* ---- RIGHT: tabs ---- */}
          <div className="hub-right">
            <div className="hub-tabs" role="tablist">
              <button className={`hub-tab ${tab === 'postcard' ? 'on' : ''}`} onClick={() => setTab('postcard')} role="tab" aria-selected={tab === 'postcard'}>
                <span className="hub-tab__ic" aria-hidden="true">♥</span>Postcard
                {state.postcard && <span className="hub-tab__dot" aria-label="done" />}
              </button>
              <button className={`hub-tab ${tab === 'rights' ? 'on' : ''}`} onClick={() => setTab('rights')} role="tab" aria-selected={tab === 'rights'}>
                <span className="hub-tab__ic" aria-hidden="true">⊛</span>Rights
                {state.paidRights && <span className="hub-tab__dot" aria-label="done" />}
              </button>
              <button className={`hub-tab ${tab === 'recollab' ? 'on' : ''}`} onClick={() => setTab('recollab')} role="tab" aria-selected={tab === 'recollab'}>
                <span className="hub-tab__ic" aria-hidden="true">＋</span>Re-collab
                {(state.shortlisted || state.invitedNext) && <span className="hub-tab__dot" aria-label="done" />}
              </button>
            </div>

            <div className="hub-panel">
              {tab === 'postcard' && (
                <PostcardPanel
                  campaignId={campaignId}
                  creator={creator}
                  post={post}
                  brandName={brandName}
                  existing={state.postcard}
                  onStartSend={(payload) => { setAnimPostcard(payload); setSending(true); }}
                  finishSend={(record) => {
                    savePostcard(campaignId, creator.handle, record);
                    setSending(false);
                    setAnimPostcard(null);
                    refresh();
                  }}
                  animMs={ANIM_DURATION_MS}
                />
              )}
              {tab === 'rights' && (
                <RightsPanel
                  active={state.paidRights}
                  price={PAID_RIGHTS_PRICE}
                  onToggle={() => { setPaidRights(campaignId, creator.handle, !state.paidRights); refresh(); }}
                />
              )}
              {tab === 'recollab' && (
                <ReCollabPanel
                  creatorName={creator.name}
                  shortlisted={state.shortlisted}
                  invitedNext={state.invitedNext}
                  onToggleShortlist={() => { setShortlisted(campaignId, creator.handle, !state.shortlisted); refresh(); }}
                  onToggleInvite={() => { setInvitedNext(campaignId, creator.handle, !state.invitedNext); refresh(); }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Postcard panel ---------------- */
function PostcardPanel({ campaignId, creator, post, brandName, existing, onStartSend, finishSend, animMs }) {
  const viewOnly = !!existing;
  const [style, setStyle] = useState(viewOnly ? existing.style : getPreferredStyle());
  const [message, setMessage] = useState(
    viewOnly ? existing.message : 'We loved what you made! Thank you for sharing it with your community.'
  );
  const [signoff, setSignoff] = useState(
    viewOnly ? existing.signoff : `xoxo the ${brandName} team`
  );

  const props = {
    thumbnailUrl: post?.thumbnailUrl,
    platform: post?.platform,
    brandName,
    message,
    signoff,
    date: viewOnly ? new Date(existing.sentAt) : new Date(),
  };
  const PC = style === 'polaroid' ? PolaroidPostcard : VintagePostcard;

  const changeStyle = (s) => { setStyle(s); if (!viewOnly) setPreferredStyle(s); };

  const send = () => {
    const sentAt = new Date().toISOString();
    const record = { style, message, signoff, sentAt };
    onStartSend({ style, props });
    setTimeout(() => finishSend(record), animMs);
  };

  return (
    <div className="hub-postcard">
      <div className="hub-postcard__preview"><PC {...props} /></div>

      {viewOnly ? (
        <div className="hub-postcard__sent">
          <div className="hub-postcard__sent-badge">✓ Sent</div>
          <p>You sent {creator.name} a postcard on{' '}
            {new Date(existing.sentAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
        </div>
      ) : (
        <div className="hub-postcard__compose">
          <div className="hub-picker">
            <button className={`hub-picker__btn ${style === 'polaroid' ? 'on' : ''}`} onClick={() => changeStyle('polaroid')}>Polaroid keepsake</button>
            <button className={`hub-picker__btn ${style === 'vintage' ? 'on' : ''}`} onClick={() => changeStyle('vintage')}>Vintage × Pastel</button>
          </div>
          <label className="hub-field">
            <span>Your message</span>
            <textarea rows={3} maxLength={MESSAGE_MAX} value={message}
              onChange={(e) => setMessage(e.target.value)} placeholder="we love what you made!" />
            <small>{message.length} / {MESSAGE_MAX}</small>
          </label>
          <label className="hub-field">
            <span>Sign-off</span>
            <input type="text" maxLength={SIGNOFF_MAX} value={signoff}
              onChange={(e) => setSignoff(e.target.value)} placeholder={`xoxo the ${brandName} team`} />
          </label>
          <button className="hub-primary" onClick={send} disabled={!message.trim()}>♥ Send postcard</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Rights panel ---------------- */
function RightsPanel({ active, price, onToggle }) {
  return (
    <div className="hub-rights">
      <div className="hub-rights__row hub-rights__row--granted">
        <span className="hub-rights__check">✓</span>
        <div>
          <h4>Organic rights</h4>
          <p>Included with this campaign — share, repost, and embed this content on your own channels, forever.</p>
        </div>
      </div>

      <div className={`hub-rights__row hub-rights__row--paid ${active ? 'is-active' : ''}`}>
        <span className="hub-rights__icon">{active ? '✓' : '＄'}</span>
        <div className="hub-rights__paid-body">
          <h4>Paid rights {active && <span className="hub-rights__tag">Active</span>}</h4>
          {active ? (
            <p>Paid usage is active — run this as an ad on Meta &amp; TikTok for 30 days, all placements. {price} · billed to your account.</p>
          ) : (
            <p>Unlock paid usage to run this content as an ad on Meta &amp; TikTok — 30 days, all placements.</p>
          )}
          <button className={active ? 'hub-secondary' : 'hub-primary'} onClick={onToggle}>
            {active ? 'Turn off paid rights' : `Activate paid rights — ${price}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Re-collab panel ---------------- */
function ReCollabPanel({ creatorName, shortlisted, invitedNext, onToggleShortlist, onToggleInvite }) {
  return (
    <div className="hub-recollab">
      <p className="hub-recollab__lede">Loved working with {creatorName}? Keep the door open for next time.</p>

      <div className={`hub-recollab__card ${shortlisted ? 'is-done' : ''}`}>
        <div className="hub-recollab__head">
          <h4>Save to shortlist</h4>
          {shortlisted && <span className="hub-recollab__tag">Saved ✓</span>}
        </div>
        <p>{shortlisted
          ? `We'll surface ${creatorName} when you plan your next campaign.`
          : `Bookmark ${creatorName} so they're easy to find later.`}</p>
        <button className={shortlisted ? 'hub-secondary' : 'hub-primary'} onClick={onToggleShortlist}>
          {shortlisted ? 'Remove from shortlist' : 'Save to shortlist'}
        </button>
      </div>

      <div className={`hub-recollab__card ${invitedNext ? 'is-done' : ''}`}>
        <div className="hub-recollab__head">
          <h4>Invite to next campaign</h4>
          {invitedNext && <span className="hub-recollab__tag">Invited ✓</span>}
        </div>
        <p>{invitedNext
          ? `${creatorName} will get a heads-up about your next campaign.`
          : `Send ${creatorName} an early heads-up for whatever you launch next.`}</p>
        <button className={invitedNext ? 'hub-secondary' : 'hub-primary'} onClick={onToggleInvite}>
          {invitedNext ? 'Cancel invite' : 'Invite to next campaign'}
        </button>
      </div>
    </div>
  );
}
