import React from 'react'
import css from './MinimizeButton.css'
import resolveCss from '$shared/utils/resolveCss'
import Item from '$tl/ui/panels/AllInOnePanel/Bottom/Item'
import UIComponent from '$tl/ui/handy/UIComponent'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class MinimizeButton extends UIComponent<IProps, IState> {
  render() {
    return (
      <Item onClick={this.minimize}>
        <div {...classes('icon')}>&#8601;</div>
      </Item>
    )
  }

  minimize = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.ahistoric.setUIVisibilityState('onlyTriggerIsVisible'),
    )
  }
}
