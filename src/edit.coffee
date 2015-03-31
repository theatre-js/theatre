DynamicTimeline = require './DynamicTimeline'
EditorModel = require './EditorModel'
EditorView = require './EditorView'
NoAudioTimeControl = require './tools/NoAudioTimeControl'

module.exports = (port, file, audio = no, debug = yes, autoRaf = yes) ->
	timeline = new DynamicTimeline 60

	if audio is no
		audio = new NoAudioTimeControl
	else
		pathToAudioFile = audio
		audio = null

	model = new EditorModel "theatre-default", timeline, debug, audio

	if pathToAudioFile?
		model.audio.set pathToAudioFile

	view = new EditorView model, document.body

	if autoRaf
		frame = (t) ->
			view.tick t
			raf frame

		raf frame

	server = if typeof port is 'number'
		'http://localhost:' + port
	else
		port

	model.communicateWith server, file, "nopass"

	graph = model.graph

	run = ->
		model.run()

	{timeline, model, view, graph, run}

raf = window.requestAnimationFrame ? webkitRequestAnimationFrame ? mozRequestAnimationFrame