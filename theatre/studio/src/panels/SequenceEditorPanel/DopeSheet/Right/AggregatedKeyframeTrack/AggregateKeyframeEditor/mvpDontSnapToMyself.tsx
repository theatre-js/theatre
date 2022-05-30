let positionsToNotSnapTo = new Set<number>()
let lastSnapPosition: number | undefined

export const mvpDontSnapToMyself = {
  updateLastSnap(to: number | undefined) {
    lastSnapPosition = to
  },
  updateCurrentPositionsDragging(to: Set<number>) {
    positionsToNotSnapTo = to
  },
  canSnap(to: number | undefined) {
    if (to == null) return false
    if (lastSnapPosition === to) return true
    return !positionsToNotSnapTo.has(to)
  },
}
