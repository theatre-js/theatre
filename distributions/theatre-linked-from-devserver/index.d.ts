export * from './core'

/**
 * Functions to control Theatre's UI
 */
export const ui: {
  /**
   * Makes the UI appear
   */
  show(): void

  /**
   * Makes the UI disappear
   */
  hide(): void

  /**
   * If the UI is showing, this prop would equal true
   */
  showing: boolean

  /**
   * Makes the UI appear, and restores the panel too
   */
  restore(): void
}