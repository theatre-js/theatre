array = require 'utila/scripts/js/lib/array'
ListModel = require './listManagerModel/ListModel'
_Emitter = require '../_Emitter'

module.exports = class ListManagerModel extends _Emitter

	constructor: (@editor) ->

		super

		@_lists = []

		@_propListingChangeListeners = {}

	getAll: ->

		@_lists

	get: (name) ->

		list = @_getListByName name

		unless list?

			@_lists.push list = new ListModel @, name

			@_emit 'new-list', list

		list

	_getListByName: (name) ->

		name = String name

		if name.length < 3

			throw Error "Wrong name '#{name}' for a list"

		for list in @_lists

			return list if list.name is name

		return

	_removeList: (list) ->

		array.pluckOneItem @_lists, list

		return

	onPropListingChange: (propModel, cb) ->

		unless @_propListingChangeListeners[propModel.id]?

			@_propListingChangeListeners[propModel.id] = [cb]

			return

		@_propListingChangeListeners[propModel.id].push cb

		return

	isPropListed: (propModel) ->

	togglePropListing: (propModel) ->

