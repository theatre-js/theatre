import {IModifierDescriptor} from '$studio/componentModel/types'
import commonStylesPrototype from '$studio/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/commonStylesPrototype'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {Parser, Expression} from 'expr-eval'

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

const formularize = ownerP => v => {
  if (typeof v !== 'string') return v

  if (v.startsWith('=')) {
    let expr: Expression
    try {
      expr = new Parser().parse(v.replace(/^=/, ''))
    } catch (e) {
      return '0'
    }
    return autoDerive(() => {
      const owner = ownerP.getValue()
      const timelineInstance = owner.getTimelineInstance('defaultTimeline')
      const timeP = timelineInstance.timeP

      return autoDerive(() => {
        const time = timeP.getValue() / 1000

        let val
        try {
          val = expr.evaluate({t: time, pi: Math.PI})
        } catch (e) {
          console.log('e', e)
          val = '0'
        }
        return String(val)
      })
    }).flatten()
  }
  return v
}

const getClass = (propsP, baseClass) => {
  return baseClass.extend(commonStylesPrototype).extend({
    reifiedStyles(self) {
      const ownerP = self.prop('owner')
      return self.propFromSuper('reifiedStyles').flatMap(reifiedStyles => {
        const translateXP = propsP
          .prop('translationX')
          .flatMap(formularize(ownerP))
        const translateYP = propsP
          .prop('translationY')
          .flatMap(formularize(ownerP))
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
  id: 'TheatreJS/Core/HTML/UberModifier',
  getClass,
}

export default descriptor
