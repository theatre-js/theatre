EditorModel = require './EditorModel'

module.exports = class EditorView

	constructor: (@id) ->

		@editorModel = new EditorModel @id

		@_prepared = no

	prepare: ->

		if @_prepared

			throw Error "Already prepared"

		@_prepared = yes

