import type {ISheetObject, UnknownShorthandCompoundProps} from '@theatre/core'
import {getProject} from '@theatre/core'
import {useVal} from '@theatre/react'
import studio from '@theatre/studio'
import {useEffect} from 'react'

studio.initialize()

const allProps: UnknownShorthandCompoundProps[] = []

const project = getProject('Tweaks')
const sheet = project.sheet('default')
const object = sheet.object('default', {})

export function useControls<Props extends UnknownShorthandCompoundProps>(
  propsOrFolderName: string | Props,
  props?: Props,
) {
  const folderName =
    typeof propsOrFolderName === 'string' ? propsOrFolderName : undefined
  const actualProps =
    typeof propsOrFolderName === 'string'
      ? props ?? ({} as Props)
      : (propsOrFolderName as Props)

  // have to do this to make sure the values are immediately available
  sheet.object(
    'default',
    Object.assign(
      {},
      ...allProps,
      folderName ? {[folderName]: actualProps} : actualProps,
    ),
    {
      reconfigure: true,
    },
  )

  useEffect(() => {
    const propConfingForThisHook = folderName
      ? {[folderName]: actualProps}
      : actualProps
    allProps.push(propConfingForThisHook)
    // cleanup runs after render, so we have to reconfigure with the new props here too, doing it during render just makes sure that
    // the very first values returned are not undefined
    sheet.object(
      'default',
      Object.assign({}, ...allProps, propConfingForThisHook),
      {
        reconfigure: true,
      },
    )

    return () => {
      allProps.splice(allProps.indexOf(propConfingForThisHook), 1)
      sheet.object('default', Object.assign({}, ...allProps), {
        reconfigure: true,
      })
    }
  }, [actualProps])

  return useVal(
    folderName
      ? ((object as ISheetObject).props[
          folderName
        ] as ISheetObject<Props>['props'])
      : (object as ISheetObject<Props>).props,
  )
}

export {types} from '@theatre/core'
