import type {Rgba} from './color'

export type MarkerPropType = {
  metaType: 'marker'
  /** undefined is to mean default color */
  rgba?: Rgba | undefined
  /** undefined is to mean empty / unset */
  text?: string | undefined
}
