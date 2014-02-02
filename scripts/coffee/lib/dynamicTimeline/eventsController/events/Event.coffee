_Emitter = require '../../../_Emitter'

module.exports = class Event extends _Emitter

	constructor: (@events, @id, @typeId, @t, arg) ->

		super

		@_eventType = @events.controller.getType @typeId

		unless @_eventType?

			throw Error "Event type '#{@typeId}' doesn't exist"

		if @events._itemExistsAt @t

			throw Error "Another event sits at '#{@t}'"

		prevIndex = @events._getIndexOfItemBeforeOrAt @t

		index = prevIndex + 1

		@events._injectItemOn @, index

		next = @events._getItemByIndex index + 1

		@events._setUpdateRange @t, if next? then next.t else Infinity

		@_arg = null

		@_filteredArg = null

		@setArg arg

	# will return something other than yes if
	# the enw arg doesn't validate.
	#
	# the returned value is expected to be the
	# reason for invalidation, but since the user
	# writes the validator function, that might not
	# always be the case.
	setArg: (newArg) ->

		result = @_eventType.validate newArg

		return result unless result is yes

		@_filteredArg = @_eventType.filter result

		@_emit 'arg-changed'

		yes

	tickAt: (t, asLast) ->

		forward = t >= @t

		@_eventType.run forward, asLast, @t, t, @_filteredArg

		return