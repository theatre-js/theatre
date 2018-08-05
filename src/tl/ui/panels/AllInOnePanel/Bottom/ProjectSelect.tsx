import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './ProjectSelect.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import Item from './Item'
import FlyoutMenu from '$shared/components/FlyoutMenu/FlyoutMenu'
import FlyoutMenuItem from '$shared/components/FlyoutMenu/FlyoutMenuItem'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import Project from '$tl/Project/Project'
import projectsSingleton from '$tl/Project/projectsSingleton'

interface IProps {
  css?: Partial<typeof css>
  allInOnePanelStuff: AllInOnePanelStuff
}

interface IState {
  menuOpen: boolean
}

export default class ProjectSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)
    // const p = getProjectSelectionState(this.ui)
    const projects = val(projectsSingleton.atom.pointer.projects)

    const areThereProjects = Object.keys(projects).length > 0

    return (
      <>
        {val(stateP.menuOpen) && (
          <FlyoutMenu onClose={this.closeMenu}>
            {Object.keys(projects).map((projectId, i) => {
              return (
                <FlyoutMenuItem
                  title={projectId}
                  key={`project#${i}`}
                  onClick={() => this.selectProject(projectId)}
                />
              )
            })}
          </FlyoutMenu>
        )}
        <Item onClick={areThereProjects ? this.onClick : undefined}>
          {!areThereProjects
            ? 'No project'
            : (val(propsP.allInOnePanelStuff.project) as Project).id}
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

  selectProject = (projectId: string) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.selectProject(projectId),
    )
  }
}
