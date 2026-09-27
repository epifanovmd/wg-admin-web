import { cn } from "@shared/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useCollapseContext } from "./collapse-context";
import { collapseContentVariants } from "./collapse-variants";

export interface CollapseContentProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** Не размонтировать содержимое в свёрнутом состоянии (формы, тяжёлые деревья). */
  keepMounted?: boolean;
}

const TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

const MOTION_VARIANTS = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

export const CollapseContent = ({
  children,
  className,
  innerClassName,
  keepMounted = false,
}: CollapseContentProps) => {
  const { isOpen, triggerId, contentId, variant } = useCollapseContext();

  const regionClass = cn(collapseContentVariants({ variant }), className);
  const innerNode = (
    <div className={cn("pt-1", innerClassName)}>{children}</div>
  );

  if (keepMounted) {
    return (
      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        inert={!isOpen}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={MOTION_VARIANTS}
        transition={TRANSITION}
        className={regionClass}
      >
        {innerNode}
      </motion.div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          initial="closed"
          animate="open"
          exit="closed"
          variants={MOTION_VARIANTS}
          transition={TRANSITION}
          className={regionClass}
        >
          {innerNode}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
