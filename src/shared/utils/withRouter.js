// @flow
import {withRouter} from 'react-router-dom'
import {type HigherOrderComponent} from 'react-flow-types'

export type WithRouterProps = {
  history: {
    push: (path: string, options: ?Object) => void,
    goBack: Function,
    replace: (path: string) => void,
  },
  match: Object,
  location: Object,
}

export default ((withRouter: any): HigherOrderComponent<{}, WithRouterProps>)
