wn = require 'when'
fs = require 'graceful-fs'
git = require 'gift'
CSON = require 'cson'
nodefn = require 'when/node/function'
sysPath = require 'path'

module.exports = class DataHandler

	constructor: (@server, rootPath, timelinesDir) ->

		@_setPaths rootPath, timelinesDir

		@_lastPromiseToWorkWithHeadData = wn()

	_setPaths: (@rootPath, @timelinesDir) ->

		@gitPath = sysPath.join @rootPath, '.git'

		unless fs.existsSync @gitPath

			throw Error "Git repo path '#{@gitPath}' doesn't exist"

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

		return

	hasNamespace: (ns) ->

		ns in @namespaces

	getHeadDataForNamespace: (ns) ->

		unless @hasNamespace ns

			throw Error "Invalid namespace '#{ns}'"

		@_scheduleToWorkWithHeadData =>

			nodefn.call(fs.readFile, @getDataFilePathFor(ns), {encoding: 'utf-8'})

		.then (cson) =>

			return {} if typeof cson isnt 'string'

			if (cson.replace /\s+/, '') is ''

				return {}

			obj = CSON.parseSync cson

			if obj instanceof Error

				throw obj

			obj

	_scheduleToWorkWithHeadData: (cb) ->

		@_lastPromiseToWorkWithHeadData = @_lastPromiseToWorkWithHeadData.then cb

	replaceHeadDataForNamespace: (ns, obj) ->

		cson = CSON.stringifySync obj

		@_scheduleToWorkWithHeadData =>

			nodefn.call(fs.writeFile, @getDataFilePathFor(ns), cson, {encoding: 'utf-8'})

	getDataFilePathFor: (ns) ->

		sysPath.join @timelinesPath, ns + '.cson'