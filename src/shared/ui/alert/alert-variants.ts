import { cva, type VariantProps } from "class-variance-authority";

export const alertVariants = cva(
  "relative flex gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-muted/40 border-border",
        info: "bg-info/10 border-info/30",
        success: "bg-success/10 border-success/30",
        warning: "bg-warning/10 border-warning/30",
        destructive: "bg-destructive/10 border-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariant = NonNullable<
  VariantProps<typeof alertVariants>["variant"]
>;

export const ALERT_ICON_COLORS: Record<AlertVariant, string> = {
  default: "text-muted-foreground",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};
