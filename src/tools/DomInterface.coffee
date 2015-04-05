getCSSProp = do ->

	p = null

	el = document.createElement 'div'

	(possibleProps) ->

		for prop in possibleProps

			return prop if el.style[prop] isnt undefined

		return

cssPropertySetter = (prop) ->

	actualProp = getCSSProp getPossiblePropsFor prop

	return (->) unless actualProp?

	(el, v) -> el.style[actualProp] = v

getPossiblePropsFor = (prop) ->

	rest = prop.charAt(0).toUpperCase() + prop.substr(1, prop.length)

	[
		"webkit#{rest}", "moz#{rest}", "o#{rest}", "ms#{rest}", prop
	]

css =

	setTransform: cssPropertySetter 'transform'

	setTransformStyle: cssPropertySetter 'transformStyle'

	setTransformOrigin: cssPropertySetter 'transformOrigin'

	setTransformOriginX: cssPropertySetter 'transformOriginX'
	setTransformOriginY: cssPropertySetter 'transformOriginY'
	setTransformOriginZ: cssPropertySetter 'transformOriginZ'

	setCssFilter: cssPropertySetter 'filter'

	setTransitionDuration: cssPropertySetter 'transitionDuration'

	setTransitionTimingFunction: cssPropertySetter 'transitionTimingFunction'

	# Turns numbers to css rgb representation
	rgb: (r, g, b) ->

		'rgb(' + r + ', ' + g + ', ' + b + ')'

	canHaveProp: (prop) ->

		actualProp = getCSSProp getPossiblePropsFor prop

		actualProp?

module.exports = class DomInterface

	constructor: (node, initial) ->

		unless @ instanceof self

			return new self node, initial

		if node instanceof self

			return node

		if typeof node is 'string'

			parts = self._parseTag node

			if parts.name.length is 0

				parts.name = 'div'

			if parts.ns

				node = document.createElementNS parts.ns, parts.name

			else

				node = document.createElement parts.name

			for name, val of parts.attribs

				node.setAttribute name, val

		else if not node?

			node = document.createElement 'div'

		unless node instanceof Element

			throw Error "node must be an HTML element."

		@node = node

		if Float32Array?

			@_props = new Float32Array 28

		else

			@_props = []

			for i in [0..28]

				@_props.push 0

		@_map = {}

		@_style = @node.style

		@_initialize initial

	_initialize: (initial) ->

		# initialize opacity
		@_props[6] = 1

		# initialize transform values

		# scale
		@_props[22] = 1
		@_props[23] = 1
		@_props[24] = 1

		# perspective
		@_props[27] = 1000000

		return if initial is undefined or initial is null

		@from(initial)

	inside: (node) ->

		if node.node?

			node = node.node

		node.appendChild @node

		@

	adopt: (node) ->

		if node.node?

			node = node.node

		@node.appendChild node

		@

	detach: ->

		p = @node.parentNode

		if p?

			p.removeChild @node

		@

	from: (props) ->

		for name, val of props

			if Array.isArray val

				@[name].apply @, val

			else

				@[name] val

		@

	_setTextShadow: ->

		@_style.textShadow = (@_props[7] + 'px') + ' ' + (@_props[8] + 'px') + ' ' + (@_props[9] + 'px') + ' ' + ('rgb(' + @_props[10] + ',' + @_props[11] + ',' + @_props[12] + ')')

	_setTransform: ->

		transformString = ''



		if @_props[22] isnt 1

			transformString = ' scaleX(' + @_props[22] + ') ' + transformString

		if @_props[23] isnt 1

			transformString = ' scaleY(' + @_props[23] + ') ' + transformString

		if @_props[24] isnt 1

			transformString = ' scaleZ(' + @_props[24] + ') ' + transformString

		if @_props[25] isnt 0

			transformString = ' skewX(' + @_props[25] + 'deg) ' + transformString

		if @_props[26] isnt 0

			transformString = ' skewY(' + @_props[26] + 'deg) ' + transformString

		if @_props[19] isnt 0 or @_props[20] isnt 0 or @_props[21] isnt 0

			transformString = ' translate3d(' + @_props[19] + 'px, ' + @_props[20] + 'px, ' + @_props[21] + 'px) ' + transformString

		if @_props[13] isnt 0

			transformString = ' rotateX(' + @_props[13] + 'deg) ' + transformString

		if @_props[14] isnt 0

			transformString = ' rotateY(' + @_props[14] + 'deg) ' + transformString

		if @_props[15] isnt 0

			transformString = ' rotateZ(' + @_props[15] + 'deg) ' + transformString

		if @_props[16] isnt 0 or @_props[17] isnt 0 or @_props[18] isnt 0

			transformString = ' translate3d(' + @_props[16] + 'px, ' + @_props[17] + 'px, ' + @_props[18] + 'px) ' + transformString

		if @_props[27] < 1000000

			transformString = ' perspective(' + @_props[27] + 'px) ' + transformString


		css.setTransform @node, transformString

	#
	#	var
	#

	set: (name, val) ->

		@_map[name] = val

		@

	get: (name) ->

		@_map[name]

	del: (name) ->

		delete @_map[name]

		@

	has: (name) ->

		@_map[name]?


	#
	#	HTML
	#

	html: (text) ->

		@node.innerHTML = text

		@

	attr: (name, val) ->

		unless val?

			return @node.getAttribute name

		@node.setAttribute name, val

		@

	#
	#	CSS
	#

	css: (name, val) ->

		if typeof name is 'object'

			obj = name

			for name, val of obj

				@css name, val

			return @

		@_style[name] = val

		@

	#
	#	Size
	#

	getWidth: ->

		@_props[0]

	width: (width) ->

		@_style.width = width + 'px'

		@_props[0] = width

		@

	getHeight: ->

		@_props[1]

	height: (height) ->

		@_style.height = height + 'px'

		@_props[1] = height

		@

	zIndex: (z) ->

		@_style.zIndex = z

		@

	#
	#	Pos
	#

	getTop: ->

		@_props[2]

	top: (top) ->

		@_style.top = top + 'px'

		@_props[2] = top

		@

	getLeft: ->

		@_props[3]

	left: (left) ->

		@_style.left = left + 'px'

		@_props[3] = left

		@

	getBottom: ->

		@_props[4]

	bottom: (bottom) ->

		@_style.bottom = bottom + 'px'

		@_props[4] = bottom

		@

	getRight: ->

		@_props[5]

	right: (right) ->

		@_style.right = right + 'px'

		@_props[5] = right

		@

	#
	#	Opacity
	#

	getOpacity: ->

		@_props[6]

	opacity: (opacity) ->

		@_style.opacity = opacity

		@_props[6] = opacity

		@

	#
	#	Text Shadow
	#

	getTextShadowH: ->

		@_props[7]

	textShadowH: (h) ->

		@_props[7] = h

		do @_setTextShadow

		@

	getTextShadowV: ->

		@_props[8]

	textShadowV: (v) ->

		@_props[8] = v

		do @_setTextShadow

		@

	getTextShadowBlur: ->

		@_props[9]

	textShadowBlur: (blur) ->

		@_props[9] = blur

		do @_setTextShadow

		@

	getTextShadowColor: ->

		[@_props[10], @_props[11], @_props[12]]

	textShadowColor: (colorRed, colorGreen, colorBlue) ->

		@_props[10] = colorRed
		@_props[11] = colorGreen
		@_props[12] = colorBlue

		do @_setTextShadow

		@

	#
	#	Transforms
	#
	#	Rotate
	#

	getRotateX: ->

		@_props[13]

	rotateX: (rotateX) ->

		@_props[13] = rotateX

		do @_setTransform

		@

	getRotateY: ->

		@_props[14]

	rotateY: (rotateY) ->

		@_props[14] = rotateY

		do @_setTransform

		@

	getRotateZ: ->

		@_props[15]

	rotateZ: (rotateZ) ->

		@_props[15] = rotateZ

		do @_setTransform

		@

	#
	#	Translate
	#

	getX: ->

		@_props[16]

	x: (x) ->

		@_props[16] = x

		do @_setTransform

		@

	getY: ->

		@_props[17]

	y: (y) ->

		@_props[17] = y

		do @_setTransform

		@

	getZ: ->

		@_props[18]

	z: (z) ->

		@_props[18] = z

		do @_setTransform

		@

	#
	#	local
	#

	getlocalX: ->

		@_props[19]

	localX: (localX) ->

		@_props[19] = localX

		do @_setTransform

		@

	getlocalY: ->

		@_props[20]

	localY: (localY) ->

		@_props[20] = localY

		do @_setTransform

		@

	getlocalZ: ->

		@_props[21]

	localZ: (localZ) ->

		@_props[21] = localZ

		do @_setTransform

		@

	#
	#	Scale
	#

	scale: (amount) ->

		@_props[22] = amount
		@_props[23] = amount
		@_props[24] = amount

		do @_setTransform

		@

	getScaleX: ->

		@_props[22]

	scaleX: (scaleX) ->

		@_props[22] = scaleX

		do @_setTransform

		@

	getScaleY: ->

		@_props[23]

	scaleY: (scaleY) ->

		@_props[23] = scaleY

		do @_setTransform

		@

	getScaleZ: ->

		@_props[24]

	scaleZ: (scaleZ) ->

		@_props[24] = scaleZ

		do @_setTransform

		@

	#
	#	Skew
	#

	getSkewX: ->

		@_props[25]

	skewX: (skewX) ->

		@_props[25] = skewX

		do @_setTransform

		@

	getSkewY: ->

		@_props[26]

	skewY: (skewY) ->

		@_props[26] = skewY

		do @_setTransform

		@

	#
	#	perspective
	#

	getPerspective: ->

		@_props[27]

	perspective: (perspective) ->

		@_props[27] = perspective

		do @_setTransform

		@

	#
	#
	#

	transformOriginX: (x) ->

		css.setTransformOriginX @node, x + '%'

		@

	transformOriginY: (y) ->

		css.setTransformOriginY @node, y + '%'

		@

	transformOriginZ: (z) ->

		css.setTransformOriginZ @node, z + '%'

		@

	transformStyle: (v) ->

		css.setTransformStyle @node, v

		@

	preserve3d: ->

		@transformStyle 'preserve-3d'

	current: (prop) ->

		comp = getComputedStyle @node

		if prop?

			comp[prop]

		else

			comp

	addClass: (c) ->

		@node.classList.add c

		@

	removeClass: (c) ->

		@node.classList.remove c

		@

	toggleClass: (c) ->

		@node.classList.toggle c

		@

	setClass: (c) ->

		@node.className = c

		@

	@_parseTag: (k) ->

		# validate
		if not k.match(/^[a-zA-Z0-9\#\-\_\.\[\]\"\'\=\,\s\:]+$/) or k.match(/^[0-9]+/)

			throw Error "cannot parse tag `#{k}`"

		attribs = {}

		parts =

			name: ''

			attribs: attribs

			ns: no

		if k.match /^svg\:/

			parts.ns = 'http://www.w3.org/2000/svg'

			k = k.substr 4, k.length

		# tag name
		if m = k.match /^([^\.#\[]+)/

			name = m[1]

			unless name.match self._nameRx

				throw Error "tag name `#{name}` is not valid"

			parts.name = name

			k = k.substr name.length, k.length

		if m = k.match /^\[([^\]]+)\]/

			pairs = m[1].split(',').map (s) -> s.trim()

			for pair in pairs

				[attrName, attrVal] = pair.split('=').map (s) -> s.trim()

				attribs[attrName] = attrVal

			k = k.substr m[0].length, k.length

		# tag id
		if m = k.match /^#([a-zA-Z0-9\-]+)/

			id = m[1]

			unless id.match self._nameRx

				throw Error "tag id `#{id}` is not valid"

			attribs.id = id

			k = k.substr id.length + 1, k.length

		classes = []

		# the class attrib
		while m = k.match /\.([a-zA-Z0-9\-\_]+)/

			cls = m[1]

			unless cls.match self._nameRx

				throw Error "tag class `#{cls}` is not valid"

			classes.push cls

			k = k.replace '.' + cls, ''

		if classes.length

			attribs.class = classes.join " "

		# TODO: match attributes like [a=b]

		parts

	@_nameRx: /^[a-zA-Z\-\_]{1}[a-zA-Z0-9\-\_]*$/

	self = @