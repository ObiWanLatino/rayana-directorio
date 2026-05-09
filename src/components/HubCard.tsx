"use client";

import Link from "next/link";

export type HubCardProps = {
  href: string;
  emoji: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: "green" | "accent" | "muted";
  accent?: "primary" | "accent" | "navy";
};

const accentColors = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  navy: "var(--color-navy)",
};

const muted = "rgba(26, 6, 51, 0.55)";

export function HubCard({
  href,
  emoji,
  title,
  description,
  badge,
  badgeColor = "muted",
  accent = "primary",
}: HubCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "#fff",
          border: "1px solid rgba(89,47,146,0.12)",
          borderRadius: 24,
          padding: 28,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 16px 48px rgba(89,47,146,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `${accentColors[accent]}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
          }}
        >
          {emoji}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--color-navy)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h2>
            {badge ? (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background:
                    badgeColor === "green"
                      ? "rgba(37,211,102,0.12)"
                      : badgeColor === "accent"
                        ? "rgba(255,16,138,0.12)"
                        : "rgba(89,47,146,0.1)",
                  color:
                    badgeColor === "green"
                      ? "#1a7a3c"
                      : badgeColor === "accent"
                        ? "var(--color-accent)"
                        : "var(--color-primary)",
                }}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <p
            style={{
              fontSize: "0.88rem",
              color: muted,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: "0.82rem",
            fontWeight: 600,
            color: accentColors[accent],
          }}
        >
          Ir ahora
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  );
}
