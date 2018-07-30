import {TPointValuesEditorProps} from '$theater/AnimationTimelinePanel/OverlaysProvider/types'

export type TShowPointValuesEditor = (
  props: Pick<
    TPointValuesEditorProps,
    'initialValue' | 'initialTime' | 'top' | 'left' | 'pointIndex'
  >,
) => void
