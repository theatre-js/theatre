module.exports = class Point

	constructor: (@t, @pLeftX, @pLeftY, @pRightX, @pRightY) ->

	changeValues: (@pLeftX, @pLeftY, @pRightX, @pRightY) ->

	isConnector: -> no

	isPoint: -> yes