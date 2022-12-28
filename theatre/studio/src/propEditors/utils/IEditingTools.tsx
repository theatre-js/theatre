import type {Asset} from '@theatre/shared/utils/assets'

export interface IEditingTools<T> {
  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permanentlySetValue(v: T): void

  getAssetUrl(asset: Asset): string | undefined
  createAsset(asset: Blob): Promise<string | null>
}
