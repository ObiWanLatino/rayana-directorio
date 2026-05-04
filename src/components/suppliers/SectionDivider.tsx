export function SectionDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "4px 4px 0",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(120,90,60,.18), transparent)",
        }}
      />
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#A89878",
          textTransform: "uppercase",
        }}
      >
        Todos los proveedores
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(120,90,60,.18), transparent)",
        }}
      />
    </div>
  );
}
