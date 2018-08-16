import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {Pointer} from '$shared/DataVerse2/pointer'
import Item from './Item'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '../AllInOnePanel'
import Project from '$tl/Project/Project'
import projectsSingleton from '$tl/Project/projectsSingleton'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList'

interface IProps {
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
    // const p = getProjectSelectionState(this.ui)
    const projects = val(projectsSingleton.atom.pointer.projects)

    const areThereProjects = Object.keys(projects).length > 0

    return (
      <>
        {val(stateP.menuOpen) && (
          <FlyoutSearchableList
            options={Object.keys(projects)}
            onSelect={this.selectProject}
            close={this.closeMenu}
          />
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
    this.closeMenu()
  }
}
