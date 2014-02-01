Events = require './eventController/Events'
_TimelineRow = require './_TimelineRow'

module.exports = class EventController extends _TimelineRow

	constructor: ->

		@_serializedAddress = ['timeline', '_eventControllers', @id]

		super

		@_types = {}

		@events = new Events @

	_tickForward: (t) ->

	_tickBackward: (t) ->

	defineType: (typeName, cb) ->

		if @_types[typeName]?

			throw Error "An event-type named '#{typeName}' already exists"

		@_types[typeName] = cb

		@