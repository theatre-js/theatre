import type {
  ISheetObject,
  UnknownShorthandCompoundProps} from '@theatre/core';
import {
  getProject
} from '@theatre/core'
import {useVal} from '@theatre/react'
import studio from '@theatre/studio'
import {useEffect} from 'react'

studio.initialize()

const allProps: UnknownShorthandCompoundProps[] = []

const project = getProject('Tweaks')
const sheet = project.sheet('default')
const object = sheet.object('default', {})

export const useControls = <Props extends UnknownShorthandCompoundProps>(
  props: Props,
) => {
  // have to do this to make sure the values are immediately available
  sheet.object('default', Object.assign({}, ...allProps, props), {
    reconfigure: true,
  })

  useEffect(() => {
    allProps.push(props)
    // cleanup runs after render, so we have to reconfigure with the new props here too, doing it during render just makes sure that
    // the very first values returned are not undefined
    sheet.object('default', Object.assign({}, ...allProps, props), {
      reconfigure: true,
    })

    return () => {
      allProps.splice(allProps.indexOf(props), 1)
      sheet.object('default', Object.assign({}, ...allProps), {
        reconfigure: true,
      })
    }
  }, [props])

  return useVal((object as ISheetObject<Props>).props)
}

export {types} from '@theatre/core'
