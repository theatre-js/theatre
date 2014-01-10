Foxie = require 'foxie'

module.exports = class Selection

	constructor: (@prop) ->

		@rootView = @prop.rootView

		@_from = 0
		@_to = 0
		@_selected = no

		do @_prepareNode

		do @_prepareInteractions

	_prepareNode: ->

		@node = Foxie('.timeflow-timeline-prop-selection')
		.putIn(@prop.pacsNode)
		.moveX(-5000)

	_prepareInteractions: ->

		do @_prepareSelectInteraction
		do @_prepareDeselectInteraction

	_prepareDeselectInteraction: ->

		@rootView.moosh.onClick(@prop.node)
		.withNoKeys()
		.onUp =>

			do @_deselect

	_prepareSelectInteraction: ->

		start = 0

		@rootView.moosh.onDrag(@prop.node)
		.withKeys('shift')
		.onDown (e) =>

			# start =

			@_select

		.onDrag (e) ->

			console.log 'dragging'

		.onUp ->

			console.log 'up'

	_deselect: ->

		@_selected = no

		do @_hide

	_hide: ->

		@node.moveX(-5000)

	_show: ->

		@node.moveX(0)

