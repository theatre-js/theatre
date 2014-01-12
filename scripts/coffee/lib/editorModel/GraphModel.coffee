CategoryModel = require './graphModel/CategoryModel'

module.exports = class GraphModel

	constructor: (@editor) ->

		@categories = {}

	getCategory: (name) ->

		unless @categories[name]?

			@categories[name] = cat = new CategoryModel @, name

		@categories[name]

	getCategories: ->

		@categories