// import theatre from '@theatre/core'
import {createRafDriver, getProject} from '@theatre/core'
import type {
  UnknownShorthandCompoundProps,
  ISheet,
  ISheetObject,
} from '@theatre/core'
// @ts-ignore
import benchProject1State from './Bench project 1.theatre-project-state.json'
import {setCoreRafDriver} from '@theatre/core/coreTicker'

const driver = createRafDriver({name: 'BenchmarkRafDriver'})

setCoreRafDriver(driver)

// theatre.init({studio: true, })

/**
 * This test will create a project with `numberOfInstances` instances of the same sheet. Each instance
 * will have a single object, and that object will have a bunch of props (see `CONFIG.depthOfProps` and `CONFIG.leavePropsAtEachBranch`).
 * All of those props have been set to be sequenced in `./Bench project 1.theatre-project-state.json`.
 * The test will then play the sequence from the beginning to the end, split into `CONFIG.numberOfIterations` iterations.
 * We then measure the time it takes to play the sequence through.
 */
async function test1() {
  const project = getProject('Bench project 1', {state: benchProject1State})

  const CONFIG = {
    numberOfInstances: 20,
    depthOfProps: 4,
    leavePropsAtEachBranch: 4,
    sequenceLength: 10, // seconds
    numberOfIterations: 20,
  }

  function getObjConf(
    depth: number,
    count: number,
  ): UnknownShorthandCompoundProps | 0 {
    if (depth === 0) {
      return 0
    }

    return Object.fromEntries(
      new Array(count)
        .fill(0)
        .map((_, i) => [String(i), getObjConf(depth - 1, count)]),
    )
  }

  const rootConf = getObjConf(
    CONFIG.depthOfProps,
    CONFIG.leavePropsAtEachBranch,
  ) as UnknownShorthandCompoundProps

  const sheets: Array<ISheet> = []
  const objects: Array<ISheetObject> = []

  for (let i = 0; i < CONFIG.numberOfInstances; i++) {
    const sheet = project.sheet(`Sheet`, `Instance ${i}`)
    sheets.push(sheet)
    const obj = sheet.object(`Obj`, rootConf)
    objects.push(obj)
  }

  let onChangeEventsFired = 0

  function subscribeToAllObjects() {
    const startTime = performance.now()
    for (const obj of objects) {
      obj.onValuesChange((v) => {
        onChangeEventsFired++
      })
    }
    const endTime = performance.now()
    console.log(
      `Subscribing to ${objects.length} objects took ${endTime - startTime}ms`,
    )
  }

  function iterateOnSequence() {
    driver.tick(performance.now())
    const startTime = performance.now()
    for (let i = 1; i < CONFIG.numberOfIterations; i++) {
      onChangeEventsFired = 0
      const pos = (i / CONFIG.numberOfIterations) * CONFIG.sequenceLength
      for (const sheet of sheets) {
        sheet.sequence.position = pos
      }
      driver.tick(performance.now())
      if (onChangeEventsFired !== objects.length) {
        console.info(
          `Expected ${objects.length} onChange events, got ${onChangeEventsFired}`,
        )
      }
    }
    const endTime = performance.now()
    console.log(
      `Scrubbing the sequence in ${CONFIG.numberOfIterations} iterations took ${
        endTime - startTime
      }ms`,
    )
  }

  subscribeToAllObjects()
  iterateOnSequence()
}

void test1().then(() => {
  console.log('test1 done')
})
