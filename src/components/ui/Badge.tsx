import { forwardRef } from "react";

type BadgeVariant = "default" | "terracotta" | "rose" | "golden" | "cream" | "success" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  terracotta: "bg-beo-terracotta/10 text-beo-terracotta",
  rose: "bg-beo-rose/10 text-beo-rose-dark",
  golden: "bg-beo-golden/20 text-beo-golden-dark",
  cream: "bg-beo-cream/30 text-beo-cream-dark",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", children, className = "", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          px-2.5 py-0.5
          text-xs font-medium
          rounded-full
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
