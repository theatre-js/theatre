import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './TimelineSelect.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {getSelectedProject, getSelectedInternalTimeline} from '../selectors'
import Item from './Item'
import FlyoutMenu from '$shared/components/FlyoutMenu/FlyoutMenu'
import FlyoutMenuItem from '$shared/components/FlyoutMenu/FlyoutMenuItem'
import {val} from '$shared/DataVerse2/atom'

interface IProps {
  css?: Partial<typeof css>
}

interface IState {
  menuOpen: boolean
}

export default class TimelineSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const project = getSelectedProject(this.ui)

    if (!project) return null

    const internalTimeline = getSelectedInternalTimeline(this.ui, project)
    const internalTimelines = val(project._internalTimelines.pointer)

    return (
      <>
        {val(stateP.menuOpen) && (
          <FlyoutMenu onClose={this.closeMenu}>
            {Object.keys(internalTimelines).map((timelinePath, i) => {
              return (
                <FlyoutMenuItem
                  title={timelinePath}
                  key={`project#${i}`}
                  onClick={() =>
                    this.selectInternalTimeline(project.id, timelinePath)
                  }
                />
              )
            })}
          </FlyoutMenu>
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
  }
}
