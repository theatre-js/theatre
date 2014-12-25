El = require 'stupid-dom-interface'

module.exports = class View

	constructor: (@panner) ->

		@theatre = @panner.theatre

		@model = @panner.model

		@box = @panner.box

		@scrollView = @box.scrollableArea.view

		do @_prepareNodes

		do @_prepareInteractions

		do @_update

		@scrollView.on 'view-change', => do @_update

	_prepareNodes: ->

		@containerNode = El '.theatrejs-timelineEditor-panner'
		.inside @box.view.containerNode

		return

	_prepareInteractions: ->

		{moosh, cursor} = @theatre

		mode = 's'

		moosh.onLeftDrag @containerNode
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


		moosh.onHover @containerNode
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

		@containerNode.scaleX @width / 1000

		@containerNode.x @x

		return
