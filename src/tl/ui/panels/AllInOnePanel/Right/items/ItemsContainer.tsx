import React from 'react'
import UIComponent from '$tl/ui/handy/UIComponent'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {val} from '$shared/DataVerse2/atom'
import {
  internalTimelineToSeriesOfVerticalItems,
  PrimitivePropItem,
} from '$tl/ui/panels/AllInOnePanel/utils'
import TimelineItem from '$tl/ui/panels/AllInOnePanel/Right/items/TimelineItem'
import {Pointer} from '$shared/DataVerse2/pointer'

interface IExportedComponentProps {}

interface IItemsContainerProps {
  internalTimeline: InternalTimeline
}

interface IState {}

class ItemsContainer extends UIComponent<IItemsContainerProps, IState> {
  _render(propsP: Pointer<IItemsContainerProps>) {

    const items = internalTimelineToSeriesOfVerticalItems(
      this.ui,
      val(propsP.internalTimeline),
    )

    const lastItem = items[items.length - 1]
    const height = lastItem ? lastItem.top + lastItem.height : '100%'

    return (
      <div style={{height}}>
        {items
          .filter(item => item.type === 'PrimitiveProp')
          .map(item => (
            <TimelineItem item={item as PrimitivePropItem} key={item.key} />
          ))}
      </div>
    )
  }
}

export default (_props: IExportedComponentProps) => (
  <AllInOnePanelStuff>
    {allInOnePanelStuffP => (
      <PropsAsPointer>
        {() => {
          const internalTimeline = val(
            allInOnePanelStuffP.internalTimeline,
          ) as InternalTimeline

          const timelineItemsProps: IItemsContainerProps = {
            internalTimeline,
          }
          return <ItemsContainer {...timelineItemsProps} />
        }}
      </PropsAsPointer>
    )}
  </AllInOnePanelStuff>
)
