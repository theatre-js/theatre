module.exports = class ChronologyContainer

	constructor: ->

		@itemsInOrder = []

		@allItems = {}

		@lastId = -1

	recognizeItem: (item) ->

		if item._idInChronologyContainer isnt null

			throw Error "Item hasn't been unrecognized from its ChronologyContainer, therefore it cannot be recognized in this ChronologyContainer"

		@lastId++

		item._idInChronologyContainer = @lastId

		@allItems[@lastId] = item

		#Todo: emit()

		@

	unrecognizeItem: (item) ->

		if item._idInChronologyContainer is null

			throw Error "Item cannot be unrecognized because its Item._idInChronologyContainer is null. How did this happen btw?"

		@allItems[item._idInChronologyContainer] = null

		@item._idInChronologyContainer = null

		#Todo: emit()

		@

	getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @itemsInOrder

			break if item.t > t

			lastIndex = index

		lastIndex

	getItemByIndex: (index) ->

		@itemsInOrder[index]

	getItemIndex: (item) ->

		@itemsInOrder.indexOf item

	getItemAt: (t) ->

		index = @getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return unless item?

		return unless item.t is t

		item

	itemExistsAt: (t) ->

		@getItemAt(t)?

	injectItemOn: (item, index) ->

		array.injectInIndex @itemsInOrder, index, item

		return

	pluckItemOn: (index) ->

		array.pluck @itemsInOrder, index

		return

	getItemsInRange: (from, to) ->

		items = []

		for item in @itemsInOrder

			break if item.t > to

			continue if item.t < from

			items.push item

		items