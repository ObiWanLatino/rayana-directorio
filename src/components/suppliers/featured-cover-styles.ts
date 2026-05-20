import type { CSSProperties } from "react";

export function featuredCoverImageStyle(positionY: number): CSSProperties {
  const y = positionY ?? 50;
  return {
    position: "absolute",
    width: "100%",
    height: "150%",
    objectFit: "cover",
    top: `${-y * 0.5}%`,
    left: 0,
  };
}
