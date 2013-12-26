Category = require './structure/Category'

module.exports = class Structure

	constructor: (@model) ->

		@categories = {}

	getCategory: (name) ->

		unless @categories[name]?

			@categories[name] = new Category @, name

		@categories[name]

	getCategories: ->

		@categories