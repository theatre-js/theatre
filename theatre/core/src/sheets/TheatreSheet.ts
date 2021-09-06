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
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import deepEqual from 'fast-deep-equal'
import type {IShorthandCompoundProps} from '@theatre/core/propTypes/internals'

export type SheetObjectConfig<
  Props extends PropTypeConfig_Compound<$IntentionalAny>,
> = Props

export interface ISheet {
  readonly type: 'Theatre_Sheet_PublicAPI'
  readonly project: IProject
  readonly address: SheetAddress

  object<Props extends IShorthandCompoundProps>(
    key: string,
    config: Props,
  ): ISheetObject<Props>

  readonly sequence: ISequence
}

const weakMapOfUnsanitizedProps = new WeakMap()

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

  object<Props extends IShorthandCompoundProps>(
    key: string,
    config: Props,
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.object("${key}", ...)`,
    )

    const existingObject = internal.getObject(sanitizedPath)

    const nativeObject = null

    if (existingObject) {
      if (process.env.NODE_ENV !== 'production') {
        if (!deepEqual(config, existingObject.template.config)) {
          throw new Error(
            `You seem to have called sheet.object("${key}", config) twice, with different values for \`config\`. ` +
              `This is disallowed because changing the config of an object on the fly would make it difficult to reason about.\n\n` +
              `You can fix this by either re-using the existing object, or calling sheet.object("${key}", config) with the same config.`,
          )
        }
      }

      return existingObject.publicApi as $IntentionalAny
    } else {
      const object = internal.createObject(
        sanitizedPath,
        nativeObject,
        compound(config),
      )
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
