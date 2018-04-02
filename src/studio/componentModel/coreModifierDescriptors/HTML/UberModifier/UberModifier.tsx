import {IModifierDescriptor} from '$src/studio/componentModel/types'
import commonStylesPrototype from '$src/studio/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/commonStylesPrototype'
import dictAtom from '$shared//DataVerse/atoms/dictAtom'
import withDeps from '$shared//DataVerse/derivations/withDeps'
import AbstractDerivation from '$shared//DataVerse/derivations/AbstractDerivation'

const numeralize = (
  vD: AbstractDerivation<undefined | null | string | number>,
) => {
  const v = vD.getValue()
  if (typeof v === 'number') {
    return String(v)
  } else if (typeof v === 'string') {
    if (parseFloat(v) === parseFloat(v)) {
      return v
    } else {
      return '0'
    }
  } else {
    return '0'
  }
}

const getClass = (propsP, baseClass) => {
  return baseClass.extend(commonStylesPrototype).extend({
    reifiedStyles(self) {
      return self.propFromSuper('reifiedStyles').flatMap(reifiedStyles => {
        const translateXP = propsP.prop('translationX')
        const translateYP = propsP.prop('translationY')
        const translateZP = propsP.prop('translationZ')

        const scaleXP = propsP.prop('scaleX')
        const scaleYP = propsP.prop('scaleY')
        const scaleZP = propsP.prop('scaleZ')

        const rotateZP = propsP.prop('rotateZ')

        const opacityP = propsP.prop('opacity')

        return withDeps(
          {
            translateXP,
            translateYP,
            translateZP,
            scaleXP,
            scaleYP,
            scaleZP,
            rotateZP,
            opacityP,
          },
          () => {
            const d = dictAtom({
              transform: `translate3d(${numeralize(
                translateXP,
              )}px, ${numeralize(translateYP)}px, ${numeralize(
                translateZP,
              )}px) scale3d(${numeralize(scaleXP)}, ${numeralize(
                scaleYP,
              )}, ${numeralize(scaleZP)}) rotate3d(0, 0, 1, ${numeralize(
                rotateZP,
              )}deg)`,
              opacity: numeralize(opacityP),
            })

            return reifiedStyles.extend(d.derivedDict())
          },
        )
      })
    },
  })
}

const descriptor: IModifierDescriptor = {
  id: 'TheaterJS/Core/HTML/UberModifier',
  getClass,
}

export default descriptor
