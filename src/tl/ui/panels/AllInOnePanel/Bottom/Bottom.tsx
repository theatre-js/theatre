import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Bottom.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import projectsSingleton from '$tl/Project/projectsSingleton'
import {val} from '$shared/DataVerse2/atom'
import identity from 'lodash/identity'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Bottom extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const projects = val(projectsSingleton.atom.pointer.projects)
    const areThereProjects = Object.keys(projects).length > 0
    const selectedProjectName = val(
      this.ui.atomP.historic.allInOnePanel.selectedProject,
    )
    const selectedProject =
      areThereProjects && selectedProjectName
        ? projects[selectedProjectName]
        : null

    const errorState:
      | {
          mode: 'error' | 'attention'
          pointsTo:
            | null
            | 'projectSelect'
            | 'timelineSelect'
            | 'timelineInstanceSelect'
          render: (() => React.ReactNode)
        }
      | {mode: 'normal'} = !areThereProjects
      ? {
          mode: 'attention',
          pointsTo: null,
          render() {
            // @todo
            return (
              <div>
                <p>Get started by creating a project.</p>
              </div>
            )
          },
        }
      : !selectedProjectName
        ? {
            mode: 'attention',
            pointsTo: 'projectSelect',
            render() {
              // @todo
              return (
                <div>
                  <p>Select the project you want to work on:</p>
                </div>
              )
            },
          }
        : !selectedProject
          ? {
              mode: 'error',
              pointsTo: 'projectSelect',
              render() {
                // @todo
                return (
                  <div>
                    <p>
                      Project "{selectedProjectName}" doesn't seem to be
                      created.
                    </p>
                  </div>
                )
              },
            }
          : {mode: 'normal'}

    console.log(errorState)

    return (
      <div {...classes('container', errorState.mode)}>
        <div className={css.leftContainer}>
          <div
            {...classes(
              'item',
              errorState.mode !== 'normal' &&
              errorState.pointsTo === 'projectSelect'
                ? 'focusOfAttention'
                : null,
            )}
          >
            <span className={css.text}>
              Project:{' '}
              {!areThereProjects
                ? 'No projects'
                : !selectedProjectName
                  ? 'None selected'
                  : formatProjectName(selectedProjectName)}
            </span>
          </div>
          <div className={css.item}>
            <span className={css.text}>Timeline: Blah</span>
          </div>
        </div>
        <div className={css.rightContainer}>
          <div className={css.item}>
            <span className={css.text}>TheaterJS</span>
          </div>
        </div>
      </div>
    )
  }
}

const formatProjectName = identity