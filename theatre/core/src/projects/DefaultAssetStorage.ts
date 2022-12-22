import * as idb from 'idb-keyval'
import type Project from './Project'
import {val} from '@theatre/dataverse'
import type {IAssetStorageConfig} from './Project'
// @ts-ignore
import blobCompare from 'blob-compare'

function getAllPossibleAssetIDs(project: Project) {
  const sheets = Object.values(val(project.pointers.historic.sheetsById))
  const staticValues = sheets
    .flatMap((sheet) => Object.values(sheet?.staticOverrides.byObject ?? {}))
    .flatMap((overrides) => Object.values(overrides ?? {}))
  const keyframeValues = sheets
    .flatMap((sheet) => Object.values(sheet?.sequence?.tracksByObject ?? {}))
    .flatMap((tracks) => Object.values(tracks?.trackData ?? {}))
    .flatMap((track) => track?.keyframes)
    .map((keyframe) => keyframe?.value)

  const allValues = [...staticValues, ...keyframeValues].filter(
    // value is string, and is unique
    (value, index, self) =>
      typeof value === 'string' && self.indexOf(value) === index,
  ) as string[]

  return allValues
}

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

          const response = await fetch(assetUrl, {method: 'HEAD'})
          if (response.ok) {
            await idb.del(key)
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
            const existingAsset =
              assetsMap.get(asset.name) ??
              (await fetch(`${baseUrl}/${asset.name}`).then((r) =>
                r.ok ? r.blob() : undefined,
              ))

            if (existingAsset) {
              // @ts-ignore
              sameSame = await blobCompare.isEqual(asset, existingAsset)

              // if same same, we do nothing
              if (sameSame) {
                console.log('same same', sameSame)
                return asset.name
              } else {
                const renameAsset = (): boolean => {
                  // if different, we ask the user to pls rename
                  const newAssetName = prompt(
                    'Please rename the asset',
                    asset.name,
                  )

                  if (newAssetName === null) {
                    // asset creation canceled
                    return false
                  } else if (
                    existingIDs.includes(newAssetName) ||
                    newAssetName === ''
                  ) {
                    return renameAsset()
                  }

                  // rename asset
                  asset = new File([asset], newAssetName, {type: asset.type})
                  return true
                }

                const success = renameAsset()

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
