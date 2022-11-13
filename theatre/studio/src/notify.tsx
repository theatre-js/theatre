import React, {Fragment} from 'react'
import toast, {useToaster} from 'react-hot-toast/headless'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from './css'
import type {
  Notification,
  NotificationType,
  Notify,
  Notifiers,
} from '@theatre/shared/notify'
import {useVal} from '@theatre/react'
import getStudio from './getStudio'
import {marked} from 'marked'
import useTooltip from './uiComponents/Popover/useTooltip'
import MinimalTooltip from './uiComponents/Popover/MinimalTooltip'

/**
 * Creates a string key unique to a notification with a certain title and message.
 */
const hashNotification = ({title, message}: Notification) =>
  `${title} ${message}`

/**
 * Used to check if a notification with a certain title and message is already displayed.
 */
const notificationUniquenessChecker = (() => {
  const map = new Map<string, number>()
  return {
    add: (notification: Notification) => {
      const key = hashNotification(notification)
      if (map.has(key)) {
        map.set(key, map.get(key)! + 1)
      } else {
        map.set(key, 1)
      }
    },
    delete: (notification: Notification) => {
      const key = hashNotification(notification)
      if (map.has(key) && map.get(key)! > 1) {
        map.set(key, map.get(key)! - 1)
      } else {
        map.delete(key)
      }
    },
    clear: () => {
      map.clear()
    },
    check: (notification: Notification) =>
      map.has(hashNotification(notification)),
  }
})()

/**
 * Used to check if a notification with a certain type is already displayed.
 *
 * Massive hack, we should be able to attach this info to toasts.
 */
const notificationTypeChecker = (() => {
  const map = new Map<NotificationType, number>()
  return {
    add: (type: NotificationType) => {
      if (map.has(type)) {
        map.set(type, map.get(type)! + 1)
      } else {
        map.set(type, 1)
      }
    },
    delete: (type: NotificationType) => {
      if (map.has(type) && map.get(type)! > 1) {
        map.set(type, map.get(type)! - 1)
      } else {
        map.delete(type)
      }
    },
    clear: () => {
      map.clear()
    },
    check: (type: NotificationType) => map.has(type),
    get types() {
      return Array.of(...map.keys())
    },
  }
})()

//region Styles
const NotificationContainer = styled.div`
  width: 100%;
  border-radius: 4px;
  display: flex;
  gap: 12px;
  ${pointerEventsAutoInNormalMode};
  background-color: rgba(40, 43, 47, 0.8);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(14px);

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.95);
  }
`

const NotificationTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #fff;
`

const NotificationMain = styled.div`
  flex: 1;
  flex-direction: column;
  width: 0;
  display: flex;
  padding: 16px 0;
  gap: 12px;
`

const NotificationMessage = styled.div`
  color: #b4b4b4;
  font-size: 12px;
  line-height: 1.4;

  a {
    color: rgba(255, 255, 255, 0.9);
  }

  em {
    font-style: italic;
  }

  strong {
    font-weight: bold;
    color: #d5d5d5;
  }

  p {
    margin-bottom: 8px;
  }

  code {
    font-family: monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 1px 1px 2px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    white-space: pre-wrap;
  }

  pre > code {
    white-space: pre;
    display: block;
    overflow: auto;
    padding: 4px;
  }

  pre {
    white-space: pre-wrap;
    margin-bottom: 8px;
  }
`

const DismissButton = styled.button`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding-left: 12px;
  padding-right: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const COLORS = {
  info: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
}

const IndicatorDot = styled.div<{type: NotificationType}>`
  display: flex;
  justify-content: center;
  margin-left: 12px;
  padding-top: 21px;

  ::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999999px;
    background-color: ${({type}) => COLORS[type]};
  }
`
//endregion

/**
 * Creates handlers for different types of notifications.
 */
const createHandler =
  (type: NotificationType): Notify =>
  (title, message, docs = [], allowDuplicates = false) => {
    // We can disallow duplicates. We do this through checking the notification contents
    // against a registry of already displayed notifications.
    if (
      allowDuplicates ||
      !notificationUniquenessChecker.check({title, message})
    ) {
      notificationUniquenessChecker.add({title, message})
      // We have not way sadly to attach custom notification types to react-hot-toast toasts,
      // so we use our own data structure for it.
      notificationTypeChecker.add(type)
      toast.custom(
        (t) => (
          <NotificationContainer>
            <IndicatorDot type={type} />
            <NotificationMain>
              <NotificationTitle>{title}</NotificationTitle>
              <NotificationMessage
                dangerouslySetInnerHTML={{
                  __html: marked.parse(message),
                }}
              />
              {docs.length > 0 && (
                <NotificationMessage>
                  <span>
                    Docs:{' '}
                    {docs.map((doc, i) => (
                      <Fragment key={i}>
                        {i > 0 && ', '}
                        <a target="_blank" href={doc.url}>
                          {doc.title}
                        </a>
                      </Fragment>
                    ))}
                  </span>
                </NotificationMessage>
              )}
            </NotificationMain>
            <DismissButton
              onClick={() => {
                toast.remove(t.id)
                notificationUniquenessChecker.delete({title, message})
                notificationTypeChecker.delete(type)
              }}
            >
              Close
            </DismissButton>
          </NotificationContainer>
        ),
        {duration: Infinity},
      )
    }
  }

export const notify: Notifiers = {
  warning: createHandler('warning'),
  success: createHandler('success'),
  info: createHandler('info'),
  error: createHandler('error'),
}

//region Styles
const ButtonContainer = styled.div<{
  align: 'center' | 'side'
  danger?: boolean
}>`
  display: flex;
  justify-content: ${({align}) => (align === 'center' ? 'center' : 'flex-end')};
  gap: 12px;
`

const Button = styled.button<{danger?: boolean}>`
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  ${pointerEventsAutoInNormalMode};
  background-color: rgba(40, 43, 47, 0.8);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(14px);
  border: none;
  padding: 12px;
  color: #fff;
  overflow: hidden;

  ::before {
    content: '';
    position: absolute;
    inset: 0;
  }

  :hover::before {
    background: ${({danger}) =>
      danger ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  }

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.95);
  }
`

const NotifierContainer = styled.div`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: fixed;
  right: 92px;
  top: 50px;
  width: 500px;
  height: 85vh;
  min-height: 400px;
`

const NotificationScroller = styled.div`
  overflow: hidden;
  pointer-events: auto;
  border-radius: 4px;

  & > div {
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    overflow: scroll;
    height: 100%;
  }
`

const EmptyState = styled.div`
  width: fit-content;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #b4b4b4;
  font-size: 12px;
  line-height: 1.4;
`
//endregion

export const useEmptyNotificationsTooltip = () => {
  const {hasNotifications} = useNotifications()

  return useTooltip({enabled: !hasNotifications}, () => (
    <MinimalTooltip>
      <EmptyState>
        <NotificationTitle>No notifications</NotificationTitle>
        Notifications will appear here when you get them.
      </EmptyState>
    </MinimalTooltip>
  ))
}

/**
 * The component responsible for rendering the notifications.
 */
export const Notifier = () => {
  const {toasts, handlers} = useToaster()
  const {startPause, endPause} = handlers

  const pinNotifications =
    useVal(getStudio().atomP.ahistoric.pinNotifications) ?? false

  return (
    <NotifierContainer>
      {!pinNotifications
        ? null
        : toasts.length > 0 && (
            <NotificationScroller
              onMouseEnter={startPause}
              onMouseLeave={endPause}
            >
              <div>
                {toasts.map((toast) => {
                  return (
                    <div key={toast.id}>
                      {/* message is always a function in our case */}
                      {/* @ts-ignore */}
                      {toast.message(toast)}
                    </div>
                  )
                })}
              </div>
            </NotificationScroller>
          )}
      <ButtonContainer align="side">
        {pinNotifications && toasts.length > 0 && (
          <Button
            onClick={() => {
              notificationTypeChecker.clear()
              notificationUniquenessChecker.clear()
              toast.remove()
            }}
            danger
          >
            Clear
          </Button>
        )}
      </ButtonContainer>
    </NotifierContainer>
  )
}

export const useNotifications = () => {
  const {toasts} = useToaster()

  return {
    hasNotifications: toasts.length > 0,
  }
}
