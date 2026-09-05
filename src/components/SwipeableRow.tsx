import React, { useRef, useState } from 'react';

export interface SwipeRevealAction {
  icon: React.FC<{ className?: string }>;
  bgClassName: string; // e.g. 'bg-emerald-500' or 'bg-red-600'
  ariaLabel: string;
  onTrigger: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  // Revealed on the row's left edge when the user drags it to the right.
  revealOnDragRight?: SwipeRevealAction;
  // Revealed on the row's right edge when the user drags it to the left.
  revealOnDragLeft?: SwipeRevealAction;
}

const ACTION_WIDTH = 72;
const REVEAL_THRESHOLD = 36;
const DIRECTION_LOCK_PX = 8;
const HORIZONTAL_BIAS = 1.2;

// A single swipeable list row: drag right reveals a left-edge action, drag
// left reveals a right-edge action. Tapping a revealed action fires it;
// tapping the row content while revealed just closes it.
//
// Calls stopPropagation on its own touch handlers so it doesn't fight the
// app-level swipe-left/right (tab switch) gesture on <main> — that hook
// only listens for touchstart/touchend, so stopping those here is enough.
// `touch-action: pan-y` lets the browser keep handling vertical page
// scroll natively while this component owns horizontal drags, without
// needing (React-synthetic-event-unfriendly) preventDefault calls.
export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  revealOnDragRight,
  revealOnDragLeft,
}) => {
  const [dragX, setDragX] = useState(0);
  const [revealed, setRevealed] = useState<'left' | 'right' | null>(null);
  const drag = useRef<{ startX: number; startY: number; committed: boolean } | null>(null);

  const closedX = revealed === 'left' ? ACTION_WIDTH : revealed === 'right' ? -ACTION_WIDTH : 0;
  const isDragging = drag.current?.committed ?? false;
  const displayX = isDragging ? dragX : closedX;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const t = e.touches[0];
    if (!t) return;
    drag.current = { startX: t.clientX, startY: t.clientY, committed: false };
    setDragX(closedX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const state = drag.current;
    if (!state) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - state.startX;
    const dy = t.clientY - state.startY;

    if (!state.committed) {
      if (Math.abs(dx) < DIRECTION_LOCK_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_BIAS) {
        drag.current = null; // vertical scroll wins — release control
        return;
      }
      state.committed = true;
    }

    const maxRight = revealOnDragRight ? ACTION_WIDTH : 0;
    const maxLeft = revealOnDragLeft ? -ACTION_WIDTH : 0;
    setDragX(Math.max(maxLeft, Math.min(maxRight, closedX + dx)));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const state = drag.current;
    const wasCommitted = state?.committed ?? false;
    drag.current = null;

    if (!wasCommitted) {
      if (revealed) setRevealed(null); // tap while revealed = dismiss
      return;
    }
    if (dragX >= REVEAL_THRESHOLD && revealOnDragRight) setRevealed('left');
    else if (dragX <= -REVEAL_THRESHOLD && revealOnDragLeft) setRevealed('right');
    else setRevealed(null);
  };

  const RightRevealIcon = revealOnDragRight?.icon;
  const LeftRevealIcon = revealOnDragLeft?.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {revealOnDragRight && RightRevealIcon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            revealOnDragRight.onTrigger();
            setRevealed(null);
          }}
          aria-label={revealOnDragRight.ariaLabel}
          className={`absolute inset-y-0 left-0 flex items-center justify-center text-white ${revealOnDragRight.bgClassName}`}
          style={{ width: ACTION_WIDTH }}
        >
          <RightRevealIcon className="w-5 h-5" />
        </button>
      )}
      {revealOnDragLeft && LeftRevealIcon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            revealOnDragLeft.onTrigger();
            setRevealed(null);
          }}
          aria-label={revealOnDragLeft.ariaLabel}
          className={`absolute inset-y-0 right-0 flex items-center justify-center text-white ${revealOnDragLeft.bgClassName}`}
          style={{ width: ACTION_WIDTH }}
        >
          <LeftRevealIcon className="w-5 h-5" />
        </button>
      )}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${displayX}px)`,
          touchAction: 'pan-y',
          transition: isDragging ? 'none' : 'transform 200ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
