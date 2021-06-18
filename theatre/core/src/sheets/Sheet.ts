import type Project from '@theatre/core/projects/Project'
import Sequence from '@theatre/core/sequences/Sequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {SheetObjectConfig} from '@theatre/core/sheets/TheatreSheet'
import TheatreSheet from '@theatre/core/sheets/TheatreSheet'
import type {SheetAddress} from '@theatre/shared/utils/addresses'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {Atom, valueDerivation} from '@theatre/dataverse'
import type SheetTemplate from './SheetTemplate'

type IObjects = {[key: string]: SheetObject}

export default class Sheet {
  private readonly _objects: Atom<IObjects> = new Atom<IObjects>({})
  private _sequence: undefined | Sequence
  readonly address: SheetAddress
  readonly publicApi: TheatreSheet
  readonly project: Project
  readonly objectsP = this._objects.pointer
  type: 'Theatre_Sheet' = 'Theatre_Sheet'

  constructor(
    readonly template: SheetTemplate,
    public readonly instanceId: string,
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
    key: string,
    nativeObject: unknown,
    config: SheetObjectConfig<$IntentionalAny>,
  ): SheetObject {
    const objTemplate = this.template.getObjectTemplate(
      key,
      nativeObject,
      config,
    )

    const object = objTemplate.createInstance(this, nativeObject, config)

    this._objects.setIn([key], object)

    return object
  }

  getObject(key: string): SheetObject | undefined {
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
