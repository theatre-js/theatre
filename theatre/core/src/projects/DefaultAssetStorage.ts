import type {IAssetStorageConfig} from './Project'
import * as uuid from 'uuid'
import * as idb from 'idb-keyval'
import JSZip from 'jszip'

export const createDefaultAssetStorage = ({
  baseUrl = '',
} = {}): IAssetStorageConfig => {
  return {
    coreAssetStorage: {
      getAssetUrl: (assetId: string) => `${baseUrl}/${assetId}`,
    },
    createStudioAssetStorage: async () => {
      // Check for support.
      if (!('indexedDB' in window)) {
        console.log("This browser doesn't support IndexedDB.")

        return {
          getAssetUrl: (assetId: string) => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          createAsset: (asset: Blob) => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          updateAsset: (assetId: string, asset: Blob) => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          deleteAsset: (assetId: string) => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          getAssetIDs: () => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          createExport: () => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
        }
      }

      const assetsFromBaseUrl = new Map<string, Blob>()

      const assetsMap = new Map(await idb.entries()) as Map<string, Blob>
      const urlCache = new Map<Blob, string>()

      const invalidateUrl = (asset: Blob) => {
        const url = urlCache.get(asset)
        if (url) {
          URL.revokeObjectURL(url)
          urlCache.delete(asset)
        }
      }

      const getUrlForAsset = (asset: Blob) => {
        if (urlCache.has(asset)) {
          return urlCache.get(asset)!
        } else {
          const url = URL.createObjectURL(asset)
          urlCache.set(asset, url)
          return url
        }
      }

      const getUrlForId = (assetId: string) => {
        const asset = assetsMap.get(assetId)
        if (!asset) {
          throw new Error(`Asset with id ${assetId} not found`)
        }
        return getUrlForAsset(asset)
      }

      return {
        getAssetUrl: (assetId: string) => {
          return getUrlForId(assetId)
        },
        createAsset: async (asset: Blob) => {
          const assetId = uuid.v4()
          assetsMap.set(assetId, asset)
          await idb.set(assetId, asset)
          return assetId
        },
        updateAsset: async (assetId: string, asset: Blob) => {
          if (!assetsMap.has(assetId)) {
            throw new Error(`Asset with id ${assetId} not found`)
          }
          const oldAsset = assetsMap.get(assetId)!
          invalidateUrl(oldAsset)
          assetsMap.set(assetId, asset)
          await idb.set(assetId, asset)
        },
        deleteAsset: async (assetId: string) => {
          if (!assetsMap.has(assetId)) {
            return
          }
          const asset = assetsMap.get(assetId)!
          invalidateUrl(asset)
          assetsMap.delete(assetId)
          await idb.del(assetId)
        },
        getAssetIDs: (type?: string) => {
          const ids: string[] = []
          for (const [id, asset] of assetsMap.entries()) {
            if (!type || asset.type.startsWith(type)) {
              ids.push(id)
            }
          }
          return ids
        },
        createExport: async () => {
          const assetIDs = Array.from(assetsMap.keys())

          if (assetIDs.length > 0) {
            const zip = new JSZip()

            await Promise.all(
              assetIDs.map(async (assetID) => {
                const assetUrl = getUrlForId(assetID)
                if (!assetUrl) return

                const blob = await fetch(assetUrl).then((r) => r.blob())
                zip.file(assetID, blob)
              }),
            )

            const assetsFile = await zip.generateAsync({type: 'blob'})
            return {
              blob: assetsFile,
              extension: '.assets.zip',
            }
          } else {
            return null
          }
        },
      }
    },
  }
}
