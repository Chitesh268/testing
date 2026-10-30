import { useEffect, useMemo, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  SVG filters used by the border frames (referenced from CSS)        */
/* ------------------------------------------------------------------ */
export function FxDefs() {
  return (
    <svg className="fx-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {/* two "frozen" lightning displacements; frames flicker between them with a compositor-only animation */}
        <filter id="el-a" x="-6%" y="-12%" width="112%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.034" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="el-b" x="-6%" y="-12%" width="112%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.031 0.026" numOctaves="3" seed="17" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="fire-orb" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves="2" seed="9" result="n">
            <animate attributeName="baseFrequency" dur="7s" values="0.035 0.06;0.045 0.08;0.035 0.06" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Ornate frame: electric ring + travelling aura + flame + corners    */
/* ------------------------------------------------------------------ */
const CURL = 'M15 15 C22 15 24 22 31 22 C36 22 38 18 35 15 C33 13 30 14 30 16 M15 15 C15 22 22 24 22 31 C22 36 18 38 15 35 C13 33 14 30 16 30';

function Corner({ pos }) {
  return (
    <svg className={`frame__corner frame__corner--${pos}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 54 V15 C3 8 8 3 15 3 H54" strokeWidth="2" />
      <path d="M9 46 V17 C9 12 12 9 17 9 H46" opacity=".55" />
      <path d={CURL} opacity=".9" />
      <path d="M3 24 H10 M24 3 V10" opacity=".7" />
      <circle cx="3" cy="58" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="58" cy="3" r="1.8" fill="currentColor" stroke="none" />
      <path d="M15 15 l3.2 0 l-1.6 -1.6 z M15 15 l0 3.2 l-1.6 -1.6 z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Gem({ at }) {
  return (
    <svg className={`frame__gem frame__gem--${at}`} viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M2 8 H40 M80 8 H118" opacity=".7" />
      <path d="M40 8 C46 8 50 3 54 3 M80 8 C74 8 70 3 66 3 M40 8 C46 8 50 13 54 13 M80 8 C74 8 70 13 66 13" opacity=".9" />
      <path d="M60 1.5 L67 8 L60 14.5 L53 8 Z" fill="#02060e" strokeWidth="1.6" />
      <circle cx="60" cy="8" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FLAME_COUNT = 16;
function Flames({ edge }) {
  const tongues = useMemo(() => Array.from({ length: FLAME_COUNT }, (_, i) => ({
    x: ((i + 0.5) * 100) / FLAME_COUNT,
    h: 30 + ((i * 37) % 26),
    w: 36 + ((i * 53) % 28),
    t: 2.1 + ((i * 13) % 10) / 10,
    d: -(((i * 29) % 22) / 10),
  })), []);
  const rows = edge === 'both' ? ['top', 'bottom'] : ['top'];
  return rows.map((r) => (
    <div className={`flames flames--${r}`} key={r} aria-hidden="true">
      {tongues.map((f, i) => (
        <i key={i} style={{ '--x': `${f.x}%`, '--h': `${f.h}px`, '--w': `${f.w}px`, '--t': `${f.t}s`, '--dl': `${f.d}s` }} />
      ))}
    </div>
  ));
}

export function Frame({ as: Tag = 'section', variant = 'card', flames, gem = true, className = '', style, children, ...rest }) {
  // random phase so neighbouring panels never pulse in unison
  const phase = useRef(null);
  if (phase.current === null) phase.current = -(Math.random() * 9).toFixed(2);
  return (
    <Tag className={`frame frame--${variant} ${className}`} style={{ '--ph': `${phase.current}s`, ...style }} {...rest}>
      <i className="frame__aura" aria-hidden="true" />
      <i className="frame__ring frame__ring--a" aria-hidden="true" />
      <i className="frame__ring frame__ring--b" aria-hidden="true" />
      <i className="frame__sweep" aria-hidden="true" />
      {flames && <Flames edge={flames} />}
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      {gem && <Gem at="bottom" />}
      <div className="frame__body">{children}</div>
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Full-screen canvas: rising embers, blue flame haze, lightning      */
/* ------------------------------------------------------------------ */
function sprite(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  return c;
}

function readColor(probe, css) {
  probe.fillStyle = '#27baff';
  probe.fillStyle = css || '#27baff';
  const v = probe.fillStyle;
  if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  const m = v.match(/[\d.]+/g) || [39, 186, 255];
  return [+m[0], +m[1], +m[2]];
}

function makeBolt(W, H, strong) {
  // enter from the top near one of the side edges and fork down
  const side = Math.random();
  const x0 = side < 0.4 ? W * (0.02 + Math.random() * 0.14) : side < 0.8 ? W * (0.84 + Math.random() * 0.14) : W * (0.2 + Math.random() * 0.6);
  const yEnd = H * (strong ? 0.55 + Math.random() * 0.4 : 0.28 + Math.random() * 0.5);
  const lines = [];
  const walk = (x1, y1, x2, y2, disp, depth, width) => {
    if (depth === 0 || Math.hypot(x2 - x1, y2 - y1) < 14) { lines.push([x1, y1, x2, y2, width]); return; }
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * disp;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * disp * 0.35;
    walk(x1, y1, mx, my, disp / 2, depth - 1, width);
    walk(mx, my, x2, y2, disp / 2, depth - 1, width);
    if (depth === 3 && Math.random() < 0.55) {
      const bx = mx + (Math.random() - 0.5) * 220;
      walk(mx, my, bx, my + 60 + Math.random() * 150, 60, 3, width * 0.55);
    }
  };
  walk(x0, -10, x0 + (Math.random() - 0.5) * 260, yEnd, 130, 6, 1);
  return { lines, age: 0, life: strong ? 0.75 : 0.5, strong };
}

export function FxCanvas({ level, burst }) {
  const ref = useRef(null);
  const engine = useRef(null);

  useEffect(() => {
    if (level === 'off') return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const probe = document.createElement('canvas').getContext('2d');
    const high = level === 'high';
    const frameMs = high ? 1000 / 30 : 1000 / 20;
    let W = 0, H = 0, raf = 0, last = 0, alive = true, colorAt = -1e9;
    let rgb = [39, 186, 255], rgb2 = [179, 246, 255];
    let glow = null, flame = null;
    let embers = [], tongues = [], bolts = [], flash = 0;
    let nextBolt = performance.now() + 2200;

    const build = () => {
      const [r, g, b] = rgb, [r2, g2, b2] = rgb2;
      glow = sprite(48, 48, (c, w, h) => {
        const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, `rgba(${r2},${g2},${b2},1)`); gr.addColorStop(0.25, `rgba(${r},${g},${b},.8)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        c.fillStyle = gr; c.fillRect(0, 0, w, h);
      });
      flame = sprite(64, 128, (c, w, h) => {
        c.save(); c.translate(w / 2, h); c.scale(1, 2);
        const gr = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
        gr.addColorStop(0, `rgba(${r2},${g2},${b2},.9)`); gr.addColorStop(0.35, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        c.fillStyle = gr; c.beginPath(); c.arc(0, 0, w / 2, Math.PI, 0); c.fill(); c.restore();
      });
    };

    const seed = () => {
      const n = Math.round(Math.min(high ? 78 : 34, (W * H) / (high ? 15000 : 32000)));
      embers = Array.from({ length: n }, () => spawnEmber(true));
      const t = Math.max(8, Math.min(26, Math.round(W / 70)));
      tongues = Array.from({ length: t }, (_, i) => ({ x: ((i + 0.5) / t) * W, w: (W / t) * (1.6 + Math.random()), p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.1, a: 0.5 + Math.random() * 0.5 }));
    };
    const spawnEmber = (anywhere) => ({
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10 + Math.random() * 40,
      vy: 16 + Math.random() * 46, sway: 8 + Math.random() * 26, ph: Math.random() * 6.28, f: 1.5 + Math.random() * 3,
      s: 2.2 + Math.random() * 5.5, a: 0.25 + Math.random() * 0.6,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, high ? 1.5 : 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const drawBolts = (dt) => {
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.age += dt;
        if (b.age > b.life) { bolts.splice(i, 1); continue; }
        const k = 1 - b.age / b.life;
        // strobe: bright - dim - bright - fade
        const strobe = b.age < 0.07 ? 1 : b.age < 0.12 ? 0.25 : b.age < 0.2 ? 0.95 : k * 0.8;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const passes = [[7, 0.16, rgb], [3.2, 0.5, rgb], [1.3, 1, [255, 255, 255]]];
        passes.forEach(([lw, al, col]) => {
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${al * strobe})`;
          b.lines.forEach(([x1, y1, x2, y2, w]) => { ctx.lineWidth = lw * w * (b.strong ? 1.25 : 1); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
        });
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < frameMs) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (now - colorAt > 700) {
        colorAt = now;
        const cs = getComputedStyle(document.documentElement);
        const n1 = readColor(probe, cs.getPropertyValue('--energy').trim());
        const n2 = readColor(probe, cs.getPropertyValue('--energy2').trim());
        if (!glow || n1.join() !== rgb.join() || n2.join() !== rgb2.join()) { rgb = n1; rgb2 = n2; build(); }
      }
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      // blue flame haze along the bottom of the screen
      for (const f of tongues) {
        const hgt = H * (0.1 + 0.1 * (0.5 + 0.5 * Math.sin(t * f.s + f.p))) * f.a;
        ctx.globalAlpha = 0.2 + 0.1 * Math.sin(t * f.s * 1.7 + f.p);
        ctx.drawImage(flame, f.x - f.w / 2 + Math.sin(t * 0.6 + f.p) * 10, H - hgt, f.w, hgt);
      }
      // embers
      for (const e of embers) {
        e.y -= e.vy * dt; e.x += Math.sin(t * 0.9 + e.ph) * e.sway * dt;
        if (e.y < -20) Object.assign(e, spawnEmber(false));
        const life = Math.max(0, Math.min(1, e.y / H));
        ctx.globalAlpha = e.a * (0.45 + 0.55 * Math.sin(t * e.f + e.ph)) * (0.25 + life);
        ctx.drawImage(glow, e.x - e.s, e.y - e.s, e.s * 2, e.s * 2);
      }
      ctx.globalAlpha = 1;

      // lightning
      if (now > nextBolt) {
        bolts.push(makeBolt(W, H, false)); flash = 0.07;
        if (Math.random() < 0.3) bolts.push(makeBolt(W, H, false));
        nextBolt = now + (high ? 3200 + Math.random() * 5200 : 6500 + Math.random() * 7000);
      }
      drawBolts(dt);
      if (flash > 0.002) {
        ctx.globalAlpha = flash; ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        flash *= 0.82;
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && alive) { last = 0; raf = requestAnimationFrame(frame); }
    };

    engine.current = {
      burst: () => {
        bolts.push(makeBolt(W, H, true), makeBolt(W, H, true), makeBolt(W, H, false));
        flash = 0.22;
      },
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false; engine.current = null;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [level]);

  useEffect(() => { if (burst) engine.current?.burst(); }, [burst]);

  if (level === 'off') return null;
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}
