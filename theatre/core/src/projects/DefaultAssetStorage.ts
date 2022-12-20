import type {IAssetStorageConfig} from './Project'
import * as uuid from 'uuid'
import * as idb from 'idb-keyval'

type Manifest = {
  [id: string]: {
    type: string
    revisionHistory: string[]
    deleted?: boolean
  }
}

export type DefaultAssetStorageConfig = IAssetStorageConfig<Manifest>

export const createDefaultAssetStorage = ({
  baseUrl = '',
} = {}): DefaultAssetStorageConfig => {
  return {
    coreAssetStorage: {
      getAssetUrl: (assetId: string) => `${baseUrl}/${assetId}`,
    },
    createStudioAssetStorage: async () => {
      // Check for support.
      if (!('indexedDB' in window)) {
        console.log("This browser doesn't support IndexedDB.")

        // #region Asset manager if no idb support
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
          hasConflicts: () => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          acceptRemote: () => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          getManifest: () => {
            throw new Error(
              `IndexedDB is required by the default asset manager, but it's not supported by this browser. To use assets, please provide your own asset manager to the project config.`,
            )
          },
          exportable: true,
        }
        // #endregion
      }

      let assetManifest: Manifest = {}

      try {
        assetManifest = await fetch(`${baseUrl}/manifest.json`).then((r) =>
          r.json(),
        )
      } catch (e) {
        // No asset manifest found
      }

      const conflicts = new Set<string>()

      const idbEntries = new Map(
        await idb.entries<
          string,
          {blob: Blob | null; meta: {revisionHistory: string[]}}
        >(),
      )

      // FIXME even if this all works out, there's on huge weakness remaining: if an asset is deleted in the upstream repo,
      // we can't recover it, since we load all assets from the manifest if present, without saving it in the idb.

      // Resolve/mark conflicts, delete assets from manifest that are marked as deleted
      Object.keys(assetManifest).forEach((id) => {
        const asset = idbEntries.get(id)

        if (!asset) return

        if (
          asset.meta.revisionHistory.indexOf(
            assetManifest[id].revisionHistory[0],
          ) == -1
        ) {
          // if asset is not deleted in idb
          if (asset.blob) {
            // use idb but mark conflict
            conflicts.add(id)
          } else {
            // use manifest, idb asset is deleted

            // if asset marked as deleted in manifest too, delete asset from manifest
            if (assetManifest[id].deleted) {
              delete assetManifest[id]
            }
          }
        } else {
          if (asset.blob) {
            if (
              assetManifest[id].revisionHistory.length ===
              asset.meta.revisionHistory.length
            ) {
              // assets are the same, use asset manifest and delete idb entry to free up space
              idb.del(id)
            } else {
              // use idb, manifest is outdated
              delete assetManifest[id]
            }
          } else {
            // use manifest, idb asset is deleted
            if (assetManifest[id].deleted) {
              // asset marked as deleted in manifest too, delete asset from manifest
              delete assetManifest[id]
            }
          }
        }
      })

      // Create a map of just the blobs. Filter out deleted ones.
      const assetsMap = new Map(
        Array.from(idbEntries)
          .filter(([id, {blob}]) => blob)
          .map(([id, {blob}]) => [id, blob]) as unknown as Map<string, Blob>,
      )
      const urlCache = new Map<Blob, string>()

      const invalidateUrl = (asset: Blob) => {
        const url = urlCache.get(asset)
        if (url) {
          URL.revokeObjectURL(url)
          urlCache.delete(asset)
        }
      }

      /** Gets idb aset url from asset blob */
      const getUrlForAsset = (asset: Blob) => {
        if (urlCache.has(asset)) {
          return urlCache.get(asset)!
        } else {
          const url = URL.createObjectURL(asset)
          urlCache.set(asset, url)
          return url
        }
      }

      /** Gets idb asset url from id */
      const getUrlForId = (assetId: string) => {
        const asset = assetsMap.get(assetId)
        if (!asset) {
          throw new Error(`Asset with id ${assetId} not found`)
        }
        return getUrlForAsset(asset)
      }

      return {
        getAssetUrl: (assetId: string) => {
          return conflicts.has(assetId) || !assetManifest[assetId]
            ? getUrlForId(assetId)
            : `${baseUrl}/${assetId}`
        },
        createAsset: async (asset: Blob) => {
          const assetId = uuid.v4()
          assetsMap.set(assetId, asset)
          await idb.set(assetId, {
            blob: asset,
            meta: {
              revisionHistory: [uuid.v4()],
            },
          })
          return assetId
        },
        updateAsset: async (assetId: string, asset: Blob) => {
          const meta =
            conflicts.has(assetId) || !assetManifest[assetId]
              ? idbEntries.get(assetId)!.meta
              : assetManifest[assetId]

          // Invalidate url of old asset, if any
          const oldAsset = assetsMap.get(assetId)
          if (oldAsset) {
            invalidateUrl(oldAsset)
          }

          assetsMap.set(assetId, asset)
          await idb.set(assetId, {
            blob: asset,
            meta: {
              ...meta,
              revisionHistory: [uuid.v4(), ...meta.revisionHistory],
            },
          })

          // Remove asset from manifest
          delete assetManifest[assetId]
        },
        deleteAsset: async (assetId: string) => {
          const meta =
            conflicts.has(assetId) || !assetManifest[assetId]
              ? idbEntries.get(assetId)!.meta
              : assetManifest[assetId]

          // Invalidate url of old asset, if any
          const oldAsset = assetsMap.get(assetId)
          if (oldAsset) {
            invalidateUrl(oldAsset)
          }
          assetsMap.delete(assetId)

          await idb.set(assetId, {
            blob: null,
            meta: {
              revisionHistory: [uuid.v4(), ...meta.revisionHistory],
            },
          })

          // Remove asset from manifest
          delete assetManifest[assetId]
        },
        getAssetIDs: (type?: string) => {
          const ids: Set<string> = new Set()

          // Get asset ids from idb
          for (const [id, asset] of assetsMap.entries()) {
            if (!type || asset.type.startsWith(type)) {
              ids.add(id)
            }
          }

          // Get asset ids from manifest
          for (const id of Object.keys(assetManifest)) {
            if (!type || assetManifest[id].type.startsWith(type)) {
              ids.add(id)
            }
          }

          return Array.from(ids)
        },
        hasConflicts: (assetId) => Promise.resolve(conflicts.has(assetId)),
        acceptRemote: async (assetId) => {
          // Invalidate url of old asset, if any
          const oldAsset = assetsMap.get(assetId)
          if (oldAsset) {
            invalidateUrl(oldAsset)
          }

          assetsMap.delete(assetId)
          await idb.del(assetId)
          conflicts.delete(assetId)
        },
        getManifest: async () => {
          const manifest: Manifest = {}

          // Get entries from idb
          for (const [id, entry] of await idb.entries<
            string,
            {blob: Blob | null; meta: {revisionHistory: string[]}}
          >()) {
            console.log('idb entry', id, entry)
            manifest[id] = {
              ...entry.meta,
              type: entry.blob?.type ?? '',
            }
          }

          // Get entries from manifest
          for (const [id, entry] of Object.entries(assetManifest)) {
            // prefer idb if there is a conflict
            if (!conflicts.has(id)) {
              manifest[id] = {
                ...entry,
              }
            }
          }

          return manifest
        },
        exportable: true,
      }
    },
  }
}
