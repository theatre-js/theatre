/** Create timer */
export function timer(name: string): {
  wrap<T>(fn: () => T): T
  stop(): void
}
