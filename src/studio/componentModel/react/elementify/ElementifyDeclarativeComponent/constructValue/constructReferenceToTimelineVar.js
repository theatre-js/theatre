/* eslint-disable flowtype/require-valid-file-annotation */
import type {default as TimelineInstance} from '$studio/componentModel/react/makeReactiveComponent/TimelineInstance'

const constructReferenceToTimelineVar = (descP, d) => {
  const timelineIdP = descP.prop('timelineId')
  const varIdP = descP.prop('varId')

  return timelineIdP.flatMap((timelineId: string) =>
    varIdP.flatMap((varId: string) => {
      return d
        .pointer()
        .prop('timelineInstances')
        .prop(timelineId)
        .flatMap((timelineInstance: TimelineInstance) => {
          return timelineInstance.valueFor(varId)
        })
    }),
  )
}

export default constructReferenceToTimelineVar
