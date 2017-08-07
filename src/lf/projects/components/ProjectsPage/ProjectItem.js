// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './ProjectItem.css'
import {type ProjectDescription} from '$lb/projects/types'

type Props = {
  path: String,
  projectDesc: ?ProjectDescription,
  onForget: Function,
}

const ProjectItem = (props: Props) => {
  return (
    <div className={css.container}>
      <div className={css.projectInfo}>
        {(props.projectDesc != null && props.projectDesc.loadingState === 'loaded') &&
          <div className={css.title}>{props.projectDesc.name}</div>
        }
        {(!(props.projectDesc != null) 
        || (props.projectDesc && props.projectDesc.loadingState === 'loading')) &&
          <div className={css.loading}>
            <span>L</span><span>o</span><span>a</span><span>d</span><span>i</span><span>n</span><span>g</span>
          </div>
        }
        {(props.projectDesc && props.projectDesc.loadingState === 'error') &&
          <div className={css.title}>{props.projectDesc.message}</div>
        }
        <div title={props.path} className={css.path}>{props.path.slice(1).slice(0, -15)}</div>
      </div>
      <button className={css.forgetButton} onClick={props.onForget}>forget</button>
    </div>
  )
}

export default compose(
  (a) => a
)(ProjectItem)
