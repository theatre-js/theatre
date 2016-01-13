module.exports = class CursorControl
  constructor: (@rootNode = document.body) ->

  use: (nodeOrString) ->
    if typeof nodeOrString is 'string'
      @_useString nodeOrString
    else
      node = nodeOrString
      if node.node? then node = node.node

      unless node instanceof Element
        throw Error "node must be a foxie instance or an html element"

      @_useString getComputedStyle(node).cursor

    this

  free: ->
    @rootNode.style.cursor = ''
    return

  _useString: (s) ->
    @rootNode.style.cursor = s
    return