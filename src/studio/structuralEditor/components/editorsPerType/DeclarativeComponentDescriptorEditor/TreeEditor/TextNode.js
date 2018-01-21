// @flow
import {React} from '$studio/handy'
import css from './TextNode.css'

type Props = {
  nodeProps: Object,
}
type State = void

class Node extends React.PureComponent<Props, State> {
  render() {
    const {nodeProps} = this.props
    return <div className={css.container}>
      <div className={css.textLogo}>t</div>
      <div className={css.text}>{nodeProps.value}</div>
    </div>
  }
}

export default Node
