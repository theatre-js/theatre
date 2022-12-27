import {createStore} from './IDBStorage'
import type Project from './Project'
import type {IAssetStorageConfig} from './Project'
// @ts-ignore
import blobCompare from 'blob-compare'
import {notify} from '@theatre/core/coreExports'
import {getAllPossibleAssetIDs} from '@theatre/shared/utils/assets'

export const createDefaultAssetStorageConfig = ({
  project,
  baseUrl = '',
}: {
  project: Project
  baseUrl?: string
}): IAssetStorageConfig => {
  return {
    coreAssetStorage: {
      getAssetUrl: (assetId: string) => `${baseUrl}/${assetId}`,
    },
    createStudioAssetStorage: async () => {
      // in SSR we bail out and return a dummy asset manager
      if (typeof window === 'undefined') {
        return {
          getAssetUrl: () => '',
          createAsset: () => Promise.resolve(null),
        }
      }

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
        }
      }

      const idb = createStore(`${project.address.projectId}-assets`)

      // get all possible asset ids referenced by either static props or keyframes
      const possibleAssetIDs = getAllPossibleAssetIDs(project)

      // Clean up assets not referenced by the project. We can only do this at the start because otherwise
      // we'd break undo/redo.
      const idbKeys = await idb.keys<string>()
      await Promise.all(
        idbKeys.map(async (key) => {
          if (!possibleAssetIDs.includes(key)) {
            await idb.del(key)
          }
        }),
      )

      // Clean up idb entries exported to disk
      await Promise.all(
        idbKeys.map(async (key) => {
          const assetUrl = `${baseUrl}/${key}`

          try {
            const response = await fetch(assetUrl, {method: 'HEAD'})
            if (response.ok) {
              await idb.del(key)
            }
          } catch (e) {
            notify.error(
              'Failed to access assets',
              `Failed to access assets at ${
                project.config.assets?.baseUrl ?? '/'
              }. This is likely due to a CORS issue.`,
            )
          }
        }),
      )

      const assetsMap = new Map(await idb.entries<string, Blob>())
      const urlCache = new Map<Blob, string>()

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
          return assetsMap.has(assetId)
            ? getUrlForId(assetId)
            : `${baseUrl}/${assetId}`
        },
        createAsset: async (asset: File) => {
          const existingIDs = getAllPossibleAssetIDs(project)

          let sameSame = false

          if (existingIDs.includes(asset.name)) {
            let existingAsset: Blob | undefined
            try {
              existingAsset =
                assetsMap.get(asset.name) ??
                (await fetch(`${baseUrl}/${asset.name}`).then((r) =>
                  r.ok ? r.blob() : undefined,
                ))
            } catch (e) {
              notify.error(
                'Failed to access assets',
                `Failed to access assets at ${
                  project.config.assets?.baseUrl ?? '/'
                }. This is likely due to a CORS issue.`,
              )

              return Promise.resolve(null)
            }

            if (existingAsset) {
              // @ts-ignore
              sameSame = await blobCompare.isEqual(asset, existingAsset)

              // if same same, we do nothing
              if (sameSame) {
                return asset.name
              } else {
                // if different, we ask the user to pls rename
                const renameAsset = (text: string): boolean => {
                  const newAssetName = prompt(text, asset.name)

                  if (newAssetName === null) {
                    // asset creation canceled
                    return false
                  } else if (newAssetName === '') {
                    return renameAsset(
                      'Asset name cannot be empty. Please choose a different file name for this asset.',
                    )
                  } else if (existingIDs.includes(newAssetName)) {
                    console.log(existingIDs)
                    return renameAsset(
                      'An asset with this name already exists. Please choose a different file name for this asset.',
                    )
                  }

                  // rename asset
                  asset = new File([asset], newAssetName, {type: asset.type})
                  return true
                }

                const success = renameAsset(
                  'An asset with this name already exists. Please choose a different file name for this asset.',
                )

                if (!success) {
                  return null
                }
              }
            }
          }

          assetsMap.set(asset.name, asset)
          await idb.set(asset.name, asset)
          return asset.name
        },
      }
    },
  }
}
