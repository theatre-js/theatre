Box = require './Box'

module.exports = class TimelineBoxManager

	constructor: (@theatre) ->

		@boxes = {}

		do @_initDefaultBox

	_initDefaultBox: ->

		@boxes['default'] = new Box @, 'default'