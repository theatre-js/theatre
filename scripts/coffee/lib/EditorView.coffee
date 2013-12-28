GraphView = require './editorView/GraphView'
EditorModel = require './EditorModel'
TimelineView = require './editorView/TimelineView'
ControlsView = require './editorView/ControlsView'
StupidClickManager = require './tools/StupidClickManager'
StupidKeyboardManager = require './tools/StupidKeyboardManager'

module.exports = class EditorView

	constructor: (@id, @parentNode) ->

		@model = new EditorModel @id

		do @_prepareNode

		@clicks = new StupidClickManager @node

		@keys = new StupidKeyboardManager

		@graph = new GraphView @

		@timeline = new TimelineView @

		@controls = new ControlsView @

		@_prepared = no

	tick: (t) =>

		@model._tick t

		return

	_prepareNode: ->

		@node = document.createElement 'div'

		@node.classList.add 'timeflow'

		return

	prepare: ->

		if @_prepared

			throw Error "Already prepared"

		@parentNode.appendChild @node

		do @graph.prepare

		@_prepared = yes

