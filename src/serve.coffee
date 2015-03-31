serve = require 'theatrejs-data-server/lib/serve'
path = require 'path'

module.exports = (root, dataDir, port) ->

	repoPath = path.join path.dirname(module.parent.filename), root

	console.log repoPath

	serve repoPath, port, dataDir, "nopass"