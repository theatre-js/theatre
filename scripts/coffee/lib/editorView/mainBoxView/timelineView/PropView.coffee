Foxie = require 'foxie'
array = require 'utila/scripts/js/lib/array'
SvgArea = require './propView/SvgArea'
PointView = require './propView/PointView'
ConnectorView = require './propView/ConnectorView'

module.exports = class PropView

	constructor: (@repo, @propModel) ->

		@timeline = @repo.timeline

		@rootView = @timeline.rootView

		@id = @propModel.id

		@timeFlowProp = @propModel.timeFlowProp

		@pacs = @timeFlowProp.pacs

		@pacs.on 'peak-and-bottom-change', => do @_relayVertically

		@_items = []

		@rootView.moosh = @repo.timeline.mainBox.editor.moosh

		@_expanded = no

		@_propHolderModel = null

		@_widthToTimeRatio = 0

		@_heightToValueRatio = 0

		@_height = 0

		do @_prepareNodes

		@svgArea = new SvgArea @

		do @_prepareHypothericalConnector

		do @_preparePacs

		setTimeout =>

			do @_relayVertically

			do @relayHorizontally

		, 0

	_setPropHolderModel: (@_propHolderModel) ->

		@_setExpansion @_propHolderModel.isExpanded()

	_prepareNodes: ->

		@node = Foxie '.timeflow-timeline-prop'

		@rootView.moosh.onHover(@node)
		.withKeys('ctrl')
		.onEnter (e) =>

			@rootView.cursor.use 'none'

			@hypotheticalPointNode
			.moveXTo(e.layerX)
			.moveYTo(e.layerY - 16)

		.onMove (e) =>

			@hypotheticalPointNode
			.moveXTo(e.layerX)
			.moveYTo(e.layerY - 16)

		.onLeave =>

			@rootView.cursor.free()

			@hypotheticalPointNode.moveTo(-1000, -1000, 1)

		@rootView.moosh.onClick(@node)
		.withKeys('ctrl')
		.onUp (e) =>

			t = @timeline._XToFocusedTime e.layerX
			val = @_YToVal e.layerY - parseInt(@pacsNode.computedStyle('top'))

			@pacs.addPoint t, val, val * 0.1, val * 0.1, val * 0.1, val * 0.1

		do @_prepareInfoNodes

		do @_preparePacsNodes

		@hypotheticalPointNode = Foxie('.timeflow-timeline-prop-pacs-hypotheticalPoint')
		.putIn(@pacsNode)
		.moveTo(-1000, -1000, 1)

	_prepareHypothericalConnector: ->

		@hypotheticalConnector = Foxie('svg:path').putIn(@svgArea.node)
		.attr('stroke', '#999')
		.attr('stroke-width', '3px')
		.attr('fill', 'transparent')

	hideHypotheticalConnector: ->

		@hypotheticalConnector
		.attr('d', 'M 0 0')

	drawHypotheticalConnector: (fromT, fromVal, toT, toVal) ->

		@hypotheticalConnector.attr 'd',

			"M#{@_timeToX(fromT)} #{@_valToY(fromVal)} L " +
			"#{@_timeToX(toT)} #{@_valToY(toVal)}"

		return

	_prepareInfoNodes: ->

		@info = Foxie('.timeflow-timeline-prop-info').putIn @node

		@rootView.moosh.onClick(@info)
		.withNoKeys()
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

	_removeItem: (item) ->

		array.pluckOneItem @_items, item

		return

	_tick: ->

		@timeline._tick()

		return

	_timeToX: (t) ->

		t * @_widthToTimeRatio

	_XToTime: (x) ->

		x / @_widthToTimeRatio

	_valToY: (v) ->

		@_normalizeY @_normalizeValue(v) * @_heightToValueRatio

	_YToVal: (y) ->

		@_unnormalizeValue @_unnormalizeY(y) / @_heightToValueRatio

	_normalizedValToY: (v) ->

		-v * @_heightToValueRatio

	_YToNormalizedVal: (y) ->

		-y / @_heightToValueRatio

	_normalizeValue: (value) ->

		value - @pacs.bottom

	_unnormalizeValue: (normalizedValue) ->

		normalizedValue + @pacs.bottom

	_normalizeY: (y) ->

		@_height - y

	_unnormalizeY: (normalizedY) ->

		@_height - normalizedY