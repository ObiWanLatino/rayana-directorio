import Image from "next/image";
import Link from "next/link";

type MakerayLogoSize = "sm" | "md" | "lg";

type MakerayLogoProps = {
  size?: MakerayLogoSize;
  /** true sobre fondo navy (footer, sidebar) */
  invert?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Solo el logo del nav landing suele necesitar priority (LCP) */
  priority?: boolean;
};

const sizeConfig: Record<
  MakerayLogoSize,
  { height: number; className: string }
> = {
  sm: { height: 40, className: "h-10" },
  md: { height: 48, className: "h-12" },
  lg: { height: 56, className: "h-14" },
};

export function MakerayLogo({
  size = "md",
  invert = false,
  href,
  onClick,
  className = "",
  priority = false,
}: MakerayLogoProps) {
  const cfg = sizeConfig[size];

  const img = (
    <Image
      src="/logo.png"
      alt="Makeray"
      width={200}
      height={cfg.height}
      className={[
        "w-auto object-contain",
        cfg.className,
        invert ? "brightness-0 invert opacity-90" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      priority={priority}
    />
  );

  const wrapClass = `inline-flex items-center ${onClick ? "cursor-pointer" : ""} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={wrapClass} onClick={onClick}>
        {img}
      </Link>
    );
  }

  return (
    <span className={wrapClass} onClick={onClick} role={onClick ? "button" : undefined}>
      {img}
    </span>
  );
}
