import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import type {IProject} from '@theatre/core/projects/TheatreProject'
import type TheatreSequence from '@theatre/core/sequences/TheatreSequence'
import type {ISequence} from '@theatre/core/sequences/TheatreSequence'
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {compound} from '@theatre/core/propTypes'
import type {ISheetObject} from '@theatre/core/sheetObjects/TheatreSheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {SheetAddress} from '@theatre/shared/utils/addresses'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/shared/utils/slashedPaths'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import deepEqual from 'fast-deep-equal'
import type {
  UnknownShorthandCompoundProps,
  UnknownValidCompoundProps,
} from '@theatre/core/propTypes/internals'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {ObjectAddressKey} from '@theatre/shared/utils/ids'

export type SheetObjectPropTypeConfig =
  PropTypeConfig_Compound<UnknownValidCompoundProps>

export interface ISheet {
  /**
   * All sheets have `sheet.type === 'Theatre_Sheet_PublicAPI'`
   */
  readonly type: 'Theatre_Sheet_PublicAPI'

  /**
   * The Project this Sheet belongs to
   */
  readonly project: IProject

  /**
   * The address of the Sheet
   */
  readonly address: SheetAddress

  /**
   * Creates a child object for the sheet
   *
   * **Docs: https://docs.theatrejs.com/in-depth/#objects**
   *
   * @param key - Each object is identified by a key, which is a non-empty string
   * @param props - The props of the object. See examples
   *
   * @returns An Object
   *
   * @example
   * Usage:
   * ```ts
   * // Create an object named "a unique key" with no props
   * const obj = sheet.object("a unique key", {})
   * obj.address.objectKey // "a unique key"
   *
   *
   * // Create an object with {x: 0}
   * const obj = sheet.object("obj", {x: 0})
   * obj.value.x // returns 0 or the current number that the user has set
   *
   * // Create an object with nested props
   * const obj = sheet.object("obj", {position: {x: 0, y: 0}})
   * obj.value.position // {x: 0, y: 0}
   * ```
   */
  object<Props extends UnknownShorthandCompoundProps>(
    key: string,
    props: Props,
  ): ISheetObject<Props>

  /**
   * The Sequence of this Sheet
   */
  readonly sequence: ISequence
}

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
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.object("${key}", ...)`,
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

    if (existingObject) {
      if (process.env.NODE_ENV !== 'production') {
        const prevConfig = weakMapOfUnsanitizedProps.get(existingObject)
        if (prevConfig) {
          if (!deepEqual(config, prevConfig)) {
            throw new Error(
              `You seem to have called sheet.object("${key}", config) twice, with different values for \`config\`. ` +
                `This is disallowed because changing the config of an object on the fly would make it difficult to reason about.\n\n` +
                `You can fix this by either re-using the existing object, or calling sheet.object("${key}", config) with the same config.`,
            )
          }
        }
      }

      return existingObject.publicApi as $IntentionalAny
    } else {
      const sanitizedConfig = compound(config)
      const object = internal.createObject(
        sanitizedPath as ObjectAddressKey,
        nativeObject,
        sanitizedConfig,
      )
      if (process.env.NODE_ENV !== 'production') {
        weakMapOfUnsanitizedProps.set(object as $FixMe, config)
      }
      return object.publicApi as $IntentionalAny
    }
  }

  get sequence(): TheatreSequence {
    return privateAPI(this).getSequence().publicApi
  }

  get project(): IProject {
    return privateAPI(this).project.publicApi
  }

  get address(): SheetAddress {
    return {...privateAPI(this).address}
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
