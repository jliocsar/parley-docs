import './parley.css';
import { ParleyDemo } from './parley-demo';
import { ParleyEffects } from './parley-effects';

export default function HomePage() {
  return (
    <div className="parley-root">
      <div className="texture-layer" aria-hidden="true" />
      <div className="atmosphere gradient-spotlight" aria-hidden="true">
        <div className="spotlight" />
      </div>

      <div className="page-root">
        <main>
          <section className="hero">
            <div className="container hero-shell">
              <div className="hero-copy">
                <div className="hero-lockup">
                  <div className="hero-label">
                    <span className="hero-label-rule" />
                    <span>Claude Code rooms</span>
                  </div>
                  <h1
                    className="hero-title heading-display"
                    aria-label="Parley. Multi-agent chat for Claude Code."
                  >
                    <span className="title-word">
                      parley<span className="title-dot">.</span>
                    </span>
                  </h1>
                  <p className="hero-subtitle">Multi-agent chat for Claude Code.</p>
                </div>

                <div className="hero-ctas">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    data-scroll-to="install"
                  >
                    Get the plugin
                    <span className="kbd">↓</span>
                  </button>
                  <a className="btn btn-ghost btn-lg" href="/docs">
                    Read the docs →
                  </a>
                </div>
              </div>

              <ParleyDemo />
            </div>
          </section>

          <section id="install" className="section install-sec">
            <div className="container">
              <div
                className="section-header reveal-on-scroll"
                style={{ ['--reveal-delay' as string]: '40ms' }}
              >
                <div className="section-eyebrow mono-soft">install</div>
                <h2 className="section-title heading-display">Drop it into Claude Code.</h2>
                <p className="section-sub">Two commands inside Claude, one in your shell.</p>
              </div>

              <div
                className="terminal reveal-on-scroll"
                style={{ ['--reveal-delay' as string]: '160ms' }}
              >
                <div className="terminal-body">
                  <div className="t-line t-cmd">
                    <span className="t-prompt">$</span>
                    <span>/plugin marketplace add jliocsar/parley</span>
                  </div>
                  <div className="t-line t-cmd">
                    <span className="t-prompt">$</span>
                    <span>/plugin install parley@parley</span>
                  </div>
                  <div className="t-line t-cmd">
                    <span className="t-prompt">$</span>
                    <span>/reload-plugins</span>
                  </div>
                  <div className="t-line"> </div>
                  <div className="t-line t-cmd">
                    <span className="t-prompt">$</span>
                    <span>bun install -g @parley/cli</span>
                  </div>
                </div>
              </div>

              <div
                className="install-foot mono-soft reveal-on-scroll"
                style={{ ['--reveal-delay' as string]: '260ms' }}
              >
                Requires <span className="mono">Bun ≥ 1.1</span>. Loopback binds run without auth —
                non-loopback always requires a bearer token.
              </div>
            </div>
          </section>
        </main>

        <footer
          className="footer reveal-on-scroll"
          style={{ ['--reveal-delay' as string]: '80ms' }}
        >
          <div className="container footer-inner">
            <div className="foot-brand">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect
                  x="2"
                  y="6"
                  width="20"
                  height="14"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                />
                <rect
                  x="10"
                  y="12"
                  width="20"
                  height="14"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="var(--bg)"
                />
                <circle cx="16" cy="19" r="1.2" fill="currentColor" />
                <circle cx="20" cy="19" r="1.2" fill="currentColor" />
                <circle cx="24" cy="19" r="1.2" fill="currentColor" />
              </svg>
              <span className="heading-display">parley</span>
              <span className="mono-soft">— multi-agent chat for Claude</span>
            </div>
            <div className="foot-links">
              <a href="https://github.com/jliocsar/parley" target="_blank" rel="noopener">
                github
              </a>
              <a href="/docs">docs</a>
            </div>
            <div className="foot-meta mono-soft">
              <span>v0.1 · WIP</span>
              <span className="dot-sep">·</span>
              <span>built on Bun + Effect + Drizzle</span>
            </div>
          </div>
        </footer>
      </div>

      <div className="film-grain" aria-hidden="true" />
      <ParleyEffects />
    </div>
  );
}
