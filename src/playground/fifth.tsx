import {dict} from '$src/shared/DataVerse/atoms'
import {skipFindingColdDerivations} from '$src/shared/debug'
import {Ticker} from '$src/shared/DataVerse'
import autoProxyDerivedDict from '$src/shared/DataVerse/derivations/dicts/autoProxyDerivedDict'

skipFindingColdDerivations()

const ticker = new Ticker()
const req = () => {
  setTimeout(req, 0)
  ticker.tick()
}
setTimeout(req, 0)

const def = dict({
  tagName: 'span',
  style: dict({
    background: 'red',
    color: 'blue',
  }),
  children: 'hi',
})

window.def = def

const defD = def.derivedDict()

class ToDom {
  defD: $FixMe
  constructor(defD: $FixMe) {
    this.defD = defD
  }

  getEl() {
    const tagNameD = this.defD.prop('tagName')

    const el = document.createElement(tagNameD.getValue())

    const childrenD = this.defD.prop('children')

    childrenD.tapImmediate(ticker, () => {
      el.innerHTML = childrenD.getValue()
    })

    const stylesD = autoProxyDerivedDict(this.defD.prop('style'), ticker)
    // console.log(stylesD);
    
    const untaps: {[k: string]: $IntentionalAny} = {}
    stylesD.keys().forEach(addStyleKey)

    stylesD.changes(ticker).tap((c) => {
      c.addedKeys.forEach(addStyleKey)
      c.deletedKeys.forEach(deleteStyleKey)
    })


    function addStyleKey(k: string) {
      const valD = stylesD.prop(k)
      

      const untap = valD.tapImmediate(ticker, applyStyle)
      untaps[k] = untap
      
      function applyStyle(newValue) {
        el.style[k] = newValue
      }
    }

    function deleteStyleKey(k: string) {
      untaps[k]()
      delete untaps[k]
      
    }

    return el
  }
}

const toDom = new ToDom(defD)
const el = toDom.getEl()

document.body.appendChild(el)

def.setProp('children', 'hi2')

def.prop('style').setProp('background', 'blue')
def.setProp('style', dict({fontFamily: 'Helvetica', background: 'green'}))
