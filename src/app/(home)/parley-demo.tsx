'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

type Part = string | { em: string };

type Entry =
  | { kind: 'user'; text: string; preDelay?: number }
  | { kind: 'tool'; text: string; preDelay?: number }
  | { kind: 'result'; text?: string; parts?: Part[]; preDelay?: number }
  | { kind: 'send'; channel: string; text?: string; preDelay?: number }
  | { kind: 'receive'; channel: string; text: string; crossPane?: boolean; preDelay?: number }
  | { kind: 'wait'; channel: string }
  | {
      kind: 'spin';
      spinId: string;
      verb: string;
      preDelay?: number;
      extraGap?: number;
    };

const PANES: Record<'L' | 'R', Entry[]> = {
  L: [
    { kind: 'user', text: 'join room "demo"' },
    { kind: 'tool', text: 'Called plugin:parley:parley' },
    {
      kind: 'result',
      parts: ['Joined ', { em: 'demo' }, ' as ', { em: 'autumn-elk' }, '. 1 member.'],
    },
    { kind: 'send', channel: 'lJoined' },
    { kind: 'spin', spinId: 'l1', verb: 'Sautéed' },

    { kind: 'receive', channel: 'status', text: 'parley: status?', crossPane: true },
    { kind: 'result', text: 'silent-penguin asked for status.' },
    { kind: 'spin', spinId: 'l2', verb: 'Churned', extraGap: 1200 },

    { kind: 'user', text: 'reply: cache is warm' },
    { kind: 'tool', text: 'Called plugin:parley:parley' },
    { kind: 'send', channel: 'cache', text: 'parley: cache is warm' },
    { kind: 'result', text: 'Sent status update.' },
    { kind: 'spin', spinId: 'l3', verb: 'Churned' },
  ],
  R: [
    { kind: 'wait', channel: 'lJoined' },
    { kind: 'user', text: 'join room "demo" and say status', preDelay: 1200 },
    { kind: 'tool', text: 'Called plugin:parley:parley 2 times' },
    { kind: 'send', channel: 'status', text: 'parley: status?' },
    { kind: 'result', text: 'Joined "demo" as silent-penguin and sent "status?"' },
    { kind: 'spin', spinId: 'r1', verb: 'Brewed' },

    { kind: 'receive', channel: 'cache', text: 'parley: cache is warm', crossPane: true },
    { kind: 'result', text: 'autumn-elk says cache is warm.' },
    { kind: 'spin', spinId: 'r2', verb: 'Worked' },
  ],
};

const CHAR_DELAY = 22;
const POST_BUFFER = 260;
const POST_BUFFER_INSTANT = 110;
const FADE_DURATION = 360;
const SPIN_PAUSE = 600;
const UNDIM_HOLD = 2400;
const RESTART_PAUSE = 1600;
const DEMO_START_DELAY = 1620;

const PRE_THINK = 850;
const PRE_REASON = 720;
const PRE_RECEIVE = 60;

type VisualKind = 'user' | 'tool' | 'result' | 'inbound' | 'spin' | 'send' | 'wait';

const visualKind = (k: Entry['kind']): VisualKind => (k === 'receive' ? 'inbound' : k);

const animModeFor = (k: Entry['kind']): 'fade' | 'type' => {
  const v = visualKind(k);
  return v === 'tool' || v === 'inbound' ? 'fade' : 'type';
};

const preDelayFor = (entry: Entry): number => {
  if ('preDelay' in entry && typeof entry.preDelay === 'number') return entry.preDelay;
  const k = entry.kind;
  if (k === 'tool') return PRE_THINK;
  if (k === 'result') return PRE_REASON;
  if (k === 'send' || k === 'receive') return PRE_RECEIVE;
  return 0;
};

type Char = { ch: string; cls: string | null };

function buildChars(line: Entry): Char[] {
  const out: Char[] = [];
  if ('parts' in line && line.parts) {
    line.parts.forEach((p) => {
      if (typeof p === 'string') {
        [...p].forEach((ch) => out.push({ ch, cls: null }));
      } else if (p && typeof p === 'object' && 'em' in p) {
        [...p.em].forEach((ch) => out.push({ ch, cls: 'cc-em' }));
      }
    });
  } else if ('text' in line && typeof line.text === 'string') {
    [...line.text].forEach((ch) => out.push({ ch, cls: null }));
  }
  return out;
}

function appendTypedSpans(parent: HTMLElement, chars: Char[], mode: 'fade' | 'type') {
  const spans = chars.map((c) => {
    const s = document.createElement('span');
    if (c.cls) s.className = c.cls;
    s.textContent = c.ch;
    s.style.opacity = '0';
    parent.appendChild(s);
    return s;
  });
  if (spans.length === 0) return;
  if (mode === 'fade') {
    animate(spans, { opacity: [0, 1], duration: FADE_DURATION, ease: 'outQuad' });
  } else {
    animate(spans, {
      opacity: [0, 1],
      duration: 30,
      ease: 'linear',
      delay: stagger(CHAR_DELAY),
    });
  }
}

function createEntryEl(entry: Entry, spinSec: number): HTMLDivElement | null {
  const wrap = document.createElement('div');
  wrap.className = 'cc-entry';

  if (entry.kind === 'spin') {
    const line = document.createElement('div');
    line.className = 'cc-line cc-spin cc-fadein';
    const spark = document.createElement('span');
    spark.className = 'cc-spark';
    spark.textContent = '✻';
    const text = document.createElement('span');
    text.textContent = `${entry.verb} for ${spinSec}s`;
    line.append(spark, text);
    wrap.appendChild(line);
    return wrap;
  }

  const chars = buildChars(entry);
  const mode = animModeFor(entry.kind);

  if (entry.kind === 'user') {
    const block = document.createElement('div');
    block.className = 'cc-userblock';
    const ruleA = document.createElement('div');
    ruleA.className = 'cc-rule';
    const user = document.createElement('div');
    user.className = 'cc-user';
    const chev = document.createElement('span');
    chev.className = 'cc-chev';
    chev.textContent = '❯';
    const text = document.createElement('span');
    user.append(chev, text);
    const ruleB = document.createElement('div');
    ruleB.className = 'cc-rule';
    block.append(ruleA, user, ruleB);
    wrap.appendChild(block);
    appendTypedSpans(text, chars, mode);
    return wrap;
  }

  if (entry.kind === 'tool') {
    const line = document.createElement('div');
    line.className = 'cc-line cc-tool';
    wrap.appendChild(line);
    appendTypedSpans(line, chars, mode);
    return wrap;
  }

  if (entry.kind === 'result') {
    const line = document.createElement('div');
    line.className = 'cc-line cc-result';
    const bullet = document.createElement('span');
    bullet.className = 'cc-bullet';
    bullet.textContent = '●';
    const text = document.createElement('span');
    line.append(bullet, text);
    wrap.appendChild(line);
    appendTypedSpans(text, chars, mode);
    return wrap;
  }

  if (visualKind(entry.kind) === 'inbound') {
    const isReceive = entry.kind === 'receive';
    const line = document.createElement('div');
    line.className =
      'cc-line cc-inbound' + (isReceive && entry.crossPane ? ' cc-inbound-flash' : '');
    const arrow = document.createElement('span');
    arrow.className = 'cc-arrow';
    arrow.textContent = '←';
    const text = document.createElement('span');
    line.append(arrow, text);
    wrap.appendChild(line);
    appendTypedSpans(text, chars, mode);
    return wrap;
  }

  return null;
}

export function ParleyDemo() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const leftBodyRef = useRef<HTMLDivElement | null>(null);
  const rightBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const bodies = { L: leftBodyRef.current, R: rightBodyRef.current };
    if (!frame || !bodies.L || !bodies.R) return;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const scrollPane = (el: HTMLElement) =>
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });

    let runToken = 0;
    let stopped = false;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    async function runOnce() {
      const myToken = ++runToken;
      const cancelled = () => stopped || myToken !== runToken;

      bodies.L!.replaceChildren();
      bodies.R!.replaceChildren();

      const channels: Record<
        string,
        { promise: Promise<void>; resolve: () => void; fired: boolean }
      > = {};
      const initChannel = (name: string) => {
        let resolve!: () => void;
        const promise = new Promise<void>((r) => {
          resolve = r;
        });
        channels[name] = { promise, resolve, fired: false };
      };
      initChannel('status');
      initChannel('cache');
      initChannel('lJoined');

      const renderedEls: Record<'L' | 'R', HTMLElement[]> = { L: [], R: [] };

      const runPane = async (pane: 'L' | 'R') => {
        const script = PANES[pane];
        const body = bodies[pane]!;
        let batchStart: number | null = null;
        let pendingNewBatch = false;

        for (let i = 0; i < script.length; i++) {
          if (cancelled()) return;
          const entry = script[i];

          if (entry.kind === 'send') {
            const ch = channels[entry.channel];
            if (ch && !ch.fired) {
              ch.fired = true;
              ch.resolve();
            }
            continue;
          }
          if (entry.kind === 'wait') {
            await channels[entry.channel].promise;
            if (cancelled()) return;
            continue;
          }

          if (entry.kind === 'receive') {
            await channels[entry.channel].promise;
            if (cancelled()) return;
          } else {
            const pre = preDelayFor(entry);
            if (pre > 0) {
              await sleep(pre);
              if (cancelled()) return;
            }
          }

          const isSpin = entry.kind === 'spin';

          if (!isSpin && pendingNewBatch) {
            renderedEls[pane].forEach((el) => el.classList.add('cc-dimmed'));
            pendingNewBatch = false;
          }
          if (!isSpin && batchStart == null) batchStart = Date.now();

          let spinSec = 1;
          if (isSpin) {
            const start = batchStart ?? Date.now();
            spinSec = Math.max(1, Math.round((Date.now() - start) / 1000));
            batchStart = null;
            pendingNewBatch = true;
          }

          const el = createEntryEl(entry, spinSec);
          if (el) {
            body.appendChild(el);
            renderedEls[pane].push(el);
          }

          await new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          );
          if (cancelled()) return;
          scrollPane(body);

          if (isSpin) {
            await sleep(SPIN_PAUSE);
          } else {
            const chars = buildChars(entry);
            const mode = animModeFor(entry.kind);
            const dur =
              mode === 'fade'
                ? FADE_DURATION + POST_BUFFER_INSTANT
                : chars.length * CHAR_DELAY + POST_BUFFER;
            await sleep(dur);
          }
          if (cancelled()) return;

          if ('extraGap' in entry && entry.extraGap) {
            await sleep(entry.extraGap);
            if (cancelled()) return;
          }
        }
      };

      await Promise.all([runPane('L'), runPane('R')]);
      if (cancelled()) return;

      renderedEls.L.concat(renderedEls.R).forEach((el) => el.classList.remove('cc-dimmed'));
      await sleep(UNDIM_HOLD);
      if (cancelled()) return;
      await sleep(RESTART_PAUSE);
      if (cancelled()) return;

      runOnce();
    }

    function start() {
      frame!.classList.add('is-visible');
      startTimer = setTimeout(runOnce, DEMO_START_DELAY);
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (!e || !e.isIntersecting) return;
          observer?.disconnect();
          start();
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.35 },
      );
      observer.observe(frame);
    } else {
      start();
    }

    return () => {
      stopped = true;
      runToken++;
      if (startTimer) clearTimeout(startTimer);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="hero-demo-below" aria-label="Live multi-agent transcript">
      <div className="demo-frame" ref={frameRef}>
        <div className="cc-grid">
          <div className="cc-pane" data-pane="L">
            <div className="cc-pane-label">
              <span className="cc-pane-dot"></span>
              <span className="cc-pane-name">autumn-elk</span>
            </div>
            <div className="cc-body" ref={leftBodyRef}></div>
          </div>
          <div className="cc-pane" data-pane="R">
            <div className="cc-pane-label">
              <span className="cc-pane-dot"></span>
              <span className="cc-pane-name">silent-penguin</span>
            </div>
            <div className="cc-body" ref={rightBodyRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
