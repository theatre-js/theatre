_Listener = require '../_Listener'

module.exports = class ClickListener extends _Listener

	constructor: (@_manager, @_nodeData) ->

		@_downCallback = null
		@_upCallback = null
		@_cancelCallback = null
		@_doneCallback = null

		@_active = no

		n = 1

		@_lastRepeatCheckTimeout = null

		super

	onDown: (cb) ->

		@_downCallback = cb

		@

	onUp: (cb) ->

		@_upCallback = cb

		@

	onCancel: (cb) ->

		@_cancelCallback = cb

		@

	onDone: (cb) ->

		@_doneCallback = cb

		return

	repeat: (n) ->

		if @_locked

			throw Error "Cannot call repeat when the listener is already set up"

		@_repeats = parseInt n

		unless Number.isFinite(@_repeats)

			throw Error "Invalid number for repeat"

		@

	_endCombo: ->

		do @_cancel

		return

	_handleMouseMove: (e) ->

		unless @_active

			throw Error "called _handleMouseMove when mighBe is off"

		if Math.abs(e.pageX - @_event.pageX) < 5

			return

		do @_cancel

		return

	_cancel: ->

		if @_active

			@_active = no

			@_manager._removeListenerFromActiveListenersList @

			if @_cancelCallback

				@_cancelCallback @_event

		return

	_handleMouseDown: (e) ->

		@_lastReceivedMouseEvent = e

		unless @_active

			return unless @_comboSatisfies

			@_active = yes

			@_manager._addListenerToActiveListenersList @

		do @_modifyEvent

		if @_downCallback?

			@_downCallback @_event

		if @_repeats > 1

			if @_lastRepeatCheckTimeout?

				clearTimeout @_lastRepeatCheckTimeout

			@_lastRepeatCheckTimeout = setTimeout =>

				do @_cancel

			, 300

		return

	_handleMouseUp: (e) ->

		return unless @_active

		@_lastReceivedMouseEvent = e

		do @_modifyEvent

		@_event.repeats = e.detail

		if @_upCallback?

			@_upCallback @_event

		if e.detail >= @_repeats

			@_manager._removeListenerFromActiveListenersList @

			@_active = no

			if @_doneCallback?

				@_doneCallback @_event

			clearTimeout @_lastRepeatCheckTimeout

		return