'use client';

import { useEffect } from 'react';

export function ParleyEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.parley-root');
    if (!root) return;

    const ctaHandlers: Array<{ btn: HTMLElement; handler: (e: Event) => void }> = [];
    root.querySelectorAll<HTMLElement>('[data-scroll-to]').forEach((btn) => {
      const handler = (e: Event) => {
        const id = btn.getAttribute('data-scroll-to');
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      };
      btn.addEventListener('click', handler);
      ctaHandlers.push({ btn, handler });
    });

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal-on-scroll'));
    let observer: IntersectionObserver | null = null;
    if (targets.length > 0) {
      if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-visible');
              observer?.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
        );
        targets.forEach((el) => observer!.observe(el));
      }
    }

    return () => {
      ctaHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
      observer?.disconnect();
    };
  }, []);

  return null;
}
