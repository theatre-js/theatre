import type {ComponentProps, ComponentType, Ref, RefAttributes} from 'react'
import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {allRegisteredObjects, editorStore} from './store'
import mergeRefs from 'react-merge-refs'
import type {ISheetObject} from '@theatre/core'
import useInvalidate from './useInvalidate'
import {useCurrentSheet} from './SheetProvider'
import defaultEditableFactoryConfig from './defaultEditableFactoryConfig'
import type {EditableFactoryConfig} from './editableFactoryConfigUtils'
import {makeStoreKey} from './utils'
import type {$FixMe} from '../types'

const createEditable = <Keys extends keyof JSX.IntrinsicElements>(
  config: EditableFactoryConfig,
) => {
  const editable = <
    T extends ComponentType<any> | keyof JSX.IntrinsicElements | 'primitive',
    U extends Keys,
  >(
    Component: T,
    type: T extends 'primitive' ? null : U,
  ) => {
    type Props = Omit<ComponentProps<T>, 'visible'> & {
      theatreKey: string
      visible?: boolean | 'editor'
      additionalProps?: $FixMe
      objRef?: $FixMe
    } & (T extends 'primitive'
        ? {
            editableType: U
          }
        : {}) &
      RefAttributes<JSX.IntrinsicElements[U]>

    return forwardRef(
      (
        {
          theatreKey,
          visible,
          editableType,
          additionalProps,
          objRef,
          ...props
        }: Props,
        ref,
      ) => {
        const actualType = type ?? editableType

        const objectRef = useRef<JSX.IntrinsicElements[U]>()

        const sheet = useCurrentSheet()!

        const storeKey = makeStoreKey(sheet, theatreKey)

        const [sheetObject, setSheetObject] = useState<
          undefined | ISheetObject<$FixMe>
        >(undefined)

        const invalidate = useInvalidate()

        // warn about cameras in r3f
        useEffect(() => {
          if (
            Component === 'perspectiveCamera' ||
            Component === 'orthographicCamera'
          ) {
            const dreiComponent =
              Component.charAt(0).toUpperCase() + Component.slice(1)

            console.warn(
              `You seem to have declared the camera %c${theatreKey}%c simply as <e.${Component} ... />. This alone won't make r3f use it for rendering.

The easiest way to create a custom animatable ${dreiComponent} is to import it from @react-three/drei, and make it editable.

%cimport {${dreiComponent}} from '@react-three/drei'
const EditableCamera = editable(${dreiComponent}, '${Component}')%c

Then you can use it in your JSX like any other editable component. Note the makeDefault prop exposed by drei, which makes r3f use it for rendering.

%c<EditableCamera
  theatreKey="${theatreKey}"
  makeDefault
>`,
              'font-style: italic;',
              'font-style: inherit;',
              'background: black; color: white;',
              'background: inherit; color: inherit',
              'background: black; color: white;',
            )
          }
        }, [Component, theatreKey])

        // create sheet object and add editable to store
        useLayoutEffect(() => {
          if (!sheet) return
          const sheetObject = sheet.object(
            theatreKey,
            Object.assign(
              {
                ...additionalProps,
              },
              // @ts-ignore
              ...Object.values(config[actualType].props).map(
                // @ts-ignore
                (value) => value.type,
              ),
            ),
          )
          allRegisteredObjects.add(sheetObject)
          setSheetObject(sheetObject)

          if (objRef)
            typeof objRef === 'function'
              ? objRef(sheetObject)
              : (objRef.current = sheetObject)

          editorStore.getState().addEditable(storeKey, {
            type: actualType,
            sheetObject,
            visibleOnlyInEditor: visible === 'editor',
            // @ts-ignore
            objectConfig: config[actualType],
          })
        }, [sheet, storeKey])

        // store initial values of props
        useLayoutEffect(() => {
          if (!sheetObject) return
          sheetObject!.initialValue = Object.fromEntries(
            // @ts-ignore
            Object.entries(config[actualType].props).map(
              // @ts-ignore
              ([key, value]) => [key, value.parse(props)],
            ),
          )
        }, [
          sheetObject,
          // @ts-ignore
          ...Object.keys(config[actualType].props).map(
            // @ts-ignore
            (key) => props[key],
          ),
        ])

        // subscribe to prop changes from theatre
        useLayoutEffect(() => {
          if (!sheetObject) return

          const object = objectRef.current!

          const setFromTheatre = (newValues: any) => {
            // @ts-ignore
            Object.entries(config[actualType].props).forEach(
              // @ts-ignore
              ([key, value]) => value.apply(newValues[key], object),
            )
            // @ts-ignore
            config[actualType].updateObject?.(object)
            invalidate()
          }

          setFromTheatre(sheetObject.value)

          const untap = sheetObject.onValuesChange(setFromTheatre)

          return () => {
            untap()
          }
        }, [sheetObject])

        return (
          // @ts-ignore
          <Component
            ref={mergeRefs([objectRef, ref])}
            {...props}
            visible={visible !== 'editor' && visible}
            userData={{
              __editable: true,
              __storeKey: storeKey,
            }}
          />
        )
      },
    )
  }

  const extensions = {
    ...Object.fromEntries(
      Object.keys(config).map((key) => [
        key,
        // @ts-ignore
        editable(key, key),
      ]),
    ),
    primitive: editable('primitive', null),
  } as unknown as {
    [Property in Keys]: React.ForwardRefExoticComponent<
      React.PropsWithRef<
        Omit<JSX.IntrinsicElements[Property], 'visible'> & {
          theatreKey: string
          visible?: boolean | 'editor'
          additionalProps?: $FixMe
          objRef?: $FixMe
          // not exactly sure how to get the type of the threejs object itself
          ref?: Ref<unknown>
        }
      >
    >
  } & {
    primitive: React.ForwardRefExoticComponent<
      React.PropsWithRef<{
        object: any
        theatreKey: string
        visible?: boolean | 'editor'
        additionalProps?: $FixMe
        objRef?: $FixMe
        editableType: keyof JSX.IntrinsicElements
        // not exactly sure how to get the type of the threejs object itself
        ref?: Ref<unknown>
      }> & {
        // Have to reproduce the primitive component's props here because we need to
        // lift this index type here to the outside to make auto-complete work
        [props: string]: any
      }
    >
  }

  return Object.assign(editable, extensions)
}

const editable = createEditable<keyof typeof defaultEditableFactoryConfig>(
  defaultEditableFactoryConfig,
)

export default editable
