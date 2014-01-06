Keys = require 'keyboardjs'
_Listener = require '../_Listener'

module.exports = class WheelListener extends _Listener

	constructor: (@_manager, @_nodeData) ->

		super

		@_callback = null

	onWheel: (cb) ->

		@_callback = cb

		@

	_modifyEvent: ->

		super

		e = @_lastReceivedMouseEvent

		@_event.delta = e.wheelDelta
		@_event.deltaX = e.wheelDeltaX
		@_event.deltaY = e.wheelDeltaY

	_handleMouseWheel: (e) ->

		@_lastReceivedMouseEvent = e

		return unless @_comboSatisfies

		do @_modifyEvent

		if @_callback?

			@_callback @_event

		return