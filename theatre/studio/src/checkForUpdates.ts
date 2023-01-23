import {pointerToPrism, val} from '@theatre/dataverse'
import {defer} from '@theatre/shared/utils/defer'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import getStudio from './getStudio'
import type {UpdateCheckerResponse} from './store/types'

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000 // check for updates every 30 minutes
const TIME_TO_WAIT_ON_ERROR = 1000 * 60 * 60 // an hour

/**
 * Returns a promise that will resolve when the UI is visible. If the UI is hidden, it'll
 * wait for it to become visible.
 */
async function waitTilUIIsVisible(): Promise<undefined> {
  const visibilityStatePt = getStudio().atomP.ahistoric.visibilityState
  if (val(visibilityStatePt) === 'everythingIsVisible') return
  const deferred = defer<undefined>()

  const unsub = pointerToPrism(visibilityStatePt).onStale(() => {
    const newVal = val(visibilityStatePt)
    if (newVal === 'everythingIsVisible') {
      unsub()
      deferred.resolve(undefined)
    }
  })

  return deferred.promise
}

export default async function checkForUpdates() {
  // let's wait a bit in case the user has called for the UI to be hidden.
  await wait(500)
  await waitTilUIIsVisible()
  while (true) {
    const state = val(getStudio().atomP.ahistoric.updateChecker)
    if (state) {
      if (state.result !== 'error') {
        const lastChecked = state.lastChecked
        const now = Date.now()
        const timeElapsedSinceLastCheckedForUpdate = Math.abs(now - lastChecked)

        // doing Math.max in case the clock has shifted
        if (timeElapsedSinceLastCheckedForUpdate < UPDATE_CHECK_INTERVAL) {
          await wait(
            UPDATE_CHECK_INTERVAL - timeElapsedSinceLastCheckedForUpdate,
          )
        }
      }
    }
    try {
      const response = await fetch(
        new Request(
          `https://updates.theatrejs.com/updates/${process.env.THEATRE_VERSION}`,
        ),
      )
      if (response.ok) {
        const json = await response.json()
        if (!isValidUpdateCheckerResponse(json)) {
          throw new Error(`Bad response`)
        }
        getStudio().transaction(({drafts}) => {
          drafts.ahistoric.updateChecker = {
            lastChecked: Date.now(),
            result: {...json},
          }
        })

        await wait(1000)
      } else {
        throw new Error(`HTTP Error ${response.statusText}`)
      }
    } catch (error) {
      // TODO log an error here

      await wait(TIME_TO_WAIT_ON_ERROR)
    }
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isValidUpdateCheckerResponse(
  json: unknown,
): json is UpdateCheckerResponse {
  if (typeof json !== 'object') return false
  const obj = json as $IntentionalAny
  if (typeof obj['hasUpdates'] !== 'boolean') return false
  // could use a runtime type checker but not important yet
  return (
    (obj.hasUpdates === true &&
      typeof obj.newVersion === 'string' &&
      typeof obj.releasePage === 'string') ||
    obj.hasUpdates === false
  )
}
