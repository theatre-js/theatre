/**
 * Truncates a string to a given length, adding an ellipsis if it was truncated.
 * Example:
 * ```ts
 * ellipsify('hello world', 5) // 'hello...'
 * ellipsify('hello world', 100) // 'hello world'
 * ```
 */
export default function ellipsify(str: string, maxLength: number) {
  if (str.length <= maxLength) return str
  return str.substr(0, maxLength - 3) + '...'
}
