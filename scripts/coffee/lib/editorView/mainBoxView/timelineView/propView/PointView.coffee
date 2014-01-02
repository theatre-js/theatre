Foxie = require 'foxie'

module.exports = class PointView

	constructor: (@prop, @model) ->

		@clicks = @prop.clicks

		@pacs = @model.pacs

		@model.on 'value-change', =>

			do @relayVertically

		@x = 0

		@y = 0

		do @_prepareNode

		do @_prepareValueInputNode

		do @relayHorizontally

		do @relayVertically

	_prepareNode: ->

		@node = Foxie('.timeflow-timeline-prop-pacs-point').putIn @prop.pacsNode

		@clicks.onClick @node, =>

			do @_openValueInput

	_moveNodeX: ->

		@node.moveXTo @x

		return

	_moveNodeY: ->

		@node.moveYTo -@y

		return

	_prepareValueInputNode: ->

		@valueInput = Foxie('input.timeflow-timeline-prop-pacs-point-valueContainer').putIn @prop.pacsNode

		@valueInput.node.addEventListener 'keyup', =>

			@_setValue @valueInput.node.value

		do @_updateValue

	_openValueInput: ->

		@valueInput.addClass 'visible'

		@clicks.onModalClosure @valueInput, =>

			@valueInput.removeClass 'visible'

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

		@x = @model.t * @prop._widthToTimeRatio

		do @_moveNodeX

		do @_moveValueInputX

		return

	_moveValueInputX: ->

		@valueInput.moveXTo @x

		return

	_moveValueInputY: ->

		newY = @y

		if newY < 10

			newY += 20

		else

			newY -= 20

		@valueInput.moveYTo -newY

		return

	relayVertically: ->

		baseVal = @model.value - @model.pacs.bottom

		@y = baseVal * @prop._heightToValueRatio

		do @_moveNodeY

		do @_moveValueInputY

		return