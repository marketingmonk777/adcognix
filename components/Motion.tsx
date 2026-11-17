'use client';
import { useEffect, useState } from 'react';
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** One observer for the whole page: [data-reveal] fades/slides in, [data-count] counts up, [data-parallax] drifts on scroll. */
export function MotionInit() {
  useEffect(() => {
    const rm = reduced(); const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const count = (el: HTMLElement) => {
      const to = Number(el.dataset.count); const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (rm || !to) { el.textContent = pre + to.toLocaleString('en-IN') + suf; return; }
      const t0 = performance.now(), dur = 1200; const step = (t: number) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = pre + Math.round(to * e).toLocaleString('en-IN') + suf; if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    };
    if (rm || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); document.querySelectorAll<HTMLElement>('[data-count]').forEach(count); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target as HTMLElement; el.classList.add('in'); el.querySelectorAll<HTMLElement>('[data-count]').forEach(count); if (el.dataset.count) count(el); io.unobserve(el); } }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
    const px = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')); let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => px.forEach(el => { const r = el.getBoundingClientRect(); const k = Number(el.dataset.parallax) || 0.08; const v = Math.max(-24, Math.min(24, (r.top + r.height / 2 - innerHeight / 2) * -k)); el.style.transform = `translate3d(0, ${v.toFixed(1)}px, 0)`; })); };
    if (px.length) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    return () => { io.disconnect(); removeEventListener('scroll', onScroll); };
  }, []);
  return null;
}
/** Cycles through words with a slide-up swap; each word carries its own gradient. */
export function RotatingWord({ words, ms = 2400, onIndex }: { words: { text: string; grad: string }[]; ms?: number; onIndex?: (i: number) => void }) {
  const [i, setI] = useState(0);
  useEffect(() => { if (reduced()) return; const t = setInterval(() => setI(x => { const n = (x + 1) % words.length; onIndex?.(n); return n; }), ms); return () => clearInterval(t); }, [words.length, ms, onIndex]);
  const longest = words.reduce((a, w) => (w.text.length > a.length ? w.text : a), '');
  return (<span className="rot" aria-live="polite">
    <span className="rot-sizer" aria-hidden="true">{longest}</span>
    {words.map((w, k) => <span key={w.text} className={'rot-w' + (k === i ? ' on' : '')} style={{ backgroundImage: w.grad }} aria-hidden={k !== i}>{w.text}</span>)}
  </span>);
}
