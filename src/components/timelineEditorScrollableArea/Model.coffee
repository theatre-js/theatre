PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class Model

	constructor: (@scrollableArea) ->
		@events = new PipingEmitter
		@focusStart = 0
		@focusLength = 2000
		@filledTimelineLength = 8000
		@timelineLength = 8000

	setTimeFocus: (start, length) ->
		@focusStart = +start
		@focusLength = +length
		@timelineLength = Math.max @focusStart + @focusLength, @filledTimelineLength
		@events._emit 'timeFocus-change'