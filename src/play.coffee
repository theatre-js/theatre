DynamicTimeline = require './DynamicTimeline'
StaticPlayerModel = require './StaticPlayerModel'
NoAudioTimeControl = require './tools/NoAudioTimeControl'

module.exports = (data, audio = no, debug = yes, autoRaf = yes) ->
	timeline = new DynamicTimeline 60

	if audio is no
		audio = new NoAudioTimeControl
	else
		pathToAudioFile = audio
		audio = null

	model = new StaticPlayerModel "theatre-default", timeline, data, debug, audio

	if pathToAudioFile?
		model.audio.set pathToAudioFile

	view = new EditorView model, document.body

	if autoRaf
		frame = (t) ->
			view.tick t
			raf frame

		raf frame

	graph = model.graph

	run = ->
		model.run()

	{timeline, model, graph, run}

raf = window.requestAnimationFrame ? webkitRequestAnimationFrame ? mozRequestAnimationFrame