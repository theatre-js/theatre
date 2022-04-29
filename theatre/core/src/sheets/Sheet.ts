import type Project from '@theatre/core/projects/Project'
import Sequence from '@theatre/core/sequences/Sequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {SheetObjectPropTypeConfig} from '@theatre/core/sheets/TheatreSheet'
import TheatreSheet from '@theatre/core/sheets/TheatreSheet'
import type {SheetAddress} from '@theatre/shared/utils/addresses'
import {Atom, valueDerivation} from '@theatre/dataverse'
import type SheetTemplate from './SheetTemplate'
import type {ObjectAddressKey, SheetInstanceId} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'

type SheetObjectMap = StrictRecord<ObjectAddressKey, SheetObject>

/**
 * Future: `nativeObject` Idea is to potentially allow the user to provide their own
 * object in to the object call as a way to keep a handle to an underlying object via
 * the {@link ISheetObject}.
 *
 * For example, a THREEjs object or an HTMLElement is passed in.
 */
export type ObjectNativeObject = unknown

export default class Sheet {
  private readonly _objects: Atom<SheetObjectMap> =
    new Atom<SheetObjectMap>({})
  private _sequence: undefined | Sequence
  readonly address: SheetAddress
  readonly publicApi: TheatreSheet
  readonly project: Project
  readonly objectsP = this._objects.pointer
  type: 'Theatre_Sheet' = 'Theatre_Sheet'

  constructor(
    readonly template: SheetTemplate,
    public readonly instanceId: SheetInstanceId,
  ) {
    this.project = template.project
    this.address = {
      ...template.address,
      sheetInstanceId: this.instanceId,
    }

    this.publicApi = new TheatreSheet(this)
  }

  /**
   * @remarks At some point, we have to reconcile the concept of "an object"
   * with that of "an element."
   */
  createObject(
    objectKey: ObjectAddressKey,
    nativeObject: ObjectNativeObject,
    config: SheetObjectPropTypeConfig,
  ): SheetObject {
    const objTemplate = this.template.getObjectTemplate(
      objectKey,
      nativeObject,
      config,
    )

    const object = objTemplate.createInstance(this, nativeObject, config)

    this._objects.setIn([objectKey], object)

    return object
  }

  getObject(key: ObjectAddressKey): SheetObject | undefined {
    return this._objects.getState()[key]
  }

  getSequence(): Sequence {
    if (!this._sequence) {
      const lengthD = valueDerivation(
        this.project.pointers.historic.sheetsById[this.address.sheetId].sequence
          .length,
      ).map((s) => (typeof s === 'number' ? s : 10))

      const subUnitsPerUnitD = valueDerivation(
        this.project.pointers.historic.sheetsById[this.address.sheetId].sequence
          .subUnitsPerUnit,
      ).map((s) => (typeof s === 'number' ? s : 30))

      this._sequence = new Sequence(
        this.template.project,
        this,
        lengthD,
        subUnitsPerUnitD,
      )
    }
    return this._sequence
  }
}
