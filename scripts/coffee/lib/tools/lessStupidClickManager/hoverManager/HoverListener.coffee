Keys = require 'keyboardjs'

module.exports = class HoverListener

	constructor: (@_manager, @_nodeData) ->

		@_mouseIsOverNode = no # or @_isActive

		@_enterCallback = null
		@_moveCallback = null
		@_leaveCallback = null

		@_event =

			keys: Keys.activeKeys()

			pageX: 0
			pageY: 0

			screenX: 0
			screenY: 0

			layerX: 0
			layerY: 0

		@_lastReceivedMouseEvent = null

		@_locked = no

		setTimeout =>

			@_locked = yes

		, 0

		@_keyBinding = null

		@_comboActive = yes

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

			if @_comboActive

				do @_leave

		return

	_handleMouseMove: (e) ->

		@_lastReceivedMouseEvent = e

		if @_mouseIsOverNode

			if @_comboActive

				do @_move

		else

			do @_activate

			if @_comboActive

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

	_modifyEvent: ->

		e = @_lastReceivedMouseEvent

		@_event.keys = Keys.activeKeys()

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

	onEnter: (cb) ->

		@_enterCallback = cb

		@

	onMove: (cb) ->

		@_moveCallback = cb

		@

	onLeave: (cb) ->

		@_leaveCallback = cb

		@

	withKeys: (combo) ->

		if @_locked

			throw Error "You can only set key combos on the same tick this listener was created"

		if @_keyBinding?

			throw Error "Keyboard combo is already set on this event listener"

		@_comboActive = no

		combo = String combo

		unless combo.match /^[a-zA-Z0-9\s\+]+$/

			throw Error "Bad combo '#{combo}'"

		@_keyBinding = Keys.on combo

		@_keyBinding.on 'keydown', =>

			return if @_comboActive

			@_comboActive = yes

			do @_startCombo

		@_keyBinding.on 'keyup', =>

			return unless @_comboActive

			@_comboActive = no

			do @_endCombo

		@