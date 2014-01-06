HoverManager = require './lessStupidClickManager/HoverManager'

# This is supposed to be more capable than our last
# click manager, but I'm keeping the 'Stupid' prefix
# just in case
module.exports = class LessStupidClickManager

	self = @

	@_instanceCounter = 0

	constructor: (@rootNode = document.body) ->

		if @rootNode.node? then @rootNode = @rootNode.node

		@id = ++self._instanceCounter

		@_nodesData = []

		@_hovers = new HoverManager @

		@rootNode.addEventListener 'mousedown', =>

			@_mousedown event

		@rootNode.addEventListener 'mouseup', =>

			@_mouseup event

		@rootNode.addEventListener 'mousemove', =>

			@_mousemove event

	_getHtmlNode: (node) ->

		if node.node? then node = node.node

		unless node instanceof HTMLElement

			throw Error "node must either be a Foxie instance or an html element"

		node

	_assignIdToNode: (node) ->

		id = node.getAttribute "data-lessStupidClickManager-#{@id}-id"

		unless id?

			id = @_nodesData.length

			node.setAttribute "data-lessStupidClickManager-#{@id}-id", id

			@_nodesData.push

				id: id
				node: node

				hoverListeners: []
				clickListeners: []
				dragListeners: []

		parseInt id

	forgetNode: (node) ->

		node = @_getHtmlNode node

		id = @_getNodeId node

		if id?

			data = @_nodesData[id]
			data.ndoe = null
			data.hoverListeners.length = 0
			data.clickListeners.length = 0
			data.dragListeners.length  = 0

			node.removeAttribute "data-lessStupidClickManager-#{@id}-id"

		@

	_getNodeId: (node) ->

		id = node.getAttribute "data-lessStupidClickManager-#{@id}-id"

		return null unless id?

		parseInt id

	_getNodeAncestors: (node) ->

		ancestors = []

		loop

			break unless node?

			id = @_getNodeId node

			if id?

				ancestors.unshift @_nodesData[id]

			break if node is @rootNode

			node = node.parentNode

		ancestors

	_mousemove: (e) ->

		ancestors = @_getNodeAncestors e.target

		@_hovers.handleMouseMove e, ancestors

	_mousedown: (e) ->

		console.log @_getNodeAncestors e.target

	_mouseup: (e) ->

	onHover: (node) ->

		node = @_getHtmlNode node

		id = @_assignIdToNode node

		data = @_nodesData[id]

		@_hovers.onHover data