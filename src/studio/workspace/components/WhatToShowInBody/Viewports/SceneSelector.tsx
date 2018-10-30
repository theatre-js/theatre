import React from 'react'
import HeadlessDataList from '$studio/common/components/HeadlessDataList/HeadlessDataList'
import {fitInput} from '$studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/utils'
import resolveCss from '$shared/utils/resolveCss'
import css from './SceneSelector.css'
import {IDeclarativeComponentDescriptor} from '$studio/componentModel/types'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import {val} from '$shared/DataVerse2/atom'
import {reduceHistoricState} from '$studio/bootstrap/actions'
import {makeSceneComponent} from '$studio/componentModel/utils'
import {batchedAction} from '$shared/utils/redux/withHistory/withBatchActions'

const classes = resolveCss(css)

interface IProps {
  viewportId: string
  onSelect: () => any
  onCancel: () => any
}

interface IState {
  value: string
}

class SceneSelector extends PureComponentWithTheater<IProps, IState> {
  input: HTMLInputElement | null
  scenes: Record<string, IDeclarativeComponentDescriptor>

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.scenes = this.getScenes()

    this.state = {
      value: '',
    }
  }

  componentDidMount() {
    fitInput(this.input)
    this.input!.focus()
    this.input!.select()
  }

  handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onQuery: Function,
  ) => {
    fitInput(this.input)
    const {value} = e.target
    onQuery(value)
    this.setState(() => ({value}))
  }

  setViewportSceneId = (sceneDisplayName: string) => {
    const sceneObject = Object.values(this.scenes).find(
      scene => scene.displayName === sceneDisplayName,
    )
    this.dispatch(
      reduceHistoricState(
        [
          'historicWorkspace',
          'viewports',
          'byId',
          this.props.viewportId,
          'sceneComponentId',
        ],
        () => sceneObject!.id,
      ),
    )
    this.props.onSelect()
  }

  createNewScene = () => {
    const sceneObject = makeSceneComponent({displayName: this.state.value})
    this.dispatch(
      batchedAction([
        reduceHistoricState(
          [
            'historicComponentModel',
            'customComponentDescriptors',
            sceneObject.id,
          ],
          () => sceneObject,
        ),
        reduceHistoricState(
          [
            'historicWorkspace',
            'viewports',
            'byId',
            this.props.viewportId,
            'sceneComponentId',
          ],
          () => sceneObject.id,
        ),
      ]),
    )
    this.props.onSelect()
  }

  private getScenes() {
    const customComponents = val(
      this.theaterAtom2P.historicComponentModel.customComponentDescriptors,
    )
    return Object.entries(customComponents).reduce(
      (reducer, [id, descriptor]) => {
        return (descriptor as IDeclarativeComponentDescriptor).isScene
          ? {...reducer, [id]: descriptor}
          : reducer
      },
      {},
    )
  }

  render() {
    return (
      <HeadlessDataList
        options={Object.values(this.scenes).map(scene => scene.displayName)}
        onSelectOption={this.setViewportSceneId}
        onSelectNothing={this.createNewScene}
        onCancel={this.props.onCancel}
      >
        {(onQuery, filteredOptions, focusedIndex, setFocusedIndexTo) => {
          return (
            <>
              <input
                type="text"
                ref={c => (this.input = c)}
                value={this.state.value}
                onChange={e => this.handleValueChange(e, onQuery)}
                onBlur={this.props.onCancel}
              />
              <div {...classes('list')}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option: string, i) => (
                    <div
                      onMouseEnter={() => setFocusedIndexTo(i)}
                      onMouseDown={() => this.setViewportSceneId(option)}
                      {...classes('item', i === focusedIndex && 'highlight')}
                      key={i}
                    >
                      {option}
                    </div>
                  ))
                ) : (
                  <div {...classes('hint')}>
                    No match found!
                    <br />
                    Press <span {...classes('highlight')}>Enter</span> to create
                    a new scene.
                  </div>
                )}
              </div>
            </>
          )
        }}
      </HeadlessDataList>
    )
  }
}

export default SceneSelector
