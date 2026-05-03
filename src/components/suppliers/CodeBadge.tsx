type CodeBadgeProps = {
  code: number;
  size?: "md" | "lg";
};

export function CodeBadge({ code, size = "md" }: CodeBadgeProps) {
  const big = size === "lg";
  return (
    <div
      className="inline-flex shrink-0 items-baseline"
      style={{
        gap: 1,
        padding: big ? "6px 14px" : "5px 11px",
        borderRadius: 12,
        background: "linear-gradient(180deg, #E8A88E 0%, #D88A6B 100%)",
        color: "white",
        fontWeight: 800,
        fontSize: big ? 22 : 17,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        boxShadow:
          "0 4px 10px rgba(216,138,107,.35), inset 0 1px 0 rgba(255,255,255,.35), inset 0 -1px 2px rgba(120,60,40,.18)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        style={{
          opacity: 0.7,
          fontWeight: 700,
          fontSize: big ? 16 : 13,
          marginRight: 1,
        }}
      >
        #
      </span>
      {String(code).padStart(2, "0")}
    </div>
  );
}
