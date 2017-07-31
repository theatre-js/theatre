// flow-typed signature: ca3f7f1b46804b3c09c838773ece34ba
// flow-typed version: b43dff3e0e/uuid_v3.x.x/flow_>=v0.32.x

declare module 'uuid' {
  declare function v1(options?: {|
    node?: number[],
    clockseq?: number,
    msecs?: number | Date,
    nsecs?: number,
  |}, buffer?: number[] | Buffer, offset?: number): string;
  declare function v4(options?: {|
    random?: number[],
    rng?: () => number[] | Buffer,
  |}, buffer?: number[] | Buffer, offset?: number): string;
}
