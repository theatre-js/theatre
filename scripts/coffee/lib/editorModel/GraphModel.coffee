CategoryModel = require './graphModel/CategoryModel'

module.exports = class GraphModel

	constructor: (@editor) ->

		@categories = {}

	serialize: ->

		se = {}

		se.categories = categories = {}

		for name, cat of @categories

			categories[name] = cat.serialize()

		se

	getCategory: (name) ->

		unless @categories[name]?

			@categories[name] = cat = new CategoryModel @, name

		@categories[name]

	getCategories: ->

		@categories