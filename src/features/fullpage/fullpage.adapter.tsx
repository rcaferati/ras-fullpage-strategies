import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AwesomeSlider from '@rcaferati/react-awesome-slider';
import {
  isFullpageSlug,
  normalizePathname,
  pathToSlug,
  ROOT_SLUG,
  slugToPath,
  type FullpageSlug,
} from './fullpage.navigation';

export type SliderNavigationState = {
  slug: FullpageSlug;
  goto: FullpageSlug;
  navigating: boolean;
  pop: boolean;
};

export type SliderNavigate = (
  next: Partial<SliderNavigationState> | string
) => void;

export type FullpageNavigation = {
  navigation: SliderNavigationState;
  navigate: SliderNavigate;
};

type NavigationLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
};

type NavigationProviderProps = {
  slug: string;
  children?: React.ReactNode;
};

type SliderMedia = {
  slug?: string;
};

type SliderTransitionPayload = {
  currentMedia?: SliderMedia;
  nextMedia?: SliderMedia;
};

type NavigationHandledProps = {
  onTransitionStart?: (element: SliderTransitionPayload) => void;
  onTransitionEnd?: (element: SliderTransitionPayload) => void;
  onTransitionReject?: (element: SliderTransitionPayload) => void;
  selected?: number | string;
  buttons?: boolean;
  fillParent?: boolean;
  bullets?: boolean;
  infinite?: boolean;
};

type WithNavigationHandlersProps<P> = Omit<P, keyof NavigationHandledProps> &
  Partial<NavigationHandledProps>;

const FALLBACK_NAVIGATION: SliderNavigationState = {
  slug: ROOT_SLUG,
  goto: ROOT_SLUG,
  navigating: false,
  pop: false,
};

const FALLBACK_NAVIGATE: SliderNavigate = () => {};

const NavigationContext = createContext<
  [SliderNavigationState, SliderNavigate] | null
>(null);

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  );
}

function isExternalHref(href: string) {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^mailto:/i.test(href);
}

function getSlideSlug(slug?: string): FullpageSlug {
  return slug && isFullpageSlug(slug) ? slug : ROOT_SLUG;
}

function syncBrowserPath(slug: FullpageSlug, mode: 'push' | 'replace') {
  if (typeof window === 'undefined') {
    return;
  }

  const nextPath = slugToPath(slug);

  if (normalizePathname(window.location.pathname) === nextPath) {
    return;
  }

  window.history[mode === 'replace' ? 'replaceState' : 'pushState'](
    {},
    '',
    nextPath
  );
}

export function NavigationProvider({
  slug,
  children,
}: NavigationProviderProps) {
  const initialSlug = useMemo(() => pathToSlug(slug), [slug]);
  const [state, setState] = useState<SliderNavigationState>(() => ({
    slug: initialSlug,
    goto: initialSlug,
    navigating: false,
    pop: false,
  }));

  const navigate = useCallback<SliderNavigate>((next) => {
    setState((current) => {
      if (typeof next === 'string') {
        const nextSlug = pathToSlug(next);

        if (nextSlug === current.goto && current.pop === false) {
          return current;
        }

        return {
          ...current,
          goto: nextSlug,
          pop: false,
        };
      }

      return {
        ...current,
        ...next,
      };
    });
  }, []);

  return (
    <NavigationContext.Provider value={[state, navigate]}>
      {children}
    </NavigationContext.Provider>
  );
}

export function NavigationLink({
  href,
  className = undefined,
  onClick,
  children,
  ...extra
}: NavigationLinkProps) {
  const { navigation, navigate } = useFullpageNavigation();
  const goto = pathToSlug(href);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || !href) {
        return;
      }

      if (isExternalHref(href) || isModifiedClick(event)) {
        return;
      }

      event.preventDefault();

      if (navigation.navigating || goto === navigation.goto) {
        return;
      }

      navigate({
        ...navigation,
        goto,
        pop: false,
      });
    },
    [goto, href, navigate, navigation, onClick]
  );

  return (
    <a
      {...extra}
      className={className}
      href={href}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

export function withNavigationHandlers<T extends React.ElementType>(
  Component: T
) {
  type P = React.ComponentPropsWithoutRef<T>;
  const ManagedComponent = Component as unknown as React.ComponentType<P>;
  const componentName =
    typeof Component === 'string'
      ? Component
      : ((Component as { displayName?: string; name?: string }).displayName ??
        (Component as { displayName?: string; name?: string }).name ??
        'Component');

  function WithNavigationHandlers(props: WithNavigationHandlersProps<P>) {
    const { navigation, navigate } = useFullpageNavigation();
    const {
      onTransitionStart,
      onTransitionEnd,
      onTransitionReject,
      ...extra
    } = props;
    const navigationRef = useRef(navigation);

    useEffect(() => {
      navigationRef.current = navigation;
    }, [navigation]);

    useEffect(() => {
      const handlePopState = () => {
        navigate({
          ...navigationRef.current,
          goto: pathToSlug(window.location.pathname),
          pop: true,
        });
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    const handleStart = useCallback(
      (element: SliderTransitionPayload) => {
        const currentNavigation = navigationRef.current;
        const nextSlug = getSlideSlug(
          element.nextMedia?.slug ?? currentNavigation.goto
        );

        if (!currentNavigation.pop) {
          syncBrowserPath(nextSlug, 'push');
        }

        navigate({
          ...currentNavigation,
          goto: nextSlug,
          navigating: true,
        });

        onTransitionStart?.(element);
      },
      [navigate, onTransitionStart]
    );

    const handleEnd = useCallback(
      (element: SliderTransitionPayload) => {
        const currentNavigation = navigationRef.current;
        const currentSlug = getSlideSlug(
          element.currentMedia?.slug ?? currentNavigation.goto
        );

        syncBrowserPath(currentSlug, 'replace');
        navigate({
          ...currentNavigation,
          slug: currentSlug,
          goto: currentSlug,
          navigating: false,
          pop: false,
        });

        onTransitionEnd?.(element);
      },
      [navigate, onTransitionEnd]
    );

    const handleReject = useCallback(
      (element: SliderTransitionPayload) => {
        const currentSlug = pathToSlug(window.location.pathname);

        navigate({
          ...navigationRef.current,
          slug: currentSlug,
          goto: currentSlug,
          navigating: false,
          pop: false,
        });

        onTransitionReject?.(element);
      },
      [navigate, onTransitionReject]
    );

    return (
      <ManagedComponent
        {...({
          ...extra,
          buttons: true,
          fillParent: true,
          bullets: false,
          infinite: false,
          selected: navigation.goto,
          onTransitionStart: handleStart,
          onTransitionEnd: handleEnd,
          onTransitionReject: handleReject,
        } as P)}
      />
    );
  }

  WithNavigationHandlers.displayName = `withNavigationHandlers(${componentName})`;

  return WithNavigationHandlers;
}

export { AwesomeSlider };

export function useFullpageNavigation(): FullpageNavigation {
  const value = useContext(NavigationContext);

  const navigation = value?.[0] ?? FALLBACK_NAVIGATION;
  const navigate = value?.[1] ?? FALLBACK_NAVIGATE;

  return useMemo(
    () => ({
      navigation,
      navigate,
    }),
    [navigation, navigate]
  );
}
