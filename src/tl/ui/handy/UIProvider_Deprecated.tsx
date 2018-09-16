import UIComponent from './UIComponent'
import UI from '$tl/ui/UI'

/**
 * Don't use this. Just extend from $tl/ui/handy/UIComponent instead
 */
export default class UIProvider_Deprecated extends UIComponent<
  {children: (ui: UI) => React.ReactNode},
  {}
> {
  render() {
    return this.props.children(this.ui)
  }
}
