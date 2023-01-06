import type {
  ISheetObject,
  SheetObjectActionsConfig,
  UnknownShorthandCompoundProps,
} from '@theatre/core'
import {getProject} from '@theatre/core'
import {useVal} from '@theatre/react'
import type {IStudio} from '@theatre/studio'
import studio from '@theatre/studio'
import {get} from 'lodash-es'
import {useEffect} from 'react'

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

type OmitMatching<T extends object, V> = Omit<T, KeysMatching<T, V>>

studio.initialize()

const allProps: UnknownShorthandCompoundProps[] = []
const allActions: SheetObjectActionsConfig[] = []

const project = getProject('Tweaks')
const sheet = project.sheet('default')
const object = sheet.object('default', {})

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

export function useControls<Props extends ControlsAndButtons>(
  configOrFolderName: string | Props,
  configIfFolderName?: Props,
) {
  const folderName =
    typeof configOrFolderName === 'string' ? configOrFolderName : undefined
  let config =
    typeof configOrFolderName === 'string'
      ? configIfFolderName ?? ({} as Props)
      : (configOrFolderName as Props)

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

  const props = folderName
    ? {[folderName]: controlsWithoutButtons}
    : controlsWithoutButtons

  const actions = Object.fromEntries(
    Object.entries(buttons).map(([key, value]) => [
      `${folderName ? `${folderName}: ` : ''}${key}`,
      (object: ISheetObject, studio: IStudio) => {
        value.onClick(
          (path, value) => {
            // this is not ideal because it will create a separate undo level for each set call,
            // but this is the only thing that theatre's public API allows us to do.
            // Wrapping the whole thing in a transaction wouldn't work either because side effects
            // would be run twice.
            studio.transaction((api) => {
              api.set(
                get(folderName ? object.props[folderName] : object.props, path),
                value,
              )
            })
          },
          (path) =>
            get(folderName ? object.value[folderName] : object.value, path),
        )
      },
    ]),
  )

  // have to do this to make sure the values are immediately available
  sheet.object('default', Object.assign({}, ...allProps, props), {
    reconfigure: true,
    actions: Object.assign({}, ...allActions, actions),
  })

  useEffect(() => {
    allProps.push(props)
    allActions.push(actions)
    // cleanup runs after render, so we have to reconfigure with the new props here too, doing it during render just makes sure that
    // the very first values returned are not undefined
    sheet.object('default', Object.assign({}, ...allProps), {
      reconfigure: true,
      actions: Object.assign({}, ...allActions),
    })

    return () => {
      allProps.splice(allProps.indexOf(props), 1)
      allActions.splice(allActions.indexOf(actions), 1)
      sheet.object('default', Object.assign({}, ...allProps), {
        reconfigure: true,
        actions: Object.assign({}, ...allActions),
      })
    }
  }, [props, actions])

  return useVal(
    folderName
      ? ((object as ISheetObject).props[folderName] as ISheetObject<
          OmitMatching<Props, {type: 'button'}>
        >['props'])
      : (object as ISheetObject<OmitMatching<Props, {type: 'button'}>>).props,
  )
}

export {types} from '@theatre/core'

export const button = (onClick: Button['onClick']) => {
  return {
    type: 'button' as const,
    onClick,
  }
}
