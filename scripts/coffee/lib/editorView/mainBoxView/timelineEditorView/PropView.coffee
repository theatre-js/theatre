Foxie = require 'foxie'
array = require 'utila/lib/array'
SvgArea = require './propView/SvgArea'
Selection = require './propView/Selection'
PointView = require './propView/PointView'
ConnectorView = require './propView/ConnectorView'

module.exports = class PropView

	constructor: (@repo, @propModel) ->

		@timelineEditor = @repo.timelineEditor

		@rootView = @timelineEditor.rootView

		@id = @propModel.id

		@timelineProp = @propModel.timelineProp

		@pacs = @timelineProp.pacs

		@pacs.on 'peak-and-bottom-change', => do @_relayVertically

		@_items = []

		@rootView.moosh = @repo.timelineEditor.mainBox.editor.moosh

		@_expanded = null

		@_propHolderModel = null

		@_widthToTimeRatio = 0

		@_heightToValueRatio = 0

		@_lastPeak = 0

		@_lastBottom = 0

		@_height = 0

		do @_prepareNodes

		do @_prepareInteractions

		@selection = new Selection @

		@svgArea = new SvgArea @

		do @_prepareHypothericalConnector

		do @_preparePacs

		setTimeout =>

			do @_relayVertically

			do @relayHorizontally

		, 5

	_setPropHolderModel: (@_propHolderModel) ->

		@_propHolderModel.removeAllListeners()

		@_propHolderModel.on 'expansion-toggle', =>

			do @_updateExpansion

		do @_updateExpansion

		@_propHolderModel.on 'height-change', =>

			do @_updateHeight

		do @_updateHeight

	_prepareNodes: ->

		@node = Foxie '.theatrejs-timelineEditor-prop.shouldTransition'

		@resizer = Foxie('.theatrejs-timelineEditor-prop-resizer').putIn(@node)

		do @_prepareInfoNodes

		do @_preparePacsNodes

	_prepareInteractions: ->

		top = parseInt(@pacsNode.computedStyle('top')) || 0

		@rootView.moosh.onHover(@node)
		.withKeys('ctrl+shift')
		.onEnter (e) =>

			@rootView.cursor.use 'none'

			@hypotheticalPointNode
			.moveXTo(e.layerX)
			.moveYTo(e.layerY - top)

		.onMove (e) =>

			t = @timelineEditor._XToFocusedTime e.layerX
			x = @timelineEditor._timeToX t

			@hypotheticalPointNode
			.moveXTo(x)
			.moveYTo(e.layerY - top)

		.onLeave =>

			@rootView.cursor.free()

			@hypotheticalPointNode.moveTo(-1000, -1000, 1)

		@rootView.moosh.onClick(@node)
		.withKeys('ctrl+shift')
		.onUp (e) =>

			t = @timelineEditor._XToFocusedTime e.layerX
			val = @_YToVal e.layerY - top

			@pacs.addPoint t, val, 100, val * 0.1, 100, val * 0.1

			@pacs.done()

		@hypotheticalPointNode = Foxie('.theatrejs-timelineEditor-prop-pacs-hypotheticalPoint')
		.putIn(@pacsNode)
		.moveTo(-1000, -1000, 1)

		@rootView.moosh.onDrag(@resizer)
		.withNoKeys()
		.onDown (e) =>

			unless @_propHolderModel.isExpanded()

				e.cancel()

				return

			@node.removeClass 'shouldTransition'

		.onUp =>

			@node.addClass 'shouldTransition'

			do @_relayVertically

		.onDrag (e) =>

			@_propHolderModel.setHeight @_propHolderModel.getHeight() + e.relY

		@rootView.moosh.onMiddleClick @node
		.withKeys('ctrl')
		.onUp =>

			do @_showPropOptions

	_showPropOptions: ->

		@rootView.chooser.choose @propModel.name, [
			'Paste'
		], (did, choice) =>

			return unless did

			switch choice

				when 'Paste'

					@selection.paste()

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

			"M#{@timelineEditor._timeToX(fromT)} #{@_valToY(fromVal)} L " +
			"#{@timelineEditor._timeToX(toT)} #{@_valToY(toVal)}"

		return

	_prepareInfoNodes: ->

		@info = Foxie('.theatrejs-timelineEditor-prop-info').putIn @node

		@rootView.moosh.onClick(@info)
		.withNoKeys()
		.onDone (e) =>

			e.preventDefault()

			@_propHolderModel.toggleExpansion()

		@rootView.moosh.onDrag(@info)
		.withNoKeys()
		.onDrag (e) =>

			if e.relX <= -20

				e.cancel()

				@_propHolderModel.removeFromWorkspace()

			else if e.relY <= -20

				e.cancel()

				@_propHolderModel.shiftUp()

			else if e.relY >= 20

				e.cancel()

				@_propHolderModel.shiftDown()

			return

		@catName = Foxie('.theatrejs-timelineEditor-prop-info-catName').putIn @info
		@catName.node.innerHTML = @propModel.actor.group.name

		@actorName = Foxie('.theatrejs-timelineEditor-prop-info-actorName').putIn @info
		@actorName.node.innerHTML = @propModel.actor.name

		@propName = Foxie('.theatrejs-timelineEditor-prop-info-propName').putIn @info
		@propName.node.innerHTML = @propModel.name

	_preparePacsNodes: ->

		@pacsContainer = Foxie('.theatrejs-timelineEditor-prop-pacsContainer').putIn @node

		@pacsNode = Foxie('.theatrejs-timelineEditor-prop-pacs').putIn @pacsContainer

	attach: ->

		@selection.attach()

		@node.putIn @timelineEditor.node

		return

	detach: ->

		@selection.detach()

		@node.remove()

		return

	_updateExpansion: ->

		expanded = @_propHolderModel.isExpanded()

		return if expanded is @_expanded

		@_expanded = expanded

		if @_expanded

			@node.addClass('expanded').removeClass('not-expanded')

		else

			@node.removeClass('expanded').addClass('not-expanded')

		return

	_updateHeight: ->

		nodeHeight = @_propHolderModel.getHeight()

		return if nodeHeight - 40 is @_height

		@_height = nodeHeight - 40

		@node.css 'height', nodeHeight + 'px'

		return

	relayHorizontally: ->

		newRatio = @timelineEditor._widthToTimeRatio

		if newRatio isnt @_widthToTimeRatio

			@_widthToTimeRatio = newRatio

			@svgArea.relayHorizontally()

			for item in @_items

				do item.relayHorizontally

			@selection.relayHorizontally()

		@_shiftViewToTime @timelineEditor.focusArea.from

		return

	_shiftViewToTime: (t) ->

		newPos = @timelineEditor._timeToX t

		@pacsNode.moveXTo -newPos

		return

	_relayVertically: ->

		valDiff = @pacs.peak - @pacs.bottom

		newRatio = @_height / valDiff

		return if @pacs.peak is @_lastPeak and @pacs.bottom is @_lastBottom and newRatio is @_heightToValueRatio

		@_lastPeak = @pacs.peak

		@_lastBottom = @pacs.bottom

		@_heightToValueRatio = newRatio

		@svgArea.relayVertically()

		for item in @_items

			item.relayVertically()

		return

	_preparePacs: ->

		for item in @pacs.chronology

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

		@timelineEditor._tick()

		return

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