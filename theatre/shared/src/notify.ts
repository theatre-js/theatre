import logger from './logger'
import * as globalVariableNames from './globalVariableNames'

export type Notification = {title: string; message: string}
export type NotificationType = 'info' | 'success' | 'warning'
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
}

const createHandler =
  (type: NotificationType): Notify =>
  (...args) => {
    if (type === 'warning') {
      logger.warn(args[1])
    }

    // @ts-ignore
    return window[globalVariableNames.notifications]?.notify[type](...args)
  }

export const notify: Notifiers = {
  warning: createHandler('warning'),
  success: createHandler('success'),
  info: createHandler('info'),
}
