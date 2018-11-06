import React from 'react'
import css from './MinimizeButton.css'
import resolveCss from '$shared/utils/resolveCss'
import Item from '$tl/ui/panels/AllInOnePanel/Bottom/Item'
import UIComponent from '$tl/ui/handy/UIComponent'
import SvgIcon from '$shared/components/SvgIcon'
import minimizeIcon from 'svg-inline-loader!./minimizeIcon.svg'
import WithTooltip from '$shared/components/WithTooltip/WithTooltip'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class MinimizeButton extends UIComponent<IProps, IState> {
  render() {
    return (
      <WithTooltip 
        inside={<div {...classes('tooltip')}>Minimize</div>}
        >
        <div {...classes('itemWrapper')}>
          <Item onClick={this.minimize}>
            <div {...classes('iconWrapper')}>
              <SvgIcon sizing="fill" src={minimizeIcon} />
            </div>
          </Item>
        </div>
      </WithTooltip>
    )
  }

  minimize = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.ahistoric.setUIVisibilityState('onlyTriggerIsVisible'),
    )
  }
}
