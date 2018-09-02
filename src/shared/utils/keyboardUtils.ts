import {isMac} from './isMac'

/**
 * On mac, it checks Cmd, on windows, ctrl
 */
export const cmdIsDown = (e: KeyboardEvent) => {
  if (isMac) {
    return e.metaKey === true
  } else {
    return e.ctrlKey === true
  }
}

/**
 * On mac, it checks for ctrl, on windows, Win
 */
export const ctrlIsDown = (e: KeyboardEvent) => {
  if (isMac) {
    return e.ctrlKey === true
  } else {
    return e.metaKey === true
  }
}