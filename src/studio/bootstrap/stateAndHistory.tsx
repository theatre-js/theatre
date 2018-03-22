type CommitDiff = $FixMe

interface Chronology {
  currentCommitHash: CommitHash
  commitsByHash: Record<CommitHash, Commit>
  listOfCommitHashes: Array<CommitHash>
}

interface Commit {
  hash: CommitHash
  forwardDiff: CommitDiff
  backwardDiff: CommitDiff
  timestamp: number
}

type CommitHash = string

interface Snapshot {
  commitHash: CommitHash
  data: mixed
}
