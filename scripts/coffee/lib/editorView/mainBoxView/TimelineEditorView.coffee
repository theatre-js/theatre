Foxie = require 'foxie'
array = require 'utila/scripts/js/lib/array'
PropViewRepo = require './timelineView/PropViewRepo'

module.exports = class TimelineEditorView

	constructor: (@mainBox) ->

		@model = @mainBox.editor.model.timelineEditor

		@rootView = @mainBox.rootView

		@focusArea = @model.focusArea

		timeControlModel = @mainBox.editor.model.timeControl

		@timelineLength = timeControlModel.timelineLength

		timeControlModel.on 'length-change', =>

			@timelineLength = timeControlModel.timelineLength

		@width = @mainBox.width

		@mainBox.on 'width-change', => @width = @mainBox.width

		@_repo = new PropViewRepo @

		@_currentProps = []

		do @_relayHorizontally

		do @_prepareNode

		do @_prepareListeners

	_prepareListeners: ->

		@mainBox.on 'width-change', => do @_relayHorizontally

		@model.on 'focus-change', => do @_relayHorizontally

		@model.on 'prop-add', (propHolder) => @_add propHolder

		@model.on 'prop-remove', (propHolder) => @_remove propHolder

	_prepareNode: ->

		@node = Foxie('.theatrejs-timeline').putIn(@mainBox.node)

		@mainBox.seekbar

		@rootView.moosh.onMiddleDrag(@node)
		.withNoKeys()
		.onDown =>

			@rootView.cursor.use '-webkit-grabbing'

		.onDrag (e) =>

			@mainBox.seekbar._dragFocusBy -e.relX

		.onUp =>

			@rootView.cursor.free()

		@rootView.moosh.onClick(@node)
		.withNoKeys()
		.repeatedBy(2)
		.onDone (e) =>

			@mainBox.seekbar._seekToX e.layerX

		@rootView.moosh.onWheel(@node)
		.withKeys('shift')
		.onWheel (e) =>

			@mainBox.seekbar._zoomFocus 1 + (-e.delta / 120 / 8), e.layerX

	_add: (propHolder) ->

		propView = @_repo.getPropViewFor propHolder

		@_currentProps.push propView

		do propView.attach

		return

	_remove: (propHolder) ->

		console.log propHolder

		for propView in @_currentProps

			if propView.id is propHolder.id

				propViewToRemove = propView

		unless propViewToRemove?

			throw Error "Couldn't find prop '#{propHolder.id}' in the current props list"

		array.pluckOneItem @_currentProps, propViewToRemove

		do propViewToRemove.detach

		return

	_relayHorizontally: ->

		@horizontalSpace = @mainBox.width

		prop.relayHorizontally() for prop in @_currentProps

		return

	_tick: ->

		@model.tick()

		return

	_timeToFocusedX: (t) ->

		parseInt @width * (t - @focusArea.from) / @focusArea.duration

	_XToFocusDuration: (x) ->

		x / @width * @focusArea.duration

	_XToFocusedTime: (x) ->

		@_XToFocusDuration(x) + @focusArea.from

	_XToTime: (x) ->

		x / @width * @timelineLength

	_timeToX: (t) ->

		parseInt (t / @timelineLength) * @width

