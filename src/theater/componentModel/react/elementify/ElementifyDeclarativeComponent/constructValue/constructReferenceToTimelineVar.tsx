import {default as TimelineInstance} from '$theater/componentModel/react/TheaterComponent/TimelineInstance/TimelineInstance'

const constructReferenceToTimelineVar = (desD, d) => {
  const timelineIdD = desD.prop('timelineId')
  const varIdD = desD.prop('varId')

  return timelineIdD.flatMap((timelineId: string) =>
    varIdD.flatMap((varId: string) => {
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
