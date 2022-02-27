export function getAliasesFromTsConfigForJest(): Record<string, string>
export function getAliasesFromTsConfigForRollup(): Array<{
  find: RegExp
  replacement: string
}>
