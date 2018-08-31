export default function clamp(n: number, from: number, to: number): number {
  return n < from ? from : n > to ? to : n
}
