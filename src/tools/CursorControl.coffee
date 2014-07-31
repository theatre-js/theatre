module.exports = class CursorControl

	constructor: (@rootNode = document.body) ->

	use: (nodeOrString) ->

		if typeof nodeOrString is 'string'

			@_useString nodeOrString

		else

			node = nodeOrString

			if node.node? then node = node.node

			unless node instanceof Element

				throw Error "node must an html element"

			@_useString getComputedStyle(node).cursor

		@

	free: ->

		@rootNode.style.cursor = ''

	_useString: (s) ->

		if s in ['grab', 'grabbing']

			@_applyString s
			@_applyString '-webkit-' + s
			@_applyString '-moz-' + s

		else

			@_applyString s

	_applyString: (s) ->

		@rootNode.style.cursor = s