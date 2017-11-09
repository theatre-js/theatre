// @flow
import {React, compose} from '$studio/handy'
import css from './index.css'

type Props = {
  title: React.Node,
  body: React.Node,
}

const ModifierInspectorWrapper = ({title, body}: Props) => {
  return (
    <div className={css.container}>
      {title ? (
        <div className={css.titleContainer}>
          {typeof title === 'string' ? (
            <div className={css.title}>{title}</div>
          ) : (
            title
          )}
        </div>
      ) : null}
      <div className={css.bodyContainer}>{body}</div>
    </div>
  )
}

export default compose(a => a)(ModifierInspectorWrapper)
