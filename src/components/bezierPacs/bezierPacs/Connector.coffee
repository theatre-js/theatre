Item = require './Item'

module.exports = class Connector extends Item

	constructor: ->

		super

		@_leftTime = 0
		@_rightTime = 0
		@_leftValue = 0
		@_rightValue = 0

		@_leftPoint = null
		@_rightPoint = null

	isPoint: ->

		no

	isConnector: ->

		yes

	setTime: (t) ->

		#TODO: validate
		@_time = +t

		@events._emit 'time-change', t

		@

	_fitInSequence: ->

		beforeIndex = @_pacs.getIndexOfItemBeforeOrAt @_time

		myIndex = beforeIndex + 1

		before = @_pacs.getItemByIndex beforeIndex

		unless before? and before.isPoint()

			throw Error "We need a point to be present before each connector"

		after = @_pacs.getItemByIndex myIndex

		unless after? and after.isPoint()

			throw Error "We need a point to be present after each connector"

		@_pacs.injectItemOnIndex this, myIndex

		@_setLeftPoint before
		@_setRightPoint after

		do @reactToChangesInLeftPoint
		do @reactToChangesInRightPoint

		@_pacs._reportChange before._time, after._time

		@events._emit 'inSequnce'

	_setLeftPoint: (@_leftPoint) ->

		@_leftPoint._setRightConnector this

	_unsetLeftPoint: ->

		@_leftPoint._unsetRightConnector()

		@_leftPoint = null

	_setRightPoint: (@_rightPoint) ->

		@_rightPoint._setLeftConnector this

	_unsetRightPoint: ->

		@_rightPoint._unsetLeftConnector()

		@_rightPoint = null

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

		@setTime leftPoint._time

		@_leftValue = leftPoint._value
		@_leftTime = leftPoint._time

		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'curve-change'

		@

	_fitOutOfSequence: ->

		changeFrom = @_leftPoint._time
		changeTo = @_rightPoint._time

		do @_unsetLeftPoint
		do @_unsetRightPoint

		@_pacs.pluckItem this
		@_pacs._reportChange changeFrom, changeTo

		@events._emit 'outOfSequence'