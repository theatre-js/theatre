_DynamicModel = require '../../_DynamicModel'
GuideModel = require './guidesManagerModel/GuideModel'
array = require 'utila/lib/array'

module.exports = class GuidesManagerModel extends _DynamicModel

	constructor: (@timelineEditor) ->

		@rootModel = @timelineEditor.editor

		@_serializedAddress = ['timelineEditor', 'guides']

		super

		@_list = []

	serialize: ->

		se = {}

		se._list = list = []

		for g in @_list

			list.push g.t

		se

	_loadFrom: (se) ->

		return unless se? and se._list? and Array.isArray se._list

		list = se._list

		for t in list

			@add t

		return

	add: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		array.injectInIndex @_list, index + 1, g = new GuideModel @, t

		@_emit 'new-guide', g

		do @_reportLocalChange

		@

	_remove: (g) ->

		array.pluckOneItem @_list, g

		do @_reportLocalChange

	_getIndexOfItemBeforeOrAt: (t) ->

		lastIndex = -1

		for item, index in @_list

			break if item.t > t

			lastIndex = index

		lastIndex

	toggle: (t) ->

		index = @_getIndexOfItemBeforeOrAt t

		if index is -1

			@add t

			return

		item = @_list[index]

		if item.t >= t - 50

			item.remove()

			return

		nextItem = @_list[index + 1]

		if nextItem? and nextItem.t <= t + 50

			nextItem.remove()

			return

		@add t

		return

	removeInRange: (from, to) ->

		guides = []

		for g in @_list

			guides.push g if from <= g.t <= to

		for g in guides

			g.remove()

		return