import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import Item from './Item'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList/FlyoutSearchableList'
import MultiLevelDropdown from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import {convertInternalTimelinesToItems} from '$shared/components/MultiLevelDropdown/utils'
import FullSizeHint, {
  TextBlock,
  CodeSnippet,
  Tooltip,
} from '$tl/ui/panels/AllInOnePanel/Bottom/FullSizeHint/FullSizeHint'
interface IProps {}

interface IState {
  menuOpen: boolean
}

export default class TimelineSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer state={this.state}>
            {({state: stateP}) => {
              const project = val(stuffP.project)
              if (!project) return null
              const internalTimeline = val(stuffP.internalTimeline)
              const internalTimelines = val(project._internalTimelines.pointer)
              const multiLevelItems = convertInternalTimelinesToItems(
                internalTimelines,
              )
              const activePath = !!internalTimeline
                ? internalTimeline._path.split(' / ')
                : []
              const onSelect = (path: string) =>
                this.selectInternalTimeline(project.id, path)
              return (
                <>
                  {val(stateP.menuOpen) &&
                    (internalTimeline && (
                      <FlyoutSearchableList
                        options={Object.keys(internalTimelines)}
                        onSelect={onSelect}
                        close={this.closeMenu}
                      >
                        {query =>
                          query.length === 0 ? (
                            <MultiLevelDropdown
                              items={multiLevelItems}
                              activePath={activePath}
                              onSelect={path => onSelect(path.join(' / '))}
                            />
                          ) : null
                        }
                      </FlyoutSearchableList>
                    ))}

                  {!internalTimeline && (
                    <>
                      <FullSizeHint>
                        <TextBlock>Next, you need to create a timeline to put your objects in:</TextBlock>
                        <CodeSnippet>
                          const timeline = project.getTimeline('A timeline')
                        </CodeSnippet>
                      </FullSizeHint>
                      <Tooltip>Your timeline will appear here:</Tooltip>
                    </>
                  )}
                  <Item onClick={this.onClick}>
                    {!internalTimeline
                      ? 'No timelines yet'
                      : internalTimeline._path}
                  </Item>
                </>
              )
            }}
          </PropsAsPointer>
        )}
      </AllInOnePanelStuff>
    )
  }

  onClick = () => {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  closeMenu = () => {
    this.setState({menuOpen: false})
  }

  selectInternalTimeline = (projectId: string, timelinePath: string) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setSelectedTimeline({
        projectId,
        timelinePath,
      }),
    )
    this.closeMenu()
  }
}
