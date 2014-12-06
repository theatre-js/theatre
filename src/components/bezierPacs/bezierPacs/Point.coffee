Item = require './Item'
clamp = require 'utila/lib/math/clamp'

module.exports = class Point extends Item

	constructor: ->

		super

		@_value = 0

		@_leftHandler = new Float32Array 2
		@_rightHandler = new Float32Array 2

		@_leftConnector = null
		@_rightConnector = null

	setValue: (v) ->

		#TODO: validate
		@_value = +v

		#TODO: emit

		@

	getValue: ->

		@_value

	setTime: (t) ->

		unless @_sequence?

			@_time = +t

		else

			before = @_pacs.getItemBeforeItem this

			leftConfinement = if before? then before._time else -Infinity

			after = @_pacs.getItemAfterItem this

			unless after?

				rightConfinement = Infinity

			else if after.isPoint()

				rightConfinement = after._time

			else

				rightConnector = after

				after = @_pacs.getItemAfterItem rightConnector

				rightConfinement = after._time

			unless leftConfinement < t < rightConfinement

				throw Error "Cannot move Point outside its neighbors` boundries. Get the point off sequence before moving it in time."

			@_time = +t

			if before?.isConnector()

				before.reactToChangesInRightPoint()

			if rightConnector?

				rightConnector.reactToChangesInLeftPoint()

		@events._emit 'time-change', t

		@

	setLeftHandler: (x, y) ->

		@_leftHandler[0] = clamp +x, 0, 1
		@_leftHandler[1] = +y

		@events._emit 'leftHandler-change'
		@getLeftConnector()?.reactToChangesInRightPoint()

		@

	setRightHandler: (x, y) ->

		@_rightHandler[0] = clamp +x, 0, 1
		@_rightHandler[1] = +y

		@events._emit 'rightHandler-change'
		@getRightConnector()?.reactToChangesInLeftPoint()

		@

	_fitInSequence: ->

		beforeIndex = @_pacs.getIndexOfItemBeforeOrAt @_time

		myIndex = beforeIndex + 1

		if myIndex is 0

			changeFrom = -Infinity

		else

			beforeItem = @_pacs.getItemByIndex beforeIndex

			if beforeItem.isPoint()

				changeFrom = @_time

			else

				throw Error "Point cannot fit where a connector already exists.
					Remove the connector, put the point in sequence, and then restore
					the connector if necessary"

		afterItem = @_pacs.getItemByIndex myIndex

		unless afterItem?

			changeTo = Infinity

		else if afterItem.isPoint()

			changeTo = afterItem._time

		else

			throw Error "Point cannot fit where a connector already exists.
				Remove the connector, put the point in sequence, and then restore
				the connector if necessary"

		@_pacs.injectItemOnIndex this, myIndex

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'inSequnce'

	_fitOutOfSequence: ->

		if @_leftConnector?

			throw Error "Cannot fit out of sequence when already connected to the left."

		if @_rightConnector?

			throw Error "Cannot fit out of sequence when already connected to the right."

		before = @_pacs.getItemBeforeItem this
		after = @_pacs.getItemAfterItem this

		changeFrom = if before? then @_time else -Infinity

		changeTo = if after? then after._time else Infinity

		@_pacs.pluckItem this

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'outOfSequence'

	isPoint: ->

		yes

	isConnector: ->

		no

	getLeftConnector: ->

		@_leftConnector

	getRightConnector: ->

		@_rightConnector

	_setLeftConnector: (@_leftConnector) ->

		@events._emit 'connectionToLeft', @_leftConnector

	_unsetLeftConnector: ->

		@events._emit 'disconnectionFromLeft'

		@_leftConnector = null

	_setRightConnector: (@_rightConnector) ->

		@events._emit 'connectionToRight', @_rightConnector

	_unsetRightConnector: ->

		@events._emit 'disconnectionFromRight'

		@_rightConnector = null