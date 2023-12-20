import type CoreBundle from '@theatre/core/CoreBundle'
import type {CoreBits} from '@theatre/core/CoreBundle'
import type {Studio} from './Studio'

export default class StudioBundle {
  private _coreBundle: undefined | CoreBundle
  constructor(private readonly _studio: Studio) {}
  get type(): 'Theatre_StudioBundle' {
    return 'Theatre_StudioBundle'
  }

  registerCoreBundle(coreBundle: CoreBundle) {
    if (this._coreBundle) {
      throw new Error(
        `StudioBundle.coreBundle is already registered. This is a bug.`,
      )
    }
    this._coreBundle = coreBundle
    let coreBits!: CoreBits

    coreBundle.getBitsForStudio(this._studio, (bits) => {
      coreBits = bits
    })

    this._studio.setCoreBits(coreBits)
  }
}
