export default function ellipsify(str: string, maxLength: number) {
  if (str.length <= maxLength) return str
  return str.substr(0, maxLength - 3) + '...'
}
