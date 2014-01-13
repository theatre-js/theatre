sysPath = require 'path'
git = require 'gift'
io = require 'socket.io'
fs = require 'graceful-fs'

module.exports = class Server

	constructor: (@rootPath, @port, @timelinesDir) ->

		unless Number.isFinite(@port) and parseInt(@port) is parseFloat(@port)

			throw Error "We need a valid port"

		unless @port > 3000

			throw Error "Port must be an integer over 3000"

		gitPath = sysPath.join @rootPath, '.git'

		unless fs.existsSync gitPath

			throw Error "Git repo path '#{gitPath}' doesn't exist"

		unless String(@timelinesDir).length > 0

			throw Error "@timelinesDir '#{@timelinesDir}' is not valid"

		timelinesPath = sysPath.join @rootPath, @timelinesDir

		unless fs.existsSync timelinesPath

			throw Error "Timelines path '#{timelinesPath}' doesn't exist"

		repo = git @rootPath

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