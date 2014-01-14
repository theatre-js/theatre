fs = require 'graceful-fs'
git = require 'gift'
nodefn = require 'when/node/function'
sysPath = require 'path'

module.exports = class DataHandler

	constructor: (@server, rootPath, timelinesDir) ->

		@_setPaths rootPath, timelinesDir

		# do @_setupGit

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

			unless namespace.match /^[a-zA-Z0-9\-\_]+\.json$/

				throw Error "Invalid namespace json file: #{namespace}"

			nsName = namespace.substr(0, namespace.length - 5)

			console.log "recognized namespace", nsName

			@namespaces.push nsName

		return

	hasNamespace: (ns) ->

		ns in @namespaces

	_setupGit: ->

		@repo = git @rootPath

		# repo.add '.', ->

		# 	console.log 'added'

		# repo.commit 'second', (err) ->

		# 	console.log 'commited', err

		# repo.create_tag 'second', ->

		# 	# console.log arguments

		# repo.tags (err, tags) ->

		# 	console.log tags

		# repo.checkout 'first', ->

		# 	console.log arguments

		# repo.status ->

		# 	console.log arguments

	getHeadJsonForNamespace: (ns) ->

		unless @hasNamespace ns

			throw Error "Invalid namespace '#{ns}'"

		nodefn.call(fs.readFile, @getJsonPathFor(ns), {encoding: 'utf-8'})

	getJsonPathFor: (ns) ->

		sysPath.join @timelinesPath, ns + '.json'