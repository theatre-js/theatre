// @flow
import forEachRight from 'lodash/forEachRight'
import flattenDeep from 'lodash/flattenDeep'

type StylesToClassName = {[key: string]: string}
type StylesToClassNames =
  | StylesToClassName
  | null
  | void
  | Array<StylesToClassNames>

const resolveCss = (...stylesToClassNames: Array<StylesToClassNames>) => (
  ...classNameOrClassNames: Array<string | void | null | false>
): {className: string} => {
  // $FlowIgnore
  const styles: Array<string> = classNameOrClassNames.filter(
    s => typeof s === 'string' && s.length > 0,
  )

  function resolveSingleStyle(style: string): string {
    const pieces = flattenDeep(
      // voodoo. don't bother
      flattenDeep(stylesToClassNames)
        .filter(a => !!a)
        .map(map => map[style]),
    )

    const eligiblePieces = []

    forEachRight(pieces, piece => {
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
      const pieceWithoutOverride = piece.replace(/\s*!override/, '').trim()
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
