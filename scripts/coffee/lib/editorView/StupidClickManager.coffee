array = require 'utila/scripts/js/lib/array'

# Aria: this is an unusually stupid way to handle pointer events
module.exports = class StupidClickManager

	constructor: (@root) ->

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

	_mouseUp: (e) ->

		if @_clickRequest.node?

			@_clickRequest.cb()

			@_clickRequest.node = null
			@_clickRequest.cb = null

		else if @_dragRequest.node?

			@_dragRequest.callbacks.end e.x - @_dragRequest.initialPos[0], e.y - @_dragRequest.initialPos[1]

			@_dragRequest.node = null

		return

	_mouseDown: (e) ->

		return if @_shouldUseMouseDownToCloseModal e

	_mouseMove: (e) ->

		if @_clickRequest.node?

			@_clickRequest.node = null
			@_clickRequest.cb = null

		if @_dragRequest.node?

			@_dragRequest.callbacks.drag e.x - @_dragRequest.initialPos[0], e.y - @_dragRequest.initialPos[1]

		return

	onModalClosure: (node, closureCallback) ->

		for modal in @_modals

			if modal.node is node

				throw Error "Current node already is in the modal list"

		@_modals.push

			node: node
			closureCallback: closureCallback

		return

	onClick: (node, cb) ->

		node.addEventListener 'mousedown', (e) =>

			e.stopPropagation()

			if @_shouldUseMouseDownToCloseModal e

				return

			@_requestClickFor node, cb, e

		return

	onDrag: (node, callbacks) ->

		unless callbacks? and callbacks.start? and callbacks.end? and callbacks.drag?

			throw Error "you should provide callbacks for start, end, and drag evenets"

		node.addEventListener 'mousedown', (e) =>

			e.stopPropagation()

			if @_shouldUseMouseDownToCloseModal e

				return

			@_requestDragFor node, callbacks, e

		return

	_shouldUseMouseDownToCloseModal: (e) ->

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

		callbacks.start()

		return