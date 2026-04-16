import { memo, useEffect, useRef } from 'react';

export type FullpageNavHighlightTarget = {
  x: number;
  w: number;
};

type FullpageNavHighlightCanvasProps = {
  target: FullpageNavHighlightTarget;
  width: number;
  height: number;
  className?: string;
  fillStyle?: string;
  testId?: string;
};

const DEFAULT_FILL_STYLE = 'rgba(0, 0, 0, 0.14)';
const DAMPING_FACTOR = 0.18;
const SETTLE_THRESHOLD = 0.1;

function resolvePixelRatio() {
  if (typeof window === 'undefined') {
    return 1;
  }

  return Math.max(window.devicePixelRatio || 1, 1);
}

function requestFrame(callback: FrameRequestCallback) {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }

  return window.setTimeout(() => callback(Date.now()), 16);
}

function cancelFrame(handle: number) {
  if (typeof window === 'undefined' || handle === 0) {
    return;
  }

  if (typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(handle);
    return;
  }

  window.clearTimeout(handle);
}

function getContext(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    return null;
  }

  try {
    return canvas.getContext('2d');
  } catch {
    return null;
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, safeRadius);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function drawHighlight(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  x: number,
  pillWidth: number,
  fillStyle: string
) {
  ctx.clearRect(0, 0, width, height);

  if (pillWidth <= 0.5 || height <= 0.5) {
    return;
  }

  ctx.fillStyle = fillStyle;
  drawRoundedRect(ctx, x, 0, pillWidth, height, height / 2);
  ctx.fill();
}

export const FullpageNavHighlightCanvas = memo(function FullpageNavHighlightCanvas({
  target,
  width,
  height,
  className,
  fillStyle = DEFAULT_FILL_STYLE,
  testId,
}: FullpageNavHighlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const sizeRef = useRef({ width, height });
  const targetRef = useRef(target);
  const stateRef = useRef({
    currentX: target.x,
    currentW: target.w,
    seeded: target.w > 0,
  });

  useEffect(() => {
    sizeRef.current = { width, height };

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (width <= 0 || height <= 0) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const dpr = resolvePixelRatio();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = getContext(canvas);
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawHighlight(
      ctx,
      width,
      height,
      stateRef.current.currentX,
      stateRef.current.currentW,
      fillStyle
    );
  }, [fillStyle, height, width]);

  useEffect(() => {
    targetRef.current = target;

    if ((!stateRef.current.seeded || stateRef.current.currentW <= 0.5) && target.w > 0.5) {
      stateRef.current.currentX = target.x;
      stateRef.current.currentW = target.w;
      stateRef.current.seeded = true;
    }
  }, [target]);

  useEffect(() => {
    const step = () => {
      const canvas = canvasRef.current;
      const ctx = getContext(canvas);

      if (!canvas || !ctx) {
        return;
      }

      const nextSize = sizeRef.current;
      if (nextSize.width <= 0 || nextSize.height <= 0) {
        frameRef.current = requestFrame(step);
        return;
      }

      const nextTarget = targetRef.current;
      const current = stateRef.current;

      if ((!current.seeded || current.currentW <= 0.5) && nextTarget.w > 0.5) {
        current.currentX = nextTarget.x;
        current.currentW = nextTarget.w;
        current.seeded = true;
      } else {
        const nextX =
          current.currentX + (nextTarget.x - current.currentX) * DAMPING_FACTOR;
        const nextW =
          current.currentW + (nextTarget.w - current.currentW) * DAMPING_FACTOR;

        if (
          Math.abs(nextTarget.x - nextX) < SETTLE_THRESHOLD &&
          Math.abs(nextTarget.w - nextW) < SETTLE_THRESHOLD
        ) {
          current.currentX = nextTarget.x;
          current.currentW = nextTarget.w;
        } else {
          current.currentX = nextX;
          current.currentW = nextW;
        }
      }

      const dpr = resolvePixelRatio();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHighlight(
        ctx,
        nextSize.width,
        nextSize.height,
        current.currentX,
        current.currentW,
        fillStyle
      );

      frameRef.current = requestFrame(step);
    };

    frameRef.current = requestFrame(step);

    return () => {
      cancelFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [fillStyle]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-testid={testId}
      aria-hidden="true"
    />
  );
});
