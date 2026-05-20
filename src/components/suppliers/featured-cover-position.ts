import type { CSSProperties } from "react";

/** offsetY en px (≤0): desplaza la imagen hacia arriba dentro del recorte. */
export function getCoverOffsetPx(posY: number, containerH: number): number {
  const imgH = containerH * 1.5;
  const maxOffset = imgH - containerH;
  if (maxOffset <= 0) return 0;
  return -((posY / 100) * maxOffset);
}

export function featuredCoverImgStyle(
  positionY: number,
  containerH: number,
): CSSProperties {
  return {
    position: "absolute",
    width: "100%",
    height: "150%",
    objectFit: "cover",
    top: `${getCoverOffsetPx(positionY, containerH)}px`,
    left: 0,
  };
}
