import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Right.css'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {
  internalTimelineToSeriesOfVerticalItems,
  PrimitivePropItem,
} from '../utils'
// import GroupingOrObject from './items/GroupingOrObject'
// import PrimitiveProp from './items/PrimitiveProp'
import SeekBar from './SeekBar/SeekBar'
import AnimatableProp from './items/AnimatableProp'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Right extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {allInOnePanelStuffP => {
          return (
            <PropsAsPointer>
              {() => {
                const timelineInstance = val(
                  allInOnePanelStuffP.timelineInstance,
                )
                const internalTimeline = val(
                  allInOnePanelStuffP.internalTimeline,
                )
                if (!timelineInstance || !internalTimeline) return null

                const items = internalTimelineToSeriesOfVerticalItems(
                  this.ui,
                  internalTimeline,
                )

                const lastItem = items[items.length - 1]
                const height = lastItem ? lastItem.top + lastItem.height : 0

                return (
                  <>
                    <SeekBar />
                    <div
                      {...classes('container')}
                      style={{height: `${height}px`}}
                    >
                      <div {...classes('filler')} />
                      {items
                        .filter(item => item.type === 'PrimitiveProp')
                        .map(item => {
                          return (
                            <AnimatableProp
                              item={item as PrimitivePropItem}
                              key={item.key}
                            />
                          )
                        })}
                    </div>
                  </>
                )
              }}
            </PropsAsPointer>
          )
        }}
      </AllInOnePanelStuff>
    )
  }
}
