import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 80,
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
  href?: string;
  priority?: boolean;
}

export function Logo({ size = "md", className, href, priority }: LogoProps) {
  const px = sizeMap[size];

  const image = (
    <Image
      src={LOGO_SRC}
      alt="BISWasend Pro"
      width={px}
      height={px}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
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
  height = 48,
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
      alt="BISWasend Pro"
      width={Math.round(height * 2.4)}
      height={height}
      priority={priority}
      className={cn("object-contain object-left", className)}
      style={{ height, width: "auto", maxHeight: height }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {image}
      </Link>
    );
  }

  return image;
}
