"use client";

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  color?: string;
};

export function ToggleSwitch({
  label,
  checked,
  onChange,
  color = "var(--color-primary)",
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3.5">
      <span className="text-[0.95rem] font-semibold text-zinc-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 cursor-pointer border-0 bg-transparent p-0"
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          background: checked ? color : "#d1c4e9",
          transition: "background 0.2s",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 25 : 3,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}
