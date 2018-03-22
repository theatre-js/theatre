import {withRouter} from 'react-router-dom'
// import {HigherOrderComponent} from 'react-flow-types'

export type WithRouterProps = {
  history: {
    push: (path: string, options: undefined | null | Object) => void
    goBack: Function
    replace: (path: string) => void
  }
  match: Object
  location: Object
}

export default (withRouter as any) as HigherOrderComponent<{}, WithRouterProps>
