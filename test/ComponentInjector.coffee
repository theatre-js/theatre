ComponentInjector = require '../src/ComponentInjector'

describe "ComponentInjector", ->

	c = null
	beforeEach ->
		c = new ComponentInjector

	describe "constructor()", ->

		it "should work", ->
			(-> new ComponentInjector).should.not.throw()

	describe "for global components", ->

		describe "for components already instantiated before registration", ->

			it "should have them ready", ->
				c.register "obj", obj = {}
				c.get("obj").should.equal obj

		describe "for global components not instantiated before registration", ->

			describe "with no dependencies", ->

				it "should instantiate after calling #initialize()", ->
					class A
						@type: 'global'

					c.register 'a', A
					c.initialize()
					c.get('a').should.be.instanceof A

			describe "with dependencies", ->

				it "should resolve simple dependencies", ->
					class A
						@type: 'global'
						@globalDeps: 'b': 'b'
					class B
						@type: 'global'
					c.register 'a', A
					c.register 'b', B
					c.initialize()
					expect(c.get('a').b).to.equal c.get('b')

				it "should resolve circular dependencies", ->
					class A
						@type: 'global'
						@globalDeps: 'b': 'b'
					class B
						@type: 'global'
						@globalDeps: 'a': 'a'
					c.register 'a', A
					c.register 'b', B
					c.initialize()
					expect(c.get('a').b).to.equal c.get('b')
					expect(c.get('b').a).to.equal c.get('a')

			describe "for lazy globals", ->

				it "should not instantiate on #initialize()", ->
					spy = sinon.spy()
					class A
						@type: 'global'
						@lazy: yes
						constructor: ->
							spy()

					c.register 'a', A
					c.initialize()
					spy.should.not.have.been.called

				it "should instantiate on demand", ->
					spy = sinon.spy()
					class A
						@type: 'global'
						@lazy: yes
						constructor: ->
							spy()

					c.register 'a', A
					c.initialize()
					c.get 'a'
					spy.should.have.been.calledOnce

				it "should instantiate only once", ->
					spy = sinon.spy()
					class A
						@type: 'global'
						@lazy: yes
						constructor: ->
							spy()

					c.register 'a', A
					c.initialize()
					c.get 'a'
					c.get 'a'
					spy.should.have.been.calledOnce

		describe "_constructAndInitializeGlobalClass()", ->

			it "should call constructor() of the class", ->
				cb = sinon.spy()
				class A
					@type: 'global'
					constructor: -> cb()

				c.register 'a', A
				c.initialize()
				c.get('a')
				cb.should.have.been.calledOnce

	describe "for local components", ->

		it "should not instantiate upon #initialize()", ->
			spy = sinon.spy()
			class A
				@type: 'local'
				constructor: ->
					spy()

			c.register 'a', A
			c.initialize()
			spy.should.not.have.been.called

		it "should instantiate upon #instantiate()", ->
			class A
				@type: 'local'

			c.register 'a', A
			c.instantiate('a').should.be.instanceof A

		it "should resolve their global dependencies", ->
			class A
				@type: 'local'
				@globalDeps: 'g': 'g'
			class G
				@type: 'global'
				@lazy: yes

			c.register 'a', A
			c.register 'g', G
			a = c.instantiate('a')
			expect(a.g).to.equal c.get('g')

		it "should resolve their local dependencies", ->
			class A
				@type: 'local'
				@localDeps: 'b': 'b'
			class B
				@type: 'local'

			c.register 'a', A
			c.register 'b', B
			a = c.instantiate('a')
			expect(a.b).to.be.instanceof B

		it "should detect circular dependencies in local deps", ->
			class A
				@type: 'local'
				@localDeps: 'b': 'b'
			class B
				@type: 'local'
				@localDeps: 'a': 'a'

			c.register 'a', A
			c.register 'b', B
			(-> c.instantiate('a')).should.throw()

	describe "for leech dependencies", ->

		it "should not instantiate upon #initialize()", ->
			spy = sinon.spy()
			class A
				@type: 'leech'
				@target: 'something'
				constructor: (target) ->
					spy target

			c.register 'a', A
			c.initialize()
			spy.should.not.have.been.called

		it "should instantiate upon instantiation of target", ->
			spy = sinon.spy()
			class A
				@type: 'leech'
				@target: 'b'
				constructor: (target) ->
					spy target
			class B
				@type: 'local'

			c.register 'a', A
			c.register 'b', B

			b = c.instantiate('b')
			spy.should.have.been.calledWith b