ViewProp = require '../structure/category/actor/ViewProp'

module.exports = class List

	constructor: (@listManager, @name) ->

		@props = []

	rename: (newName) ->

		return if newName is @name

		if @listManager._getListByName(newName)?

			throw Error "A list named '#{newName}' already exists"

		@name = newName

		return

	remove: ->

		@listManager._removeList @

		@listManager = null

		@name = 'REMOVED'

		return

	addProp: (prop) ->

		unless prop instanceof ViewProp

			throw Error "prop must be an instance of ViewProp"

		return if @props.indexOf(prop) isnt -1

		@props.push prop

		return