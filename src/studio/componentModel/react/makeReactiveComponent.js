// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, type WithStudioProps} from './studioContext'
import * as D from '$shared/DataVerse'

type Args = {
  modifyPrototypalDict: (D.IPrototypalDict<$FixMe>, D.Context) => D.IPrototypalDict<$FixMe> | D.IDerivation<D.IPrototypalDict<$FixMe>>,
  displayName: string,
  getInitialState?: () => D.IDictAtom<$FixMe>,
}

const applyModifier = (modifierInstantiationDescriptorP, dict) => {
  return modifierInstantiationDescriptorP.popr('modifierID').flatMap((modifierID: string) => {

  })
}

export default function makeReactiveComponent({modifyPrototypalDict, displayName, getInitialState}: Args) {
  type Props = {
    key: string,
    props: $FixMe,
    modifierInstantiationDescriptorsByID: $FixMe,
    listOfModifierInstantiationDescriptorIDs: $FixMe,
  } & WithStudioProps

  class TheaterJSComponent extends React.PureComponent<Props, void> {
    static displayName = displayName
    _finalFace: $FixMe
    _atom: $FixMe
    _basePrototypalDictD: D.IDerivation<$FixMe>
    _whatToRender: $FixMe
    _fnsToCallOnWillUnmount: Array<() => void>

    static _baseLookupTable = {
      render() {
        return null
      },
      componentWillMountCallbacks: () => D.derivations.derivedArray([]),
      componentDidMountCallbacks: () => D.derivations.derivedArray([]),
      componentWillUnmountCallbacks: () => D.derivations.derivedArray([]),
      componentWillUpdateCallbacks: () => D.derivations.derivedArray([]),

      props: (d) => d.pointer().prop('_atom').prop('props'),
      studio: (d) => d.pointer().prop('_atom').prop('studio'),
      dataVerseContext: (d) => d.pointer().prop('studio').getValue().dataVerseContext,
      key: (d) => d.pointer().prop('_atom').prop('key'),
      modifierInstantiationDescriptorsByID: (d) => d.pointer().prop('_atom').prop('modifierInstantiationDescriptorsByID'),
      listOfModifierInstantiationDescriptorIDs: (d) => d.pointer().prop('_atom').prop('listOfModifierInstantiationDescriptorIDs'),
      state: (d) => d.pointer().prop('_atom').prop('state'),
    }

    constructor(props: Props) {
      super(props)
      this._fnsToCallOnWillUnmount = []

      const instanceId = D.atoms.box(this.props.studio._getNewComponentInstanceId())

      this._atom = D.atoms.dict({
        instanceId,
        props: (props.props: $FixMe),
        modifierInstantiationDescriptorsByID: (props.modifierInstantiationDescriptorsByID: $FixMe),
        listOfModifierInstantiationDescriptorIDs: (props.listOfModifierInstantiationDescriptorIDs: $FixMe),
        studio: props.studio,
        key: props.key,
        state: getInitialState ? getInitialState(): D.atoms.dict({}),
      })

      this._basePrototypalDictD = D.derivations.constant(
        D.derivations.prototypalDict({_atom: () => this._atom}).extend(TheaterJSComponent._baseLookupTable)
      )

      const modifierInstantiationDescriptorsByIDP = this._atom.pointer('modifierInstantiationDescriptorsByID')

      const finalPrototypalDict =
        this._basePrototypalDictD

        .flatMap((basePrototypalDict) => modifyPrototypalDict(basePrototypalDict, props.studio.dataverseContext))
        .flatMap((prototypalDictWithoutModifiers) => {
          return this._atom.prop('listOfModifierInstantiationDescriptorIDs').flatMap((listOfModifierInstantiationDescriptorIDs: D.IDerivedArray<$FixMe>) => {
            return listOfModifierInstantiationDescriptorIDs
              .map((id: string) => modifierInstantiationDescriptorsByIDP.prop(id))
              .reduce(
                (dictD, modifierInstantiationDescriptorP) => {
                  return dictD.flatMap((dict) => applyModifier(modifierInstantiationDescriptorP, dict))
                },
                D.derivations.constant(prototypalDictWithoutModifiers),
              )
          })
        })

      this._finalFace =

        new D.derivations.PrototypalDictFace(finalPrototypalDict.getValue(), props.studio.dataverseContext)

      const untapFromPrototypalMapChanges = finalPrototypalDict.setDataVerseContext(props.studio.dataverseContext).changes().tap((newFinalPrototypalDict) => {
        this._finalFace.setHead(newFinalPrototypalDict)
      })

      // console.log(displayName, props.props.pointer().prop('props').prop('modifierInstantiationDescriptorsByID').getValue())
      // console.log(this._finalFace.prop('modifierInstantiationDescriptorsByID'))

      this._fnsToCallOnWillUnmount.push(untapFromPrototypalMapChanges)

      this._whatToRender = null
      const untapFromRender = this._finalFace.prop('render').setDataVerseContext(props.studio.dataverseContext).changes().tap((whatToRender) => {
        this._whatToRender = whatToRender
        this.forceUpdate()
      })
      this._fnsToCallOnWillUnmount.push(untapFromRender)
    }

    componentWillReceiveProps(newProps: Props) {
      if (newProps.props !== this.props.props) {
        this._atom.set('props', newProps.props)
      }

      if (newProps.listOfModifierInstantiationDescriptorIDs !== this.props.listOfModifierInstantiationDescriptorIDs) {
        this._atom.set('listOfModifierInstantiationDescriptorIDs', newProps.listOfModifierInstantiationDescriptorIDs)
      }

      if (newProps.modifierInstantiationDescriptorsByID !== this.props.modifierInstantiationDescriptorsByID) {
        this._atom.set('modifierInstantiationDescriptorsByID', newProps.modifierInstantiationDescriptorsByID)
      }
    }

    componentWillMount() {
      this._whatToRender = this._finalFace.prop('render').getValue()
      // this._finalFace.prop('componentWillMountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
    }

    componentDidMount() {
      // this._finalFace.prop('componentDidMountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
    }

    componentWillUnmount() {
      this._fnsToCallOnWillUnmount.forEach((fn) => {fn()})
      // this._finalFace.prop('componentWillUnmountCallbacks').getValue().face().forEach((fn) => fn(this._finalFace))
    }

    render() {
      return this._whatToRender
    }
  }

  return compose(
    withStudio,
  )(TheaterJSComponent)
}