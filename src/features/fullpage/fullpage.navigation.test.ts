import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ANIMATION,
  isFullpageAnimation,
  pathToSlug,
  ROOT_SLUG,
  slugToPath,
} from './fullpage.navigation';

describe('fullpage navigation helpers', () => {
  it('maps paths to supported slugs', () => {
    expect(pathToSlug('/')).toBe(ROOT_SLUG);
    expect(pathToSlug('/page-two')).toBe('page-two');
    expect(pathToSlug('/page-three/')).toBe('page-three');
  });

  it('falls back unknown paths to the root slug', () => {
    expect(pathToSlug('/unknown')).toBe(ROOT_SLUG);
  });

  it('maps slugs back to browser paths', () => {
    expect(slugToPath(ROOT_SLUG)).toBe('/');
    expect(slugToPath('page-two')).toBe('/page-two');
    expect(slugToPath('page-three')).toBe('/page-three');
  });

  it('recognizes supported animation names', () => {
    expect(isFullpageAnimation(DEFAULT_ANIMATION)).toBe(true);
    expect(isFullpageAnimation('cubeAnimation')).toBe(true);
    expect(isFullpageAnimation('not-real')).toBe(false);
  });
});
