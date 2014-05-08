fs = require 'graceful-fs'
wn = require 'when'
git = require 'gift'
CSON = require 'cson'
delay = require 'when/delay'
nodefn = require 'when/node/function'
sysPath = require 'path'

module.exports = class DataHandler

	constructor: (@server, rootPath, timelinesDir) ->

		@_setPaths rootPath, timelinesDir

		@_lastPromiseToWorkWithHeadData = wn()

	_setPaths: (@rootPath, @timelinesDir) ->

		unless String(@timelinesDir).length > 0

			throw Error "@timelinesDir '#{@timelinesDir}' is not valid"

		@timelinesPath = sysPath.join @rootPath, @timelinesDir

		unless fs.existsSync @timelinesPath

			throw Error "Timelines path '#{@timelinesPath}' doesn't exist"

		namespaces = fs.readdirSync @timelinesPath

		@namespaces = []

		unless Array.isArray(namespaces) and namespaces.length > 0

			throw Error "no namespace found"

		for namespace in namespaces

			continue unless namespace.match /^[a-zA-Z0-9\-\_]+\.cson$/

			nsName = namespace.substr(0, namespace.length - 5)

			console.log "recognized namespace", nsName

			@namespaces.push nsName

		if @namespaces.length is 0

			throw Error "No namespace cson file was found"

		do @_initGit

		return

	_initGit: ->

		unless fs.existsSync @rootPath + '/.git'

			throw Error "Git repo is not initialized yet"

		@repo = git @rootPath

		unless @repo?

			throw Error "Could not get a repo from gift"

		do @_scheduleToCommit

	_scheduleToCommit: ->

		delay(5 * 60 * 1000)
		.then =>

			@queue =>

				do @_scheduleToCommit

				nodefn.call(@repo.status.bind(@repo))
				.then (status) =>

					if status.clean is yes

						console.log 'no need to commit'

						return

					nodefn.call(@repo.add.bind(@repo), '.')
					.then =>

						nodefn.call(@repo.commit.bind(@repo), '[autosave]', all: yes)

					.then =>

						console.log 'commited'

		return

	hasNamespace: (ns) ->

		ns in @namespaces

	getHeadDataForNamespace: (ns) ->

		unless @hasNamespace ns

			throw Error "Invalid namespace '#{ns}'"

		nodefn.call(fs.readFile, @getDataFilePathFor(ns), {encoding: 'utf-8'})
		.then (cson) =>

			if (cson.replace /\s+/, '') is ''

				return {}

			obj = CSON.parseSync cson

			if obj instanceof Error

				console.log obj

				throw obj

			obj

	queue: (cb) ->

		@_lastPromiseToWorkWithHeadData = @_lastPromiseToWorkWithHeadData.then cb

	replaceHeadDataForNamespace: (ns, obj) ->

		cson = CSON.stringifySync obj

		json = @trimData obj

		first = nodefn.call(fs.writeFile, @getDataFilePathFor(ns), cson, {encoding: 'utf-8'})
		second = nodefn.call(fs.writeFile, @getTrimmedDataFilePathFor(ns), json, {encoding: 'utf-8'})

		wn.all([first, second])

	trimData: (obj) ->

		timeline = obj?.timeline

		timeline ?= {}

		JSON.stringify timeline

	getDataFilePathFor: (ns) ->

		sysPath.join @timelinesPath, ns + '.cson'

	getTrimmedDataFilePathFor: (ns) ->

		sysPath.join @timelinesPath, ns + '.json'