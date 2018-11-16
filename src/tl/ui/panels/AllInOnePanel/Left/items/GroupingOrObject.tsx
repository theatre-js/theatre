import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './GroupingOrObject.css'
import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
import {GroupingItem, ObjectItem} from '../../utils'
import {getProjectTimelineAndInstance} from '$tl/ui/panels/AllInOnePanel/selectors'

const classes = resolveCss(css)

interface IProps {
  item: GroupingItem | ObjectItem
}

interface IState {}

export default class GroupingOrObject extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
  }

  toggleExpansion = () => {
    console.log('togg');
    
    const {timelineTemplate} = getProjectTimelineAndInstance(this.ui)
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setNodeExpansion({
        expanded: !this.props.item.expanded,
        nodePath: this.props.item.path,
        ...timelineTemplate._address,
      }),
    )
  }

  select = () => {}

  render() {
    const {props} = this
    const {item} = props
    const hasChildren = true
    const isSelected = false
    const isSelectable = false
    const pathComponents = props.item.path.split(/\s*\/\s*/)
    const lastComponentOfPath = pathComponents[pathComponents.length - 1]
    const name = lastComponentOfPath

    return (
      <div
        {...classes(
          'container',
          isSelected && 'selected',
          props.item.expanded && 'expanded',
          hasChildren && 'hasChildren',
          item.type === 'Grouping' ? 'grouping' : 'object',
        )}
        style={{
          // @ts-ignore ignore
          '--depth': props.item.depth,
          top: item.top + 'px',
          height: item.height + 'px',
        }}
      >
        <div {...classes('top')}>
          {
            <div {...classes('bullet')} onClick={this.toggleExpansion}>
              <div {...classes('bulletIcon')}>
                {<SvgIcon sizing="absoluteFill" src={arrowIcon} />}
              </div>
            </div>
          }
          <div
            key="name"
            {...classes('name', isSelectable && 'selectable')}
            onClick={this.select}
          >
            {name}
          </div>
        </div>
      </div>
    )
  }
}
