_Listener = require '../_Listener'

module.exports = class DragListener extends _Listener

	constructor: (@_manager, @_nodeData) ->

		@_downCallback = null
		@_upCallback = null
		@_cancelCallback = null
		@_dragCallback = null

		@_startPageX = 0
		@_startPageY = 0

		@_lastPageX = 0
		@_lastPageY = 0

		@_mightBe = no

		super

	_modifyEvent: ->

		super

		@_event.absX = @_event.pageX - @_startPageX
		@_event.absY = @_event.pageY - @_startPageY

		@_event.relX = @_event.pageX - @_lastPageX
		@_event.relY = @_event.pageY - @_lastPageY

		@_lastPageX = @_event.pageX
		@_lastPageY = @_event.pageY

		return

	onDown: (cb) ->

		@_downCallback = cb

		@

	onUp: (cb) ->

		@_upCallback = cb

		@

	onCancel: (cb) ->

		@_cancelCallback = cb

		@

	onDrag: (cb) ->

		@_dragCallback = cb

		@

	_endCombo: ->

		do @_cancel

		return

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

		@_startPageX = e.pageX
		@_startPageY = e.pageY

		@_lastPageX  = e.pageX
		@_lastPageY  = e.pageY

		do @_modifyEvent

		if @_downCallback?

			@_downCallback @_event

		return

	_handleMouseUp: (e) ->

		return unless @_mightBe

		@_lastReceivedMouseEvent = e

		do @_modifyEvent

		if @_upCallback?

			@_upCallback @_event

		@_manager._removeListenerFromActiveListenersList @

		@_mightBe = no

		return

	_handleMouseMove: (e) ->

		return unless @_mightBe

		@_lastReceivedMouseEvent = e

		do @_modifyEvent

		if @_dragCallback?

			@_dragCallback @_event

		return