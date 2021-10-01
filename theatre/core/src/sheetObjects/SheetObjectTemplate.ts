import type Project from '@theatre/core/projects/Project'
import type Sheet from '@theatre/core/sheets/Sheet'
import type SheetTemplate from '@theatre/core/sheets/SheetTemplate'
import type {SheetObjectConfig} from '@theatre/core/sheets/TheatreSheet'
import {emptyArray} from '@theatre/shared/utils'
import type {
  PathToProp,
  SheetObjectAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import getDeep from '@theatre/shared/utils/getDeep'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  $IntentionalAny,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {Atom, getPointerParts, prism, val} from '@theatre/dataverse'
import get from 'lodash-es/get'
import set from 'lodash-es/set'
import getPropDefaultsOfSheetObject from './getPropDefaultsOfSheetObject'
import SheetObject from './SheetObject'
import logger from '@theatre/shared/logger'

export type IPropPathToTrackIdTree = {
  [key in string]?: SequenceTrackId | IPropPathToTrackIdTree
}

export default class SheetObjectTemplate {
  readonly address: WithoutSheetInstance<SheetObjectAddress>
  readonly type: 'Theatre_SheetObjectTemplate' = 'Theatre_SheetObjectTemplate'
  protected _config: Atom<SheetObjectConfig<$IntentionalAny>>
  readonly _cache = new SimpleCache()
  readonly project: Project

  get config() {
    return this._config.getState()
  }

  constructor(
    readonly sheetTemplate: SheetTemplate,
    objectKey: string,
    nativeObject: unknown,
    config: SheetObjectConfig<$IntentionalAny>,
  ) {
    this.address = {...sheetTemplate.address, objectKey}
    this._config = new Atom(config)
    this.project = sheetTemplate.project
  }

  createInstance(
    sheet: Sheet,
    nativeObject: unknown,
    config: SheetObjectConfig<$IntentionalAny>,
  ): SheetObject {
    this._config.setState(config)
    return new SheetObject(sheet, this, nativeObject)
  }

  overrideConfig(config: SheetObjectConfig<$IntentionalAny>) {
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

        return (
          val(
            pointerToSheetState.staticOverrides.byObject[
              this.address.objectKey
            ],
          ) || {}
        )
      }),
    )
  }

  /**
   * Filters through the sequenced tracks those tracks who are valid
   * according to the object's prop types.
   *
   * Returns an array.
   */
  getArrayOfValidSequenceTracks(): IDerivation<
    Array<{pathToProp: PathToProp; trackId: SequenceTrackId}>
  > {
    return this._cache.get('getArrayOfValidSequenceTracks', () =>
      prism((): Array<{pathToProp: PathToProp; trackId: SequenceTrackId}> => {
        const defaults = val(this.getDefaultValues())

        const pointerToSheetState =
          this.project.pointers.historic.sheetsById[this.address.sheetId]

        const trackIdByPropPath = val(
          pointerToSheetState.sequence.tracksByObject[this.address.objectKey]
            .trackIdByPropPath,
        )

        const arrayOfIds: Array<{
          pathToProp: PathToProp
          trackId: SequenceTrackId
        }> = []

        if (trackIdByPropPath) {
          for (const [pathToPropInString, trackId] of Object.entries(
            trackIdByPropPath,
          )) {
            let pathToProp
            try {
              pathToProp = JSON.parse(pathToPropInString)
            } catch (e) {
              logger.warn(
                `property ${JSON.stringify(
                  pathToPropInString,
                )} cannot be parsed. Skipping.`,
              )
              continue
            }
            const defaultValue = get(defaults, pathToProp)
            if (typeof defaultValue !== 'number') {
              continue
            }

            arrayOfIds.push({pathToProp, trackId: trackId!})
          }
        } else {
          return emptyArray as $IntentionalAny
        }

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
