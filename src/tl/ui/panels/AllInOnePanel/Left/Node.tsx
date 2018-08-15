import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Node.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {NodeDescriptorsByPath} from './Left'
import {val} from '$shared/DataVerse2/atom'
import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!$theater/ExploreFlyoutMenu/arrow.svg'
import Props from './Props/Props'

interface IProps {
  css?: Partial<typeof css>
  path: string
  nodeDescriptorsByPath: NodeDescriptorsByPath
  depth: number
}

interface IState {
  isExpanded: boolean
}

export default class Node extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {isExpanded: true}
  }

  toggleExpansion = () => {
    this.setState(({isExpanded}) => ({isExpanded: !isExpanded}))
  }

  select = () => {}

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)
    const node = val(propsP.nodeDescriptorsByPath[val(propsP.path)])
    const depth = val(propsP.depth)
    const isExpanded = val(stateP.isExpanded)
    const hasChildren = node.children.length > 0
    const {isObject} = node
    const isSelected = false
    const isSelectable = false

    let childrenNodes = null
    if (isExpanded && hasChildren) {
      const childDepth = depth + 1
      childrenNodes = node.children.map(
        childPath => (
          <Node
            key={`child-${childPath}`}
            depth={childDepth}
            nodeDescriptorsByPath={val(propsP.nodeDescriptorsByPath)}
            path={childPath}
          />
        ),
      )
    }

    return (
      <div
        {...classes(
          'container',
          isSelected && 'selected',
          isExpanded && 'expanded',
          hasChildren && 'hasChildren',
          isObject && 'isObject',
        )}
        // @ts-ignore ignore
        style={{'--depth': depth}}
      >
        <div {...classes('top')}>
          {
            <div {...classes('bullet')} onClick={this.toggleExpansion}>
              <div {...classes('bulletIcon')}>
                {<SvgIcon sizing="fill" src={arrowIcon} />}
              </div>
            </div>
          }
          <div
            key="name"
            {...classes('name', isSelectable && 'selectable')}
            onClick={this.select}
          >
            {node.lastComponent}
          </div>
        </div>
        {isObject && isExpanded && <Props />}
        {hasChildren && <div {...classes('subNodes')}>{childrenNodes}</div>}
      </div>
    )
  }
}
