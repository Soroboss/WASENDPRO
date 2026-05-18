import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

const LOGO_SRC = "/logo.png";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<LogoSize, number> = {
  xs: 32,
  sm: 44,
  md: 52,
  lg: 68,
  xl: 96,
  "2xl": 128,
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
  href?: string;
  priority?: boolean;
}

const logoImageClass =
  "object-contain bg-transparent [background:transparent]";

export function Logo({ size = "md", className, href, priority }: LogoProps) {
  const px = sizeMap[size];

  const image = (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={px}
      height={px}
      priority={priority}
      className={cn(logoImageClass, className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center bg-transparent">
        {image}
      </Link>
    );
  }

  return image;
}

/** Logo complet (icône + texte intégrés dans l’image). */
export function LogoFull({
  className,
  href,
  height = 56,
  priority,
}: {
  className?: string;
  href?: string;
  height?: number;
  priority?: boolean;
}) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={Math.round(height * 2.5)}
      height={height}
      priority={priority}
      className={cn(
        logoImageClass,
        "object-contain object-center",
        className
      )}
      style={{
        height,
        width: "auto",
        maxHeight: height,
        minWidth: Math.round(height * 1.8),
      }}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center shrink-0 bg-transparent"
      >
        {image}
      </Link>
    );
  }

  return image;
}
