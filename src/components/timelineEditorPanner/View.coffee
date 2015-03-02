El = require 'stupid-dom-interface'

module.exports = class View

	constructor: (@panner) ->

		@theatre = @panner.theatre

		@editor = @panner.editor

		@scrollView = @editor.scrollableArea.view

		do @_prepareEls

		do @_prepareInteractions

		do @_update

		@scrollView.events.on 'view-change', => do @_update

	_prepareEls: ->

		@containerEl = El '.theatrejs-timelineEditor-panner'
		.inside @editor.view.containerEl

		return

	_prepareInteractions: ->

		{moosh, cursor} = @theatre

		mode = 's'

		moosh.onLeftDrag @containerEl
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

					cursor.use 'grabbing'

					@_shiftBy e.relX

				when 'rr'

					cursor.use 'ew-resize'

					@_resizeRightBy e.relX

				when 'rl'

					cursor.use 'ew-resize'

					@_resizeLeftBy e.relX

		.onEnd => do cursor.free

		cursorPointer = (e) =>

			if @width - e.layerX < 10

				cursor.use 'ew-resize'

			else if e.layerX < 10

				cursor.use 'ew-resize'

			else

				cursor.use 'grab'


		moosh.onHover @containerEl
		.withNoKeys()
		.onEnter cursorPointer

		.onLeave (e) => do cursor.free

		.onMove cursorPointer

	_shiftBy: (x) ->

		@scrollView.shiftFocus @scrollView.unfocusedXToTime(x), yes

		return

	_resizeRightBy: (x) ->

		@scrollView.rewriteFocus @scrollView.unfocusedXToTime(@x), @scrollView.unfocusedXToTime(@width + x)

		return

	_resizeLeftBy: (x) ->

		@scrollView.rewriteFocus @scrollView.unfocusedXToTime(@x + x), @scrollView.unfocusedXToTime(@width - x)

		return

	_update: ->

		@width = @scrollView.timeToUnfocusedX @scrollView.focusLength

		@x = @scrollView.timeToUnfocusedX @scrollView.focusStart

		do @_applyTransforms

		return

	_applyTransforms: ->

		x = @x
		width = @width

		if x < 0

			width += x * 2

			if width < 1 then width = 1

			x = 0

		@containerEl.scaleX width / 1000

		@containerEl.x x

		return
