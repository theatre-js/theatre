El = require 'stupid-dom-interface'

module.exports = class Panner
	@type: 'leech'
	@target: 'studio-timelineEditor'
	@globalDeps:
		studio: 'studio'
		moosh: 'moosh'
		cursor: 'cursor'
	@peerDeps:
		scrollableArea: 'studio-timelineEditor-scrollableArea'

	constructor: (@editor) ->
		@scrollableArea = @scrollableArea.view

		do @_prepareEls
		do @_prepareInteractions
		do @_update

		@scrollableArea.events.on 'view-change', => do @_update

	_prepareEls: ->
		@containerEl = El '.theatre-timelineEditor-panner'
		.inside @editor.view.containerEl

	_prepareInteractions: ->
		mode = 's'
		@moosh.onLeftDrag @containerEl
		.withNoKeys()
		.onStart (e) =>
			if @width - e.layerX < 10
				mode = 'rr'
			else if e.layerX < 10
				mode = 'rl'
			else
				mode = 's'

		.onDrag (e) =>
			switch mode
				when 's'
					@cursor.use 'grabbing'
					@_shiftBy e.relX
				when 'rr'
					@cursor.use 'ew-resize'
					@_resizeRightBy e.relX
				when 'rl'
					@cursor.use 'ew-resize'
					@_resizeLeftBy e.relX

		.onEnd => do @cursor.free

		cursorPointer = (e) =>
			if @width - e.layerX < 10
				@cursor.use 'ew-resize'
			else if e.layerX < 10
				@cursor.use 'ew-resize'
			else
				@cursor.use 'grab'

		@moosh.onHover @containerEl
		.withNoKeys()
		.onEnter cursorPointer
		.onLeave (e) => do @cursor.free
		.onMove cursorPointer

	_shiftBy: (x) ->
		@scrollableArea.shiftFocus @scrollableArea.unfocusedXToTime(x), yes

	_resizeRightBy: (x) ->
		@scrollableArea.rewriteFocus @scrollableArea.unfocusedXToTime(@x), @scrollableArea.unfocusedXToTime(@width + x)

	_resizeLeftBy: (x) ->
		@scrollableArea.rewriteFocus @scrollableArea.unfocusedXToTime(@x + x), @scrollableArea.unfocusedXToTime(@width - x)

	_update: ->
		@width = @scrollableArea.timeToUnfocusedX @scrollableArea.focusLength
		@x = @scrollableArea.timeToUnfocusedX @scrollableArea.focusStart
		do @_applyTransforms

	_applyTransforms: ->
		x = @x
		width = @width

		if x < 0
			width += x * 2
			if width < 1 then width = 1
			x = 0

		@containerEl.scaleX width / 1000
		@containerEl.x x