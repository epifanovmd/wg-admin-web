import { cva } from "class-variance-authority";

export const iconButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-accent text-accent-foreground",
        primary: "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        success: "hover:bg-success/10 text-success",
        warning: "hover:bg-warning/10 text-warning",
        destructive: "hover:bg-destructive/10 text-destructive",
        ghost: "text-foreground",
        solid:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary/85 shadow-sm hover:shadow-md",
      },
      /** Та же шкала высот, что у остальных контролов, плюс компактный `xs`. */
      size: {
        xs: "h-6 w-6 p-1",
        sm: "h-8 w-8 p-1.5",
        md: "h-10 w-10 p-2",
        lg: "h-12 w-12 p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);
