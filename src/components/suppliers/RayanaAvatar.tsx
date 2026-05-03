function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

type RayanaAvatarProps = {
  name: string;
  size?: number;
};

export function RayanaAvatar({ name, size = 44 }: RayanaAvatarProps) {
  const hue = hueFromName(name);
  const bg = `linear-gradient(135deg, hsl(${hue} 50% 76%), hsl(${(hue + 30) % 360} 50% 64%))`;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: bg,
        color: "white",
        fontWeight: 700,
        fontSize: size * 0.36,
        letterSpacing: "-0.02em",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.45), 0 2px 5px rgba(0,0,0,.06)",
      }}
    >
      {initials(name)}
    </div>
  );
}
