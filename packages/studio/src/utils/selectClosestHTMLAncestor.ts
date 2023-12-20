/**
 * Traverse upwards from the current element to find the first element that matches the selector.
 */
export function selectClosestHTMLAncestor(
  start: Element | Node | null,
  selector: string,
): Element | null {
  if (start == null) return null
  if (start instanceof Element && start.matches(selector)) {
    return start
  } else {
    return selectClosestHTMLAncestor(start.parentElement, selector)
  }
}
