import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
import React from 'react'
import * as css from './NodeTemplate.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

type Props = {
  isSelected: boolean
  isExpanded: boolean
  ancestorOfSelectedNode: boolean
  depth: number
  toggleExpansion?: () => void
  select?: () => void
  hasChildren: boolean
  childrenNodes?: React.ReactNode
  name: React.ReactNode
  canHaveChildren: boolean
}

const NodeTemplate = (props: Props) => {
  return (
    <div
      {...classes(
        'container',
        props.isSelected && 'selected',
        props.isExpanded && 'expanded',
        props.hasChildren && 'hasChildren',
        props.ancestorOfSelectedNode && 'ancestorOfSelectedNode',
      )}
      style={{'--depth': props.depth}}
    >
      <div className={css.top}>
        {props.canHaveChildren && (
          <div className={css.bullet} onClick={props.toggleExpansion}>
            <div className={css.bulletIcon}>
              {<SvgIcon sizing="fill" src={arrowIcon} />}
            </div>
          </div>
        )}
        <div key="name" className={css.name} onClick={props.select}>
          {props.name}
        </div>
        {props.select && <div key="highlighter" className={css.highlighter} />}
      </div>
      {props.hasChildren && (
        <div {...classes('subNodes')}>{props.childrenNodes}</div>
      )}
    </div>
  )
}

export const TaggedDisplayName = (props: {name: string}) => (
  <>
    <span className={css.tagOpen}>&lt;</span>
    <span className={css.tagName}>{props.name}</span>
    <span className={css.tagClose}>&gt;</span>
  </>
)

export default NodeTemplate
