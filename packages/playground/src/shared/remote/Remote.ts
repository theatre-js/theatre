import type {IProject, ISheet, ISheetObject} from '@theatre/core'
import type {VoidFn} from '@theatre/dataverse/src/types'

export type TheatreUpdateCallback = (data: any) => void

export type BroadcastDataEvent =
  | 'setSheet'
  | 'setSheetObject'
  | 'updateSheetObject'
  | 'updateTimeline'

export interface BroadcastData {
  event: BroadcastDataEvent
  data: any
}

export type BroadcastCallback = (data: BroadcastData) => void

// Default SheetObject.onValuesChange callback
const noop: TheatreUpdateCallback = (values: any) => {}

function isColor(obj: any) {
  return (
    obj.r !== undefined &&
    obj.g !== undefined &&
    obj.b !== undefined &&
    obj.a !== undefined
  )
}

// Which hashtag to add to the URL
const hashtag = 'editor'

class RemoteSingleton {
  // Remote
  mode = 'listener'
  channel: BroadcastChannel

  // Theatre
  project!: IProject
  sheets: Map<string, ISheet> = new Map()
  sheetObjects: Map<string, ISheetObject> = new Map()
  sheetObjectCBs: Map<string, TheatreUpdateCallback> = new Map()
  sheetObjectUnsubscribe: Map<string, VoidFn> = new Map()

  constructor() {
    this.channel = new BroadcastChannel('theatre')
    this.showTheatre = document.location.hash.search(hashtag) > -1
  }

  // Remote

  send(data: BroadcastData) {
    if (this.mode === 'theatre') {
      this.channel.postMessage(data)
    }
  }

  listen(callback: BroadcastCallback) {
    if (this.mode === 'listener') {
      this.channel.onmessage = (event: MessageEvent<any>) => {
        callback(event.data)
      }
    }
  }

  // Theatre

  sheet(name: string): ISheet {
    let sheet: any = this.sheets.get(name)
    if (sheet !== undefined) return sheet

    sheet = this.project.sheet(name)
    this.sheets.set(name, sheet)
    return sheet
  }

  sheetObject(
    sheetName: string,
    key: string,
    props: any,
    onUpdate?: TheatreUpdateCallback,
  ): ISheetObject | undefined {
    const sheet = this.sheets.get(sheetName)
    if (sheet === undefined) return undefined

    const objName = `${sheetName}_${key}`
    let obj = this.sheetObjects.get(objName)
    if (obj !== undefined) {
      obj = sheet.object(key, {...props, ...obj.value}, {reconfigure: true})
      return obj
    }

    obj = sheet.object(key, props)
    this.sheetObjects.set(objName, obj)
    this.sheetObjectCBs.set(objName, onUpdate !== undefined ? onUpdate : noop)

    const unsubscribe = obj.onValuesChange((values: any) => {
      if (this.showTheatre) {
        for (let i in values) {
          const value = values[i]
          if (typeof value === 'object') {
            if (isColor(value)) {
              values[i] = {
                r: value.r,
                g: value.g,
                b: value.b,
                a: value.a,
              }
            }
          }
        }
        this.send({
          event: 'updateSheetObject',
          data: {
            sheetObject: objName,
            values: values,
          },
        })
      } else {
        const callback = this.sheetObjectCBs.get(objName)
        if (callback !== undefined) callback(values)
      }
    })
    this.sheetObjectUnsubscribe.set(objName, unsubscribe)

    return obj
  }

  unsubscribe(sheet: ISheetObject) {
    const id = `${sheet.address.sheetId}_${sheet.address.objectKey}`
    const unsubscribe = this.sheetObjectUnsubscribe.get(id)
    if (unsubscribe !== undefined) {
      unsubscribe()
    }
  }

  // Getters / Setters

  get showTheatre(): boolean {
    return this.mode === 'theatre'
  }

  set showTheatre(value: boolean) {
    if (value) {
      this.mode = 'theatre'
      document.title += ' - Editor'
    }
  }
}

export const remote = new RemoteSingleton()
