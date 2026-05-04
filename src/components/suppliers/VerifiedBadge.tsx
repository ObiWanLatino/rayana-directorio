export function VerifiedBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: 50,
        background: "rgba(0,0,0,.62)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "#FFD97D",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        zIndex: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,.18)",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFD97D">
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
      </svg>
      Verificado Makeray
    </div>
  );
}
