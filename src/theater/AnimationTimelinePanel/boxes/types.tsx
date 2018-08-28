export type TBoxDnDAPI = {
  grab: (
    index: number,
    height: number,
    top: number,
    isDopesheet: boolean,
  ) => void
  merge: (
    index: number,
    height: number,
    top: number,
    isDopesheet: boolean,
  ) => void
  move: (index: number, top: number) => void
}

export type TBoxDnDState = {
  status: 'noDnD' | 'grab' | 'move' | 'merge'
  grabProps: null | {
    index: number
    height: number
    top: number
    isDopesheet: boolean
  }
  dropProps: null | {
    index: number
    height?: number
    top: number
  }
}
