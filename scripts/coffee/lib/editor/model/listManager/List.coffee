ViewProp = require '../structure/category/actor/ViewProp'
_Emitter = require '../../../_Emitter'

module.exports = class List extends _Emitter

	constructor: (@listManager, @name) ->

		super

		@props = []

	rename: (newName) ->

		return if newName is @name

		if @listManager._getListByName(newName)?

			throw Error "A list named '#{newName}' already exists"

		@name = newName

		@_emit 'rename'

		return

	remove: ->

		@listManager._removeList @

		@_emit 'remove'

		@listManager = null

		@name = 'REMOVED'

		return

	addProp: (prop) ->

		unless prop instanceof ViewProp

			throw Error "prop must be an instance of ViewProp"

		return if @props.indexOf(prop) isnt -1

		@props.push prop

		@_emit 'new-prop', prop

		return