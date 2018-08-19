import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Left.css'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {internalTimelineToSeriesOfVerticalItems} from '../utils'
import GroupingOrObject from './items/GroupingOrObject'
import PrimitiveProp from './items/PrimitiveProp'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Left extends UIComponent<IProps, IState> {
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
                  <div
                    {...classes('container')}
                    style={{height: `${height}px`}}
                  >
                    {items.map(item => {
                      if (
                        item.type === 'Grouping' ||
                        item.type === 'ObjectItem'
                      ) {
                        return <GroupingOrObject item={item} key={item.key} />
                      } else if (item.type === 'PrimitiveProp') {
                        return <PrimitiveProp item={item} key={item.key} />
                      } else {
                        console.log('@todo unsupported yet', item)

                        return null
                      }
                    })}
                  </div>
                )
              }}
            </PropsAsPointer>
          )
        }}
      </AllInOnePanelStuff>
    )
  }
}
