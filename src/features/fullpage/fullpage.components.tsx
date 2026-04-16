import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { NavigationLink, useFullpageNavigation } from './fullpage.adapter';
import { FullpageNavHighlightCanvas } from './fullpage.nav-highlight';
import {
  ANIMATION_OPTIONS,
  ROOT_SLUG,
  slugToPath,
  type FullpageAnimation,
  type FullpagePath,
  type FullpageSlug,
} from './fullpage.navigation';
import { useFullpageSettings } from './fullpage.settings';

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
> & {
  selected: FullpageAnimation;
  onChange: (value: FullpageAnimation) => void;
};

type HeaderNavItem = {
  slug: FullpageSlug;
  href: FullpagePath;
  label: string;
};

const HEADER_NAV_ITEM_STAGGER_MS = 50;
const HEADER_NAV_ITEM_ENTER_DURATION_MS = 335;

const HEADER_NAV_ITEMS: readonly HeaderNavItem[] = [
  {
    slug: ROOT_SLUG,
    href: slugToPath(ROOT_SLUG),
    label: 'index',
  },
  {
    slug: 'page-two',
    href: slugToPath('page-two'),
    label: 'page-two',
  },
  {
    slug: 'page-three',
    href: slugToPath('page-three'),
    label: 'page-three',
  },
] as const;

export function FullpageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderNav />
      <main>{children}</main>
    </>
  );
}

export function HeaderNav() {
  const { navigation } = useFullpageNavigation();
  const currentSlug = navigation.slug;
  const navMotionStyle = {
    '--page-header-nav-enter-duration': `${HEADER_NAV_ITEM_ENTER_DURATION_MS}ms`,
    '--page-header-nav-highlight-delay': `${
      HEADER_NAV_ITEM_ENTER_DURATION_MS +
      (HEADER_NAV_ITEMS.length - 1) * HEADER_NAV_ITEM_STAGGER_MS
    }ms`,
  } as CSSProperties;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Partial<Record<FullpageSlug, HTMLDivElement | null>>>(
    {}
  );
  const [highlightSize, setHighlightSize] = useState({ width: 0, height: 0 });
  const [highlightTarget, setHighlightTarget] = useState({ x: 0, w: 0 });

  const measureHighlightTarget = useCallback((slug: FullpageSlug) => {
    const item = itemRefs.current[slug];

    if (!item) {
      return { x: 0, w: 0 };
    }

    return {
      x: item.offsetLeft,
      w: item.offsetWidth,
    };
  }, []);

  const syncHighlight = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const nextSize = {
      width: track.clientWidth,
      height: track.clientHeight,
    };
    const nextTarget = measureHighlightTarget(currentSlug);

    setHighlightSize((prev) =>
      prev.width === nextSize.width && prev.height === nextSize.height
        ? prev
        : nextSize
    );
    setHighlightTarget((prev) =>
      prev.x === nextTarget.x && prev.w === nextTarget.w ? prev : nextTarget
    );
  }, [currentSlug, measureHighlightTarget]);

  useLayoutEffect(() => {
    syncHighlight();
  }, [syncHighlight]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let frame = 0;

    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncHighlight();
      });
    };

    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(() => {
        scheduleSync();
      });

      resizeObserver.observe(track);

      return () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', scheduleSync);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleSync);
    };
  }, [syncHighlight]);

  return (
    <header className="page-header">
      <div className="page-header__wrapper">
        <div className="page-header__title">
          <ReactLogo />
          <div>
            <h1>
              <span>REACT</span>
              <span>AWESOME SLIDER</span>
            </h1>
            <h2>FULL-PAGE TRANSITION STRATEGY</h2>
            <small>
              Built with {'<3'} by{' '}
              <a
                target="_blank"
                rel="noreferrer noopener"
                href="https://caferati.me"
              >
                @rcaferati
              </a>
            </small>
          </div>
        </div>
        <nav aria-label="Primary">
          <div
            className="page-header__nav-track"
            ref={trackRef}
            style={navMotionStyle}
          >
            <div className="page-header__nav-canvas">
              <FullpageNavHighlightCanvas
                className="page-header__nav-highlight"
                target={highlightTarget}
                width={highlightSize.width}
                height={highlightSize.height}
                testId="page-header-nav-highlight"
              />
            </div>
            <div className="page-header__nav-items">
              {HEADER_NAV_ITEMS.map((item, index) => {
                const isSelected = currentSlug === item.slug;

                return (
                  <div
                    key={item.slug}
                    className="page-header__nav-item"
                    style={
                      {
                        '--page-header-nav-item-delay': `${
                          index * HEADER_NAV_ITEM_STAGGER_MS
                        }ms`,
                      } as CSSProperties
                    }
                    ref={(node) => {
                      if (node) {
                        itemRefs.current[item.slug] = node;
                        return;
                      }

                      delete itemRefs.current[item.slug];
                    }}
                  >
                    <NavigationLink
                      className={isSelected ? 'selected' : undefined}
                      aria-current={isSelected ? 'page' : undefined}
                      href={item.href}
                    >
                      {item.label}
                    </NavigationLink>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function ContentPanel({
  action,
  main,
}: {
  action: ReactNode;
  main: ReactNode;
}) {
  const { animation, setAnimation } = useFullpageSettings();

  return (
    <div className="content">
      <div className="content__main">{main}</div>
      <div className="content__action">
        <div className="content__action__select">
          <SelectField
            aria-label="Transition animation"
            selected={animation}
            onChange={setAnimation}
          />
        </div>
        <div className="content__action__go">{action}</div>
        <div className="content__action__github">
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/rcaferati/ras-fullpage-strategies"
          >
            <svg viewBox="0 0 16 16" version="1.1" aria-hidden="true">
              <path
                fillRule="evenodd"
                fill="#FFFFFF"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            <span>Source on Github</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function Lettering({
  text = [],
  title = '',
}: {
  text?: string[];
  title?: string;
}) {
  return (
    <div className="lettering">
      <h1>{title}</h1>
      {text.map((line, index) => (
        <p key={`${title}-${index}`}>{line}</p>
      ))}
    </div>
  );
}

export function Background({
  alt = 'background',
  src,
}: {
  src: string;
  alt?: string;
}) {
  return <img alt={alt} src={src} className="background" />;
}

export function MouseIndicator({ visible = true }: { visible?: boolean }) {
  const className = ['scroll'];

  if (!visible) {
    className.push('hidden');
  }

  return (
    <button className={className.join(' ')} title="Choose Wisely" type="button">
      <span />
    </button>
  );
}

export function Section({
  backgroundColor = '#FFFFFF',
  children,
  wrapper = true,
}: {
  children: ReactNode;
  wrapper?: boolean;
  backgroundColor?: string;
}) {
  return (
    <section className="section" style={{ backgroundColor }}>
      {wrapper ? <div className="section-wrapper">{children}</div> : children}
    </section>
  );
}

export function PageScroller({ children }: { children: ReactNode }) {
  return <div className="page">{children}</div>;
}

export function StartupScreen() {
  return (
    <div className="startup">
      <ReactLogo />
    </div>
  );
}

export function ReactLogo() {
  return (
    <div className="logo-container" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function SelectField({ onChange, selected, ...extra }: SelectFieldProps) {
  return (
    <select
      {...extra}
      value={selected}
      onChange={(event) => onChange(event.currentTarget.value as FullpageAnimation)}
    >
      {ANIMATION_OPTIONS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
