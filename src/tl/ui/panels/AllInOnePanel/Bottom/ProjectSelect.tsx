import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import Item from './Item'
import {val} from '$shared/DataVerse2/atom'
import Project from '$tl/Project/Project'
import projectsSingleton from '$tl/Project/projectsSingleton'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList/FlyoutSearchableList'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import FullSizeHint, {
  TextBlock,
  CodeSnippet,
  Tooltip,
} from '$tl/ui/panels/AllInOnePanel/Bottom/FullSizeHint/FullSizeHint'

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
                  {val(stateP.menuOpen) &&
                    (areThereProjects && (
                      <FlyoutSearchableList
                        options={Object.keys(projects)}
                        onSelect={this.selectProject}
                        close={this.closeMenu}
                      />
                    ))}
                  {!areThereProjects && (
                    <>
                      <FullSizeHint>
                        <TextBlock>Start by creating a project:</TextBlock>
                        <CodeSnippet>
                          const project = new Theatre.Project('My project')
                        </CodeSnippet>
                      </FullSizeHint>
                      <Tooltip>Your project will appear here!</Tooltip>
                    </>
                  )}
                  <Item onClick={this.onClick}>
                    {!areThereProjects
                      ? 'No projects yet'
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
