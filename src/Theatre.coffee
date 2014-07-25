TimelineBoxManager = require './components/timelineBox/Manager'
El = require 'stupid-dom-interface'

module.exports = class Theatre

	constructor: ->

		@containerNode = El '.theatrejs'
		.inside document.body

		@timelineBoxManager = new TimelineBoxManager @