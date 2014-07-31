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

		for i in [0..50]

			new DummyPoint @, Math.random() * 15000

		return

El = require 'stupid-dom-interface'

class DummyPoint

	constructor: (@box, @t) ->

		@el = El '.dummyPoint'
		.inside @box.view.containerNode

		@el.y Math.random() * 300
		@el.z 1

		@el.css 'border-color', randomColor()

		@box.scrollableArea.view.on 'view-change', => do @_updatePos

		do @_updatePos

	_updatePos: ->

		@el.x @box.scrollableArea.view.timeToX @t

randomColor = ->

	r = 100 + (Math.random() * 155)|0
	g = 100 + (Math.random() * 155)|0
	b = 100 + (Math.random() * 155)|0

	"rgb(#{r}, #{g}, #{b})"