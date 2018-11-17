import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Left.css'
import {val} from '$shared/DataVerse/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {timelineTemplateToSeriesOfVerticalItems} from '../utils'
import GroupingOrObject from './items/GroupingOrObject'
import PrimitiveProp from './items/PrimitiveProp'
import {
  TextBlock,
  CodeSnippet,
} from '$tl/ui/panels/AllInOnePanel/Bottom/FullSizeHint/FullSizeHint'

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
                const timelineTemplate = val(
                  allInOnePanelStuffP.timelineTemplate,
                )
                if (!timelineInstance || !timelineTemplate) return null

                const items = timelineTemplateToSeriesOfVerticalItems(
                  this.ui,
                  timelineTemplate,
                  this.project,
                )

                const lastItem = items[items.length - 1]
                const height = lastItem ? lastItem.top + lastItem.height : 0

                return items.length > 0 ? (
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
                ) : (
                  <div {...classes('createItemTip')}>
                    <TextBlock>Your timeline seems to be empty. Add on object to your timeline by:</TextBlock>
                    <CodeSnippet>
                      timeline.getObject('My Div', myDiv)
                    </CodeSnippet>
                    <TextBlock>Your object will appear here.</TextBlock>
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
