Foxie = require 'foxie'

module.exports = class CursorControl

	constructor: (@rootNode = document.body) ->

		# @node = Foxie('.cursor-override').putIn(@rootNode)
		# @node.css('position', 'absolute')
		# @node.css('top', '0')
		# @node.css('left', '0')
		# @node.css('right', '0')
		# @node.css('bottom', '0')
		# @node.css('z-index', -5000)

	use: (nodeOrString) ->

		if typeof nodeOrString is 'string'

			@_useString nodeOrString

		else

			node = nodeOrString

			if node.node? then node = node.node

			unless node instanceof Element

				throw Error "node must be a foxie instance or an html element"

			@_useString getComputedStyle(node).cursor

		@

	free: ->

		# @node.css('z-index', -5000)

		@rootNode.style.cursor = ''

		return

	_useString: (s) ->

		@rootNode.style.cursor = s

		# @node
		# .css('z-index', 5000)
		# .css('cursor', s)

		return