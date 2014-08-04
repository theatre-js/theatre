ScrollableArea = require '../timelineBoxScrollableArea/ScrollableArea'
GuidesManager = require '../timelineBoxGuides/GuidesManager'
Panner = require '../timelineBoxPanner/Panner'
Model = require './Model'
View = require './View'

module.exports = class Box

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		@model = new Model @

		@view = new View @

		@scrollableArea = new ScrollableArea @

		@guidesManager = new GuidesManager @

		@panner = new Panner @

		do @_initDummyPoints

	_initDummyPoints: ->

		for i in [0..50]

			new DummyPoint @, Math.random() * 8000

		return

El = require 'stupid-dom-interface'

class DummyPoint

	constructor: (@box, @t) ->

		@el = El '.dummyPoint'
		.inside @box.scrollableArea.view.containerNode

		@el.y 20 + Math.random() * 260
		@el.z 1

		@el.css 'border-color', randomColor()

		@box.scrollableArea.view.on 'view-change', => do @_updatePos

		@box.theatre.moosh.onClick @el
		.onDone =>

			console.log @

		do @_updatePos

	_updatePos: ->

		@el.x @box.scrollableArea.view.timeToFocusedX @t

randomColor = ->

	r = 100 + (Math.random() * 155)|0
	g = 100 + (Math.random() * 155)|0
	b = 100 + (Math.random() * 155)|0

	"rgb(#{r}, #{g}, #{b})"