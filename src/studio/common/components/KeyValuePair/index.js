// @flow
import {compose, React} from '$studio/handy'
import css from './index.css'

type Props = {
  k: React.Node,
  v: React.Node,
}

const KeyValuePair = (props: Props) => {
  return (
    <div key="container" className={css.container}>
      <div className={css.keyContainer}>{props.k}</div>
      <div className={css.colon}>:</div>
      <div className={css.valueContainer}>{props.v}</div>
    </div>
  )
}

export default compose(a => a)(KeyValuePair)
