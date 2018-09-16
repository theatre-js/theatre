import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './DurationIndicator.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {
  xToTime,
  getSvgWidth,
  timeToX,
} from '$theater/AnimationTimelinePanel/utils'
import {RightStuff} from '$tl/ui/panels/AllInOnePanel/Right/Right'

interface IProps {
  css?: Partial<typeof css>
}

interface IState {}

const unscaledDimmerWidth = 1000

export default class DurationIndicator extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <AllInOnePanelStuff>
        {allInOnePanelStuffP => (
          <RightStuff>
            {rightStuffP => (
              <PropsAsPointer>
                {() => {
                  const timelineWidth = val(rightStuffP.timelineWidth)
                  
                  const dimmerX = timeToX(
                    val(rightStuffP.overshotDuration),
                    timelineWidth,
                  )(val(rightStuffP.realDuration))

                  const dimmerWidth = timelineWidth - dimmerX + 5

                  return (
                    <div {...classes('container')}>
                      <div
                        {...classes('dimmer')}
                        style={{
                          transform: `scale(${dimmerWidth /
                            unscaledDimmerWidth}, 1)`,
                        }}
                      />
                      <div
                        {...classes('border')}
                        style={{transform: `translateX(-${dimmerWidth}px)`}}
                      />
                    </div>
                  )
                }}
              </PropsAsPointer>
            )}
          </RightStuff>
        )}
      </AllInOnePanelStuff>
    )
  }
}
