import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './BrowserStateIsNotBasedOnDiskStateModal.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import projectsSingleton from '$tl/Project/projectsSingleton'
import Modal from '$shared/components/Modal/Modal'
import SyntaxHighlightedCode from '$shared/components/SyntaxHighlightedCode'
import {makeSampleCode} from '$tl/ui/panels/AllInOnePanel/Bottom/Settings/ExportModal'
import HumongousButton from '$shared/components/HumongousButton'
import Project from '$tl/Project/Project'

interface IProps {
  css?: Partial<typeof css>
  projectId: string
}

interface IState {}

export default class BrowserStateIsNotBasedOnDiskStateModal extends UIComponent<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  getProject(): Project {
    return projectsSingleton.get(this.props.projectId)!
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)
    const projectId = val(propsP.projectId)
    const project = projectsSingleton.atom.pointer.projects[projectId]
    const loadingState = val(project.atomP.ahistoric.loadingState)

    return (
      <Modal onClose={this.onClose} autoClose={false}>
        <div {...classes('container')}>
          <p>
            The state saved in the browser seems to be not based on the state
            provided to the project:
          </p>
          <SyntaxHighlightedCode
            code={makeSampleCode(
              projectId,
              'This value is in conflict with the value saved in the browser',
            )}
          />
          <HumongousButton onClick={this.forgetBrowserState}>
            Forget browser's state. Use the state in the code (will erase
            browser state forever)
          </HumongousButton>
          <HumongousButton onClick={this.useBrowserState}>
            User browser's state (will ignore the state set in your code)
          </HumongousButton>
        </div>
      </Modal>
    )
  }

  onClose = () => {}

  forgetBrowserState = () => {
    const sure = window.confirm(
      `Are you sure? This will reset your history to the one you've provided in the code. Browser history will be lost.`,
    )
    if (!sure) return

    const project = this.getProject()
    const loadingState = project.reduxStore.getState().ahistoric.loadingState
    if (loadingState.type !== 'browserStateIsNotBasedOnDiskState') {
      // will never happen
      return
    }

    project._dispatch(
      project._actions.historic.__unsafe_clearHistoryAndReplaceInnerState(
        loadingState.onDiskState.projectState,
      ),
      project._actions.ahistoric.setLoadingStateToLoaded({
        diskRevisionsThatBrowserStateIsBasedOn: [
          loadingState.onDiskState.revision,
        ],
      }),
    )
  }

  useBrowserState = () => {
    const sure = window.confirm(`Are you sure?`)
    if (!sure) return

    const project = this.getProject()
    const loadingState = project.reduxStore.getState().ahistoric.loadingState
    if (loadingState.type !== 'browserStateIsNotBasedOnDiskState') {
      // will never happen
      return
    }

    const browserState = loadingState.browserState

    project._dispatch(
      project._actions.historic.__unsafe_replaceHistory(
        browserState.projectHistory,
      ),
      project._actions.ahistoric.setLoadingStateToLoaded({
        diskRevisionsThatBrowserStateIsBasedOn: browserState.basedOnRevisions,
      }),
      project._actions.ahistoric.pushOnDiskRevisionBrowserStateIsBasedOn(
        loadingState.onDiskState.revision,
      ),
    )
  }
}
