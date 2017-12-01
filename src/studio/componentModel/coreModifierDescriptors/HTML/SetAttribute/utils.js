// @flow

export function domAttrSetter(
  node: Element,
  name: string,
  isSvg: boolean /*, old: $FixMe*/,
): $FixMe => void {
  if (name === 'class' && !isSvg) {
    return (value: $FixMe) => {
      node.className = value || ''
    }
  } else if (name === 'dangerouslySetInnerHTML') {
    return (value: $FixMe) => {
      if (value) node.innerHTML = value.__html || ''
    }
  } else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
    // else if (name[0]=='o' && name[1]=='n') {
    //   let useCapture = name !== (name=name.replace(/Capture$/, ''));
    //   name = name.toLowerCase().substring(2);
    //   if (value) {
    //     if (!old) node.addEventListener(name, eventProxy, useCapture);
    //   }
    //   else {
    //     node.removeEventListener(name, eventProxy, useCapture);
    //   }
    //   (node._listeners || (node._listeners = {}))[name] = value;
    // }
    return (value: $FixMe) => {
      setProperty(node, name, value == null ? '' : value)
      if (value == null || value === false) node.removeAttribute(name)
    }
  } else {
    let ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''))
    return (value: $FixMe) => {
      if (value == null || value === false) {
        if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase())
        else node.removeAttribute(name)
      } else if (typeof value !== 'function') {
        if (ns)
          node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value)
        else node.setAttribute(name, value)
      }
    }
  }
}

/** Attempt to set a DOM property to the given value.
 *  IE & FF throw for certain property-value combinations.
 */
function setProperty(node: Element, name: string, value: $FixMe) {
  try {
    // $FixMe
    node[name] = value
  } catch (e) {} // eslint-disable-line no-empty
}

/** Proxy an event to hooked event handlers
 *  @private
 */
// function eventProxy(e) {
//   return this._listeners[e.type](options.event && options.event(e) || e);
// }
