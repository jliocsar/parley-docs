'use client';

import { useTheme } from 'next-themes';
import { use, useEffect, useId, useRef, useState } from 'react';

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);

  if (cached) {
    return cached as Promise<T>;
  }

  const promise = setPromise();
  cache.set(key, promise);

  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<SvgPanZoom.Instance | null>(null);
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));
  const { default: svgPanZoom } = use(
    cachePromise('svg-pan-zoom', () => import('svg-pan-zoom')),
  );

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 1.5rem auto 0;',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () => {
      return mermaid.render(id.replaceAll(':', ''), chart.replaceAll('\\n', '\n'));
    }),
  );

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root) return;

    const imported = container.ownerDocument.importNode(root, true) as unknown as SVGSVGElement;
    container.appendChild(imported);
    bindFunctions?.(container);

    // Lock the stage's aspect ratio to the diagram's viewBox so the
    // diagram renders at its natural full-view size, then svg-pan-zoom
    // fills that stage and stays inside it while zooming.
    const vb = imported.viewBox.baseVal;
    if (vb && vb.width > 0 && vb.height > 0) {
      stage.style.aspectRatio = `${vb.width} / ${vb.height}`;
    }
    imported.style.width = '100%';
    imported.style.height = '100%';
    imported.style.cursor = 'grab';

    const instance = svgPanZoom(imported, {
      zoomEnabled: true,
      controlIconsEnabled: false,
      panEnabled: true,
      dblClickZoomEnabled: true,
      mouseWheelZoomEnabled: true,
      preventMouseEventsDefault: true,
      fit: true,
      center: true,
      contain: true,
      zoomScaleSensitivity: 0.45,
      minZoom: 0.5,
      maxZoom: 8,
    });
    panZoomRef.current = instance;

    const handleResize = () => {
      instance.resize();
      instance.fit();
      instance.center();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instance.destroy();
      panZoomRef.current = null;
    };
  }, [svg, bindFunctions, svgPanZoom]);

  const zoomIn = () => panZoomRef.current?.zoomIn();
  const zoomOut = () => panZoomRef.current?.zoomOut();
  const reset = () => {
    panZoomRef.current?.resetZoom();
    panZoomRef.current?.resetPan();
  };

  return (
    <div className="not-prose relative my-6">
      <div ref={stageRef} className="relative w-full overflow-hidden">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      <div className="absolute right-2 bottom-2 flex flex-row gap-1">
        <ControlButton onClick={zoomIn} label="Zoom in">
          <PlusIcon />
        </ControlButton>
        <ControlButton onClick={zoomOut} label="Zoom out">
          <MinusIcon />
        </ControlButton>
        <ControlButton onClick={reset} label="Reset view">
          <ResetIcon />
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-fd-border bg-fd-background/80 text-fd-muted-foreground backdrop-blur transition hover:text-fd-foreground hover:bg-fd-accent"
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 4 3 10 9 10" />
    </svg>
  );
}
