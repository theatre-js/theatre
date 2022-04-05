import type {Pointer} from '@theatre/dataverse'
import {isSheetObject} from '@theatre/shared/instanceTypes'
import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import get from 'lodash-es/get'
import type {ITransactionPrivateApi} from './StudioStore'
import forEachDeep from '@theatre/shared/utils/forEachDeep'
import getDeep from '@theatre/shared/utils/getDeep'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import {getPointerParts} from '@theatre/dataverse'
import type {
  PropTypeConfig,
  PropTypeConfig_AllNonCompounds,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/src/utils/addresses'
import {getPropConfigByPath} from '@theatre/shared/propTypes/utils'
import {isPlainObject} from 'lodash-es'

function cloneDeepSerializable<T>(v: T): T | undefined {
  if (
    typeof v === 'boolean' ||
    typeof v === 'string' ||
    typeof v === 'number'
  ) {
    return v
  } else if (isPlainObject(v)) {
    const cloned: $IntentionalAny = {}
    let clonedAtLeastOneProp = false
    for (const [key, val] of Object.entries(v)) {
      const clonedVal = cloneDeepSerializable(val)
      if (typeof clonedVal !== 'undefined') {
        cloned[key] = val
        clonedAtLeastOneProp = true
      }
    }
    if (clonedAtLeastOneProp) {
      return cloned
    }
  } else {
    return undefined
  }
}

function forEachDeepSimplePropOfCompoundProp(
  propType: PropTypeConfig_Compound<$IntentionalAny>,
  path: Array<string | number>,
  callback: (
    propType: PropTypeConfig_AllNonCompounds,
    path: Array<string | number>,
  ) => void,
) {
  for (const [key, subType] of Object.entries(propType.props)) {
    if (subType.type === 'compound') {
      forEachDeepSimplePropOfCompoundProp(subType, [...path, key], callback)
    } else if (subType.type === 'enum') {
      throw new Error(`Not yet implemented`)
    } else {
      callback(subType, [...path, key])
    }
  }
}

export default function createTransactionPrivateApi(
  ensureRunning: () => void,
  stateEditors: ITransactionPrivateApi['stateEditors'],
  drafts: ITransactionPrivateApi['drafts'],
): ITransactionPrivateApi {
  return {
    set: (pointer, value) => {
      ensureRunning()
      const _value = cloneDeepSerializable(value)

      const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)
      if (isSheetObject(root)) {
        const sequenceTracksTree = root.template
          .getMapOfValidSequenceTracks_forStudio()
          .getValue()

        const propConfig = getPropConfigByPath(root.template.config, path)

        if (!propConfig) {
          // TODO: should we just throw here?
          console.error(
            `Object ${
              root.address.objectKey
            } does not have a prop at ${JSON.stringify(path)}`,
          )
          return
        }

        // if (isPropConfigComposite(propConfig)) {
        //   propConfig.validatePartial(_value)
        // } else {
        //   propConfig.validate(_value)
        // }

        const setStaticOrKeyframeProp = <T>(
          value: T,
          propConfig: PropTypeConfig_AllNonCompounds,
          path: PathToProp,
        ) => {
          if (typeof value === 'undefined' || value === null) {
            return
          }

          const propAddress = {...root.address, pathToProp: path}

          const trackId = get(sequenceTracksTree, path) as $FixMe as
            | SequenceTrackId
            | undefined

          if (typeof trackId === 'string') {
            // TODO: Make sure this causes no problems wrt decorated
            // or otherwise unserializable stuff that sanitize might return.
            // value needs to be serializable.
            if (propConfig?.sanitize) value = propConfig.sanitize(value)

            const seq = root.sheet.getSequence()
            seq.position = seq.closestGridPosition(seq.position)
            stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
              {
                ...propAddress,
                trackId,
                position: seq.position,
                value: value as $FixMe,
                snappingFunction: seq.closestGridPosition,
              },
            )
          } else if (propConfig !== undefined) {
            stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.setValueOfPrimitiveProp(
              {...propAddress, value: value as $FixMe},
            )
          }
        }

        if (propConfig.type === 'compound') {
          // If we are dealing with a compound prop, we recurse through its
          // nested properties.
          forEachDeepSimplePropOfCompoundProp(
            propConfig,

            getPointerParts(pointer as Pointer<$IntentionalAny>).path,
            (primitivePropConfig, pathToProp) => {
              const v = getDeep(_value, pathToProp)
              if (typeof v !== 'undefined') {
                setStaticOrKeyframeProp(v, primitivePropConfig, pathToProp)
              }
            },
          )
        } else if (propConfig.type === 'enum') {
          throw new Error(`Enums aren't implemented yet`)
        } else {
          setStaticOrKeyframeProp(_value, propConfig, path)
        }
      } else {
        throw new Error(
          'Only setting props of SheetObject-s is supported in a transaction so far',
        )
      }
    },
    unset: (pointer) => {
      ensureRunning()
      const {root, path} = getPointerParts(pointer as Pointer<$FixMe>)
      if (isSheetObject(root)) {
        const sequenceTracksTree = root.template
          .getMapOfValidSequenceTracks_forStudio()
          .getValue()

        const defaultValue = getDeep(
          root.template.getDefaultValues().getValue(),
          path,
        )

        const propConfig = getPropConfigByPath(
          root.template.config,
          path,
        ) as PropTypeConfig

        const unsetStaticOrKeyframeProp = <T>(value: T, path: PathToProp) => {
          const propAddress = {...root.address, pathToProp: path}

          const trackId = get(sequenceTracksTree, path) as $FixMe as
            | SequenceTrackId
            | undefined

          if (typeof trackId === 'string') {
            stateEditors.coreByProject.historic.sheetsById.sequence.unsetKeyframeAtPosition(
              {
                ...propAddress,
                trackId,
                position: root.sheet.getSequence().positionSnappedToGrid,
              },
            )
          } else if (propConfig !== undefined) {
            stateEditors.coreByProject.historic.sheetsById.staticOverrides.byObject.unsetValueOfPrimitiveProp(
              propAddress,
            )
          }
        }

        if (propConfig.type === 'compound') {
          forEachDeep(
            defaultValue,
            (v, pathToProp) => {
              unsetStaticOrKeyframeProp(v, pathToProp)
            },
            getPointerParts(pointer as Pointer<$IntentionalAny>).path,
          )
        } else {
          unsetStaticOrKeyframeProp(defaultValue, path)
        }
      } else {
        throw new Error(
          'Only setting props of SheetObject-s is supported in a transaction so far',
        )
      }
    },
    get drafts() {
      ensureRunning()
      return drafts
    },
    get stateEditors() {
      return stateEditors
    },
  }
}
