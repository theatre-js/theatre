import {Validation} from '$shared/ioTypes'

export interface Reporter<A> {
  report: (validation: Validation) => A
}
