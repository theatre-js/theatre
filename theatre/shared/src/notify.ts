import logger from './logger'
import * as globalVariableNames from './globalVariableNames'

export type Notification = {title: string; message: string}
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type Notify = (
  /**
   * The title of the notification.
   */
  title: string,
  /**
   * The message of the notification.
   */
  message: string,
  /**
   * An array of doc pages to link to.
   */
  docs?: {url: string; title: string}[],
  /**
   * Whether duplicate notifications should be allowed.
   */
  allowDuplicates?: boolean,
) => void
export type Notifiers = {
  /**
   * Show a success notification.
   */
  success: Notify
  /**
   * Show a warning notification.
   *
   * Say what happened in the title.
   * In the message, start with 1) a reassurance, then 2) explain why it happened, and 3) what the user can do about it.
   */
  warning: Notify
  /**
   * Show an info notification.
   */
  info: Notify
  /**
   * Show an error notification.
   */
  error: Notify
}

const createHandler =
  (type: NotificationType): Notify =>
  (...args) => {
    switch (type) {
      case 'success': {
        logger.debug(args.slice(0, 2).join('\n'))
        break
      }
      case 'info': {
        logger.debug(args.slice(0, 2).join('\n'))
        break
      }
      case 'warning': {
        logger.warn(args.slice(0, 2).join('\n'))
        break
      }
      case 'error': {
        // don't log errors, they're already logged by the browser
      }
    }

    // @ts-ignore
    return window?.[globalVariableNames.notifications]?.notify[type](...args)
  }

export const notify: Notifiers = {
  warning: createHandler('warning'),
  success: createHandler('success'),
  info: createHandler('info'),
  error: createHandler('error'),
}

window?.addEventListener('error', (e) => {
  notify.error(
    `An error occurred`,
    `${e.message}\n\nSee **console** for details.`,
  )
})
