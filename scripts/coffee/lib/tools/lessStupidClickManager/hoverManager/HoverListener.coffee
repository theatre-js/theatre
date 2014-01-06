_Listener = require '../_Listener'

module.exports = class HoverListener extends _Listener

	constructor: (@_manager, @_nodeData) ->

		super

		@_mouseIsOverNode = no # or @_isActive

		@_enterCallback = null
		@_moveCallback = null
		@_leaveCallback = null

		@_lastReceivedMouseEvent = null

	_startCombo: ->

		if @_mouseIsOverNode

			do @_enter

		return

	_endCombo: ->

		if @_mouseIsOverNode

			do @_leave

		return

	_enter: ->

		do @_modifyEvent

		if @_enterCallback?

			@_enterCallback @_event

		return

	_move: ->

		do @_modifyEvent

		if @_moveCallback?

			@_moveCallback @_event

		return

	_leave: ->

		do @_modifyEvent

		if @_leaveCallback?

			@_leaveCallback @_event

		return

	_checkIfShouldLeave: (e, ancestors) ->

		@_lastReceivedMouseEvent = e

		unless @_mouseIsOverNode

			throw Error "called _checkIfShouldLeave() when listener is not active"

		# if the mousemove event is outside this listener
		if ancestors.indexOf(@_nodeData) is -1

			do @_deactivate

			if @_comboSatisfies

				do @_leave

		return

	_handleMouseMove: (e) ->

		@_lastReceivedMouseEvent = e

		if @_mouseIsOverNode

			if @_comboSatisfies

				do @_move

		else

			do @_activate

			if @_comboSatisfies

				do @_enter

		return

	_activate: ->

		if @_mouseIsOverNode

			throw Error "Cannot call _activate when listener is already active"

		@_mouseIsOverNode = yes

		@_manager._addListenerToActiveListenersList @

		return

	_deactivate: ->

		unless @_mouseIsOverNode

			throw Error "Cannot call _deactivate when listener is not active"

		@_mouseIsOverNode = no

		@_manager._removeListenerFromActiveListenersList @

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