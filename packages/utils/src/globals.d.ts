declare module 'propose' {
  const propose: (
    str: string,
    dictionary: string[],
    options?: {threshold?: number; ignoreCase?: boolean},
  ) => string | null
  export default propose
}
