import UI from '$tl/ui/UI'

const theMap = new WeakMap<TheatreJSUI, UI>()

const theUI = (tui: TheatreJSUI) => theMap.get(tui) as UI

export default class TheatreJSUI {
  constructor() {
    theMap.set(this, new UI())
  }

  show() {
    theUI(this).show()
  }

  hide() {
    theUI(this).hide()
  }

  get showing() {
    return theUI(this)._showing
  }

  restore() {
    theUI(this).restore()
  }
}
