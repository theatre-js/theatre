Foxie = require 'foxie'
array = require 'utila/scripts/js/lib/array'
PropViewRepo = require './timelineView/PropViewRepo'

module.exports = class TimelineEditorView

	constructor: (@mainBox) ->

		@model = @mainBox.editor.model.timelineEditor

		@rootView = @mainBox.rootView

		@focusArea = @model.focusArea

		timeControlModel = @mainBox.editor.model.timeControl

		@duration = timeControlModel.duration

		timeControlModel.on 'duration-change', =>

			@duration = timeControlModel.duration

		@width = @mainBox.width

		@mainBox.on 'width-change', => @width = @mainBox.width

		@_repo = new PropViewRepo @

		@_currentProps = []

		do @_relayHorizontally

		do @_prepareNode

		do @_prepareListeners

		@_firstPropAdded = no

	_prepareListeners: ->

		@mainBox.on 'width-change', => do @_relayHorizontally

		@model.on 'focus-change', => do @_relayHorizontally

		@model.on 'prop-add', (propHolder) => @_add propHolder

		@model.on 'prop-remove', (propHolder) => @_remove propHolder

	_prepareNode: ->

		@node = Foxie('.theatrejs-timelineEditor').putIn(@mainBox.node)

		@node.node.addEventListener 'scroll', =>

			@model._setScrollTopFromUser @node.node.scrollTop

		@rootView.moosh.onMiddleDrag(@node)
		.withNoKeys()
		.onDown =>

			@rootView.cursor.use '-webkit-grabbing'
			@rootView.cursor.use '-moz-grabbing'

		.onDrag (e) =>

			@mainBox.seekbar._dragFocusBy -e.relX

		.onUp =>

			@rootView.cursor.free()

		@rootView.moosh.onClick(@node)
		.withNoKeys()
		.onDone (e) =>

			@mainBox.seekbar._seekToX e.layerX

		@rootView.moosh.onDrag(@node)
		.withNoKeys()
		.onDown =>

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			@mainBox.seekbar._seekToX e.layerX

		.onUp =>

			@rootView.cursor.free()

		@rootView.moosh.onWheel(@node)
		.withKeys('shift')
		.onWheel (e) =>

			@mainBox.seekbar._zoomFocus 1 + (-e.delta / 120 / 8), e.layerX

	_updateScrollTopFromModel: ->

		@node.node.scrollTop = @model.scrollTop|0

	_add: (propHolder) ->

		unless @_firstPropAdded

			setTimeout =>

				do @_updateScrollTopFromModel

			, 50

			@_firstPropAdded = yes


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

		x / @width * @duration

	_timeToX: (t) ->

		parseInt (t / @duration) * @width

