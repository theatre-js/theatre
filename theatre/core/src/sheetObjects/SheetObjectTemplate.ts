import type Project from '@theatre/core/projects/Project'
import type Sheet from '@theatre/core/sheets/Sheet'
import type SheetTemplate from '@theatre/core/sheets/SheetTemplate'
import type {SheetObjectPropTypeConfig} from '@theatre/core/sheets/TheatreSheet'
import {emptyArray} from '@theatre/shared/utils'
import type {
  PathToProp,
  SheetObjectAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import getDeep from '@theatre/shared/utils/getDeep'
import type {ObjectAddressKey, SequenceTrackId} from '@theatre/shared/utils/ids'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  $IntentionalAny,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {Atom, getPointerParts, prism, val} from '@theatre/dataverse'
import set from 'lodash-es/set'
import getPropDefaultsOfSheetObject from './getPropDefaultsOfSheetObject'
import SheetObject from './SheetObject'
import logger from '@theatre/shared/logger'
import {
  getPropConfigByPath,
  isPropConfSequencable,
} from '@theatre/shared/propTypes/utils'
import getOrderingOfPropTypeConfig from './getOrderingOfPropTypeConfig'

export type IPropPathToTrackIdTree = {
  [key in string]?: SequenceTrackId | IPropPathToTrackIdTree
}

/**
 * TODO: Add documentation, and share examples of sheet objects.
 *
 * See {@link SheetObject} for more information.
 */
export default class SheetObjectTemplate {
  readonly address: WithoutSheetInstance<SheetObjectAddress>
  readonly type: 'Theatre_SheetObjectTemplate' = 'Theatre_SheetObjectTemplate'
  protected _config: Atom<SheetObjectPropTypeConfig>
  readonly _cache = new SimpleCache()
  readonly project: Project

  get config() {
    return this._config.getState()
  }

  constructor(
    readonly sheetTemplate: SheetTemplate,
    objectKey: ObjectAddressKey,
    nativeObject: unknown,
    config: SheetObjectPropTypeConfig,
  ) {
    this.address = {...sheetTemplate.address, objectKey}
    this._config = new Atom(config)
    this.project = sheetTemplate.project
  }

  createInstance(
    sheet: Sheet,
    nativeObject: unknown,
    config: SheetObjectPropTypeConfig,
  ): SheetObject {
    this._config.setState(config)
    return new SheetObject(sheet, this, nativeObject)
  }

  overrideConfig(config: SheetObjectPropTypeConfig) {
    this._config.setState(config)
  }

  /**
   * Returns the default values (all defaults are read from the config)
   */
  getDefaultValues(): IDerivation<SerializableMap> {
    return this._cache.get('getDefaultValues()', () =>
      prism(() => {
        const config = val(this._config.pointer)
        return getPropDefaultsOfSheetObject(config)
      }),
    )
  }

  /**
   * Returns values that are set statically (ie, not sequenced, and not defaults)
   */
  getStaticValues(): IDerivation<SerializableMap> {
    return this._cache.get('getDerivationOfStatics', () =>
      prism(() => {
        const pointerToSheetState =
          this.sheetTemplate.project.pointers.historic.sheetsById[
            this.address.sheetId
          ]

        const json =
          val(
            pointerToSheetState.staticOverrides.byObject[
              this.address.objectKey
            ],
          ) ?? {}

        const config = val(this._config.pointer)
        const deserialized = config.deserializeAndSanitize(json) || {}
        return deserialized
      }),
    )
  }

  /**
   * Filters through the sequenced tracks and returns those tracks who are valid
   * according to the object's prop types, then sorted in the same order as the config
   *
   * Returns an array.
   */
  getArrayOfValidSequenceTracks(): IDerivation<
    Array<{pathToProp: PathToProp; trackId: SequenceTrackId}>
  > {
    return this._cache.get('getArrayOfValidSequenceTracks', () =>
      prism((): Array<{pathToProp: PathToProp; trackId: SequenceTrackId}> => {
        const pointerToSheetState =
          this.project.pointers.historic.sheetsById[this.address.sheetId]

        const trackIdByPropPath = val(
          pointerToSheetState.sequence.tracksByObject[this.address.objectKey]
            .trackIdByPropPath,
        )

        if (!trackIdByPropPath) return emptyArray as $IntentionalAny

        const arrayOfIds: Array<{
          pathToProp: PathToProp
          trackId: SequenceTrackId
        }> = []

        if (!trackIdByPropPath) return emptyArray as $IntentionalAny

        const _entries = Object.entries(trackIdByPropPath)
        for (const [pathToPropInString, trackId] of _entries) {
          const pathToProp = parsePathToProp(pathToPropInString)
          if (!pathToProp) continue

          const propConfig = getPropConfigByPath(this.config, pathToProp)

          const isSequencable = propConfig && isPropConfSequencable(propConfig)

          if (!isSequencable) continue

          arrayOfIds.push({pathToProp, trackId: trackId!})
        }

        const mapping = getOrderingOfPropTypeConfig(this.config)

        arrayOfIds.sort((a, b) => {
          const pathToPropA = a.pathToProp
          const pathToPropB = b.pathToProp

          const indexA = mapping.get(JSON.stringify(pathToPropA))!
          const indexB = mapping.get(JSON.stringify(pathToPropB))!

          if (indexA > indexB) {
            return 1
          }

          return -1
        })

        if (arrayOfIds.length === 0) {
          return emptyArray as $IntentionalAny
        } else {
          return arrayOfIds
        }
      }),
    )
  }

  /**
   * Filters through the sequenced tracks those tracks that are valid
   * according to the object's prop types.
   *
   * Returns a map.
   *
   * Not available in core.
   */
  getMapOfValidSequenceTracks_forStudio(): IDerivation<IPropPathToTrackIdTree> {
    return this._cache.get('getMapOfValidSequenceTracks_forStudio', () =>
      this.getArrayOfValidSequenceTracks().map((arr) => {
        let map = {}

        for (const {pathToProp, trackId} of arr) {
          set(map, pathToProp, trackId)
        }

        return map
      }),
    )
  }

  getDefaultsAtPointer(
    pointer: Pointer<unknown>,
  ): SerializableValue | undefined {
    const {path} = getPointerParts(pointer)
    const defaults = this.getDefaultValues().getValue()

    const defaultsAtPath = getDeep(defaults, path)
    return defaultsAtPath as $FixMe
  }
}

function parsePathToProp(
  pathToPropInString: string,
): undefined | Array<string | number> {
  try {
    const pathToProp = JSON.parse(pathToPropInString)
    return pathToProp
  } catch (e) {
    logger.warn(
      `property ${JSON.stringify(
        pathToPropInString,
      )} cannot be parsed. Skipping.`,
    )
    return undefined
  }
}
