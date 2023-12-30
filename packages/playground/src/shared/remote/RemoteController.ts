import type {IProject, ISheet} from '@theatre/core'
import {getStudioSync} from '@theatre/core'
import {remote} from './Remote'
import type {BroadcastData, BroadcastDataEvent} from './Remote'

/**
 * Handles the communication between windows
 */
export default function RemoteController(project: IProject) {
  let activeSheet: ISheet | undefined = undefined
  remote.project = project

  /**
   * Editor is hidden, this window receives updates
   */
  const receiveRemote = () => {
    const studio = getStudioSync()!
    studio.ui.hide()

    remote.listen((msg: BroadcastData) => {
      switch (msg.event) {
        case 'setSheet':
          const sheet = remote.sheets.get(msg.data.sheet)
          if (sheet !== undefined) {
            activeSheet = sheet
            studio.setSelection([sheet])
          }
          break

        case 'setSheetObject':
          const sheetObj = remote.sheetObjects.get(
            `${msg.data.sheet}_${msg.data.key}`,
          )
          if (sheetObj !== undefined) {
            studio.setSelection([sheetObj])
          }
          break

        case 'updateSheetObject':
          const sheetObjCB = remote.sheetObjectCBs.get(msg.data.sheetObject)
          if (sheetObjCB !== undefined) sheetObjCB(msg.data.values)
          break

        case 'updateTimeline':
          activeSheet = remote.sheets.get(msg.data.sheet)
          if (activeSheet !== undefined) {
            activeSheet.sequence.position = msg.data.position
          }
          break
      }
    })
  }

  /**
   * Editor is visible, this window sends updates
   */
  const sendRemote = () => {
    const studio = getStudioSync()!
    studio.ui.restore()

    studio.onSelectionChange((value: any[]) => {
      if (value.length < 1) return

      value.forEach((obj: any) => {
        let id = obj.address.sheetId
        let type: BroadcastDataEvent = 'setSheet'
        let data = {}
        switch (obj.type) {
          case 'Theatre_Sheet_PublicAPI':
            type = 'setSheet'
            data = {
              sheet: obj.address.sheetId,
            }
            activeSheet = remote.sheets.get(obj.address.sheetId)
            break

          case 'Theatre_SheetObject_PublicAPI':
            type = 'setSheetObject'
            id += `_${obj.address.objectKey}`
            data = {
              sheet: obj.address.sheetId,
              key: obj.address.objectKey,
            }
            break
        }
        remote.send({event: type, data: data})
      })
    })

    // Timeline
    let position = 0
    const onRafUpdate = () => {
      if (
        activeSheet !== undefined &&
        position !== activeSheet.sequence.position
      ) {
        position = activeSheet.sequence.position
        const t = activeSheet as ISheet
        remote.send({
          event: 'updateTimeline',
          data: {
            position: position,
            sheet: t.address.sheetId,
          },
        })
      }
    }
    const onRaf = () => {
      onRafUpdate()
      requestAnimationFrame(onRaf)
    }
    onRafUpdate() // Initial position
    onRaf()
  }

  if (remote.showTheatre) {
    sendRemote()
  } else {
    receiveRemote()
  }
}
