module.exports = class PacSelection

	constructor: (@pacs, @from, @to) ->

		@_items = @pacs.getItemsInRange @from, @to

		@empty = @_items.length is 0

