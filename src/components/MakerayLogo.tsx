import Image from "next/image";
import Link from "next/link";

type MakerayLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  /** true sobre fondo navy (footer, sidebar) */
  invert?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Solo el logo del nav landing suele necesitar priority (LCP) */
  priority?: boolean;
};

const heightMap = { sm: 40, md: 52, lg: 64, xl: 120 } as const;

export function MakerayLogo({
  size = "md",
  invert = false,
  href,
  onClick,
  className,
  priority = false,
}: MakerayLogoProps) {
  const h = heightMap[size];

  const img = (
    <Image
      src="/logo.png"
      alt="Makeray"
      width={300}
      height={h}
      priority={priority}
      style={{
        height: `${h}px`,
        width: "auto",
        objectFit: "contain",
        display: "block",
        filter: invert ? "brightness(0) invert(1)" : "none",
      }}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={className}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        {img}
      </Link>
    );
  }

  return (
    <span
      className={className}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
      }}
      role={onClick ? "button" : undefined}
    >
      {img}
    </span>
  );
}
