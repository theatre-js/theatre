import * as t from '$shared/ioTypes'
import {GenericAction} from '$shared/types'

export type TempAction = {
  type: string
  payload: {id: string; originalAction: GenericAction}
}

export const $BaseOperation = t.type({
  path: t.string,
})

export const $AddOperation = <T extends t.Type<any>>(i: T) =>
  t.intersection([
    $BaseOperation,
    t.type({
      op: t.literal('add'),
      value: i,
    }),
  ])

export const $ReplaceOperation = <T extends t.Type<any>>(i: T) =>
  t.intersection([
    $BaseOperation,
    t.type({
      op: t.literal('replace'),
      value: i,
    }),
  ])

export const $RemoveOperation = t.intersection([
  $BaseOperation,
  t.type({
    op: t.literal('remove'),
  }),
])

export const $MoveOperation = t.intersection([
  $BaseOperation,
  t.type({
    op: t.literal('move'),
    from: t.string,
  }),
])

export const $Operation = t.union(
  [
    $AddOperation(t.intentionalAny),
    $RemoveOperation,
    $ReplaceOperation(t.intentionalAny),
    $MoveOperation,
  ],
  'JSONPatchOperation',
)

export const $CommitHash = t.string
export type CommitHash = t.StaticTypeOf<typeof $CommitHash>

export const $Commit = t.type(
  {
    hash: $CommitHash,
    forwardDiff: t.array($Operation),
    backwardDiff: t.array($Operation),
    timestamp: t.number,
  },
  'Commit',
)

export type Commit = t.StaticTypeOf<typeof $Commit>

export const $HistoryOnly = <Inner>(
  innerState: t.Type<Inner>,
): t.Type<HistoryOnly<Inner>> => {
  return t.type({
    currentCommitHash: t.union([$CommitHash, t.undefined]),
    commitsByHash: t.record($CommitHash, $Commit),
    listOfCommitHashes: t.array($CommitHash),
    innerState: innerState,
  })
}

export interface HistoryOnly<HistoricState> {
  currentCommitHash: CommitHash | undefined
  commitsByHash: Record<CommitHash, Commit>
  listOfCommitHashes: Array<CommitHash>
  innerState: HistoricState
}

export const $StateWithHistory = <T extends {}>(
  inner: t.Type<T>,
): t.Type<StateWithHistory<T>> => {
  return inner as $FixMe
}

export type StateWithHistory<HistoricState extends {}> = HistoricState & {
  '@@history': HistoryOnly<HistoricState>
  '@@tempActions': Array<TempAction>
}

export interface WithHistoryConfig {
  maxNumberOfCommits: number
}
