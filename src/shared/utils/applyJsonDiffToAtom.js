// @flow
import jsonPatchLib from 'fast-json-patch'
import * as D from '$shared/DataVerse'

type Diff = $FixMe
type Stuff = $FixMe

const ops = {
  dict: {
    replace: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.setProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
        D.atoms.atomifyDeep(diff.value),
      )
    },

    remove: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.deleteProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
      )
    },

    add: (diff: Diff, stuff: Stuff) => {
      stuff.curAtom.setProp(
        jsonPatchLib.unescapePathComponent(stuff.lastComponent),
        D.atoms.atomifyDeep(diff.value),
      )
    },
  },
  array: {
    remove(diff: Diff, {curAtom, lastComponent}: Stuff) {
      // console.log(lastComponent)
      curAtom.splice(lastComponent, 1, [])
    },
    replace(diff: Diff, {curAtom, lastComponent}) {
      curAtom.setIndex(lastComponent, D.atoms.atomifyDeep(diff.value))
    },
    add(diff: Diff, {curAtom, lastComponent}) {
      curAtom.setIndex(lastComponent, D.atoms.atomifyDeep(diff.value))
    },
  },
  box: {},
}

export default function applyJsonDiffToAtom(diff: Diff, atom: $FixMe) {
  if (diff.path.length === 0) {
    throw new Error(`@todo Can't handle zero-length diff paths yet`)
  }

  const components = diff.path.split('/')
  components.shift()
  const lastComponent = components.pop()

  let curAtom: $FixMe = atom
  // debugger
  for (let component of components) {
    component = jsonPatchLib.unescapePathComponent(component)
    curAtom =
      curAtom.isDictAtom === 'True'
        ? curAtom.prop(component)
        : console.error(`not implemented`)
  }

  const type =
    curAtom.isDictAtom === 'True'
      ? 'dict'
      : curAtom.isArrayAtom === 'True'
        ? 'array'
        : curAtom.isBoxAtom === 'True'
          ? 'box'
          : (function() {
              throw new Error(`Unrecognizable atom type '${atom}'`)
            })()

  const stuff = {
    atom,
    components,
    lastComponent:
      type === 'array' ? parseInt(lastComponent, 10) : lastComponent,
    curAtom,
  }

  const opFn = ops[type][diff.op]
  if (opFn) {
    opFn(diff, stuff)
  } else {
    console.error(
      `@todo Diff op '${diff.op}' for atom type ${type} not yet supported`,
    )
    return
  }
}
