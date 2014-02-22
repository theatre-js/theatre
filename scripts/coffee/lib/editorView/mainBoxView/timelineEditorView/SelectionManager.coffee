array = require 'utila/scripts/js/lib/array'

module.exports = class SelectionManager

	constructor: (@timelineEditor) ->

		@selections = []

		@group = []

		@_clipboard = []

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

	copyToClipboard: (props) ->

		@_clipboard = @_normalizeClipboard props

		return

	_normalizeClipboard: (props) ->

		smallest = Infinity

		for prop in props

			first = prop.items.points[0]

			if first?

				smallest = Math.min smallest, first.t

		for prop in props

			for item in prop.items.points

				item.t -= smallest

			for item in prop.items.connectors

				item.t -= smallest

		props

	paste: (s) ->

		return if @_clipboard.length is 0

		if @_clipboard.length is 1

			prop = @_clipboard[0]

			return if prop.items.points.length is 0

			s._pasteFromClipboard prop.items