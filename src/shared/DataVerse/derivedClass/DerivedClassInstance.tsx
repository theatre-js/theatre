import Ticker from '$shared/DataVerse/Ticker'
import {
  default as propOfDerivedClassInstance,
  DerivationOfAPropOfADerivedClassInstance,
} from './propOfDerivedClassInstance'
import constant from '$shared/DataVerse/derivations/constant'
import forEach from 'lodash/forEach'
import pointer, {
  PointerDerivation,
} from '$shared/DataVerse/derivations/pointer'
import {DerivedClass} from '$shared/DataVerse/derivedClass/derivedClass'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

const NOTFOUND = undefined
const notFoundDerivation = constant(NOTFOUND)

type Wire = {
  key: string
  startsInLayer: LayerId
  endsInLayerId: LayerId
  proxyDerivation: DerivationOfAPropOfADerivedClassInstance<$FixMe>
}

export type LayerId = 'face' | 'tail' | number

type Layer = {
  id: number
  initiatingWiresByKey: {[propName: string]: Wire}
  derivedClass: DerivedClass<$FixMe>
  sourceDerivationsByKey: {[propName: string]: AbstractDerivation<$FixMe>}
  untapFromParentChanges: () => void
}

type Layers = {
  // This is actualy number | 'face' | 'tail'
  byId: {[id: number]: Layer}
  list: Array<number>
  face: {initiatingWiresByKey: {[propName: string]: Wire}}
  tail: {
    sourceDerivationsByKey: {[propName: string]: AbstractDerivation<$FixMe>}
  }
}

type Structure = {
  layers: Layers
  derivationsByLayerAndKey: {[lk: string]: AbstractDerivation<$FixMe>}
}

const makeEmptyStructure = (): Structure => ({
  layers: {
    byId: {},
    list: [],
    face: {initiatingWiresByKey: {}},
    tail: {sourceDerivationsByKey: {}},
  },
  derivationsByLayerAndKey: {},
})

export default class DerivedClassInstance<O> {
  isDerivedClassInstance = true
  _head: undefined | DerivedClass<$FixMe>
  _ticker: Ticker
  _structure: Structure
  _pointer: undefined | PointerDerivation<DerivedClassInstance<O>>

  constructor(head: undefined | DerivedClass<$FixMe>, ticker: Ticker) {
    this._head = head
    this._ticker = ticker
    this._structure = makeEmptyStructure()
    this._pointer = undefined
    this._updateStructure = this._updateStructure.bind(this)
    this._updateStructure()
  }

  setClass(head: DerivedClass<$FixMe>) {
    this._head = head
    this._notifyStructureNeedsUpdating()
  }

  _notifyStructureNeedsUpdating = () => {
    this._ticker.addObjectWhoseStructureShouldBeUpdated(this)
  }

  _updateStructure() {
    const oldStructure = this._structure
    forEach(oldStructure.layers.byId, layer => {
      layer.untapFromParentChanges()
    })

    const newStructure = makeEmptyStructure()

    let currentDerivedClass = this._head
    while (true) {
      if (!currentDerivedClass) break

      const id = currentDerivedClass._id
      const layer = {
        id,
        initiatingWiresByKey: {},
        derivedClass: currentDerivedClass,
        sourceDerivationsByKey: {},
        untapFromParentChanges: currentDerivedClass
          .prototypeChanges()
          .tap(this._notifyStructureNeedsUpdating),
      }
      newStructure.layers.list.unshift(id)
      newStructure.layers.byId[id] = layer

      currentDerivedClass = currentDerivedClass.getPrototype()
    }

    this._structure = newStructure

    forEach(oldStructure.layers.face.initiatingWiresByKey, (oldWire, key) => {
      this._createWire(key, 'face', oldWire.proxyDerivation)
    })
  }

  pointer(): PointerDerivation<DerivedClassInstance<O>> {
    if (!this._pointer) {
      this._pointer = pointer({
        type: 'WithPath',
        root: this,
        path: [],
      }) as $IntentionalAny
    }
    return this._pointer as $IntentionalAny
  }

  prop(key: string): $FixMe {
    return this.propFromLayer(key, 'face')
  }

  propFromLayer(
    key: string,
    initiatingLayerId: 'face' | number,
  ): AbstractDerivation<$FixMe> {
    const layer =
      initiatingLayerId === 'face'
        ? this._structure.layers.face
        : this._structure.layers.byId[initiatingLayerId]
    if (!layer)
      throw new Error(
        `Layer ${initiatingLayerId} doesn't exist. This should never happen`,
      )

    const possibleWireInLayer = layer.initiatingWiresByKey[key]
    if (possibleWireInLayer) {
      return possibleWireInLayer.proxyDerivation
    }

    return this._createWire(key, initiatingLayerId).proxyDerivation
  }

  _createWire(
    key: string,
    startsInLayer: 'face' | number,
    reusableProxy?: DerivationOfAPropOfADerivedClassInstance<$FixMe>,
  ): Wire {
    const endsInLayerId = this._findALayerThatHasProp(key, startsInLayer)

    const sourceDerivation = this._makeSourceDerivation(key, endsInLayerId)
    const proxyDerivation = reusableProxy
      ? reusableProxy.setTarget(sourceDerivation)
      : propOfDerivedClassInstance(sourceDerivation)
    const wire = {key, startsInLayer, endsInLayerId, proxyDerivation}

    const layer =
      startsInLayer === 'face'
        ? this._structure.layers.face
        : this._structure.layers.byId[startsInLayer]
    layer.initiatingWiresByKey[key] = wire
    return wire
  }

  _makeSourceDerivation(
    key: string,
    layerId: 'tail' | number,
  ): AbstractDerivation<$FixMe> {
    const layer =
      layerId === 'tail'
        ? this._structure.layers.tail
        : this._structure.layers.byId[layerId]

    const possibleSourceDerivation = layer.sourceDerivationsByKey[key]

    if (possibleSourceDerivation) return possibleSourceDerivation

    let derivation
    if (layerId === 'tail') {
      derivation = notFoundDerivation
    } else {
      const lid = layerId
      const methodFn = (layer as $FixMe).derivedClass._getMethod(key)

      derivation = notFoundDerivation.flatMap(() =>
        methodFn(new Self(this, lid)),
      )
    }

    layer.sourceDerivationsByKey[key] = derivation
    return derivation
  }

  _findALayerThatHasProp(key: string, above: 'face' | number): number | 'tail' {
    const startingIndex =
      above === 'face'
        ? this._structure.layers.list.length - 1
        : this._structure.layers.list.indexOf(above) - 1
    if (startingIndex < 0) return 'tail'

    for (let i = startingIndex; i >= 0; i--) {
      const layerId = this._structure.layers.list[i]

      const layer: Layer = this._structure.layers.byId[layerId] as $FixMe
      const derivedClass = layer.derivedClass
      const constructor = derivedClass._getMethod(key)
      if (constructor) {
        return layerId
      }
    }

    return 'tail'
  }

  keys() {
    return this._head ? this._head.keys() : {}
  }
}

class Self {
  _sourceLayerId: number
  constructor(
    readonly _instance: DerivedClassInstance<$FixMe>,
    sourceLayerId: number,
  ) {
    this._sourceLayerId = sourceLayerId
  }

  prop(key: string) {
    return this._instance.pointer().prop(key)
  }

  pointer() {
    return this._instance.pointer()
  }

  propFromSuper(key: string) {
    return this._instance.propFromLayer(key, this._sourceLayerId)
  }
}
