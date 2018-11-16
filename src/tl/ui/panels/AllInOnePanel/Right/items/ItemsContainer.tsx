import React from 'react'
import UIComponent from '$tl/ui/handy/UIComponent'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import {val} from '$shared/DataVerse2/atom'
import {
  timelineTemplateToSeriesOfVerticalItems,
  PrimitivePropItem,
} from '$tl/ui/panels/AllInOnePanel/utils'
import TimelineItem from '$tl/ui/panels/AllInOnePanel/Right/items/TimelineItem'
import {Pointer} from '$shared/DataVerse2/pointer'

interface IExportedComponentProps {}

interface IItemsContainerProps {
  timelineTemplate: TimelineTemplate
}

interface IState {}

class ItemsContainer extends UIComponent<IItemsContainerProps, IState> {
  _render(propsP: Pointer<IItemsContainerProps>) {

    const items = timelineTemplateToSeriesOfVerticalItems(
      this.ui,
      val(propsP.timelineTemplate),
      this.project,
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
          const timelineTemplate = val(
            allInOnePanelStuffP.timelineTemplate,
          ) as TimelineTemplate

          const timelineItemsProps: IItemsContainerProps = {
            timelineTemplate,
          }
          return <ItemsContainer {...timelineItemsProps} />
        }}
      </PropsAsPointer>
    )}
  </AllInOnePanelStuff>
)
