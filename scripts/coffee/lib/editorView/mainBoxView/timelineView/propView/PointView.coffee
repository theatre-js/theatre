Foxie = require 'foxie'
_ItemView = require './_ItemView'

module.exports = class PointView extends _ItemView

	constructor: (@prop, @model) ->

		super

		@x = 0

		@y = 0

		@clicks = @prop.clicks

		@pacs = @model.pacs

		@heightUsage = 0.7

		@model.on 'value-change', =>

			do @relayVertically

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

		@node.moveYTo @y

		return

	_prepareValueInputNode: ->

		@valueInput = Foxie('input.timeflow-timeline-prop-pacs-point-valueContainer').putIn @prop.pacsNode

		@valueInput.node.addEventListener 'keyup', =>

			@_setValue @valueInput.node.value

		do @_updateValue

	_moveValueInputX: ->

		@valueInput.moveXTo @x

		return

	_moveValueInputY: ->

		newY = @y

		if newY > 10

			newY -= 20

		else

			newY += 20

		@valueInput.moveYTo newY

		return

	_openValueInput: ->

		@valueInput.addClass 'visible'

		@valueInput.node.focus()

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

		@x = @_timeToX @model.t

		do @_moveNodeX

		do @_moveValueInputX

		return

	relayVertically: ->

		@y = @_valToY @model.value

		do @_moveNodeY

		do @_moveValueInputY

		return