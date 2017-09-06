
// import ReferenceMap from '../ReferenceMap'

// type PossibleReferences = ReferenceRecord<any> | ReferenceMap<any> | ReferenceArray<any>

type PathFragment = string | number

export type GetDeepArg = Array<PathFragment> | ReferenceArray<PathFragment>

export default function getDeep(contextReference: PossibleReferences, path: GetDeepArg): $IntentionalAny {
  // dragons
}