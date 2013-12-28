EditorModel = require './EditorModel'
TimelineView = require './editorView/TimelineView'
GraphView = require './editorView/GraphView'
StupidClickManager = require './editorView/StupidClickManager'

module.exports = class EditorView

	constructor: (@id, @parentNode) ->

		@model = new EditorModel @id

		do @_prepareNode

		@clicks = new StupidClickManager @node

		@graph = new GraphView @

		@timeline = new TimelineView @

		@_prepared = no

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

