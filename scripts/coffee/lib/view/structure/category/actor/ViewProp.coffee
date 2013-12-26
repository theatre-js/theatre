module.exports = class ViewProp

	constructor: (@actor, @name, @timeFlowProp) ->

		@id = @actor.id + '-' + @name