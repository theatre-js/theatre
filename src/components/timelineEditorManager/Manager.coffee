Editor = require '../timelineEditor/Editor'

module.exports = class TimelineEditorManager

	constructor: (@theatre) ->

		@editors = {}

	addEditor: (name, editor) ->

		if @editors[name]?

			throw Error "A TimeloneEditor named '#{name}' already exists"

		editor ?= new Editor @, name

		@editors[name] = editor

		editor