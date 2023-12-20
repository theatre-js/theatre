import type {PropTypeConfig} from '@theatre/core/types/public'

export type PropConfigForType<K extends PropTypeConfig['type']> = Extract<
  PropTypeConfig,
  {type: K}
>
