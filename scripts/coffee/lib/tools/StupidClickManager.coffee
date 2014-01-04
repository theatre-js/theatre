array = require 'utila/scripts/js/lib/array'

# Aria: this is an unusually stupid way to handle pointer events
module.exports = class StupidClickManager

	constructor: (@root) ->

		if @root.node?

			@root = @root.node

		@root.addEventListener 'mousedown', (e) => @_mouseDown e
		@root.addEventListener 'mouseup', (e) => @_mouseUp e
		@root.addEventListener 'mousemove', (e) => @_mouseMove e

		@_modals = []

		@_clickRequest =

			node: null
			cb: null

		@_dragRequest =

			node: null
			callbacks: null
			initialPos: [0, 0]
			lastPos: [0, 0]

	_mouseUp: (e) ->

		if @_clickRequest.node?

			@_clickRequest.cb(e)

			@_clickRequest.node = null
			@_clickRequest.cb = null

		else if @_dragRequest.node?

			relX = e.x - @_dragRequest.lastPos[0]
			relY = e.y - @_dragRequest.lastPos[1]

			absX = e.x - @_dragRequest.initialPos[0]
			absY = e.y - @_dragRequest.initialPos[1]

			@_dragRequest.callbacks.end absX, absY, relX, relY

			@_dragRequest.lastPos[0] = e.x
			@_dragRequest.lastPos[1] = e.y

			@_dragRequest.node = null

		return

	_mouseDown: (e) ->

		return unless e.which is 1

		return if @_closeModalIfNexessary e

	_mouseMove: (e) ->

		if @_clickRequest.node?

			@_clickRequest.node = null
			@_clickRequest.cb = null

		if @_dragRequest.node?

			relX = e.x - @_dragRequest.lastPos[0]
			relY = e.y - @_dragRequest.lastPos[1]

			absX = e.x - @_dragRequest.initialPos[0]
			absY = e.y - @_dragRequest.initialPos[1]

			@_dragRequest.callbacks.drag absX, absY, relX, relY

			@_dragRequest.lastPos[0] = e.x
			@_dragRequest.lastPos[1] = e.y

			e.preventDefault()
			e.stopPropagation()

		return

	onModalClosure: (node, closureCallback) ->

		if node.node?

			node = node.node

		for modal in @_modals

			if modal.node is node

				throw Error "Current node already is in the modal list"

		@_modals.push

			node: node
			closureCallback: closureCallback

		return

	onClick: (node, cb) ->

		if node.node?

			node = node.node

		node.addEventListener 'mousedown', (e) =>

			return unless e.which is 1

			e.stopPropagation()

			@_closeModalIfNexessary e

			@_requestClickFor node, cb, e

		return

	onDrag: (node, callbacks) ->

		if node.node?

			node = node.node

		unless callbacks? and callbacks.start? and callbacks.end? and callbacks.drag?

			throw Error "you should provide callbacks for start, end, and drag evenets"

		node.addEventListener 'mousedown', (e) =>

			e.stopPropagation()

			if @_closeModalIfNexessary e

				return

			@_requestDragFor node, callbacks, e

		return

	_closeModalIfNexessary: (e) ->

		return no if @_modals.length is 0

		for modal, index in @_modals

			unless @_nodeIsChildOf e.target, modal.node

				@_closeModal index

				return yes

		no

	_nodeIsChildOf: (node, supposedParent) ->

		return yes if node is supposedParent

		loop

			node = node.parentNode

			break unless node?

			return yes if node is supposedParent

		no

	_closeModal: (index) ->

		modal = @_modals[index]

		modal.closureCallback()

		array.pluck @_modals, index

		return

	_requestClickFor: (node, cb) ->

		@_clickRequest.node = node
		@_clickRequest.cb = cb

		return

	_requestDragFor: (node, callbacks, e) ->

		@_dragRequest.node = node
		@_dragRequest.callbacks = callbacks
		@_dragRequest.initialPos[0] = e.x
		@_dragRequest.initialPos[1] = e.y
		@_dragRequest.lastPos[0] = e.x
		@_dragRequest.lastPos[1] = e.y

		callbacks.start()

		return