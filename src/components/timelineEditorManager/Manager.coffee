Editor = require '../timelineEditor/Editor'

module.exports = class TimelineEditorManager

	constructor: (@theatre) ->

		@boxes = {}

	addEditor: (name, box) ->

		if @boxes[name]?

			throw Error "A TimeloneEditor named '#{name}' already exists"

		box ?= new Editor @, name

		@boxes[name] = box

		box