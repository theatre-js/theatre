import type Project from '@theatre/core/projects/Project'
import SheetObjectTemplate from '@theatre/core/sheetObjects/SheetObjectTemplate'
import type {
  SheetAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import {Atom} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import Sheet from './Sheet'
import type {ObjectNativeObject} from './Sheet'
import type {SheetObjectPropTypeConfig} from './TheatreSheet'
import type {
  ObjectAddressKey,
  SheetId,
  SheetInstanceId,
} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'

type SheetTemplateObjectTemplateMap = StrictRecord<
  ObjectAddressKey,
  SheetObjectTemplate
>

export default class SheetTemplate {
  readonly type: 'Theatre_SheetTemplate' = 'Theatre_SheetTemplate'
  readonly address: WithoutSheetInstance<SheetAddress>
  private _instances = new Atom<Record<SheetInstanceId, Sheet>>({})
  readonly instancesP: Pointer<Record<SheetInstanceId, Sheet>> =
    this._instances.pointer

  private _objectTemplates = new Atom<SheetTemplateObjectTemplateMap>({})
  readonly objectTemplatesP = this._objectTemplates.pointer

  constructor(readonly project: Project, sheetId: SheetId) {
    this.address = {...project.address, sheetId}
  }

  getInstance(instanceId: SheetInstanceId): Sheet {
    let inst = this._instances.getState()[instanceId]

    if (!inst) {
      inst = new Sheet(this, instanceId)
      this._instances.setIn([instanceId], inst)
    }

    return inst
  }

  getObjectTemplate(
    objectKey: ObjectAddressKey,
    nativeObject: ObjectNativeObject,
    config: SheetObjectPropTypeConfig,
  ): SheetObjectTemplate {
    let template = this._objectTemplates.getState()[objectKey]

    if (!template) {
      template = new SheetObjectTemplate(this, objectKey, nativeObject, config)
      this._objectTemplates.setIn([objectKey], template)
    }

    return template
  }
}
