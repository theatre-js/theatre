_Listener = require '../_Listener'

module.exports = class ClickListener extends _Listener

	constructor: (@_manager, @_nodeData) ->

		@_downCallback = null
		@_upCallback = null
		@_cancelCallback = null

		@_mightBe = no

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

	_handleMouseMove: ->

		if @_mightBe

			@_mightBe = no

			if @_cancelCallback

				@_cancelCallback @_event

		return

	_handleMouseDown: (e) ->

		@_lastReceivedMouseEvent = e

		return unless @_comboSatisfies

		@_mightBe = yes

		do @_modifyEvent

		if @_downCallback?

			@_downCallback @_event

		return

	_handleMouseUp: (e) ->

		return unless @_mightBe

		@_lastReceivedMouseEvent = e

		return unless @_comboSatisfies

		do @_modifyEvent

		if @_upCallback?

			@_upCallback @_event

		@_mightBe = no

		return