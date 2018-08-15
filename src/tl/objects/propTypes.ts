interface _BasePropType<Type extends string> {
  tags?: AllTagTypes[]
  type: Type
  enabledByDefault?: boolean
}

interface NumberType extends _BasePropType<'number'> {
  limit?: [number, number]
}

interface Position3dType extends _BasePropType<'position3d'> {}

export type AllPossiblePropTypes = NumberType | Position3dType

type AllTagTypes = never
