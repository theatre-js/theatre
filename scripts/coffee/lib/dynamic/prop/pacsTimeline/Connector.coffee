array = require 'utila/scripts/js/lib/array'

_PacsTimelineItem = require './_PacsTimelineItem'

module.exports = class Connector extends _PacsTimelineItem

	constructor: (@prop, @t, @id) ->

		super

	isConnector: -> yes

	isPoint: -> no

	remove: ->

		@prop._setUpdateRange @getLeftPoint().t, @getRightPoint().t

		array.pluck @prop.timeline, @getIndex()

		@_remove()

		return

		return

	_remove: ->

		@_fire 'remove'

		return

	getIndex: ->

		@prop.getItemIndex @

	getLeftPoint: ->

		@prop.getItemByIndex(@getIndex() - 1)

	getRightPoint: ->

		@prop.getItemByIndex(@getIndex() + 1)