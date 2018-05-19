import dictAtom, {DictAtom} from '$shared/DataVerse/atoms/dictAtom'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import AbstractDerivedArray from '$shared/DataVerse/derivations/arrays/AbstractDerivedArray'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import constant from '$shared/DataVerse/derivations/constant'
import AbstractDerivedDict, {
  DerivedDictTypeOf,
} from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import emptyDict from '$shared/DataVerse/derivations/dicts/emptyDict'
import derivedClass, {
  Classify,
  DerivedClass,
} from '$shared/DataVerse/derivedClass/derivedClass'
import DerivedClassInstance from '$shared/DataVerse/derivedClass/DerivedClassInstance'
import SideEffectsHandler from '$theater/componentModel/react/TheaterComponent/SideEffectsHandler'
import TimelinesHandler from '$theater/componentModel/react/TheaterComponent/TimelinesHandler'
import Theater, {TheaterStateAtom} from '$theater/bootstrap/Theater'
import PureComponentWithTheater from '$theater/componentModel/react/utils/PureComponentWithTheater'
import {isCoreComponent} from '$theater/componentModel/selectors'
import {IComponentId} from '$theater/componentModel/types'

type WrapProps<Props> = {
  key: string
  props: Props
  modifierInstantiationDescriptors: $FixMe
  owner: TheaterComponent<$IntentionalAny>
}

type TheAtom<Props> = DictAtom<{
  componentInstance: TheaterComponent<Props>
  props: Props
  modifierInstantiationDescriptors: $FixMe
  theater: Theater
  state: $FixMe
  timelineInstances: DictAtom<$FixMe>
}>

type BaseClass<Props> = Classify<
  {_atom: TheAtom<Props>},
  {
    render: React.ReactNode
    sideEffects: AbstractDerivedDict<$FixMe>
    props: Props
    theater: Theater
    theaterAtom: DerivedDictTypeOf<TheaterStateAtom>
    modifierInstantiationDescriptors: $FixMe
    state: $FixMe
    timelineDescriptors: AbstractDerivedDict<{[key: string]: $FixMe}>
    timelineInstances: DictAtom<$FixMe>
    componentInstance: TheaterComponent<Props>
    componentId: IComponentId
    componentDescriptor: $FixMe
    owner: TheaterComponent<$IntentionalAny>
  }
>

export default abstract class TheaterComponent<
  Props
> extends PureComponentWithTheater<WrapProps<Props>, {}> {
  static isTheaterJSComponent = true
  static componentId: string

  _derivedClassInstance: $FixMe
  _whatToRender: $FixMe
  _fnsToCallOnWillUnmount: Array<() => void>
  _derivedClassD: AbstractDerivation<DerivedClass<BaseClass<Props>>>
  _sideEffetsHandler: SideEffectsHandler
  isTheaterJSComponent: boolean
  componentType: undefined | string
  componentId: undefined | string
  _timelinesHandler: TimelinesHandler
  _atom: TheAtom<Props>

  abstract _getClass(
    baseClass: DerivedClass<BaseClass<Props>>,
  ): DerivedClass<BaseClass<Props>>

  static _baseClassMethods: BaseClass<$IntentionalAny> = {
    render: () => null,

    sideEffects: () => emptyDict,

    props: self => self.prop('_atom').prop('props'),

    theater: self => self.prop('_atom').prop('theater'),

    theaterAtom: self =>
      self.prop('theater').map((theater: Theater) => theater.atom.derivedDict()),

    modifierInstantiationDescriptors: self =>
      self.prop('_atom').prop('modifierInstantiationDescriptors'),

    state: self => self.prop('_atom').prop('state'),

    timelineDescriptors: () => emptyDict,

    timelineInstances: (self: $FixMe) =>
      self.prop('_atom').prop('timelineInstances'),

    componentId(self) {
      const instanceD = self.prop('componentInstance')
      return autoDerive(() => {
        return (instanceD.getValue().constructor as $IntentionalAny).componentId
      })
    },

    componentInstance(self) {
      return self.prop('_atom').prop('componentInstance')
    },

    owner(self) {
      return self.prop('_atom').prop('owner')
    },

    componentDescriptor(self) {
      const idP = self.prop('componentId')
      return autoDerive(() => {
        const componentId = idP.getValue()
        const atomP = self.prop('theaterAtom')
        const isCore = isCoreComponent(componentId)

        return isCore
          ? atomP
              .prop('ahistoricComponentModel')
              .prop('coreComponentDescriptors')
              .prop(componentId)
          : atomP
              .prop('historicComponentModel')
              .prop('customComponentDescriptors')
              .prop(componentId)
      })
    },
  }
  constructor(props: WrapProps<Props>, context: $IntentionalAny) {
    super(props, context)

    // console.log(props.owner);
    

    this._fnsToCallOnWillUnmount = []

    this._atom = this._createAtom()

    this._derivedClassD = this._makeDerivedClassD()

    const untapFromDerivedClassDChanges = this._derivedClassD
      .changes(this.theater.ticker)
      .tap(newFinalDerivedClass => {
        this._derivedClassInstance.setClass(newFinalDerivedClass)
      })

    this._fnsToCallOnWillUnmount.push(untapFromDerivedClassDChanges)

    this._derivedClassInstance = new DerivedClassInstance(
      this._derivedClassD.getValue(),
      this.theater.ticker,
    )

    this.isTheaterJSComponent = true

    this._whatToRender = null
    const untapFromRender = this._derivedClassInstance
      .prop('render')
      .changes(this.theater.ticker)
      .tap((whatToRender: $FixMe) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })

    this._fnsToCallOnWillUnmount.push(untapFromRender)

    const sideEffectsDictP = this._derivedClassInstance
      .pointer()
      .prop('sideEffects')

    this._sideEffetsHandler = new SideEffectsHandler(
      this.theater.ticker,
      this._derivedClassInstance,
      sideEffectsDictP,
    )

    this._timelinesHandler = new TimelinesHandler(this as $IntentionalAny)
    this._timelinesHandler.start()
  }

  getComponentId() {
    return (this.constructor as $IntentionalAny).componentId
  }

  _getInitialState(): DictAtom<{}> {
    return dictAtom({})
  }

  _createAtom(): TheAtom<Props> {
    return dictAtom({
      componentInstance: this,
      props: this.props.props,
      modifierInstantiationDescriptors: this.props
        .modifierInstantiationDescriptors,
      theater: this.theater,
      state: this._getInitialState(),
      timelineInstances: dictAtom({}),
      owner: this.props.owner,
    })
  }

  _makeDerivedClassD() {
    const baseDerivedClass = derivedClass({_atom: () => this._atom}).extend(
      TheaterComponent._baseClassMethods,
    )

    const derivedClassWithoutModifiers = this._getClass(baseDerivedClass)

    const modifierInstantiationDescriptorsByIdP = this._atom
      .pointer()
      .prop('modifierInstantiationDescriptors')
      // @ts-ignore @todo
      .prop('byId')

    const finalDerivedClassD = this._atom
      .pointer()
      .prop('modifierInstantiationDescriptors')
      // @ts-ignore @todo
      .prop('list')
      .flatMap((list: AbstractDerivedArray<$FixMe>) => {
        if (!list) return derivedClassWithoutModifiers

        return (
          list
            // @ts-ignore @todo
            .map((id: string) => modifierInstantiationDescriptorsByIdP.prop(id))
            // @ts-ignore @todo
            .reduce((dict, modifierInstantiationDescriptor) => {
              return this._applyModifier(modifierInstantiationDescriptor, dict)
            }, constant(derivedClassWithoutModifiers))
        )
      })

    return finalDerivedClassD
  }

  _applyModifier(
    // @ts-ignore @todo
    modifierInstantiationDescriptor,
    // @ts-ignore @todo
    dict,
  ): AbstractDerivation<$FixMe> {
    return modifierInstantiationDescriptor
      .prop('disabled')
      .flatMap((disabled: boolean) => {
        if (disabled) return dict

        return modifierInstantiationDescriptor
          .prop('modifierId')
          .flatMap((modifierId: string) => {
            return this.theater.atom
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

  componentWillReceiveProps(newProps: WrapProps<Props>) {
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
  }

  render() {
    return this._whatToRender
  }

  getTimelineInstance(timelineId: string) {
    return this._atom.prop('timelineInstances').prop(timelineId)
  }

  componentDidCatch(error, info) {
    console.log('catch', error, info, this)
  }
}

export const isTheaterComponent = (
  s: mixed,
): s is TheaterComponent<mixed> & {constructor: typeof TheaterComponent} =>
  // @ts-ignore @ignore
  s && s.isTheaterJSComponent === true
