export interface IEditingTools<T> {
  temporarilySetValue(v: T): void
  discardTemporaryValue(): void
  permanentlySetValue(v: T): void

  getAssetUrl(assetId: string): string
  createAsset(asset: Blob): Promise<string>
  deleteAsset(assetId: string): Promise<void>
  updateAsset(assetId: string, asset: Blob): Promise<void>
  getAssetIDs: (type?: string) => string[]
}
