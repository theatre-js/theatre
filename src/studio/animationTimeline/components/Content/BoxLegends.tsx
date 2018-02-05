import {React} from '$studio/handy'
import css from './BoxLegends.css'
import * as _ from 'lodash'
import cx from 'classnames'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import MdSwapVerticalCircel from 'react-icons/lib/md/swap-vertical-circle'
import FaBullseye from 'react-icons/lib/fa/bullseye'
import FaCircleO from 'react-icons/lib/fa/circle-o'

interface IState {
  contextMenuProps: undefined | null | Object
}

class BoxLegends extends React.PureComponent<$FixMe, IState> {
  state = {
    contextMenuProps: null
  }

  handleClick(e: $FixMe, variableId: string) {
    this.props.setActiveVariable(variableId)
  }

  handleContextMenu(e: $FixMe, variableId: string) {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.setState(() => ({contextMenuProps: {variableId, left: clientX, top: clientY}}))
  }

  render() {
    const {variables, colors, activeVariableId} = this.props
    const {contextMenuProps} = this.state
    return (
      <div className={css.container}>
        {variables.map(({id, component, property}: $FixMe, index: number) => {
          return (
            <div
              key={id}
              className={css.legendItem}
              style={{'--color': colors[index % colors.length]}}
              onClick={(e: $FixMe) => this.handleClick(e, id)}
              onContextMenu={(e: $FixMe) => this.handleContextMenu(e, id)}
            >
              <div
                className={cx(css.legendBar, {
                  [css.isActive]: activeVariableId === id,
                })}
              />
              <div className={css.legendText}>
                <span className={css.component}>{component}</span>
                <span className={css.separator}>&nbsp;/&nbsp;</span>
                <span className={css.property}>{property}</span>
              </div>
            </div>
          )
        })}
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({contextMenuProps: null}))}
            centerPoint={_.pick(contextMenuProps, ['left', 'top'])}
            placement='top'
            items={[
              {
                label: 'Hide $O$ther Lanes',
                cb: () => null,
                IconComponent: FaBullseye,
              },
              {
                label: '$S$plit this Lane',
                cb: () => this.props.splitVariable(contextMenuProps.variableId),
                disabled: variables.length === 1,
                IconComponent: MdSwapVerticalCircel,
              },
              {
                label: '$H$ide this Lane',
                cb: () => null,
                IconComponent: FaCircleO,                
              },
            ]}
          />
        )}
      </div>
    )
  }
}

export default BoxLegends
