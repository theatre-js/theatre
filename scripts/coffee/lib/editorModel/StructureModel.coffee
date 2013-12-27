CategoryModel = require './structureModel/CategoryModel'

module.exports = class StructureModel

	constructor: (@editor) ->

		@categories = {}

	getCategory: (name) ->

		unless @categories[name]?

			@categories[name] = cat = new CategoryModel @, name

		@categories[name]

	getCategories: ->

		@categories