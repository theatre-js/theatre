import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import Item from './Item'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import MultiLevelDropdown from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import {convertInternalTimelinesToItems} from '$shared/components/MultiLevelDropdown/utils'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList'

interface IProps {
  allInOnePanelStuff: AllInOnePanelStuff
}

interface IState {
  menuOpen: boolean
}

export default class TimelineSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  render() {
    const {props} = this

    const project = props.allInOnePanelStuff.project
    if (!project) return null

    const internalTimeline = props.allInOnePanelStuff
      .internalTimeline as InternalTimeline

    return (
      <>
        {this.state.menuOpen && (
          <PropsAsPointer>
            {() => {
              const internalTimelines = val(project._internalTimelines.pointer)
              const activePath = !!internalTimeline
                ? internalTimeline._path.split(' / ')
                : []
              const multiLevelItems = convertInternalTimelinesToItems(
                internalTimelines,
              )
              const onSelect = (path: string) =>
                this.selectInternalTimeline(project.id, path)

              return (
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
              )
            }}
          </PropsAsPointer>
        )}
        <Item onClick={this.onClick}>
          {!internalTimeline ? 'No timelines yet' : internalTimeline._path}
        </Item>
      </>
    )
  }

  onClick = () => {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  closeMenu = () => {
    this.setState({menuOpen: false})
  }

  selectInternalTimeline = (
    projectId: string,
    internalTimelinePath: string,
  ) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setSelectedTimeline({
        projectId,
        internalTimelinePath,
      }),
    )
    this.closeMenu()
  }
}
