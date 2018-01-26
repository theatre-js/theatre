import Emitter from '$src/shared/DataVerse/utils/Emitter'
import Ticker from '$src/shared/DataVerse/Ticker'
import {
  default as propOfDerivedClassInstance,
  DerivationOfAPropOfADerivedClassInstance,
} from './propOfDerivedClassInstance'
import constant from '$src/shared/DataVerse/derivations/constant'
import forEach from 'lodash/forEach'
import pointer from '$src/shared/DataVerse/derivations/pointer'
import {DerivedClass} from '$src/shared/DataVerse/derivedClass/derivedClass'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

const NOTFOUND = undefined // Symbol('notfound')
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
  derivedDict: DerivedClass<$FixMe>
  sourceDerivationsByKey: {[propName: string]: AbstractDerivation<$FixMe>}
  untapFromParentChanges: () => void
}

type Layers = {
  byId: {[id: LayerId]: Layer}
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

export default class DerivedClassInstance {
  isDerivedClassInstance = true
  _head: void | DerivedClass<$FixMe>
  _changeEmitter: Emitter<$FixMe>
  _ticker: Ticker
  _structure: Structure
  _pointer: void | $FixMe

  constructor(head: void | DerivedClass<$FixMe>, ticker: Ticker) {
    this._head = head
    this._changeEmitter = new Emitter()
    this._ticker = ticker
    this._structure = makeEmptyStructure()
    this._updateStructure = this._updateStructure.bind(this)
    this._updateStructure()
  }

  setClass(head: void | DerivedClass<$FixMe>) {
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

    let currentDerivedDict = this._head
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!currentDerivedDict) break

      const id = currentDerivedDict._id
      const layer = {
        id,
        initiatingWiresByKey: {},
        derivedDict: currentDerivedDict,
        sourceDerivationsByKey: {},
        untapFromParentChanges: currentDerivedDict
          .prototypeChanges()
          .tap(this._notifyStructureNeedsUpdating),
      }
      newStructure.layers.list.unshift(id)
      newStructure.layers.byId[id] = layer

      currentDerivedDict = currentDerivedDict.getPrototype()
    }

    this._structure = newStructure

    forEach(oldStructure.layers.face.initiatingWiresByKey, (oldWire, key) => {
      this._createWire(key, 'face', oldWire.proxyDerivation)
    })
  }

  changes() {
    return this._changeEmitter
  }

  pointer() {
    if (!this._pointer) {
      this._pointer = pointer({type: 'WithPath', root: this, path: []})
    }
    return this._pointer
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
      const methodFn = (layer as $FixMe).derivedDict._getMethod(key)

      derivation = notFoundDerivation.flatMap(() =>
        methodFn(new MethodArg(this, lid)),
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
      const derivedDict = layer.derivedDict
      const constructor = derivedDict._getMethod(key)
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

class MethodArg {
  _instance: $FixMe
  _sourceLayerId: number
  constructor(instance: DerivedClassInstance, sourceLayerId: number) {
    this._instance = instance
    this._sourceLayerId = sourceLayerId
  }

  prop(key: string) {
    return this._instance.prop(key)
  }

  pointer() {
    return this._instance.pointer()
  }

  propFromSuper(key) {
    return this._instance.propFromLayer(key, this._sourceLayerId)
  }
}

export type Face = DerivedClassInstance
