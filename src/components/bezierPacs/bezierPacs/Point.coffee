Item = require './Item'

module.exports = class Point extends Item

	constructor: ->

		super

		@_value = 0

		@_handlers = new Float32Array 4

	setValue: (v) ->

		#TODO: validate
		@_value = +v

		#TODO: emit

		@

	getValue: ->

		@_value

	setTime: (t) ->

		#TODO: allow changing time only in the left/right confinements.
		# If they wanna go out of that time limit, they would have to take
		# us off the sequence first

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

		#TODO: Validate
		@_handlers[0] = +x
		@_handlers[1] = +y

		@events._emit 'leftHandler-change'
		@getLeftConnector()?.reactToChangesInRightPoint()

		@

	setRightHandler: (x, y) ->

		@_handlers[2] = +x
		@_handlers[3] = +y

		@events._emit 'rightHandler-change'
		@getRightConnector()?.reactToChangesInLeftPoint()

		@

	_fitInSequence: ->

		#TODO: emit

		beforeIndex = @_pacs.getIndexOfItemBeforeOrAt @_time

		myIndex = beforeIndex + 1

		if myIndex is 0

			changeFrom = -Infinity

		else

			beforeItem = @_pacs.getItemByIndex beforeIndex

			if beforeItem.isPoint()

				changeFrom = @_time

			else

				leftConnector = beforeItem

				leftPoint = @_pacs.getItemByIndex beforeIndex - 1

				changeFrom = leftPoint._time

		afterItem = @_pacs.getItemByIndex myIndex

		unless afterItem?

			changeTo = Infinity

		else

			changeTo = afterItem._time

		@_pacs.injectItemOnIndex this, myIndex

		leftConnector?.reactToChangesInRightPoint()

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'inSequnce'

	_fitOutOfSequence: ->

		before = @_pacs.getItemBeforeItem this
		after = @_pacs.getItemAfterItem this

		if before?.isConnector()

			changeFrom = before.getLeftTime()

			before.getOutOfSequence()

		else if before?

			changeFrom = @_time

		else

			changeFrom = -Infinity

		if after?.isConnector()

			changeTo = after.getRightTime()

			after.getOutOfSequence()

		else if after?

			changeTo = after._time

		else

			changeTo = Infinity

		@_pacs.pluckItem this

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'outOfSequence'

	isPoint: ->

		yes

	isConnector: ->

		no

	getLeftConnector: ->

		c = @_pacs.getItemBeforeItem this

		return c if c?.isConnector()

	getRightConnector: ->

		c = @_pacs.getItemAfterItem this

		return c if c?.isConnector()