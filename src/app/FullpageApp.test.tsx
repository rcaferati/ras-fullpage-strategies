import React from 'react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockNavigationState = {
  slug: string;
  goto: string;
  navigating: boolean;
  pop: boolean;
};

type MockNavigate = (next: Partial<MockNavigationState> | string) => void;

const normalizePath = (value: string) => {
  const path = value.replace(/\/+$/, '') || '/';
  return path === '/page-two' || path === '/page-three' ? path : '/';
};

const pathToSlug = (value: string) => {
  const path = normalizePath(value);
  return path === '/' ? 'index' : path.slice(1);
};

const slugToPath = (value: string) => {
  return value === 'index' ? '/' : `/${value}`;
};

vi.mock('../features/fullpage/fullpage.adapter', async () => {
  const React = await import('react');

  const NavigationContext = React.createContext<
    | {
        navigation: MockNavigationState;
        navigate: MockNavigate;
        setNavigation: React.Dispatch<React.SetStateAction<MockNavigationState>>;
      }
    | null
  >(null);

  const NavigationProvider = ({
    slug,
    children,
  }: {
    slug: string;
    children?: React.ReactNode;
  }) => {
    const [navigation, setNavigation] = React.useState<MockNavigationState>(() => {
      const initialSlug = pathToSlug(slug);
      return {
        slug: initialSlug,
        goto: initialSlug,
        navigating: false,
        pop: false,
      };
    });

    const navigate: MockNavigate = (next) => {
      if (typeof next === 'string') {
        const nextSlug = pathToSlug(next);
        const nextPath = slugToPath(nextSlug);
        window.history.pushState({}, '', nextPath);
        setNavigation({
          slug: nextSlug,
          goto: nextSlug,
          navigating: false,
          pop: false,
        });
        return;
      }

      setNavigation((current) => {
        const merged = { ...current, ...next };
        const targetSlug = merged.goto || merged.slug;
        const targetPath = slugToPath(targetSlug);
        window.history.pushState({}, '', targetPath);
        return {
          ...merged,
          slug: targetSlug,
          goto: targetSlug,
          navigating: false,
          pop: false,
        };
      });
    };

    return (
      <NavigationContext.Provider
        value={{ navigation, navigate, setNavigation }}
      >
        {children}
      </NavigationContext.Provider>
    );
  };

  const useFullpageNavigation = () => {
    const value = React.useContext(NavigationContext);
    if (!value) {
      throw new Error('Missing NavigationContext');
    }

    return {
      navigation: value.navigation,
      navigate: value.navigate,
    };
  };

  const NavigationLink = ({
    href,
    className,
    children,
    ...extra
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
    const value = React.useContext(NavigationContext);

    if (!value) {
      throw new Error('Missing NavigationContext');
    }

    return (
      <a
        {...extra}
        href={href}
        className={className}
        onClick={(event) => {
          extra.onClick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          value.navigate(href);
        }}
      >
        {children}
      </a>
    );
  };

  const AwesomeSlider = ({
    animation,
    className,
    media = [],
    onTransitionEnd,
  }: {
    animation?: string | null;
    className?: string | null;
    media?: Array<{ slug?: string; children?: React.ReactNode }>;
    onTransitionEnd?: ((payload: { currentMedia?: { slug?: string } }) => void) | null;
  }) => {
    const { navigation } = useFullpageNavigation();
    const current =
      media.find((item) => (item.slug ?? '') === navigation.slug) ?? media[0];

    React.useEffect(() => {
      onTransitionEnd?.({ currentMedia: current });
    }, [current, onTransitionEnd]);

    return (
      <div
        className={className ?? undefined}
        data-testid="slider"
        data-animation={animation ?? ''}
      >
        {current?.children}
      </div>
    );
  };

  return {
    AwesomeSlider,
    NavigationLink,
    NavigationProvider,
    useFullpageNavigation,
    withNavigationHandlers: <P extends object,>(
      Component: React.ComponentType<P>
    ) => Component,
  };
});

import { FullpageApp } from './FullpageApp';

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<FullpageApp />);
};

describe('FullpageApp', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    document.body.className = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('selects the first slide on the root path', () => {
    const view = renderAtPath('/');
    expect(
      view.getByRole('heading', { name: 'INDEX', level: 1 })
    ).toBeInTheDocument();
  });

  it('renders the header navigation links with a canvas highlight layer', () => {
    const view = renderAtPath('/');

    expect(view.getByRole('link', { name: 'index' })).toBeInTheDocument();
    expect(view.getByRole('link', { name: 'page-two' })).toBeInTheDocument();
    expect(view.getByRole('link', { name: 'page-three' })).toBeInTheDocument();
    expect(view.getByTestId('page-header-nav-highlight')).toBeInTheDocument();
  });

  it.each([
    ['/', 'index'],
    ['/page-two', 'page-two'],
    ['/page-three', 'page-three'],
  ])('keeps the active nav link selected for %s', (path, label) => {
    const view = renderAtPath(path);
    expect(view.getByRole('link', { name: label })).toHaveClass('selected');
  });

  it('selects the second slide on /page-two', () => {
    const view = renderAtPath('/page-two');
    expect(
      view.getByRole('heading', { name: 'PAGE-TWO', level: 1 })
    ).toBeInTheDocument();
  });

  it('selects the third slide on /page-three', () => {
    const view = renderAtPath('/page-three');
    expect(
      view.getByRole('heading', { name: 'PAGE-THREE', level: 1 })
    ).toBeInTheDocument();
  });

  it('updates the URL and active nav state when a header link is clicked', async () => {
    const user = userEvent.setup();
    const view = renderAtPath('/');

    const pageTwoLink = view.getByRole('link', { name: 'page-two' });
    await user.click(pageTwoLink);

    expect(window.location.pathname).toBe('/page-two');
    expect(pageTwoLink).toHaveClass('selected');
    expect(
      view.getByRole('heading', { name: 'PAGE-TWO', level: 1 })
    ).toBeInTheDocument();
  });

  it('returns to the root route and highlights index when navigating back from page two', async () => {
    const user = userEvent.setup();
    const view = renderAtPath('/page-two');

    const indexLink = view.getByRole('link', { name: 'index' });
    await user.click(indexLink);

    expect(window.location.pathname).toBe('/');
    expect(indexLink).toHaveClass('selected');
    expect(
      view.getByRole('heading', { name: 'INDEX', level: 1 })
    ).toBeInTheDocument();
  });

  it('navigates with the CTA button', async () => {
    const user = userEvent.setup();
    const view = renderAtPath('/');

    await user.click(view.getByRole('button', { name: 'Goto the next page' }));

    expect(window.location.pathname).toBe('/page-two');
    expect(
      view.getByRole('heading', { name: 'PAGE-TWO', level: 1 })
    ).toBeInTheDocument();
  });

  it('changes the slider animation without changing the current route', async () => {
    const user = userEvent.setup();
    const view = renderAtPath('/page-three');

    await user.selectOptions(
      view.getByRole('combobox', { name: 'Transition animation' }),
      'cubeAnimation'
    );

    expect(window.location.pathname).toBe('/page-three');
    expect(view.getByTestId('slider')).toHaveAttribute(
      'data-animation',
      'cubeAnimation'
    );
    expect(
      view.getByRole('heading', { name: 'PAGE-THREE', level: 1 })
    ).toBeInTheDocument();
  });
});
