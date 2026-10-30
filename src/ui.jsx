import { useCallback, useEffect, useRef, useState } from 'react';
import { Frame } from './fx.jsx';
import { clockText } from './game.js';

/* ---------- icons (inline so nothing depends on an icon font) ---------- */
const PATHS = {
  status: 'M4 5h16v14H4z M8 9h8 M8 13h5',
  quests: 'M5 4h14v16H5z M8.5 9.5l1.8 1.8 3.2-3.2 M8.5 15.5h7',
  stats: 'M12 3l2.6 6.2 6.4.6-4.9 4.2 1.5 6.5L12 17.4 6.4 20.5 7.9 14 3 9.8l6.4-.6z',
  skills: 'M12 3v18 M12 8l-5-3 M12 8l5-3 M12 13l-6-3 M12 13l6-3 M12 18l-4-2 M12 18l4-2',
  bosses: 'M4 20L17 7 M14 4h6v6 M20 20L7 7 M4 10V4h6',
  achievements: 'M8 4h8v6a4 4 0 01-8 0z M8 6H4v2a3 3 0 003 3 M16 6h4v2a3 3 0 01-3 3 M12 14v4 M8 20h8',
  journal: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z M9 8.5h6 M9 12.5h6',
  settings: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5.3 5.3l2.1 2.1 M16.6 16.6l2.1 2.1 M18.7 5.3l-2.1 2.1 M7.4 16.6l-2.1 2.1',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  warn: 'M12 3l10 18H2z M12 10v5 M12 18v.5',
  down: 'M12 4v12 M7 11l5 5 5-5 M5 20h14',
  up: 'M12 20V8 M7 13l5-5 5 5 M5 4h14',
  play: 'M7 4l13 8-13 8z',
};
export function Icon({ name, size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="icon">
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- level orb with a live fire ring ---------- */
export function Orb({ level, rank }) {
  return (
    <div className="orb" role="img" aria-label={`Level ${level}, ${rank} rank`}>
      <span className="orb__fire" />
      <span className="orb__fire orb__fire--b" />
      <span className="orb__dash" />
      <span className="orb__dash orb__dash--b" />
      <div className="orb__core">
        <small>LEVEL</small>
        <strong>{level}</strong>
        <small>{rank}-RANK</small>
      </div>
    </div>
  );
}

export const XpBar = ({ pct }) => (
  <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
    <span style={{ width: pct + '%' }} />
  </div>
);

export function Timer() {
  const [t, setT] = useState(clockText());
  useEffect(() => { const id = setInterval(() => setT(clockText()), 1000); return () => clearInterval(id); }, []);
  return <span>{t}</span>;
}

/* ---------- typewriter text, like the System speaking ---------- */
function Typed({ text, instant, skip, onDone }) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) { setN(text.length); return undefined; }
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 12);
    return () => clearInterval(id);
  }, [text, instant]);
  useEffect(() => { if (skip) setN(text.length); }, [skip, text]);
  useEffect(() => { if (n >= text.length) onDone?.(); }, [n, text, onDone]);
  return <>{text.slice(0, n)}{n < text.length && <span className="caret" />}</>;
}

/* ---------- System notification window ---------- */
export function SystemWindow({ data, onClose, fx }) {
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(fx === 'off');
  const [skip, setSkip] = useState(false);
  const first = useRef(null);
  const actions = data.actions || [{ label: 'ACKNOWLEDGE ▸', kind: 'primary' }];

  const closingRef = useRef(false);
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(() => onClose(data.id), 340);
  }, [onClose, data.id]);

  useEffect(() => { first.current?.focus(); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  const markDone = useCallback(() => setDone(true), []);

  return (
    <div className={`sys-overlay ${closing ? 'crt-closing' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget && !data.actions) close(); }}>
      <Frame
        variant="alert" flames="top" gem
        className={`sys-alert ${data.variant === 'danger' ? 'is-danger' : ''}`}
        role="dialog" aria-modal="true" aria-label="System notification"
        onClick={() => setSkip(true)}
      >
        <div className="alert-head">
          <span className="alert-icon" aria-hidden="true">!</span>
          <span className="alert-label">{data.label || 'SYSTEM NOTIFICATION · PLAYER INTERFACE'}</span>
        </div>
        <h2 className="alert-heading">{data.title}</h2>
        <p className="alert-body" aria-label={data.body}>
          <Typed text={data.body} instant={fx === 'off'} skip={skip} onDone={markDone} />
        </p>
        {data.reward && <div className={`alert-reward ${done ? 'is-on' : ''}`}>{data.reward}</div>}
        <div className="alert-actions">
          {actions.map((a, i) => (
            <button
              key={a.label}
              ref={i === actions.length - 1 ? first : null}
              className={a.kind || ''}
              onClick={(e) => { e.stopPropagation(); a.onClick?.(); close(); }}
            >{a.label}</button>
          ))}
        </div>
      </Frame>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return <div key={toast.id} className={`toast ${toast.closing ? 'toast-closing' : ''}`} role="status">▸ {toast.msg}</div>;
}
