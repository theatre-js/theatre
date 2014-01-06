Keys = require 'keyboardjs'

module.exports = class _Listener

	constructor: ->

		@_locked = no

		setTimeout =>

			@_locked = yes

		, 0

		@_keyBinding = null

		@_hasCombo = no

		@_comboSatisfies = yes

		@_event =

			keys: Keys.activeKeys()

			pageX: 0
			pageY: 0

			screenX: 0
			screenY: 0

			layerX: 0
			layerY: 0

			clientRect: null

			preventDefault: => @_lastReceivedMouseEvent.preventDefault()

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
		@_event.clientRect = rect

		@_event.layerX = e.clientX - rect.left
		@_event.layerY = e.clientY - rect.top

		@_event.fractionX = @_event.layerX / rect.width
		@_event.fractionY = @_event.layerY / rect.height

		return

	withKeys: (combo) ->

		if @_locked

			throw Error "You can only set key combos on the same tick this listener was created"

		if @_hasCombo

			throw Error "Keyboard combo is already set on this event listener"

		@_comboSatisfies = no

		@_hasCombo = yes

		combo = String combo

		unless combo.match /^[a-zA-Z0-9\s\+]+$/

			throw Error "Bad combo '#{combo}'"

		@_keyBinding = Keys.on combo

		@_keyBinding.on 'keydown', =>

			return if @_comboSatisfies

			@_comboSatisfies = yes

			do @_startCombo

		@_keyBinding.on 'keyup', =>

			return unless @_comboSatisfies

			@_comboSatisfies = no

			do @_endCombo

		@

	_startCombo: ->

	_endCombo: ->