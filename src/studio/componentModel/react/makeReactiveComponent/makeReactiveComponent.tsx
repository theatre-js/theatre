import SideEffectsHandler from '$src/studio/componentModel/react/makeReactiveComponent/SideEffectsHandler'
import {PureComponentWithStudio} from '$src/studio/handy'
import TimelinesHandler from '$src/studio/componentModel/react/makeReactiveComponent/TimelinesHandler'
import derivedClass from '$src/shared/DataVerse/derivedClass/derivedClass'
import DerivedClassInstance from '$src/shared/DataVerse/derivedClass/DerivedClassInstance'
import dictAtom from '$src/shared/DataVerse/atoms/dict'
import emptyDict from '$src/shared/DataVerse/derivations/dicts/emptyDict'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'
import constant from '$src/shared/DataVerse/derivations/constant'

type MakeReactiveComponentArgs = $FixMe

export default function makeReactiveComponent({
  getClass,
  displayName,
  getInitialState,
  componentId,
  componentType,
}: MakeReactiveComponentArgs) {
  type Props = {
    key: string
    props: $FixMe
    modifierInstantiationDescriptors: $FixMe
    componentId: string
  }

  class TheaterJSComponent extends PureComponentWithStudio<Props, {}> {
    static displayName = typeof displayName === 'string'
      ? displayName
      : 'TheaterJSDeclarativeComponent'

    static componentId = componentId
    static isTheaterJSComponent = true

    _derivedClassInstance: $FixMe
    _whatToRender: $FixMe
    _fnsToCallOnWillUnmount: Array<() => void>
    _derivedClassD: AbstractDerivation<$FixMe>
    _sideEffetsHandler: SideEffectsHandler
    isTheaterJSComponent: boolean
    componentType: undefined | string
    componentId: undefined | string
    elementId: number
    _timelinesHandler: TimelinesHandler

    _atom: $FixMe // DictAtom<{
    //   instanceId: string | number,
    //   props: Props['props'],
    //   studio: Studio,
    //   key: string,
    //   state: $FixMe,
    //   modifierInstantiationDescriptors: $ElementType<
    //     Props,
    //     'modifierInstantiationDescriptors',
    //   >,
    // }>

    static _baseLookupTable = {
      render: () => null,

      sideEffects: () => emptyDict,

      props: d =>
        d
          .pointer()
          .prop('_atom')
          .prop('props'),

      studio: d =>
        d
          .pointer()
          .prop('_atom')
          .prop('studio'),

      studioAtom: self =>
        self
          .pointer()
          .prop('studio')
          .map(studio => studio.atom),

      modifierInstantiationDescriptors: d =>
        d
          .pointer()
          .prop('_atom')
          .prop('modifierInstantiationDescriptors'),

      state: d =>
        d
          .pointer()
          .prop('_atom')
          .prop('state'),

      timelineDescriptors: () => emptyDict,

      timelineInstances: d =>
        d
          .pointer()
          .prop('_atom')
          .prop('timelineInstances'),
    }

    constructor(props: Props, context: $FixMe) {
      super(props, context)
      
      this._fnsToCallOnWillUnmount = []

      // $FixMe
      this._atom = this._createAtom()

      this._derivedClassD = this._makeDerivedClassD()

      const untapFromDerivedClassDChanges = this._derivedClassD
        .changes(this.studio.ticker)
        .tap(newFinalDerivedClass => {
          this._derivedClassInstance.setClass(newFinalDerivedClass)
        })

      this._fnsToCallOnWillUnmount.push(untapFromDerivedClassDChanges)

      this._derivedClassInstance = new DerivedClassInstance(
        this._derivedClassD.getValue(),
        this.studio.ticker,
      )

      this.isTheaterJSComponent = true

      // debug.skipFindingColdDerivations()
      this.componentType = componentType // || this._finalFace.prop('componentType').getValue()

      this.componentId = componentId // || this._finalFace.prop('componentId').getValue()

      // if (!displayName)
      //   TheaterJSComponent.displayName = this._finalFace
      //     .prop('displayName')
      //     .getValue()

      // debug.endSkippingColdDerivations()

      this.elementId = this._atom.prop('instanceId')

      this._whatToRender = null
      const untapFromRender = this._derivedClassInstance
        .prop('render')
        .changes(this.studio.ticker)
        .tap((whatToRender: $FixMe) => {
          this._whatToRender = whatToRender
          this.forceUpdate()
        })

      this._fnsToCallOnWillUnmount.push(untapFromRender)

      const sideEffectsDictP = this._derivedClassInstance
        .pointer()
        .prop('sideEffects')
      this._sideEffetsHandler = new SideEffectsHandler(
        this.studio.ticker,
        this._derivedClassInstance,
        sideEffectsDictP,
      )

      this._timelinesHandler = new TimelinesHandler(this as $IntentionalAny)
      this._timelinesHandler.start()

      this.studio.declareComponentInstance(this.elementId, this)

      if (this.getComponentId() === 'BouncyBall') {
        this.reduceState(
          [
            'workspace',
            'panels',
            'byId',
            '8daa7380-9b43-475a-8352-dc564a58c719',
            'configuration',
            'elementId',
          ],
          () => this.elementId,
        )
      }

      // if (this.getComponentId() === '')
    }

    getComponentId() {
      if (componentType === 'Declarative') {
        // throw Error('implement me')
        return this.props.componentId
      } else {
        return componentId
      }
    }

    _createAtom() {
      return dictAtom({
        instanceId: this.studio._getNewComponentInstanceId(),
        props: this.props.props,
        modifierInstantiationDescriptors: this.props
          .modifierInstantiationDescriptors,
        studio: this.studio,
        // key: this.props.key,
        state: getInitialState ? getInitialState() : dictAtom({}),
        timelineInstances: dictAtom({}),
      })
    }

    _makeDerivedClassD() {
      const baseDerivedClass = derivedClass({_atom: () => this._atom}).extend(
        TheaterJSComponent._baseLookupTable,
      )

      const derivedClassWithoutModifiers = getClass(baseDerivedClass)

      const modifierInstantiationDescriptorsByIdP = this._atom
        .pointer()
        .prop('modifierInstantiationDescriptors')
        .prop('byId')

      const finalDerivedClassD = this._atom
        .pointer()
        .prop('modifierInstantiationDescriptors')
        .prop('list')
        // $FixMe
        .flatMap((list: D.IDerivedArray<$FixMe>) => {
          if (!list) return derivedClassWithoutModifiers

          return list
            .map((id: string) => modifierInstantiationDescriptorsByIdP.prop(id))
            .reduce((dict, modifierInstantiationDescriptor) => {
              return this._applyModifier(modifierInstantiationDescriptor, dict)
            }, constant(derivedClassWithoutModifiers))
        })

      return finalDerivedClassD
    }

    _applyModifier(
      // $FixMe
      modifierInstantiationDescriptor,
      // $FixMe
      dict,
    ): AbstractDerivation<$FixMe> {
      return modifierInstantiationDescriptor
        .prop('disabled')
        .flatMap((disabled: boolean) => {
          if (disabled) return dict

          return modifierInstantiationDescriptor
            .prop('modifierId')
            .flatMap((modifierId: string) => {
              return this.studio.atom
                .pointer()
                .prop('ahistoricComponentModel')
                .prop('coreModifierDescriptors')
                .prop(modifierId)
                .prop('getClass')
                .flatMap((possibleFn: undefined | null | Function) => {
                  if (!possibleFn)
                    console.warn(
                      `couldn't find modifier '${modifierId}'. This should never happen`,
                    )
                  return possibleFn
                    ? possibleFn(
                        modifierInstantiationDescriptor.pointer().prop('props'),
                        dict,
                      )
                    : dict
                })
            })
        })
    }

    componentWillReceiveProps(newProps: Props) {
      if (newProps.props !== this.props.props) {
        this._atom.setProp('props', newProps.props)
      }

      if (
        newProps.modifierInstantiationDescriptors !==
        this.props.modifierInstantiationDescriptors
      ) {
        this._atom.setProp(
          'modifierInstantiationDescriptors',
          newProps.modifierInstantiationDescriptors,
        )
      }
    }

    componentWillMount() {
      // debugger
      this._whatToRender = this._derivedClassInstance.prop('render').getValue()
      // this._finalFace.prop('componentWillMountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
    }

    componentDidMount() {
      this._sideEffetsHandler.startAppying()
    }

    componentWillUnmount() {
      this._sideEffetsHandler.stopApplying()
      this._fnsToCallOnWillUnmount.forEach(fn => {
        fn()
      })
      this.studio.undeclareComponentInstance(this.elementId)
    }

    render() {
      return this._whatToRender
    }

    getTimelineInstance(timelineId: string) {
      return this._atom.prop('timelineInstances').prop(timelineId)
    }
  }

  return TheaterJSComponent
}

export type TheaterJSComponent = $FixMe
