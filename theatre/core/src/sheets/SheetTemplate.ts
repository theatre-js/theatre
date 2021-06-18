import type Project from '@theatre/core/projects/Project'
import SheetObjectTemplate from '@theatre/core/sheetObjects/SheetObjectTemplate'
import type {
  SheetAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {Atom} from '@theatre/dataverse'
import Sheet from './Sheet'
import type {SheetObjectConfig} from './TheatreSheet'

export default class SheetTemplate {
  readonly type: 'Theatre_SheetTemplate' = 'Theatre_SheetTemplate'
  readonly address: WithoutSheetInstance<SheetAddress>
  private _instances = new Atom<{[instanceId: string]: Sheet}>({})
  readonly instancesP = this._instances.pointer

  private _objectTemplates = new Atom<{
    [objectKey: string]: SheetObjectTemplate
  }>({})
  readonly objectTemplatesP = this._objectTemplates.pointer

  constructor(readonly project: Project, sheetId: string) {
    this.address = {...project.address, sheetId}
  }

  getInstance(instanceId: string): Sheet {
    let inst = this._instances.getState()[instanceId]

    if (!inst) {
      inst = new Sheet(this, instanceId)
      this._instances.setIn([instanceId], inst)
    }

    return inst
  }

  getObjectTemplate(
    key: string,
    nativeObject: unknown,
    config: SheetObjectConfig<$IntentionalAny>,
  ): SheetObjectTemplate {
    let template = this._objectTemplates.getState()[key]

    if (!template) {
      template = new SheetObjectTemplate(this, key, nativeObject, config)
      this._objectTemplates.setIn([key], template)
    }

    return template
  }
}
