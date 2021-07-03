import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import type {IProject} from '@theatre/core/projects/TheatreProject'
import type TheatreSequence from '@theatre/core/sequences/TheatreSequence'
import type {ISequence} from '@theatre/core/sequences/TheatreSequence'
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import type {ISheetObject} from '@theatre/core/sheetObjects/TheatreSheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {SheetAddress} from '@theatre/shared/utils/addresses'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import {validateAndSanitiseSlashedPathOrThrow} from '@theatre/shared/utils/slashedPaths'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'

export type SheetObjectConfig<
  Props extends PropTypeConfig_Compound<$IntentionalAny>,
> = Props

export interface ISheet {
  readonly type: 'Theatre_Sheet_PublicAPI'
  readonly project: IProject
  readonly address: SheetAddress

  object<Props extends PropTypeConfig_Compound<$IntentionalAny>>(
    key: string,
    nativeObject: unknown,
    config: SheetObjectConfig<Props>,
  ): ISheetObject<Props>

  sequence(): ISequence
}

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

  object<Props extends PropTypeConfig_Compound<$IntentionalAny>>(
    key: string,
    nativeObject: unknown,
    config: SheetObjectConfig<Props>,
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.object("${key}", ...)`,
    )

    // @todo sanitize config

    const existingObject = internal.getObject(sanitizedPath)

    if (existingObject) {
      existingObject.overrideConfig(nativeObject, config)
      return existingObject.publicApi as $IntentionalAny
    } else {
      const object = internal.createObject(sanitizedPath, nativeObject, config)
      return object.publicApi as $IntentionalAny
    }
  }

  sequence(): TheatreSequence {
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
