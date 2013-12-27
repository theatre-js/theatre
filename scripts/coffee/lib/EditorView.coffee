EditorModel = require './EditorModel'
StructureView = require './editorView/StructureView'
StupidClickManager = require './editorView/StupidClickManager'

module.exports = class EditorView

	constructor: (@id, @parentNode) ->

		@editorModel = new EditorModel @id

		do @_prepareNode

		@clicks = new StupidClickManager @node

		@_structureView = new StructureView @

		@_prepared = no

	_prepareNode: ->

		@node = document.createElement 'div'

		@node.classList.add 'timeflow'

		return

	prepare: ->

		if @_prepared

			throw Error "Already prepared"

		@parentNode.appendChild @node

		do @_structureView.prepare

		@_prepared = yes

