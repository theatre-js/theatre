export function transformNumber(
  initialPos: number,
  {
    scale,
    origin,
    translate,
  }: {scale: number; origin: number; translate: number},
): number {
  const scaled = origin + (initialPos - origin) * scale
  return translate + scaled
}
