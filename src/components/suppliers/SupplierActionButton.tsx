import {
  IconInstagram,
  IconPin,
  IconWhatsApp,
} from "@/components/suppliers/directory-icons";

type Kind = "whatsapp" | "instagram" | "map";

type SupplierActionButtonProps = {
  kind: Kind;
  disabled: boolean;
  href?: string;
  title?: string;
};

export function SupplierActionButton({
  kind,
  disabled,
  href,
  title,
}: SupplierActionButtonProps) {
  const config = {
    whatsapp: {
      bg: "#25D366",
      icon: <IconWhatsApp />,
      iconDis: <IconWhatsApp color="#B8B0A4" />,
    },
    instagram: {
      bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      icon: <IconInstagram />,
      iconDis: <IconInstagram color="#B8B0A4" />,
    },
    map: {
      bg: "#4285F4",
      icon: <IconPin />,
      iconDis: <IconPin color="#B8B0A4" />,
    },
  }[kind];

  const defaultTitle =
    kind === "whatsapp"
      ? "Sin WhatsApp"
      : kind === "instagram"
        ? "Sin Instagram"
        : "Sin ubicación";

  if (disabled || !href) {
    return (
      <div
        title={title ?? defaultTitle}
        className="clay-action-btn-disabled flex shrink-0 items-center justify-center rounded-full"
        style={{ width: 38, height: 38 }}
      >
        {config.iconDis}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="clay-action-btn flex shrink-0 items-center justify-center rounded-full transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]"
      style={{
        width: 38,
        height: 38,
        background: config.bg,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(1px)";
        e.currentTarget.style.boxShadow =
          "1px 1px 3px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.2)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {config.icon}
    </a>
  );
}
