import type {IAssetStorageConfig} from './Project'
import * as idb from 'idb-keyval'
import type Project from './Project'
import {val} from '@theatre/dataverse'
import {generateKeyframeId as uuid} from '@theatre/shared/utils/ids'

export type DefaultAssetStorageConfig = IAssetStorageConfig

export const createDefaultAssetStorageConfig = ({
  project,
  baseUrl = '',
}: {
  project: Project
  baseUrl?: string
}): DefaultAssetStorageConfig => {
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
      const sheets = Object.values(val(project.pointers.historic.sheetsById))
      const staticValues = sheets
        .flatMap((sheet) =>
          Object.values(sheet?.staticOverrides.byObject ?? {}),
        )
        .flatMap((overrides) => Object.values(overrides ?? {}))
      const keyframeValues = sheets
        .flatMap((sheet) =>
          Object.values(sheet?.sequence?.tracksByObject ?? {}),
        )
        .flatMap((tracks) => Object.values(tracks?.trackData ?? {}))
        .flatMap((track) => track?.keyframes)
        .map((keyframe) => keyframe?.value)

      const allValues = [...staticValues, ...keyframeValues].filter(
        // value is string, and is unique
        (value, index, self) =>
          typeof value === 'string' && self.indexOf(value) === index,
      ) as string[]

      // Clean up assets not referenced by the project. We can only do this at the start because otherwise
      // we'd break undo/redo.
      const idbKeys = await idb.keys<string>()
      await Promise.all(
        idbKeys.map(async (key) => {
          if (!allValues.includes(key)) {
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
          return assetsMap.has(assetId)
            ? getUrlForId(assetId)
            : `${baseUrl}/${assetId}`
        },
        createAsset: async (asset: Blob) => {
          const fileName = (asset as File).name ?? ''
          const nameBase = fileName.replace(/\.[^/.]+$/, '')
          const extension = fileName.replace(/^.*\./, '')

          const assetId = `${nameBase ? `${nameBase}-` : ''}${uuid()}${
            extension ? `.${extension}` : ''
          }`
          assetsMap.set(assetId, asset)
          await idb.set(assetId, asset)
          return assetId
        },
      }
    },
  }
}
