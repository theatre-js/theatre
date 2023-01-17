import type {
  IProjectConfig,
  ISheetObject,
  SheetObjectActionsConfig,
  UnknownShorthandCompoundProps,
} from '@theatre/core'
import {getProject} from '@theatre/core'
import {useVal} from '@theatre/react'
import type {IStudio} from '@theatre/studio'
import studio from '@theatre/studio'
import {get} from 'lodash-es'
import {useEffect, useMemo} from 'react'

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

type OmitMatching<T extends object, V> = Omit<T, KeysMatching<T, V>>

// Because treeshaking studio relies on static checks like the following, we can't make including studio configurable at runtime.
// What we can do, if there arises a need to use studio in production with theatric, is to let users provide their own studio instance.
// That way we can treeshake our own, and the user can give us theirs, if they want to.

if (process.env.NODE_ENV === 'development') {
  studio.initialize()
}

// Just to be able to treeshake studio out of the bundle
const maybeTransaction =
  process.env.NODE_ENV === 'development'
    ? studio.transaction.bind(studio)
    : () => {}

let _state: IProjectConfig['state'] | undefined = undefined

export function initialize(state: IProjectConfig['state']) {
  if (_state !== undefined) {
    console.warn(
      'Theatric has already been initialized, either through another initialize call, or by calling useControls() before calling initialize().',
    )
    return
  }
  _state = state
}

const allProps: Record<string, UnknownShorthandCompoundProps[]> = {}
const allActions: Record<string, SheetObjectActionsConfig[]> = {}

type Button = {
  type: 'button'
  onClick: (
    set: (path: string, value: any) => void,
    get: (path: string) => void,
  ) => void
}
type Buttons = {
  [key: string]: Button
}

type ControlsAndButtons = {
  [key: string]: {type: 'button'} | UnknownShorthandCompoundProps[string]
}

export function useControls<
  Config extends ControlsAndButtons,
  Advanced extends boolean = false,
>(
  config: Config,
  options: {panel?: string; folder?: string; advanced?: Advanced} = {},
) {
  // initialize state to null, if it hasn't been initialized yet
  if (_state === undefined) {
    _state = null
  }

  const {folder, advanced} = options

  const controlsWithoutButtons = Object.fromEntries(
    Object.entries(config).filter(
      ([key, value]) => (value as any).type !== 'button',
    ),
  ) as UnknownShorthandCompoundProps

  const buttons = Object.fromEntries(
    Object.entries(config).filter(
      ([key, value]) => (value as any).type === 'button',
    ),
  ) as unknown as Buttons

  const props = folder
    ? {[folder]: controlsWithoutButtons}
    : controlsWithoutButtons

  const actions = Object.fromEntries(
    Object.entries(buttons).map(([key, value]) => [
      `${folder ? `${folder}: ` : ''}${key}`,
      (object: ISheetObject, studio: IStudio) => {
        value.onClick(
          (path, value) => {
            // this is not ideal because it will create a separate undo level for each set call,
            // but this is the only thing that theatre's public API allows us to do.
            // Wrapping the whole thing in a transaction wouldn't work either because side effects
            // would be run twice.
            maybeTransaction((api) => {
              api.set(
                get(folder ? object.props[folder] : object.props, path),
                value,
              )
            })
          },
          (path) => get(folder ? object.value[folder] : object.value, path),
        )
      },
    ]),
  )

  const sheet = useMemo(
    () => getProject('Theatric', {state: _state}).sheet('Panels'),
    [],
  )
  const panel = options.panel ?? 'Default panel'
  const allPanelProps = allProps[panel] ?? (allProps[panel] = [])
  const allPanelActions = allActions[panel] ?? (allActions[panel] = [])

  // have to do this to make sure the values are immediately available
  const object = sheet.object(
    panel,
    Object.assign({}, ...allProps[panel], props),
    {
      reconfigure: true,
      actions: Object.assign({}, ...allActions[panel], actions),
    },
  )

  useEffect(() => {
    allPanelProps.push(props)
    allPanelActions.push(actions)
    // cleanup runs after render, so we have to reconfigure with the new props here too, doing it during render just makes sure that
    // the very first values returned are not undefined
    sheet.object(panel, Object.assign({}, ...allPanelProps), {
      reconfigure: true,
      actions: Object.assign({}, ...allPanelActions),
    })

    return () => {
      allPanelProps.splice(allPanelProps.indexOf(props), 1)
      allActions[panel].splice(allPanelActions.indexOf(actions), 1)
      sheet.object(panel, Object.assign({}, ...allPanelProps), {
        reconfigure: true,
        actions: Object.assign({}, ...allPanelActions),
      })
    }
  }, [props, actions, allPanelActions, allPanelProps, sheet, panel])

  const values = useVal(
    folder
      ? ((object as ISheetObject).props[folder] as ISheetObject<
          OmitMatching<Config, {type: 'button'}>
        >['props'])
      : (object as ISheetObject<OmitMatching<Config, {type: 'button'}>>).props,
  )

  type ReturnType = Advanced extends true
    ? [typeof values, (path: string, value: any) => void, (path: string) => any]
    : typeof values

  return (
    advanced
      ? ([
          values,
          (path: string, value: any) => {
            // this is not ideal because it will create a separate undo level for each set call,
            // but this is the only thing that theatre's public API allows us to do.
            // Wrapping the whole thing in a transaction wouldn't work either because side effects
            // would be run twice.
            maybeTransaction((api) => {
              api.set(
                get(
                  folder
                    ? (object as ISheetObject).props[folder]
                    : object.props,
                  path,
                ),
                value,
              )
            })
          },
          (path: string) =>
            get(
              folder ? (object as ISheetObject).value[folder] : object.value,
              path,
            ),
        ] as const)
      : values
  ) as ReturnType
}

export {types} from '@theatre/core'

export const button = (onClick: Button['onClick']) => {
  return {
    type: 'button' as const,
    onClick,
  }
}
