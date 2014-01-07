Foxie = require 'foxie'
PointView = require './propView/PointView'
ConnectorView = require './propView/ConnectorView'
SvgArea = require './propView/SvgArea'

module.exports = class PropView

	constructor: (@repo, @propModel) ->

		@timeline = @repo.timeline

		@id = @propModel.id

		@timeFlowProp = @propModel.timeFlowProp

		@pacs = @timeFlowProp.pacs

		@pacs.on 'peak-and-bottom-change', => do @_relayVertically

		@_items = []

		@clicks = @repo.timeline.mainBox.editor.clicks

		@_expanded = no

		@_propHolderModel = null

		@_widthToTimeRatio = 0

		@_heightToValueRatio = 0

		@_height = 0

		do @_prepareNodes

		@svgArea = new SvgArea @

		do @_preparePacs

		setTimeout =>

			do @_relayVertically

			do @relayHorizontally

		, 0

	_setPropHolderModel: (@_propHolderModel) ->

		@_setExpansion @_propHolderModel.isExpanded()

	_prepareNodes: ->

		@node = Foxie '.timeflow-timeline-prop'

		do @_prepareInfoNodes

		do @_preparePacsNodes

	_prepareInfoNodes: ->

		@info = Foxie('.timeflow-timeline-prop-info').putIn @node

		@clicks.onClick(@info)
		.onDone =>

			@_setExpansion @_propHolderModel.toggleExpansion()

		@catName = Foxie('.timeflow-timeline-prop-info-catName').putIn @info
		@catName.node.innerHTML = @propModel.actor.category.name

		@actorName = Foxie('.timeflow-timeline-prop-info-actorName').putIn @info
		@actorName.node.innerHTML = @propModel.actor.name

		@propName = Foxie('.timeflow-timeline-prop-info-propName').putIn @info
		@propName.node.innerHTML = @propModel.name

	_preparePacsNodes: ->

		@pacsContainer = Foxie('.timeflow-timeline-prop-pacsContainer').putIn @node

		@pacsNode = Foxie('.timeflow-timeline-prop-pacs').putIn @pacsContainer

	attach: ->

		@node.putIn @timeline.node

		return

	detach: ->

		@node.remove()

		return

	_setExpansion: (expanded) ->

		return if expanded is @_expanded

		@_expanded = expanded

		if @_expanded

			@node.addClass 'expanded'

		else

			@node.removeClass 'expanded'

		return

	relayHorizontally: ->

		width = @timeline.horizontalSpace

		newRatio = width / @timeline.focusArea.duration

		if newRatio isnt @_widthToTimeRatio

			@_widthToTimeRatio = newRatio

			@svgArea.relayHorizontally()

			for item in @_items

				do item.relayHorizontally

		@_shiftViewToTime @timeline.focusArea.from

		return

	_shiftViewToTime: (t) ->

		newPos = t * @_widthToTimeRatio

		@pacsNode.moveXTo -newPos

		return

	_relayVertically: ->

		height = @pacsNode.node.clientHeight

		return if height < 30

		@_height = height

		valDiff = @pacs.peak - @pacs.bottom

		newRatio = height / valDiff

		return if newRatio is @_heightToValueRatio

		@_heightToValueRatio = newRatio

		@svgArea.relayVertically()

		for item in @_items

			item.relayVertically()

		return

	_preparePacs: ->

		for item in @pacs.timeline

			if item.isPoint()

				@_addPoint item

			else

				@_addConnector item

		@pacs.on 'new-point', (point) =>

			@_addPoint point

			return

		@pacs.on 'new-connector', (connector) =>

			@_addConnector connector

			return

		return

	_addPoint: (point) ->

		pointView = new PointView @, point

		@_items.push pointView

		return

	_addConnector: (connector) ->

		connectorView = new ConnectorView @, connector

		@_items.push connectorView

		return

	_tick: ->

		@timeline._tick()

		return