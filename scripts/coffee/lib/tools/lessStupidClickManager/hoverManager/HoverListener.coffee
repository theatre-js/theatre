keymaster = require 'keymaster-updated'

module.exports = class HoverListener

	constructor: (@_manager, @_nodeData) ->

		@_active = no

		@_enterCallback = null
		@_moveCallback = null
		@_leaveCallback = null

		@_keys = keymaster

		@_event =

			keys: @_keys

			pageX: 0
			pageY: 0

			screenX: 0
			screenY: 0

			layerX: 0
			layerY: 0

	_modifyEventBy: (e) ->

		@_event.screenX = e.screenX
		@_event.screenY = e.screenY

		@_event.clientX = e.clientX
		@_event.clientY = e.clientY

		@_event.pageX = e.pageX
		@_event.pageY = e.pageY

		rect = @_nodeData.node.getBoundingClientRect()
		@_event.layerX = e.clientX - rect.left
		@_event.layerY = e.clientY - rect.top

		return

	_enter: (e) ->

		@_modifyEventBy e

		if @_enterCallback?

			@_enterCallback @_event

		return

	_move: (e) ->

		@_modifyEventBy e

		if @_moveCallback?

			@_moveCallback @_event

		return

	_leave: (e) ->

		@_modifyEventBy e

		if @_leaveCallback?

			@_leaveCallback @_event

		return

	onEnter: (cb) ->

		@_enterCallback = cb

		@

	onMove: (cb) ->

		@_moveCallback = cb

		@

	onLeave: (cb) ->

		@_leaveCallback = cb

		@

	_checkIfShouldLeave: (e, ancestors) ->

		unless @_active

			throw Error "called _checkIfShouldLeave() when listener is not active"

		# if the mousemove event is outside this listener
		if ancestors.indexOf(@_nodeData) is -1

			do @_deactivate

			@_leave e

		return

	_handleMouseMove: (e) ->

		if @_active

			@_move e

		else

			do @_activate

			@_enter e

		return

	_activate: ->

		if @_active

			throw Error "Cannot call _activate when listener is already active"

		@_active = yes

		@_manager._addListenerToActiveListenersList @

		return

	_deactivate: ->

		unless @_active

			throw Error "Cannot call _deactivate when listener is not active"

		@_active = no

		@_manager._removeListenerFromActiveListenersList @

		return