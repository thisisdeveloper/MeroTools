import { useRef, TouchEvent } from 'react';

interface UseHorizontalSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

const MIN_DISTANCE = 60;
const MAX_DURATION_MS = 600;
const HORIZONTAL_BIAS = 1.5;
const MAX_ANCESTOR_DEPTH = 8;

const FORM_CONTROL_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

// Walks up from the touch target looking for anything that should own its
// own horizontal drag — a form control (e.g. a range slider) or any
// element that actually scrolls horizontally. This is deliberately generic
// (checks scrollWidth > clientWidth) rather than an allowlist of specific
// components, so any horizontal-scroll row added later is covered for free.
function touchStartsOnHorizontalDragTarget(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  let depth = 0;

  while (el && depth < MAX_ANCESTOR_DEPTH) {
    if (FORM_CONTROL_TAGS.has(el.tagName)) return true;
    if (el.scrollWidth > el.clientWidth + 1) return true;
    el = el.parentElement;
    depth++;
  }

  return false;
}

// Spread the returned handlers onto the element that should own the
// gesture. No touchmove/preventDefault involved, so normal scrolling and
// existing horizontal-scroll/drag content are never interfered with.
export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  disabled,
}: UseHorizontalSwipeOptions) {
  const startRef = useRef<{ x: number; y: number; time: number; ignored: boolean } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    if (disabled) {
      startRef.current = null;
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      ignored: touchStartsOnHorizontalDragTarget(e.target),
    };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start || start.ignored) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;

    if (dt > MAX_DURATION_MS) return;
    if (Math.abs(dx) < MIN_DISTANCE) return;
    if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_BIAS) return;

    if (dx > 0) onSwipeRight?.();
    else onSwipeLeft?.();
  };

  return { onTouchStart, onTouchEnd };
}
