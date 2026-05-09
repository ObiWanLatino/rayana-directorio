import Image from "next/image";
import Link from "next/link";

type MakerayLogoProps = {
  href?: string;
  /** nav: claro | footer/sidebar: invertido sobre navy */
  variant: "nav" | "footer" | "sidebar";
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function MakerayLogo({
  href = "/",
  variant,
  className = "",
  priority = false,
  onClick,
}: MakerayLogoProps) {
  const imgClass =
    variant === "footer"
      ? "h-12 w-auto max-w-[140px] object-contain brightness-0 invert opacity-90"
      : variant === "sidebar"
        ? "h-9 w-auto max-w-[120px] object-contain brightness-0 invert"
        : "h-10 w-auto max-w-[120px] object-contain";

  const img = (
    <Image
      src="/logo.png"
      alt="Makeray"
      width={160}
      height={96}
      className={imgClass}
      priority={priority}
    />
  );

  if (!href) {
    return <span className={`inline-flex items-center ${className}`}>{img}</span>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
      onClick={onClick}
    >
      {img}
    </Link>
  );
}
