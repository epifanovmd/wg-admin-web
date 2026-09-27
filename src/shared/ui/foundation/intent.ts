/**
 * Semantic intent → token-class maps. Single source of truth for how each
 * meaning looks, so adding a new intent or restyling one touches one place.
 *
 * SOLID   — filled background (Button, Chip).
 * SOFT    — tinted background (Badge, StatCard).
 * OUTLINE — bordered, transparent background (Chip inactive).
 *
 * Components compose these and append their own extras (hover, shadow).
 */
export const INTENT_SOLID = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
} as const;

export const INTENT_SOFT = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  purple: "bg-purple/15 text-purple",
} as const;

export const INTENT_OUTLINE = {
  primary:
    "border border-primary/40 bg-background text-primary hover:bg-primary/5",
  secondary:
    "border border-border bg-background text-secondary-foreground hover:bg-secondary/60",
  destructive:
    "border border-destructive/40 bg-background text-destructive hover:bg-destructive/5",
  success:
    "border border-success/40 bg-background text-success hover:bg-success/5",
  warning:
    "border border-warning/40 bg-background text-warning hover:bg-warning/5",
  info: "border border-info/40 bg-background text-info hover:bg-info/5",
} as const;

export type Intent = keyof typeof INTENT_SOLID;
