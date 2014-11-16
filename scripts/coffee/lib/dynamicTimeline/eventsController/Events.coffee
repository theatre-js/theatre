array = require 'utila/lib/array'
Event = require './events/Event'
_ChronologyContainer = require '../_ChronologyContainer'

module.exports = class Events extends _ChronologyContainer

	constructor: (@controller) ->

		@timeline = @controller.timeline

		super

	add: (typeId, t, arg) ->

		@_idCounter++

		id = @controller.id + '-event-' + @_idCounter

		e = new Event @, id, typeId, t, arg

		@_addEvent e

		e

	_addEvent: (e) ->

		@_emit 'new-event', e

		return

	done: ->

		super