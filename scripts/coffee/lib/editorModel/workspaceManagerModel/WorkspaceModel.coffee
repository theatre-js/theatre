ActorPropModel = require '../graphModel/categoryModel/actorModel/ActorPropModel'
_Emitter = require '../../_Emitter'
array = require 'utila/scripts/js/lib/array'

module.exports = class WorkspaceModel extends _Emitter

	constructor: (@workspaceManager, @name) ->

		super

		@props = []

	rename: (newName) ->

		return if newName is @name

		if @workspaceManager._getListByName(newName)?

			throw Error "A workspace named '#{newName}' already exists"

		@name = newName

		@_emit 'rename'

		return

	remove: ->

		@workspaceManager._removeList @

		@_emit 'remove'

		@workspaceManager = null

		@name = 'REMOVED'

		return

	addProp: (prop) ->

		unless prop instanceof ActorPropModel

			throw Error "prop must be an instance of ActorPropModel"

		return if @props.indexOf(prop) isnt -1

		@props.push prop

		@_emit 'new-prop', prop

		return

	activate: ->

		do @workspaceManager._activate @

		return

	isPropListed: (prop) ->

		@props.indexOf(prop) isnt -1

	removeProp: (prop) ->

		index = @props.indexOf(prop)

		if index is -1

			throw Error "prop '#{prop.id}' is not in this workspace"

		array.pluck @props, index

		@_emit 'prop-remove', prop

		return

	togglePropListing: (prop) ->

		if @isPropListed prop

			@removeProp prop

		else

			@addProp prop

		return