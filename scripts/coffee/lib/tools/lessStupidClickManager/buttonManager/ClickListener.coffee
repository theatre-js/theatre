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

	_endCombo: ->

		do @_cancel

		return

	_handleMouseMove: ->

		do @_cancel

	_cancel: ->

		if @_mightBe

			@_mightBe = no

			@_manager._removeListenerFromActiveListenersList @

			if @_cancelCallback

				@_cancelCallback @_event

		return

	_handleMouseDown: (e) ->

		@_lastReceivedMouseEvent = e

		return unless @_comboSatisfies

		@_mightBe = yes

		@_manager._addListenerToActiveListenersList @

		do @_modifyEvent

		if @_downCallback?

			@_downCallback @_event

		return

	_handleMouseUp: (e) ->

		return unless @_mightBe

		@_lastReceivedMouseEvent = e

		if @_comboSatisfies

			do @_modifyEvent

			if @_upCallback?

				@_upCallback @_event

		@_manager._removeListenerFromActiveListenersList @

		@_mightBe = no

		return