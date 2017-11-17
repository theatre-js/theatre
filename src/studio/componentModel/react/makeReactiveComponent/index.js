// @flow
import SideEffectsHandler from './SideEffectsHandler'
import {type Studio, PureComponentWithStudio, D} from '$studio/handy'
import * as debug from '$shared/debug'
import TimelinesHandler from './TimelinesHandler'

type MakeReactiveComponentArgs = {
  modifyPrototypalDict: (
    D.IPrototypalDict<$FixMe>,
  ) => D.IPrototypalDict<$FixMe>,
  displayName?: string,
  componentId?: string,
  componentType?: string,
  getInitialState?: () => D.IDictAtom<$FixMe>,
}

export default function makeReactiveComponent({
  modifyPrototypalDict,
  displayName,
  getInitialState,
  componentId,
  componentType,
}: MakeReactiveComponentArgs) {
  type Props = {
    key: string,
    props: $FixMe,
    modifierInstantiationDescriptors: $FixMe,
  }

  class TheaterJSComponent extends PureComponentWithStudio<Props, void> {
    static displayName = typeof displayName === 'string'
      ? displayName
      : undefined

    _finalFace: $FixMe
    _atom: $FixMe
    _whatToRender: $FixMe
    _fnsToCallOnWillUnmount: Array<() => void>
    _prototypalDictD: D.IDerivation<$FixMe>
    _sideEffetsHandler: SideEffectsHandler
    isTheaterJSComponent: boolean
    componentType: string
    componentId: string
    elementId: string | number
    _timelinesHandler: TimelinesHandler

    _atom: D.IDictAtom<{
      instanceId: string | number,
      props: $ElementType<Props, 'props'>,
      studio: Studio,
      key: string,
      state: $FixMe,
      modifierInstantiationDescriptors: $ElementType<
        Props,
        'modifierInstantiationDescriptors',
      >,
    }>

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
      this._prototypalDictD = this._makePrototypalDictD()

      const untapFromPrototypalMapChanges = this._prototypalDictD
        .changes(this.studio.ticker)
        .tap(newFinalPrototypalDict => {
          this._finalFace.setHead(newFinalPrototypalDict)
        })

      this._fnsToCallOnWillUnmount.push(untapFromPrototypalMapChanges)

      this._finalFace = new D.derivations.PrototypalDictFace(
        this._prototypalDictD.getValue(),
        this.studio.ticker,
      )

      this.isTheaterJSComponent = true

      debug.skipFindingColdDerivations()
      this.componentType =
        componentType || this._finalFace.prop('componentType').getValue()

      this.componentId =
        componentId || this._finalFace.prop('componentId').getValue()

      if (!displayName)
        TheaterJSComponent.displayName = this._finalFace
          .prop('displayName')
          .getValue()

      debug.endSkippingColdDerivations()

      this.elementId = this._atom.prop('instanceId')

      this._whatToRender = null
      const untapFromRender = this._finalFace
        .prop('render')
        .changes(this.studio.ticker)
        .tap(whatToRender => {
          this._whatToRender = whatToRender
          this.forceUpdate()
        })
      this._fnsToCallOnWillUnmount.push(untapFromRender)

      const sideEffectsDictP = this._finalFace.pointer().prop('sideEffects')
      this._sideEffetsHandler = new SideEffectsHandler(
        this.studio.ticker,
        this._finalFace,
        sideEffectsDictP,
      )

      this._timelinesHandler = new TimelinesHandler((this: $IntentionalAny))
      this._timelinesHandler.start()
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

    _makePrototypalDictD() {
      const basePrototypalDict = D.derivations
        .prototypalDict({_atom: () => this._atom})
        .extend(TheaterJSComponent._baseLookupTable)

      const prototypalDictWithoutModifiers = modifyPrototypalDict(
        basePrototypalDict,
      )

      // return D.derivations.constant(prototypalDictWithoutModifiers)

      const modifierInstantiationDescriptorsByIdP = this._atom
        .pointer()
        .prop('modifierInstantiationDescriptors')
        .prop('byId')

      const finalPrototypalDictD = this._atom
        .pointer()
        .prop('modifierInstantiationDescriptors')
        .prop('list')
        // $FixMe
        .flatMap((list: D.IDerivedArray<$FixMe>) => {
          if (!list) return prototypalDictWithoutModifiers

          return list
            .map(idD =>
              idD.flatMap((id: string) =>
                modifierInstantiationDescriptorsByIdP.prop(id),
              ),
            )
            .reduce((dict, modifierInstantiationDescriptor) => {
              return this._applyModifier(modifierInstantiationDescriptor, dict)
            }, D.derivations.constant(prototypalDictWithoutModifiers))
        })

      return finalPrototypalDictD
    }

    _applyModifier(
      // $FixMe
      modifierInstantiationDescriptor,
      // $FixMe
      dict,
    ): D.IDerivation<$FixMe> {
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
                .prop('modifyPrototypalDict')
                .flatMap((possibleFn: ?Function) => {
                  if (!possibleFn) console.warn('this shouldnt happen')
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
      this._whatToRender = this._finalFace.prop('render').getValue()
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
