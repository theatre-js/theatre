Item = require './Item'

module.exports = class Connector extends Item

	constructor: ->

		super

		@_leftTime = 0
		@_rightTime = 0
		@_leftValue = 0
		@_rightValue = 0

	isPoint: ->

		no

	isConnector: ->

		yes

	setTime: (t) ->

		unless @_sequence?

			@_time = +t

		# else

		@events._emit 'time-change', t

		@

	_fitInSequence: ->

		#TODO: emit

		beforeIndex = @_pacs.getIndexOfItemBeforeOrAt @_time

		myIndex = beforeIndex + 1

		before = @_pacs.getItemByIndex beforeIndex

		unless before? and before.isPoint()

			throw Error "We need a point to be present before each connector"

		after = @_pacs.getItemByIndex myIndex

		unless after? and after.isPoint()

			throw Error "We need a point to be present after each connector"

		@_pacs.injectItemOnIndex this, myIndex

		do @reactToChangesInLeftPoint
		do @reactToChangesInRightPoint

		@_pacs._reportChange before._time, after._time

		@events._emit 'inSequnce'


	getLeftTime: ->

		@_leftTime

	getRightTime: ->

		@_rightTime

	getLeftValue: ->

		@_leftValue

	getRightValue: ->

		@_rightValue

	reactToChangesInRightPoint: ->

		rightPoint = @_pacs.getItemAfterItem this

		changeFrom = @_leftTime
		changeTo = Math.max @_rightTime, rightPoint._time

		@_rightValue = rightPoint._value
		@_rightTime = rightPoint._time

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'curve-change'

		@

	reactToChangesInLeftPoint: ->

		leftPoint = @_pacs.getItemBeforeItem this

		changeFrom = Math.min @_leftTime, leftPoint._time
		changeTo = @_rightTime

		@_leftValue = leftPoint._value
		@_leftTime = leftPoint._time

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'curve-change'

		@

	_fitOutOfSequence: ->

		before = @_pacs.getItemBeforeItem this
		after = @_pacs.getItemAfterItem this

		changeFrom = before._time
		changeTo = after._time

		@_pacs.pluckItem this
		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'outOfSequence'