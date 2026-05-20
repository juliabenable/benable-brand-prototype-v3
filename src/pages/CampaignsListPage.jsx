import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ACTIVE_CAMPAIGNS = [
  {
    id: 46,
    title: 'Instant Beef Bone Broth Collection',
    kind: 'Gifted Product',
    started: 'Apr 6',
    yourCreators: 12,
    yourCreatorAvatars: [
      'https://i.pravatar.cc/64?img=47',
      'https://i.pravatar.cc/64?img=49',
    ],
    inCampaign: 10,
    toReview: 10,
    contentShared: 0,
    state: 'found',
    visual: 'broth',
    foundAvatars: [
      'https://i.pravatar.cc/64?img=12',
      'https://i.pravatar.cc/64?img=32',
      'https://i.pravatar.cc/64?img=20',
    ],
  },
  {
    id: 47,
    title: 'Spring Skincare Refresh',
    kind: 'Gifted Product',
    started: 'May 12',
    yourCreators: 8,
    yourCreatorAvatars: [
      'https://i.pravatar.cc/64?img=5',
      'https://i.pravatar.cc/64?img=8',
    ],
    inCampaign: 0,
    toReview: 0,
    contentShared: 0,
    state: 'searching',
    visual: 'skincare',
  },
];

const ARCHIVE_CAMPAIGNS = [
  { title: 'Instant Bone Broth Collection — Beef & Chicken', date: 'May 13', status: 'Draft' },
  { title: 'Holiday Influencer Push', date: 'Apr 28', status: 'Draft' },
  { title: 'Pikora Launch Week', date: 'Mar 14', status: 'Completed' },
];

const SOLO_CREATORS_READY = [
  { name: 'Maya Chen', meta: '@mayachen · 124k', avatar: 'https://i.pravatar.cc/64?img=12' },
  { name: 'Jordan Reese', meta: '@jordanreese · 89k', avatar: 'https://i.pravatar.cc/64?img=32' },
  { name: 'Priya Anand', meta: '@priyaanand · 56k', avatar: 'https://i.pravatar.cc/64?img=20' },
  { name: 'Theo Marks', meta: '@theomarks · 41k', avatar: 'https://i.pravatar.cc/64?img=14' },
];

const SOLO_CREATORS_INVITED = [
  { name: 'Maya Chen', meta: '@mayachen', avatar: 'https://i.pravatar.cc/64?img=12', status: 'accepted' },
  { name: 'Jordan Reese', meta: '@jordanreese', avatar: 'https://i.pravatar.cc/64?img=32', status: 'accepted' },
  { name: 'Priya Anand', meta: '@priyaanand', avatar: 'https://i.pravatar.cc/64?img=20', status: 'invited' },
  { name: 'Theo Marks', meta: '@theomarks', avatar: 'https://i.pravatar.cc/64?img=14', status: 'declined' },
];

const SOLO_CREATORS_PRODUCTION = [
  { name: 'Maya Chen', meta: '@mayachen', avatar: 'https://i.pravatar.cc/64?img=12', progress: 'Filming' },
  { name: 'Jordan Reese', meta: '@jordanreese', avatar: 'https://i.pravatar.cc/64?img=32', progress: 'Submitted draft' },
  { name: 'Priya Anand', meta: '@priyaanand', avatar: 'https://i.pravatar.cc/64?img=20', progress: 'Product shipped' },
];

const SOLO_CONTENT_PIECES = [
  { creator: 'Maya', avatar: 'https://i.pravatar.cc/64?img=12', type: 'video', bg: 'linear-gradient(135deg, #f3a182, #db5a3c)' },
  { creator: 'Jordan', avatar: 'https://i.pravatar.cc/64?img=32', type: 'photo', bg: 'linear-gradient(135deg, #7eb3ee, #4a7bca)' },
  { creator: 'Priya', avatar: 'https://i.pravatar.cc/64?img=20', type: 'video', bg: 'linear-gradient(135deg, #c69bea, #8e5cd0)' },
  { creator: 'Maya', avatar: 'https://i.pravatar.cc/64?img=12', type: 'photo', bg: 'linear-gradient(135deg, #f5cf85, #d9a14a)' },
  { creator: 'Jordan', avatar: 'https://i.pravatar.cc/64?img=32', type: 'video', bg: 'linear-gradient(135deg, #8fcfa8, #4a9c69)' },
  { creator: 'Priya', avatar: 'https://i.pravatar.cc/64?img=20', type: 'photo', bg: 'linear-gradient(135deg, #f6a8c9, #d36392)' },
];

const SOLO_PERFORMANCE = [
  { creator: 'Maya Chen', metric: '184k', sub: 'views · 7.2% engagement', trend: '+22%', bg: 'linear-gradient(135deg, #f3a182, #db5a3c)' },
  { creator: 'Jordan Reese', metric: '92k', sub: 'views · 5.8% engagement', trend: '+14%', bg: 'linear-gradient(135deg, #7eb3ee, #4a7bca)' },
  { creator: 'Priya Anand', metric: '46k', sub: 'views · 4.1% engagement', trend: '+6%', bg: 'linear-gradient(135deg, #c69bea, #8e5cd0)' },
];

const SOLO_STATES = [
  { key: 'searching', label: 'Searching', num: '1' },
  { key: 'picks',     label: 'Picks ready', num: '2' },
  { key: 'invited',   label: 'Invited', num: '3' },
  { key: 'production',label: 'In production', num: '4' },
  { key: 'review',    label: 'Content review', num: '5' },
  { key: 'live',      label: 'Live & performing', num: '6' },
  { key: 'completed', label: 'Completed', num: '7' },
];

const VARIANTS = [
  { key: 'A', label: 'Editorial card', blurb: 'Story-forward, brand-y. Best for 1–3 campaigns.' },
  { key: 'B', label: 'Hero spotlight', blurb: 'One big card for the most-actionable campaign, others as smaller cards below.' },
  { key: 'C', label: 'Magazine — 2 campaigns', blurb: 'Visual personality: color/imagery per campaign. Side-by-side.' },
  { key: 'D', label: 'Magazine — 1 campaign', blurb: 'Single-campaign hero treatment. Richer detail when there is only one.' },
];

export default function CampaignsListPage() {
  const navigate = useNavigate();
  const [variant, setVariant] = useState('A');
  const [soloState, setSoloState] = useState('picks');
  const openCampaign = (id) => navigate(`/brand/tonypikora/campaigns/${id}`);
  const createCampaign = () => navigate('/brand/tonypikora/campaigns/new');

  const current = VARIANTS.find((v) => v.key === variant);

  return (
    <main className="workspace-content" aria-busy="false">
      <div className="workspace-content-shell is-entering">
        <section className="dashboard-v2 dv2-fade-in" key={variant}>
          <header className="dv2-header">
            <div>
              <h1>Overview</h1>
              <p>Manage your active campaigns and creator relationships.</p>
            </div>
            <button type="button" className="dv2-create-btn" onClick={createCampaign}>
              <PlusIcon /> Create Campaign
            </button>
          </header>

          <div className="dv2-study-meta">
            <div className="dv2-switcher" role="tablist" aria-label="Design study variants">
              {VARIANTS.map((v) => (
                <button
                  key={v.key}
                  role="tab"
                  aria-pressed={variant === v.key}
                  onClick={() => setVariant(v.key)}
                >
                  <span className="switcher-key">{v.key}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
            <div>
              <b>Study {current.key}:</b> {current.blurb}
            </div>
          </div>

          {variant === 'D' && (
            <div className="dv2-state-sim" role="tablist" aria-label="Solo state preview">
              <span className="dv2-state-sim-label">Lifecycle</span>
              {SOLO_STATES.map((s) => (
                <button
                  key={s.key}
                  className="dv2-state-sim-chip"
                  aria-pressed={soloState === s.key}
                  onClick={() => setSoloState(s.key)}
                >
                  <span className="dv2-state-sim-chip-num">{s.num}</span>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {variant === 'A' && <VariantA onOpen={openCampaign} />}
          {variant === 'B' && <VariantB onOpen={openCampaign} />}
          {variant === 'C' && <VariantC onOpen={openCampaign} />}
          {variant === 'D' && <VariantD onOpen={openCampaign} state={soloState} />}
        </section>
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────
   Variant A — Editorial cards (the existing sketch)
   ──────────────────────────────────────────────── */
function VariantA({ onOpen }) {
  return (
    <>
      <section className="dv2-active">
        <div className="dv2-section-label">
          Active <span className="count">{ACTIVE_CAMPAIGNS.length}</span>
        </div>
        <div className="dv2-active-grid">
          {ACTIVE_CAMPAIGNS.map((c) => (
            <ACard key={c.id} campaign={c} onOpen={() => onOpen(c.id)} />
          ))}
        </div>
      </section>
      <ArchiveSection onOpen={onOpen} />
    </>
  );
}

function ACard({ campaign, onOpen }) {
  const {
    title, kind, started,
    yourCreators, yourCreatorAvatars,
    inCampaign, toReview, contentShared,
    state, foundAvatars = [],
  } = campaign;

  return (
    <article className="dv2-card">
      <div className="dv2-card-head">
        <div className="dv2-card-title-group">
          <h2>{title}</h2>
          <div className="dv2-card-meta">{kind} · Started {started}</div>
        </div>
        <span className="dv2-live-badge">Live</span>
      </div>

      <div className="dv2-stats">
        <div className="dv2-stat">
          <div className="dv2-stat-value">
            <span className="dv2-avatar-cluster">
              {yourCreatorAvatars.slice(0, 2).map((src, i) => (
                <span key={i} className="dv2-avatar" style={{ backgroundImage: `url(${src})` }} />
              ))}
            </span>
            <span>{yourCreators}</span>
          </div>
          <div className="dv2-stat-label">Your creators</div>
        </div>
        <div className="dv2-stat">
          <div className="dv2-stat-value">{inCampaign}</div>
          <div className="dv2-stat-label">In campaign</div>
        </div>
        <div className="dv2-stat">
          <div className="dv2-stat-value">{toReview}</div>
          <div className="dv2-stat-label">To review</div>
        </div>
        <div className="dv2-stat">
          <div className="dv2-stat-value">{contentShared}</div>
          <div className="dv2-stat-label">Content shared</div>
        </div>
      </div>

      <div className="dv2-card-foot">
        {state === 'searching' ? (
          <div className="dv2-state-strip" data-state="searching">
            <span className="dv2-spinner" aria-hidden="true" />
            <span className="dv2-state-text">
              Finding your perfect creators — usually <strong>6–24h</strong>
            </span>
          </div>
        ) : (
          <div className="dv2-state-strip" data-state="found">
            <span className="dv2-avatar-cluster dv2-avatar--lg">
              {foundAvatars.slice(0, 3).map((src, i) => (
                <span key={i} className="dv2-avatar" style={{ backgroundImage: `url(${src})` }} />
              ))}
            </span>
            <span className="dv2-state-text">
              <strong>{toReview} creators</strong> ready for your review
            </span>
          </div>
        )}
        <button type="button" className="dv2-open-btn" onClick={onOpen}>
          Open Campaign <span className="arrow">→</span>
        </button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────
   Variant B — Hero spotlight
   ──────────────────────────────────────────────── */
function VariantB({ onOpen }) {
  // Pick the most-actionable campaign as the hero. If any campaign has
  // creators to review, prefer that one; otherwise first active.
  const hero =
    ACTIVE_CAMPAIGNS.find((c) => c.state === 'found' && c.toReview > 0) ||
    ACTIVE_CAMPAIGNS[0];
  const others = ACTIVE_CAMPAIGNS.filter((c) => c.id !== hero.id);

  return (
    <>
      <section className="dv2-active">
        <div className="dv2-section-label">
          Most actionable
        </div>
        <article className="dv2-b-hero">
          <div className="dv2-b-hero-left">
            <span className="dv2-b-hero-tag">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7a5cfa' }} />
              {hero.state === 'found' ? `${hero.toReview} creators waiting on you` : 'Searching for creators'}
            </span>
            <h2>{hero.title}</h2>
            <div className="meta">{hero.kind} · Started {hero.started}</div>
            <button type="button" className="dv2-b-hero-cta" onClick={() => onOpen(hero.id)}>
              Open Campaign <span>→</span>
            </button>
          </div>
          <div className="dv2-b-hero-right">
            <div className="dv2-b-tile dv2-b-tile--avatar">
              <div className="dv2-b-tile-label">Your creators</div>
              <div className="dv2-b-tile-value">{hero.yourCreators}</div>
              <span className="dv2-avatar-cluster">
                {hero.yourCreatorAvatars.slice(0, 2).map((src, i) => (
                  <span key={i} className="dv2-avatar" style={{ backgroundImage: `url(${src})` }} />
                ))}
              </span>
            </div>
            <div className="dv2-b-tile dv2-b-tile--accent">
              <div className="dv2-b-tile-label">To review</div>
              <div className="dv2-b-tile-value">{hero.toReview}</div>
              <div className="dv2-b-tile-sub">New creators ready</div>
            </div>
            <div className="dv2-b-tile">
              <div className="dv2-b-tile-label">In campaign</div>
              <div className="dv2-b-tile-value">{hero.inCampaign}</div>
            </div>
            <div className="dv2-b-tile">
              <div className="dv2-b-tile-label">Content shared</div>
              <div className="dv2-b-tile-value">{hero.contentShared}</div>
            </div>
          </div>
        </article>
      </section>

      {others.length > 0 && (
        <section className="dv2-active">
          <div className="dv2-section-label">Other active <span className="count">{others.length}</span></div>
          <div className="dv2-b-others">
            {others.map((c) => (
              <article key={c.id} className="dv2-b-other-card" onClick={() => onOpen(c.id)}>
                <div className="dv2-b-other-meta">
                  {c.state === 'searching' ? (
                    <><span className="dv2-spinner" /> Searching</>
                  ) : (
                    <span className="dv2-live-badge">Live</span>
                  )}
                </div>
                <h3>{c.title}</h3>
                <div className="dv2-b-other-mini-stats">
                  <div className="dv2-b-other-mini-stat">
                    <strong>{c.inCampaign}</strong> in campaign
                  </div>
                  <div className="dv2-b-other-mini-stat">
                    <strong>{c.toReview}</strong> to review
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <ArchiveSection onOpen={onOpen} />
    </>
  );
}

/* ────────────────────────────────────────────────
   Variant C — Magazine (2 campaigns, side by side)
   ──────────────────────────────────────────────── */
function VariantC({ onOpen }) {
  return (
    <>
      <section className="dv2-active">
        <div className="dv2-section-label">
          Active <span className="count">{ACTIVE_CAMPAIGNS.length}</span>
        </div>
        <div className="dv2-d-grid">
          {ACTIVE_CAMPAIGNS.map((c) => (
            <DCard key={c.id} campaign={c} onOpen={() => onOpen(c.id)} />
          ))}
        </div>
      </section>
      <ArchiveSection onOpen={onOpen} />
    </>
  );
}

/* ────────────────────────────────────────────────
   Variant D — Magazine SOLO (single campaign, all lifecycle states)
   ──────────────────────────────────────────────── */
function VariantD({ onOpen, state }) {
  return (
    <>
      <section className="dv2-active">
        <div className="dv2-section-label">
          Active <span className="count">1</span>
        </div>
        <SoloCard state={state} onOpen={() => onOpen(46)} />
      </section>
      <ArchiveSection onOpen={onOpen} />
    </>
  );
}

const STATE_CONFIG = {
  searching: { tag: 'Searching', tagVariant: 'searching', visual: 'broth', metaSuffix: '· 12 creators in your network' },
  picks:     { tag: 'Live', tagVariant: 'default',  visual: 'broth', metaSuffix: '· 4 creators picked for you' },
  invited:   { tag: 'Live · Invited', tagVariant: 'invited', visual: 'broth', metaSuffix: '· Waiting on creators to accept' },
  production:{ tag: 'Live · In production', tagVariant: 'production', visual: 'broth', metaSuffix: '· 3 creators making content' },
  review:    { tag: 'Live · Review', tagVariant: 'review', visual: 'broth', metaSuffix: '· 6 pieces awaiting your review' },
  live:      { tag: 'Performing', tagVariant: 'celebrate', visual: 'live', metaSuffix: '· 6 pieces live across platforms' },
  completed: { tag: 'Completed', tagVariant: 'completed', visual: 'completed', metaSuffix: '· Wrapped Apr 28' },
};

function SoloCard({ state, onOpen }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.picks;
  const isSearching = state === 'searching';
  const isCompleted = state === 'completed';

  return (
    <article
      className={`dv2-solo dv2-solo--${cfg.visual}`}
      onClick={onOpen}
    >
      <div className="dv2-solo-left">
        <div className="dv2-solo-head">
          <span className={`dv2-solo-tag dv2-solo-tag--${cfg.tagVariant}`}>
            <span className="dot" />
            {cfg.tag}
          </span>
          <span className="dv2-solo-kind">Gifted Product</span>
        </div>

        <div className="dv2-solo-title-block">
          <h2 className="dv2-solo-title">Instant Beef Bone Broth Collection</h2>
          <div className="dv2-solo-meta">
            {isCompleted ? 'Started Apr 6 ' : 'Started Apr 6 '}
            {cfg.metaSuffix}
          </div>
        </div>

        <div className="dv2-solo-cta-row">
          <button type="button" className="dv2-solo-cta" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            {isCompleted ? 'View Recap' : 'Open Campaign'} <span>→</span>
          </button>
          {state === 'picks' && (
            <button type="button" className="dv2-solo-secondary" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              Review 4 creators
            </button>
          )}
          {state === 'review' && (
            <button type="button" className="dv2-solo-secondary" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              Approve 6 pieces
            </button>
          )}
          {state === 'live' && (
            <button type="button" className="dv2-solo-secondary" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              View analytics
            </button>
          )}
        </div>
      </div>

      <div className="dv2-solo-right">
        {state === 'searching' && <SoloSearching />}
        {state === 'picks' && <SoloPicksReady />}
        {state === 'invited' && <SoloInvited />}
        {state === 'production' && <SoloProduction />}
        {state === 'review' && <SoloContentReview />}
        {state === 'live' && <SoloLive />}
        {state === 'completed' && <SoloCompleted />}
      </div>
    </article>
  );
}

/* ─── State panels ─────────────────────────────── */
function SoloSearching() {
  return (
    <>
      <div className="dv2-solo-searching-pad">
        <div className="dv2-solo-searching-illustration">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="dv2-solo-searching-title">Finding your perfect creators</div>
          <div className="dv2-solo-searching-sub">
            Benable is matching creators to your brief. We'll notify you when picks are ready — usually within 6–24 hours.
          </div>
        </div>
      </div>
      <SoloStatsTrio
        a={{ value: 12, label: 'In network' }}
        b={{ value: 0, label: 'In campaign' }}
        c={{ value: '—', label: 'Started Apr 6' }}
      />
    </>
  );
}

function SoloPicksReady() {
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>★</span> Ready for your review
        </div>
        {SOLO_CREATORS_READY.slice(0, 4).map((c, i) => (
          <div key={i} className="dv2-solo-creator-row">
            <span className="dv2-solo-creator-avatar" style={{ backgroundImage: `url(${c.avatar})` }} />
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div className="dv2-solo-creator-name">{c.name}</div>
              <div className="dv2-solo-creator-meta">{c.meta}</div>
            </div>
            <span className="dv2-solo-creator-pill dv2-solo-creator-pill--ready">Ready</span>
          </div>
        ))}
      </div>
      <SoloStatsTrio
        a={{ value: 0, label: 'In campaign' }}
        b={{ value: 4, label: 'To review' }}
        c={{ value: 0, label: 'Shared' }}
      />
    </>
  );
}

function SoloInvited() {
  const accepted = SOLO_CREATORS_INVITED.filter((c) => c.status === 'accepted').length;
  const waiting = SOLO_CREATORS_INVITED.filter((c) => c.status === 'invited').length;
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>✉</span> Invitations sent
        </div>
        {SOLO_CREATORS_INVITED.map((c, i) => (
          <div key={i} className="dv2-solo-creator-row">
            <span className="dv2-solo-creator-avatar" style={{ backgroundImage: `url(${c.avatar})` }} />
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div className="dv2-solo-creator-name">{c.name}</div>
              <div className="dv2-solo-creator-meta">{c.meta}</div>
            </div>
            {c.status === 'accepted' && <span className="dv2-solo-creator-pill dv2-solo-creator-pill--accepted">Accepted</span>}
            {c.status === 'invited' && <span className="dv2-solo-creator-pill dv2-solo-creator-pill--invited">Awaiting reply</span>}
            {c.status === 'declined' && <span className="dv2-solo-creator-pill dv2-solo-creator-pill--declined">Declined</span>}
          </div>
        ))}
        <div className="dv2-solo-note">
          Waiting on {waiting} to respond · {accepted} accepted so far
        </div>
      </div>
      <SoloStatsTrio
        a={{ value: 4, label: 'Invited' }}
        b={{ value: accepted, label: 'Accepted' }}
        c={{ value: 1, label: 'Declined' }}
      />
    </>
  );
}

function SoloProduction() {
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>◐</span> Creators are making your content
        </div>
        {SOLO_CREATORS_PRODUCTION.map((c, i) => (
          <div key={i} className="dv2-solo-creator-row">
            <span className="dv2-solo-creator-avatar" style={{ backgroundImage: `url(${c.avatar})` }} />
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div className="dv2-solo-creator-name">{c.name}</div>
              <div className="dv2-solo-creator-meta">{c.meta}</div>
            </div>
            <span className="dv2-solo-creator-pill dv2-solo-creator-pill--progress">{c.progress}</span>
          </div>
        ))}
      </div>
      <SoloStatsTrio
        a={{ value: 3, label: 'In production' }}
        b={{ value: 1, label: 'Drafts in' }}
        c={{ value: 0, label: 'Approved' }}
      />
    </>
  );
}

function SoloContentReview() {
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>◉</span> Awaiting your approval
        </div>
        <div className="dv2-solo-content-grid">
          {SOLO_CONTENT_PIECES.map((p, i) => (
            <div key={i} className="dv2-solo-content-tile" style={{ background: p.bg }}>
              <span className="tile-type" aria-hidden="true">
                {p.type === 'video' ? '▶' : '◇'}
              </span>
              <span className="tile-creator">
                <span className="tile-avatar" style={{ backgroundImage: `url(${p.avatar})` }} />
                {p.creator}
              </span>
            </div>
          ))}
        </div>
        <div className="dv2-solo-note">
          6 pieces from 3 creators · oldest 2 days ago
        </div>
      </div>
      <SoloStatsTrio
        a={{ value: 6, label: 'Pending' }}
        b={{ value: 0, label: 'Approved' }}
        c={{ value: 0, label: 'Live' }}
      />
    </>
  );
}

function SoloLive() {
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>↗</span> Top performing
        </div>
        {SOLO_PERFORMANCE.map((p, i) => (
          <div key={i} className="dv2-solo-perf-row">
            <span className="dv2-solo-perf-thumb" style={{ background: p.bg }} />
            <div className="dv2-solo-perf-info">
              <div className="dv2-solo-perf-creator">{p.creator}</div>
              <div>
                <span className="dv2-solo-perf-metric">{p.metric}</span>{' '}
                <span className="dv2-solo-perf-metric-sub">{p.sub}</span>
              </div>
            </div>
            <span className="dv2-solo-perf-trend">↑ {p.trend}</span>
          </div>
        ))}
      </div>
      <SoloStatsTrio
        a={{ value: '322k', label: 'Total reach' }}
        b={{ value: '6.1%', label: 'Avg engagement' }}
        c={{ value: 6, label: 'Pieces live' }}
      />
    </>
  );
}

function SoloCompleted() {
  return (
    <>
      <div className="dv2-solo-card">
        <div className="dv2-solo-card-title">
          <span>✓</span> Wrap-up
        </div>
        <div style={{ fontSize: 13, color: '#404048', lineHeight: 1.5, marginBottom: 10 }}>
          Campaign ran 22 days. 3 creators delivered 6 pieces. Top performer Maya Chen drove 184k views with 7.2% engagement.
        </div>
        <div className="dv2-solo-content-grid">
          {SOLO_CONTENT_PIECES.slice(0, 3).map((p, i) => (
            <div key={i} className="dv2-solo-content-tile" style={{ background: p.bg }}>
              <span className="tile-creator">
                <span className="tile-avatar" style={{ backgroundImage: `url(${p.avatar})` }} />
                {p.creator}
              </span>
            </div>
          ))}
        </div>
      </div>
      <SoloStatsTrio
        a={{ value: '322k', label: 'Total reach' }}
        b={{ value: 6, label: 'Pieces delivered' }}
        c={{ value: 3, label: 'Creators' }}
      />
    </>
  );
}

function SoloStatsTrio({ a, b, c }) {
  return (
    <div className="dv2-solo-stats-card">
      <div className="dv2-solo-stat">
        <span className="dv2-solo-stat-value">{a.value}</span>
        <span className="dv2-solo-stat-label">{a.label}</span>
      </div>
      <div className="dv2-solo-stat">
        <span className="dv2-solo-stat-value">{b.value}</span>
        <span className="dv2-solo-stat-label">{b.label}</span>
      </div>
      <div className="dv2-solo-stat">
        <span className="dv2-solo-stat-value">{c.value}</span>
        <span className="dv2-solo-stat-label">{c.label}</span>
      </div>
    </div>
  );
}

function DCard({ campaign, onOpen }) {
  const {
    title, kind, started,
    yourCreators, inCampaign, toReview, contentShared,
    state, foundAvatars = [], visual,
  } = campaign;

  return (
    <article
      className={`dv2-d-card dv2-d-card--${visual}`}
      onClick={onOpen}
    >
      <div className="dv2-d-card-head">
        <span className={`dv2-d-tag ${state === 'searching' ? 'dv2-d-tag--searching' : ''}`}>
          <span className="dv2-d-tag-dot" />
          {state === 'searching' ? 'Searching' : 'Live'}
        </span>
        <span className="dv2-d-tag" style={{ background: 'rgba(255,255,255,0.55)' }}>
          {kind}
        </span>
      </div>

      <div className="dv2-d-title-block">
        <h2 className="dv2-d-title">{title}</h2>
        <div className="dv2-d-meta">Started {started}</div>
      </div>

      {state === 'found' && (
        <div className="dv2-d-creator-strip">
          <span className="dv2-avatar-cluster dv2-avatar--lg">
            {foundAvatars.slice(0, 3).map((src, i) => (
              <span key={i} className="dv2-avatar" style={{ backgroundImage: `url(${src})`, borderColor: '#fff' }} />
            ))}
          </span>
          <strong style={{ color: '#1a1a1f' }}>{toReview} creators</strong> ready for review
        </div>
      )}

      <div className="dv2-d-card-foot">
        <div className="dv2-d-stat-row">
          <div className="dv2-d-stat">
            <span className="dv2-d-stat-value">{inCampaign}</span>
            <span className="dv2-d-stat-label">In campaign</span>
          </div>
          <div className="dv2-d-stat">
            <span className="dv2-d-stat-value">{toReview}</span>
            <span className="dv2-d-stat-label">To review</span>
          </div>
          <div className="dv2-d-stat">
            <span className="dv2-d-stat-value">{contentShared}</span>
            <span className="dv2-d-stat-label">Shared</span>
          </div>
        </div>
        <button type="button" className="dv2-d-cta" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          Open <span>→</span>
        </button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────
   Shared: Drafts & past
   ──────────────────────────────────────────────── */
function ArchiveSection({ onOpen }) {
  if (ARCHIVE_CAMPAIGNS.length === 0) return null;
  return (
    <section className="dv2-archive">
      <div className="dv2-section-label">
        Drafts &amp; past <span className="count">{ARCHIVE_CAMPAIGNS.length}</span>
      </div>
      <div className="dv2-archive-list">
        {ARCHIVE_CAMPAIGNS.map((row, i) => (
          <div
            key={i}
            className="dv2-archive-row"
            role="button"
            tabIndex={0}
            onClick={() => onOpen(46)}
          >
            <div className="dv2-archive-name">{row.title}</div>
            <div className="dv2-archive-date">{row.date}</div>
            <div className="dv2-archive-status">
              {row.status === 'Draft' ? (
                <span className="dv2-draft-badge">Draft</span>
              ) : (
                <span className="status-pill status-active">
                  <span className="status-dot" /> {row.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
