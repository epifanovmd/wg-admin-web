import { AnimatePresence, motion } from "motion/react";

import type { Ripple } from "./use-ripple";

export interface RippleLayerProps {
  ripples: Ripple[];
  onRippleComplete: (id: number) => void;
}

const RIPPLE_INITIAL = { scale: 0, opacity: 0.35 };
const RIPPLE_ANIMATE = { scale: 1, opacity: 0 };
const RIPPLE_TRANSITION = { duration: 0.6, ease: "easeOut" } as const;

export const RippleLayer = ({
  ripples,
  onRippleComplete,
}: RippleLayerProps) => (
  <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
    <AnimatePresence>
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-current"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          initial={RIPPLE_INITIAL}
          animate={RIPPLE_ANIMATE}
          transition={RIPPLE_TRANSITION}
          onAnimationComplete={() => onRippleComplete(ripple.id)}
        />
      ))}
    </AnimatePresence>
  </span>
);
