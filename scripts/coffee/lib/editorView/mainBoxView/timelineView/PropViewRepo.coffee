PropView = require './PropView'

module.exports = class PropViewRepo

	constructor: (@timelineEditor) ->

		@_propViews = {}

	getPropViewFor: (propHolderModel) ->

		id = propHolderModel.id

		propView = @_propViews[id]

		unless propView?

			@_propViews[id] = propView = @_makePropViewFor propHolderModel

		propView._setPropHolderModel propHolderModel

		propView

	_makePropViewFor: (propHolderModel) ->

		new PropView @, propHolderModel.actorProp