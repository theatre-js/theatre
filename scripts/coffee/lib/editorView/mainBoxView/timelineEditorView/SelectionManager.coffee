array = require 'utila/scripts/js/lib/array'

module.exports = class SelectionManager

	constructor: (@timelineEditor) ->

		@selections = []

		@group = []

	include: (s) ->

		@selections.push s unless s in @selections

	exclude: (s) ->

		array.pluckOneItem @selections, s

		array.pluckOneItem @group, s

		s._beOffGroup()

	closeGroup: ->

		for s in @group

			s._beOffGroup()

		@group.length = 0

	startGroup: (firstSelection) ->

		do @closeGroup

		firstSelection._beInGroup()

		@group.push firstSelection

		for s in @selections

			continue if s is firstSelection

			s._beInGroup firstSelection

			@group.push s

		return

	takeOffGroup: (s) ->

		s._beOffGroup()

		array.pluckOneItem @group, s

		return