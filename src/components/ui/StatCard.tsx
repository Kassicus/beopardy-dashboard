import { forwardRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type AccentColor = "terracotta" | "rose" | "golden" | "cream";
type Trend = "up" | "down" | "neutral";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: Trend;
  icon?: React.ReactNode;
  accentColor?: AccentColor;
}

const accentStyles: Record<AccentColor, string> = {
  terracotta: "border-l-beo-terracotta",
  rose: "border-l-beo-rose",
  golden: "border-l-beo-golden",
  cream: "border-l-beo-cream-dark",
};

const trendStyles: Record<Trend, { icon: React.ReactNode; color: string }> = {
  up: { icon: <TrendingUp className="h-4 w-4" />, color: "text-green-600" },
  down: { icon: <TrendingDown className="h-4 w-4" />, color: "text-red-600" },
  neutral: { icon: <Minus className="h-4 w-4" />, color: "text-text-muted" },
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      subValue,
      trend,
      icon,
      accentColor = "terracotta",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-surface rounded-xl p-4
          border-l-4 ${accentStyles[accentColor]}
          shadow-sm
          ${className}
        `}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-secondary mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subValue && (
              <p className="text-sm text-text-muted mt-1">{subValue}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {icon && (
              <div className="p-2 bg-beo-cream/30 rounded-lg text-beo-terracotta">
                {icon}
              </div>
            )}
            {trend && (
              <div className={`flex items-center gap-1 ${trendStyles[trend].color}`}>
                {trendStyles[trend].icon}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
