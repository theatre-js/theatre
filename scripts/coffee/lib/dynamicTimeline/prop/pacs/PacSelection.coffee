module.exports = class PacSelection

	constructor: (@pacs, @from, @to) ->

		@_items = @pacs.getItemsInRange @from, @to

		@empty = @_items.length is 0

		@realFrom = @from

		@realTo = @to

		unless @empty

			@realFrom = @_items[0].t

			@realTo = @_items[@_items.length - 1].t

