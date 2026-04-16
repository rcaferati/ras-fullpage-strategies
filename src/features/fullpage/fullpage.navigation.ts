export const FULLPAGE_PATHS = ['/', '/page-two', '/page-three'] as const;
export const FULLPAGE_SLUGS = ['index', 'page-two', 'page-three'] as const;

export const FULLPAGE_ANIMATIONS = [
  'cubeAnimation',
  'fallAnimation',
  'foldOutAnimation',
  'openAnimation',
  'scaleOutAnimation',
] as const;

export type FullpagePath = (typeof FULLPAGE_PATHS)[number];
export type FullpageAnimation = (typeof FULLPAGE_ANIMATIONS)[number];
export type FullpageSlug = (typeof FULLPAGE_SLUGS)[number];

export type AnimationOption = {
  label: string;
  value: FullpageAnimation;
};

export const DEFAULT_ANIMATION: FullpageAnimation = 'foldOutAnimation';
export const ROOT_SLUG: FullpageSlug = 'index';

export const ANIMATION_OPTIONS: readonly AnimationOption[] = [
  { label: 'Cube Animation', value: 'cubeAnimation' },
  { label: 'Fall Animation', value: 'fallAnimation' },
  { label: 'Fold Out Animation', value: 'foldOutAnimation' },
  { label: 'Open Animation', value: 'openAnimation' },
  { label: 'Scale Out Animation', value: 'scaleOutAnimation' },
] as const;

export function normalizePathname(pathname: string): FullpagePath {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  return FULLPAGE_PATHS.includes(normalized as FullpagePath)
    ? (normalized as FullpagePath)
    : '/';
}

export function pathToSlug(pathname: string): FullpageSlug {
  const path = normalizePathname(pathname);
  return path === '/' ? ROOT_SLUG : (path.slice(1) as FullpageSlug);
}

export function slugToPath(slug: FullpageSlug): FullpagePath {
  return slug === ROOT_SLUG ? '/' : (`/${slug}` as FullpagePath);
}

export function isFullpageSlug(value: string): value is FullpageSlug {
  return FULLPAGE_SLUGS.includes(value as FullpageSlug);
}

export function isFullpageAnimation(
  value: string
): value is FullpageAnimation {
  return FULLPAGE_ANIMATIONS.includes(value as FullpageAnimation);
}
