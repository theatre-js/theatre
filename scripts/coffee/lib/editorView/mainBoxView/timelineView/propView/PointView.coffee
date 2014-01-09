Foxie = require 'foxie'
_ItemView = require './_ItemView'

module.exports = class PointView extends _ItemView

	constructor: (@prop, @model) ->

		super

		@x = 0

		@y = 0

		@moosh = @prop.moosh

		@pacs = @model.pacs

		@heightUsage = 0.7

		@model.on 'value-change', =>

			do @relayVertically

		@model.on 'handler-change', =>

			do @_moveHandlers

		@svgArea = @prop.svgArea

		do @_prepareNode

		do @_prepareHandlers

		do @_prepareValueInputNode

		do @relayHorizontally

		do @relayVertically

	_prepareNode: ->

		@node = Foxie('.timeflow-timeline-prop-pacs-point').putIn @prop.pacsNode

		window.n = @node

		@moosh.onClick @node, =>

			do @_activate

	_moveNode: ->

		@node.moveXTo @x

		@node.moveYTo @y

		return

	_prepareHandlers: ->

		@leftHandler = Foxie('.timeflow-timeline-prop-pacs-point-handler.left').putIn @node

		@leftHandlerLine = Foxie('svg:path').putIn(@svgArea.node)
		.attr('stroke', '#272727')
		.attr('stroke-width', '1px')
		.attr('fill', 'transparent')

		@rightHandlerLine = Foxie('svg:path').putIn(@svgArea.node)
		.attr('stroke', '#272727')
		.attr('stroke-width', '1px')
		.attr('fill', 'transparent')

		@rightHandler = Foxie('.timeflow-timeline-prop-pacs-point-handler.right').putIn @node

		do @_setupDragForRightHandler
		do @_setupDragForLeftHandler

	_setupDragForRightHandler: ->

		startX = startY = nextX = nextY = 0

		@moosh.onDrag(@rightHandler)

		.onDown =>

			startX = @rightHandler.getMovement().x
			startY = @rightHandler.getMovement().y

		.onUp =>

			@pacs.done()

		.onDrag (e) =>

			nextX = startX + e.absX
			nextY = startY + e.absY

			nextX = 0 if nextX < 0

			nextT = @_XToTime nextX
			nextVal = @_YToNormalizedVal nextY

			@model.setRightHandler nextT, nextVal

			@prop._tick()

		return

	_setupDragForLeftHandler: ->

		startX = startY = nextX = nextY = 0

		@moosh.onDrag(@leftHandler)

		.onDown =>

			startX = -@leftHandler.getMovement().x
			startY = @leftHandler.getMovement().y

		.onUp =>

			@pacs.done()

		.onDrag (e) =>

			nextX = startX - e.absX
			nextY = startY + e.absY

			nextX = 0 if nextX < 0

			nextT = @_XToTime nextX
			nextVal = @_YToNormalizedVal nextY

			@model.setLeftHandler nextT, nextVal

			@prop._tick()

		return

	_moveHandlers: ->

		@leftHandler.moveXTo @_timeToX -@model.leftHandler[0]
		@leftHandler.moveYTo @_normalizedValToY @model.leftHandler[1]

		@rightHandler.moveXTo @_timeToX @model.rightHandler[0]
		@rightHandler.moveYTo @_normalizedValToY @model.rightHandler[1]

		@leftHandlerLine.attr 'd',

			"M#{@x} #{@y} L " +
			"#{@_timeToX(@model.t - @model.leftHandler[0])} #{@_valToY(@model.value + @model.leftHandler[1])}"

		@rightHandlerLine.attr 'd',

			"M#{@x} #{@y} L " +
			"#{@_timeToX(@model.t + @model.rightHandler[0])} #{@_valToY(@model.value + @model.rightHandler[1])}"

	_prepareValueInputNode: ->

		@valueContainer = Foxie('.timeflow-timeline-prop-pacs-point-valueContainer').putIn @node

		@valueInput = Foxie('input').putIn @valueContainer

		@valueInput.node.addEventListener 'keyup', =>

			@_setValue @valueInput.node.value

		do @_updateValue

	_moveValueContainer: ->

		if @y > 90

			@valueContainer.removeClass 'hang'

		else

			@valueContainer.addClass 'hang'

		return

	_activate: ->

		@node.addClass 'active'

		@valueInput.node.focus()

		@moosh.onClickOutside @node, =>

			@node.removeClass 'active'

			return

		return

	_setValue: (newVal) ->

		newVal = Number newVal

		return unless Number.isFinite newVal

		@model.setValue newVal

		@pacs.done()

		@prop._tick()

		return

	_updateValue: ->

		@valueInput.node.value = @model.value

	relayHorizontally: ->

		@x = @_timeToX @model.t

		do @_moveNode

		do @_moveHandlers

		return

	relayVertically: ->

		@y = @_valToY @model.value

		do @_moveNode

		do @_moveValueContainer

		do @_moveHandlers

		return