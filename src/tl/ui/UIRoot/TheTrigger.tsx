import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './TheTrigger.css'
import {val} from '$shared/DataVerse/atom'
import WindowDims from '$shared/utils/react/WindowDims'
import SvgIcon from '$shared/components/SvgIcon'
import minimizeIcon from 'svg-inline-loader!$tl/ui/panels/AllInOnePanel/Bottom/minimizeIcon.svg'
import WithTooltip from '$shared/components/WithTooltip/WithTooltip'

const boxDims = {
  width: 50,
  height: 50,
}

interface IProps {
  css?: Partial<typeof css>
}

interface IState {}

export default class TheTrigger extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  toggle = () => {
    const existingState = this.ui.reduxStore.getState().ahistoric
      .visibilityState
    // debugger
    this.ui.reduxStore.dispatch(
      this.ui.actions.ahistoric.setUIVisibilityState(
        existingState === 'everythingIsVisible'
          ? 'onlyTriggerIsVisible'
          : 'everythingIsVisible',
      ),
    )
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <WindowDims>
        {windowDims => (
          <PropsAsPointer props={this.props} windowDims={windowDims}>
            {({windowDims: windowDimsP}) => {
              const position = val(this.ui.atomP.ahistoric.theTrigger.position)
              const windowDims = val(windowDimsP)

              const top =
                position.closestCorner === 'topLeft' ||
                position.closestCorner === 'topRight'
                  ? position.distanceFromVerticalEdge * windowDims.height
                  : (1 - position.distanceFromVerticalEdge) *
                      windowDims.height -
                    boxDims.height

              const left =
                position.closestCorner === 'topLeft' ||
                position.closestCorner === 'bottomLeft'
                  ? position.distanceFromHorizontalEdge * windowDims.width
                  : (1 - position.distanceFromHorizontalEdge) *
                      windowDims.width -
                    boxDims.width

              return (
                <WithTooltip
                  inside={<div {...classes('tooltip')}>Theatre.js</div>}
                >
                  <div
                    style={{left: left + 'px', top: top + 'px'}}
                    {...classes('container')}
                    onClick={this.toggle}
                  >
                    <div {...classes('iconWrapper')}>
                      <SvgIcon sizing="fill" src={minimizeIcon} />
                    </div>
                  </div>
                </WithTooltip>
              )
            }}
          </PropsAsPointer>
        )}
      </WindowDims>
    )
  }
}
