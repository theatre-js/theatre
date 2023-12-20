import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import {compound} from '@theatre/core/propTypes'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {SheetAddress} from '@theatre/core/types/public'
import {InvalidArgumentError} from '@theatre/utils/errors'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/utils/slashedPaths'
import type {$FixMe, $IntentionalAny} from '@theatre/utils/types'
import userReadableTypeOfValue from '@theatre/utils/userReadableTypeOfValue'
import deepEqual from 'fast-deep-equal'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {ObjectAddressKey} from '@theatre/core/types/public'
import {notify} from '@theatre/core/utils/notify'
import type {
  IProject,
  ISheet,
  SheetObjectActionsConfig,
  ISheetObject,
  ISequence,
  UnknownShorthandCompoundProps,
} from '@theatre/core/types/public'

const weakMapOfUnsanitizedProps = new WeakMap<
  SheetObject,
  UnknownShorthandCompoundProps
>()

export default class TheatreSheet implements ISheet {
  get type(): 'Theatre_Sheet_PublicAPI' {
    return 'Theatre_Sheet_PublicAPI'
  }
  /**
   * @internal
   */
  constructor(sheet: Sheet) {
    setPrivateAPI(this, sheet)
  }

  object<Props extends UnknownShorthandCompoundProps>(
    key: string,
    config: Props,
    opts?: {
      reconfigure?: boolean
      __actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION?: SheetObjectActionsConfig
    },
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.object`,
      notify.warning,
    )

    const existingObject = internal.getObject(sanitizedPath as ObjectAddressKey)

    /**
     * Future: `nativeObject` Idea is to potentially allow the user to provide their own
     * object in to the object call as a way to keep a handle to an underlying object via
     * the {@link ISheetObject}.
     *
     * For example, a THREEjs object or an HTMLElement is passed in.
     */
    const nativeObject = null

    const actions =
      opts?.__actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION

    if (existingObject) {
      if (process.env.NODE_ENV !== 'production') {
        const prevConfig = weakMapOfUnsanitizedProps.get(existingObject)
        if (prevConfig) {
          if (!deepEqual(config, prevConfig)) {
            if (opts?.reconfigure === true) {
              const sanitizedConfig = compound(config)
              existingObject.template.reconfigure(sanitizedConfig)
              weakMapOfUnsanitizedProps.set(existingObject, config)
              return existingObject.publicApi as $IntentionalAny
            } else {
              throw new Error(
                `You seem to have called sheet.object("${key}", config) twice, with different values for \`config\`. ` +
                  `This is disallowed because changing the config of an object on the fly would make it difficult to reason about.\n\n` +
                  `You can fix this by either re-using the existing object, or calling sheet.object("${key}", config) with the same config.\n\n` +
                  `If you mean to reconfigure the object's config, set \`{reconfigure: true}\` in sheet.object("${key}", config, {reconfigure: true})`,
              )
            }
          }
        }
      }

      if (actions) {
        existingObject.template._temp_setActions(actions)
      }

      return existingObject.publicApi as $IntentionalAny
    } else {
      const sanitizedConfig = compound(config)
      const object = internal.createObject(
        sanitizedPath as ObjectAddressKey,
        nativeObject,
        sanitizedConfig,
        actions,
      )
      if (process.env.NODE_ENV !== 'production') {
        weakMapOfUnsanitizedProps.set(object as $FixMe, config)
      }
      return object.publicApi as $IntentionalAny
    }
  }

  get sequence(): ISequence {
    return privateAPI(this).getSequence().publicApi
  }

  get project(): IProject {
    return privateAPI(this).project.publicApi
  }

  get address(): SheetAddress {
    return {...privateAPI(this).address}
  }

  detachObject(key: string) {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.deleteObject("${key}")`,
      notify.warning,
    ) as ObjectAddressKey

    const obj = internal.getObject(sanitizedPath)
    if (!obj) {
      notify.warning(
        `Couldn\'t delete object "${sanitizedPath}"`,
        `There is no object with key "${sanitizedPath}".

To fix this, make sure you are calling \`sheet.deleteObject("${sanitizedPath}")\` with the correct key.`,
      )
      console.warn(`Object key "${sanitizedPath}" does not exist.`)
      return
    }

    internal.deleteObject(sanitizedPath as ObjectAddressKey)
  }
}

const validateSequenceNameOrThrow = (value: string) => {
  if (typeof value !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence(name)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        value,
      )}.`,
    )
  }

  const idTrimmed = value.trim()
  if (idTrimmed.length !== value.length) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence("${value}")\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence("${value}")\` should be at least 3 characters long.`,
    )
  }
}
