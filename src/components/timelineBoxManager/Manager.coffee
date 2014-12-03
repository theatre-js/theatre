Box = require '../timelineBox/Box'

module.exports = class TimelineBoxManager

	constructor: (@theatre) ->

		@boxes = {}

	addBox: (name, box) ->

		if @boxes[name]?

			throw Error "A TimeloneBox named '#{name}' already exists"

		box ?= new Box @, name

		@boxes[name] = box

		box