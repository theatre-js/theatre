import type {Asset, File} from '@theatre/shared/utils/assets'

export interface IEditingTools<T> {
  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permanentlySetValue(v: T): void

  getAssetUrl(asset: Asset | File): string | undefined
  createAsset(asset: Blob): Promise<string | null>
}
