ScrollableArea = require '../timelineBoxScrollableArea/ScrollableArea'
Panner = require '../timelineBoxPanner/Panner'
Model = require './Model'
View = require './View'

module.exports = class Box

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		@model = new Model @

		@view = new View @

		@scrollableArea = new ScrollableArea @

		@panner = new Panner @

		do @_initDummyPoints

	_initDummyPoints: ->

		p1 = new DummyPoint @, 0
		p2 = new DummyPoint @, 1500
		p3 = new DummyPoint @, 1600
		p4 = new DummyPoint @, 2600
		p5 = new DummyPoint @, 26000

El = require 'stupid-dom-interface'

class DummyPoint

	constructor: (@box, @t) ->

		@el = El '.dummyPoint'
		.inside @box.view.containerNode

		@el.y 150
		@el.z 1

		@box.scrollableArea.model.on 'timeFocus-change', => do @_updatePos

		do @_updatePos

	_updatePos: ->

		@el.x @box.scrollableArea.view.timeToX @t