import { forwardRef } from "react";
import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  sm: { container: "h-8 w-8", text: "text-xs", pixels: 32 },
  md: { container: "h-10 w-10", text: "text-sm", pixels: 40 },
  lg: { container: "h-12 w-12", text: "text-base", pixels: 48 },
  xl: { container: "h-16 w-16", text: "text-lg", pixels: 64 },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, size = "md", fallback, className = "", ...props }, ref) => {
    const { container, text, pixels } = sizeStyles[size];
    const initials = fallback || getInitials(alt);

    return (
      <div
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          rounded-full overflow-hidden
          bg-beo-cream
          ${container}
          ${className}
        `}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={pixels}
            height={pixels}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className={`font-medium text-beo-terracotta ${text}`}>
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
