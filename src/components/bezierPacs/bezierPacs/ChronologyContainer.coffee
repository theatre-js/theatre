PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class ChronologyContainer

	constructor: ->

		@events = new PipingEmitter

		###
		 * This is the list of our Points and Connectors, in sequence.
		 *
		 * @type {Array}
		###
		@_itemsInSequence = []

		###
		 * This is the map to all the objects recognized by this Pacs. Not all
		 * the items in this map will be in @_itemsInSequence, but all the @_itemsInSequence
		 * will be in this map.
		 *
		 * @type {Object}
		###
		@_ids = {}

		@_lastAssignedId = -1

	recognizeItem: (item) ->

		if item._pacs?

			throw Error "This item already is recognized by a Pacs, so it cannot be recognized by this pacs."

		if item._sequence?

			throw Error "This item is not recognized by any Pacs, but it is in a sequence."

		id = ++@_lastAssignedId

		@_ids[id] = item

		item._receiveRecognition this, id

		@events._emit 'item-recognition', item

		@

	unrecognizeItem: (item) ->

		unless item._pacs?

			throw Error "Cannot unrecognize this item because it doesn't have a Pacs. How did this happen btw?"

		if item._pacs isnt this

			throw Error "Cannot unrecognize this item because its Pacs isnt this Pacs."

		if item._sequence?

			throw Error "This item is still in sequence."

		@_ids[item._idInPacs] = null

		item._receiveUnrecognition()

		@events._emit 'item-unrecognition', item

		@

	putItemInSequence: (item) ->

		if item._pacs isnt this

			throw Error "This item is not recognized by this Pacs."

		if item._sequence?

			throw Error "This item is still in sequence."

		item._sequence = @_itemsInSequence

		item._fitInSequence()

		@

	takeItemOutOfSequence: (item) ->

		if item._pacs isnt this

			throw Error "This item is not recognized by this Pacs."

		if item._sequence isnt @_itemsInSequence

			throw Error "This item is not in this sequence."

		item._fitOutOfSequence()

		item._sequence = null

		@

	getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @_itemsInSequence

			break if item._time > t

			lastIndex = index

		lastIndex

	###*
	 * If there are two Items on that time (a point and a connector),
	 * returns the connector.
	 *
	 * @param  Float32 t time
	 * @return Item/undefined
	###
	getItemAfter: (t) ->

		@getItemByIndex @getIndexOfItemBeforeOrAt(t) + 1

	getItemBeforeOrAt: (t) ->

		@getItemByIndex @getIndexOfItemBeforeOrAt t

	getItemByIndex: (index) ->

		@_itemsInSequence[index]

	getItemIndex: (item) ->

		@_itemsInSequence.indexOf item

	getItemAt: (t) ->

		index = @getIndexOfItemBeforeOrAt t

		item = @getItemByIndex index

		return unless item?

		return unless item._time is t

		item

	itemExistsAt: (t) ->

		@getItemAt(t)?

	getItemBeforeItem: (item) ->

		index = @getItemIndex item

		@getItemByIndex index - 1

	getItemAfterItem: (item) ->

		index = @getItemIndex item

		@getItemByIndex index + 1

	injectItemOnIndex: (item, index) ->

		@_itemsInSequence.splice index, 0, item

		return

	pluckItemOn: (index) ->

		@_itemsInSequence.splice index, 1

		return

	pluckItem: (item) ->

		@pluckItemOn @getItemIndex item

		return

	getItemsInRange: (from, to) ->

		items = []

		for item in @_itemsInSequence

			break if item._time > to

			continue if item._time < from

			items.push item

		items