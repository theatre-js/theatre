import {forEachRight, flattenDeep} from 'lodash'

interface IStylesToClassName {
  [key: string]: string
}
interface IArrayOfStylesToClassNames extends Array<StylesToClassNames> {}
type StylesToClassNames =
  | IStylesToClassName
  | null
  | void
  | IArrayOfStylesToClassNames

const resolveCss = (...stylesToClassNames: Array<StylesToClassNames>) => (
  ...classNameOrClassNames: Array<string | void | null | false>
): {className: string} => {
  const styles: Array<string> = classNameOrClassNames.filter(
    s => typeof s === 'string' && s.length > 0,
  ) as Array<string>

  function resolveSingleStyle(style: string): string {
    const pieces = flattenDeep(
      // voodoo. don't bother
      flattenDeep(stylesToClassNames as $FixMe)
        .filter(a => !!a)
        .map((map: $FixMe) => map[style]),
    )

    const eligiblePieces: $FixMe[] = []

    // @ts-ignore
    forEachRight(pieces, (piece) => {
      // get rid of nulls
      if (typeof piece !== 'string') return true
      // sanitize whitespaces
      const sanitizedPiece = piece.replace(/\s+/g, ' ').trim()
      // ignore empty classes
      if (sanitizedPiece.length === 0) return true
      // apply '!override's
      if (sanitizedPiece === '!important') {
        return false
      }
      // take 'class' out of 'class !important'
      const pieceWithoutOverride = piece.replace(/\s*\!override/, '').trim()
      // prepend 'class' to the array
      eligiblePieces.unshift(pieceWithoutOverride)

      // if the piece was 'class !important', then we should stop at this point
      if (piece !== pieceWithoutOverride) {
        return false
      }
    })
    return eligiblePieces.join(' ').trim()
  }

  return {
    className: styles
      .map(resolveSingleStyle)
      .join(' ')
      .trim(),
  }
}

export default resolveCss
