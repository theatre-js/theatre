interface Node<Data> {
  next: undefined | Node<Data>
  data: Data
}

/**
 * Just a simple LinkedList
 */
export default class Stack<Data> {
  _head: undefined | Node<Data>

  constructor() {
    this._head = undefined
  }

  peek() {
    return this._head && this._head.data
  }

  pop() {
    const head = this._head
    if (!head) {
      return undefined
    }
    this._head = head.next
    return head.data
  }

  push(data: Data) {
    const node = {next: this._head, data}
    this._head = node
  }
}
