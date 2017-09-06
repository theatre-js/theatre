
import {type Atom} from '../index'

export default class Placeholder implements Atom {
  _parent: Atom
  __isAtom: true

  constructor(parent: Atom) {
    this._parent = parent
  }

  __setParent() {

  }
}