EditorModel = require './EditorModel'
StructureView = require './editorView/StructureView'

module.exports = class EditorView

	constructor: (@id, @parentNode) ->

		@editorModel = new EditorModel @id

		do @_prepareNode

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

