import '@testing-library/jest-dom/vitest';

const mockCanvasContext2D = {
  beginPath() {},
  arcTo() {},
  clearRect() {},
  closePath() {},
  fill() {},
  moveTo() {},
  roundRect() {},
  setTransform() {},
  fillStyle: '',
} as unknown as CanvasRenderingContext2D;

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value(contextId: string) {
      if (contextId !== '2d') {
        return null;
      }

      return mockCanvasContext2D;
    },
  });
}
