Emitter = require 'utila/lib/Emitter
'

module.exports = class Model extends Emitter

	constructor: (@scrollableArea) ->

		super

		@focusStart = 0
		@focusLength = 2000

		@filledTimelineLength = 8000
		@timelineLength = 8000

	setTimeFocus: (start, length) ->

		@focusStart = +start
		@focusLength = +length

		@timelineLength = Math.max @focusStart + @focusLength, @filledTimelineLength

		@_emit 'timeFocus-change'