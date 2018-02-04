// @flow
import SideEffectsHandler from './SideEffectsHandler'
import {PureComponentWithStudio, D} from '$studio/handy'
import TimelinesHandler from './TimelinesHandler'
import {AbstractDerivation} from '$src/shared/DataVerse/derivations/types'
import derivedClass from '$src/shared/DataVerse/derivedClass/derivedClass'
import DerivedClassInstance from '$src/shared/DataVerse/derivedClass/DerivedClassInstance'

// type MakeReactiveComponentArgs = {
//   getClass: (
//     DerivedClass<$FixMe>,
//   ) => DerivedClass<$FixMe>,
//   getInitialState?: () => D.IDictAtom<$FixMe>,
// } & (
//   | {
//       componentType: 'HardCoded',
//       displayName: string,
//       componentId: string,
//     }
//   | {componentType: 'Declarative', componentId: void, displayName: void})
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

  class TheaterJSComponent extends PureComponentWithStudio<Props, void> {
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
    elementId: string | number
    _timelinesHandler: TimelinesHandler

    _atom: $FixMe // D.IDictAtom<{
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

      sideEffects: () => D.derivations.emptyDict,

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

      timelineDescriptors: () => D.derivations.emptyDict,

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
      return D.atoms.dict({
        instanceId: this.studio._getNewComponentInstanceId(),
        props: this.props.props,
        modifierInstantiationDescriptors: this.props
          .modifierInstantiationDescriptors,
        studio: this.studio,
        // key: this.props.key,
        state: getInitialState ? getInitialState() : D.atoms.dict({}),
        timelineInstances: D.atoms.dict({}),
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
            .map(idD =>
              idD.flatMap((id: string) =>
                modifierInstantiationDescriptorsByIdP.prop(id),
              ),
            )
            .reduce((dict, modifierInstantiationDescriptor) => {
              return this._applyModifier(modifierInstantiationDescriptor, dict)
            }, D.derivations.constant(derivedClassWithoutModifiers))
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
                .prop('componentModel')
                .prop('modifierDescriptors')
                .prop('core')
                .prop(modifierId)
                .prop('getClass')
                .flatMap((possibleFn: undefined | null | Function) => {
                  if (!possibleFn) console.warn(`couldn't find modifier '${modifierId}'. This should never happen`)
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
    }

    render() {
      return this._whatToRender
    }
  }

  return TheaterJSComponent
}

export type TheaterJSComponent = $FixMe
