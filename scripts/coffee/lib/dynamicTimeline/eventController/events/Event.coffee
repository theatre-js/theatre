module.exports = class Event

	constructor: (@events, @id, @typeName, @t, @arg) ->

		if @events._itemExistsAt @t

			throw Error "Another event sits at '#{@t}'"

		prevIndex = @events._getIndexOfItemBeforeOrAt @t

		index = prevIndex + 1

		@events._injectItemOn @, index

		next = @events._getItemByIndex index + 1

		@events._setUpdateRange @t, if next? then next.t else Infinity