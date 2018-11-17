import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Shadow.css'
import {val} from '$shared/DataVerse/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  TimeStuff,
  ITimeStuff,
} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'

const classes = resolveCss(css)
interface IProps {
  which: 'from' | 'to'
}

interface IState {}

export default class Shadow extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <TimeStuff>
        {timeStuffP => (
          <PropsAsPointer props={this.props}>
            {p => {
              const range = val(
                this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
                  this.ui.atomP.historic,
                  val(timeStuffP.timelineTemplate).address,
                ),
              )

              if (!range) return null
              const which = val(p.props.which)

              const viewportWidth = val(timeStuffP.viewportSpace.width)
              const timeToInRangeX = val(timeStuffP.viewportScrolledSpace.timeToInRangeX)

              const [fromX, toX] =
                which === 'from'
                  ? [0, timeToInRangeX(range.from)]
                  : [timeToInRangeX(range.from), viewportWidth]

              return null

              const invisible = toX < 0 || fromX > viewportWidth

              return (
                <div
                  {...classes('container', which, invisible && 'invisible')}
                  style={{
                    transform: `translateX(${fromX}px)`,
                  }}
                />
              )
            }}
          </PropsAsPointer>
        )}
      </TimeStuff>
    )
  }
}
