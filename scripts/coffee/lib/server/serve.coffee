didServe = no

module.exports = serve = (repoPath, port, serializedDirName, passwords) ->

	if didServe

		throw Error "Already serving"

	didServe = yes

	PrettyError = require 'pretty-error'
	Server = require '../Server'
	path = require 'path'
	prettyMonitor = require 'pretty-monitor'

	# Pretty Errors
	do ->

		pe = new PrettyError

		pe.renderer.style

			'pretty-error':

				marginLeft: 3
				marginTop: 1

		pe.filter ->

			`console.log("\007")`

			return

		process.on 'uncaughtException', (e) ->

			pe.render e, yes

			console.log "-----------------------\n"

			process.exit(1)

		# Pretty When Monitor
		prettyMonitor.start 100, pe

		pe.skipNodeFiles()
		pe.skipPackage 'socket.io'



		process.nextTick ->

			console.log "\n-----------------------\n"

			s = new Server repoPath, serializedDirName, port, passwords