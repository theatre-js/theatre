import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import Item from './Item'
import {val} from '$shared/DataVerse2/atom'
import Project from '$tl/Project/Project'
import projectsSingleton from '$tl/Project/projectsSingleton'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

interface IProps {}

interface IState {
  menuOpen: boolean
}

export default class ProjectSelect extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {menuOpen: false}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {({project: projectP}) => (
          <PropsAsPointer state={this.state}>
            {({state: stateP}) => {
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
                      : (val(projectP) as Project).id}
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

  selectProject = (projectId: string) => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.selectProject({projectId}),
    )
    this.closeMenu()
  }
}
