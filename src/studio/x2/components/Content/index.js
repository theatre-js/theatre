// @flow
import {compose, React, connect} from '$studio/handy'
import css from './index.css'
import * as x2Selectors from '$studio/x2/selectors'
// import * as componentModelSelectors from '$studio/componentModel/selectors'
import type {PathToInspectable, Inspectable} from '$studio/x2/types'

type Props = {
  thePath: ?PathToInspectable,
  inspectable: ?Inspectable,
}

type State = {}

export class index extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    console.log(this.props.thePath)
    return <div className={css.container}>X2 s here</div>
  }
}

export default compose(
  connect((s) => {
    const thepath = x2Selectors.pathToInspectable(s)
    const inspectable = thepath ? x2Selectors.getInspectableByPath(s, thepath) : undefined
    return {
      thePath: thepath,
      inspectable,
    }
  }),
)(index)