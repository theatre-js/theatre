import type {Pointer, Prism} from '@theatre/dataverse'
import {
  isPointer,
  isPrism,
  pointerToPrism,
  Atom,
  getPointerParts,
  pointer,
  prism,
  Ticker,
  val,
} from '@theatre/dataverse'
// eslint-disable-next-line no-restricted-imports
import {set as lodashSet} from 'lodash'
import {isPointerToPrismProvider} from './pointerToPrism'

describe(`The exhaustive guide to dataverse`, () => {
  // Hi there! I'm writing this test suite as an ever-green and thorough guide to dataverse. You should be able
  // to read it from top to bottom and learn pretty much all there is to know about dataverse.
  //
  // This is not a quick-start guide, so feel free to skip around.
  //
  // Since this is a test suite, you should be able to run it in [debug mode](https://jestjs.io/docs/en/troubleshooting)
  // and inspect the value of variables at any point in the test.
  // We recommend you follow this guide using VSCode's [Jest extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest),
  // which allows you to run/debug tests from within the editor and see the values of variables in the editor itself.

  describe(`0 - Concepts`, () => {
    // There 4 main concepts in dataverse:
    // - Atoms, hold the state of your application.
    // - Pointers are a type-safe way to get/set/react-to changes in Atoms.
    // - Prisms are functions that react to changes in atoms and other prisms.
    // - Tickers are a way to schedule and synchronise computations.

    // before we dive into the concepts, let me show you how a simple dataverse setup looks like.
    test('0.1 - A simple dataverse setup', () => {
      // In this setup, we're gonna write a program that renders an image of a sunset,
      // like this:
      //                         |
      //                     \       /
      //                       .-"-.
      //                  --  /     \  --
      // `~~^~^~^~^~^~^~^~^~^-=======-~^~^~^~~^~^~^~^~^~^~^~`
      // `~^_~^~^~-~^_~^~^_~-=========- -~^~^~^-~^~^_~^~^~^~`
      // `~^~-~~^~^~-^~^_~^~~ -=====- ~^~^~-~^~_~^~^~~^~-~^~`
      // `~^~^~-~^~~^~-~^~~-~^~^~-~^~~^-~^~^~^-~^~^~^~^~~^~-`
      // (Art by Joan G. Stark) https://www.asciiart.eu/nature/sunset

      // our program is going to have one parameter, which is `timeOfDay`, which is a number between 0 and 24.
      // the idea is that as `timeOfDay` changes, our program would render the sun in a different position.

      // Let's express the state of our program as a dataverse `Atom`. An `Atom` basically holds
      // a piece of state, and it can be read from and written to. It also provides a way to listen
      // to changes in the state.
      const state = new Atom({timeOfDay: 0, imageSize: 100})

      // we should be able to advance the time of day by calling `timeOfDay.set()`
      state.set({...state.get(), timeOfDay: 12})

      // now, we're going to write a function that renders the image of the sunset.
      // this function is going to be a "reactive function", which means that it's going to
      // re-run whenever any of its dependencies change.
      // in this case, the only dependency is `timeOfDay`, so we're going to use `prism()` to create
      // a reactive function out of it.
      const renderSunset = prism(() => {
        const timeOfDay = val(state.pointer.timeOfDay)
        // we're gonna cover what `val()` and `pointer` mean, later. For now, just know that
        // `val()` is a function that returns the value of a pointer,
        // and `state.pointer.timeOfDay` helps `val()` find only get the value of `timeOfDay` and
        // not the value of the whole state.

        // Okay, we're not _actually_ going to render a piece of ascii art here, although that would have been cool.
        // For now, just a simple string will do.
        return `The time of day is ${timeOfDay}`
      })

      // now, if we call `renderSunset.getValue()`, we'll get the string that we returned from the function.
      expect(renderSunset.getValue()).toBe(`The time of day is 12`)

      // now, to make our program reactive, we can simply listen to changes to the value of our prism:

      // in order to listen to changes, we need to create a `Ticker`. We're gonna cover what a `Ticker` is later.
      // But for now, just know that it's a way to schedule and batch computations, for performance reasons.
      const ticker = new Ticker()

      // Now let's define our listener. This one will be a jest mock function.
      const listener = jest.fn()
      const unsubscribe = renderSunset.onChange(ticker, listener)

      // now, if we change the time of day, our listener should be called.
      state.set({...state.get(), timeOfDay: 13})
      ticker.tick()
      expect(listener).toBeCalledTimes(1)
      expect(listener).toBeCalledWith(`The time of day is 13`)

      // and if we change the time of day again,
      state.set({...state.get(), timeOfDay: 14})
      // our listener would _not_ be called, because we haven't ticked the ticker yet.
      expect(listener).toBeCalledTimes(1)
      // but if we tick the ticker,
      ticker.tick()
      // our listener would be called again.
      expect(listener).toBeCalledTimes(2)

      // And that would be it for our simple program. But let's take stock of the concepts we've encountered so far.
      // 1. We've created an `Atom` to hold the state of our program.
      // 2. We've created a `prism` to create a reactive function out of `timeOfDay`.
      // 3. We've used a pointer to get the value of `timeOfDay` from the state.
      // 4. We've used a `Ticker` to schedule and batch computations.

      // In the rest of this guide, we're gonna cover each of these concepts in detail.
      // But let's wrap this test case up by cleaning up our resources.
      unsubscribe()
    })
  })

  describe(`1 - What is a prism?`, () => {
    // A Prism is a way to create a value that depends on other values.

    // let's start with a simple example:
    test(`1.1 - A pretty useless prism`, async () => {
      // Each prism has a calculate function that it runs to calculate its value. let's make a simple function that just returns 1
      const calculate = jest.fn(() => 1)

      // Now we can make a prism out of it
      const pr = prism(calculate)

      // Now, this prism is pretty useless. It doesn't depend on anything, and it doesn't have any dependents.
      // But we can already illustrate some of the concepts that are important to understand prisms.

      // Our `calculate` function will never be called until it's actually needed - prisms are lazy.
      expect(calculate).not.toHaveBeenCalled()

      // We can get the value of the prism, which will be what the `calculate` function returned,
      expect(pr.getValue()).toBe(1)

      // and of course our calculate function will have been called.
      expect(calculate).toHaveBeenCalledTimes(1)

      // Now, you might expect that if we call `getValue()` again, the calculate function won't be called again.
      // But that's _not_ the case. the calculate function will be called again, because our prism is cold.
      // We'll talk about cold/hot in a bit, but let's just say that cold prisms are calculated every time they're read.

      pr.getValue()
      expect(calculate).toHaveBeenCalledTimes(2)

      // We can even check whether a prism is hot or cold. Ours is cold.
      expect(pr.isHot).toBe(false)

      // We'll get to hot prisms soon, but let's talk about dependencies and dependents first.
    })

    // prisms can depend on other prisms. let's make a prism that depends on another prism.
    test(`1.2 - prisms can depend on other prisms`, async () => {
      const calculateA = jest.fn(() => 1)
      const a = prism(calculateA)

      const calculateATimesTwo = jest.fn(() => a.getValue() * 2)
      const aTimesTwo = prism(calculateATimesTwo)

      // let's define a function that clears the count of mocks, as we're gonna do that quite a few times.
      function clearMocks() {
        calculateA.mockClear()
        calculateATimesTwo.mockClear()
      }

      // So, `aTimesTwo` depends on `a`.
      // In our parlance, `aTimesTwo` is a dependent of `a`, and `a` is a dependency of `aTimesTwo`.

      // Now if we read the value of `aTimesTwo`, it will call `calculateATimesTwo`, which will call `calculateA`:
      expect(aTimesTwo.getValue()).toBe(2)
      expect(calculateA).toHaveBeenCalledTimes(1)
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)

      clearMocks()

      // And like we saw in the previous test, if we read the value of `aTimesTwo` again, it will call both of our calculate functions again:
      aTimesTwo.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
      expect(calculateA).toHaveBeenCalledTimes(1)

      clearMocks()

      // But if we read the value of `a`, it won't call `calculateATimesTwo`:
      a.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
      expect(calculateA).toHaveBeenCalledTimes(1)

      clearMocks()

      // Now let's see what happens if we make our prism hot.

      // One way to make a prism hot, is to add an `onStale` listener to it.
      const onStale = jest.fn()
      const unsubscribe = aTimesTwo.onStale(onStale)

      // As soon as a prism has an `onStale` listener, it becomes hot...
      expect(aTimesTwo.isHot).toBe(true)

      // ... and so will its dependencies, and _their_ dependencies, and so on.
      expect(a.isHot).toBe(true)

      // So, let's see what happens when we read the value of `aTimesTwo` again:
      aTimesTwo.getValue()
      // Since this is the first time we're calculating `aTimesTwo` after it went hot, `calculateATimesTwo` will be called again,
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
      // and so will `calculateA`,
      expect(calculateA).toHaveBeenCalledTimes(1)

      clearMocks()

      // But if we read `aTimesTwo` again, none of the calculate functions will be called again.
      aTimesTwo.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
      expect(calculateA).toHaveBeenCalledTimes(0)

      clearMocks()

      // This behavior propogates up the dependency chain, so if we read `a` again, `calculateA` won't be called again,
      // because its value is already fresh.
      a.getValue()
      expect(calculateA).toHaveBeenCalledTimes(0)

      clearMocks()

      // At this point, since none of our prisms depend on a prism whose value will change, they'll remain
      // fresh forever.
      a.getValue()
      aTimesTwo.getValue()
      a.getValue()
      aTimesTwo.getValue()

      expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
      expect(calculateA).toHaveBeenCalledTimes(0)

      clearMocks()

      // But as soon as we unsubscribe from our `onStale()` listener, the prisms will become cold again,
      unsubscribe()
      expect(aTimesTwo.isHot).toBe(false)
      expect(a.isHot).toBe(false)

      // and they'll return back to their cold behavior.
      aTimesTwo.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
      expect(calculateA).toHaveBeenCalledTimes(1)

      clearMocks()

      aTimesTwo.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
      expect(calculateA).toHaveBeenCalledTimes(1)

      clearMocks()

      // Now, one more thing before we move on. What will happen if we make `a` hot, but not `aTimesTwo`?
      // Let's try it out.
      const unsubcribeFromAOnStale = a.onStale(() => {})
      // `a` will go hot:
      expect(a.isHot).toBe(true)
      // but `aTimesTwo` stays cold:
      expect(aTimesTwo.isHot).toBe(false)

      // Now let's read the value of `a`
      a.getValue()

      // `calculateA` will be called
      expect(calculateA).toHaveBeenCalledTimes(1)
      // And `calculateATimesTwo` won't.
      expect(calculateATimesTwo).toHaveBeenCalledTimes(0)

      clearMocks()

      // And if we re-read the value of `a`, `calculateA` won't be called again, becuase `a` is hot and its value is fresh.
      a.getValue()
      expect(calculateA).toHaveBeenCalledTimes(0)

      clearMocks()

      // But if we read the value of `aTimesTwo`, `calculateATimesTwo` will be called, because `aTimesTwo` is cold.
      aTimesTwo.getValue()
      expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
      // yet `calculateA` won't be called, because `a` is hot and its value is fresh.
      expect(calculateA).toHaveBeenCalledTimes(0)

      clearMocks()

      // in conclusion, if we make a prism hot, it'll make its dependencies hot too.
      // if we read the value of a cold prism, it'll call its calculate function, which will
      // call the calculate functions of its dependencies, and so on.
      // but if we read the value of a hot prism, it'll only call its calculate function if its value is stale.

      // le'ts wrap up this part by unsubscribing from `a`'s `onStale` listener to not have any lingering listeners.
      unsubcribeFromAOnStale()
    })

    describe('1.3 - What about state?', () => {
      // so far, our prisms have not depended on any changing values, so in turn, _their_ values have never changed either.
      // but what if we want to create a prism that depends on a changing value?
      // we call those values "sources", and we can create them using the `prism.source()` hook:

      test('1.3.1 - The wrong way to depend on state', () => {
        // let's say we want to create a prism that depends on this value:
        let value = 0

        // the _wrong_ way to do this, is to create a prism that directly reads this value
        const p = prism(() => value)

        // this will actually work if the prism is cold:
        expect(p.getValue()).toBe(0)
        value = 1
        expect(p.getValue()).toBe(1)

        // but if we make the prism hot, it'll never update its value, because it's not subscribed to any sources.
        const unsubscribe = p.onStale(() => {})
        expect(p.isHot).toBe(true)
        // on first read, it'll give us the current value of `value`, which is 1.
        expect(p.getValue()).toBe(1)
        // but if we change `value` again, the prism won't know
        value = 2
        expect(p.getValue()).toBe(1)
        // and so it'll keep returning the old value.
        expect(p.getValue()).toBe(1)

        unsubscribe()
      })

      test('1.3.2 - The _less_ wrong way to depend on state', () => {
        let value = 0
        // the source hook requires a `listen` function, and a `get` function.
        // let's skip the `listen` function for now, and just focus on the `getValue` function.
        const listen = jest.fn(() => () => {})
        // the `getValue` function should return the current value of the source.
        const get = jest.fn(() => value)

        const p = prism(() => {
          return prism.source(listen, get) * 2
        })

        value = 1

        // our prism is cold right now. let's see what happens when we read its value.
        expect(p.getValue()).toBe(2)
        // `get` will be called once, because we're reading the value of the source for the first time.
        expect(get).toHaveBeenCalledTimes(1)
        // and `listen` won't be called at all
        expect(listen).toHaveBeenCalledTimes(0)

        get.mockClear()

        // now let's make the prism hot
        const unsubscribe = p.onStale(() => {})
        expect(p.isHot).toBe(true)
        expect(p.getValue()).toBe(2)
        // `get` will be called again, because we're reading the value of the source for the second time.
        expect(get).toHaveBeenCalledTimes(1)
        // and `listen` will be called once, because our prism wants to be notified when the source changes.
        expect(listen).toHaveBeenCalledTimes(1)

        get.mockClear()
        listen.mockClear()

        // now, since our `listen` function is a mock, it won't actually do anything,
        // so the prism still won't know when the source changes.
        value = 2
        expect(p.getValue()).toBe(2)
        // `get` won't be called again, because the source hasn't changed.
        expect(get).toHaveBeenCalledTimes(0)

        unsubscribe()
      })

      test('1.3.3 - The right way to depend on state', () => {
        let value = 0
        // now let's implement an actual `listen` function.

        // first, we need to keep track of all the listeners that our source wil have
        const listeners = new Set<(val: number) => void>()

        // the `listen` function should return an stop function.
        // the stop function should stop listening to the source.
        const listen = jest.fn((fn) => {
          listeners.add(fn)

          return function stop() {
            listeners.delete(fn)
          }
        })

        const get = jest.fn(() => value)

        // and now we need to define a function that will notify all the listeners that the source has changed.
        const set = (newValue: number) => {
          if (newValue !== value) {
            value = newValue
            listeners.forEach((fn) => fn(value))
          }
        }

        // don't worry, there are helpers for this in dataverse. but for now, we'll implement
        // it manually to understand how it works.

        // now let's create a prism that depends on our source.
        const p = prism(() => {
          return prism.source(listen, get) * 2
        })

        // let's make the prism hot
        const staleListener = jest.fn()
        const unsubscribe = p.onStale(staleListener)
        expect(p.isHot).toBe(true)

        // and let's read its value
        expect(p.getValue()).toBe(0)
        // `get` will be called once, because we're reading the value of the source for the first time.
        expect(get).toHaveBeenCalledTimes(1)
        // and `listen` will be called once, because our prism wants to be notified when the source changes.
        expect(listen).toHaveBeenCalledTimes(1)

        get.mockClear()
        listen.mockClear()

        // now let's change the value of the source
        set(1)

        // this time, our prism will know that the source has changed, and it'll update its value.
        expect(p.getValue()).toBe(2)

        // and that's how we create a prism that depends on a changing value.

        unsubscribe()
      })
    })

    // in practice, we'll almost never need to use the `source` hook directly,
    // and we'll never need to provide our own `listen` and `get` functions.
    // instead, we'll use `Atom`s, which are sources that are already implemented for us.
  })

  describe(`2 - Atoms`, () => {
    // In the final test of the previous chapter, we learned how to create our own sources of state,
    // and make a prism depend on them, using the `prism.source()` hook. In this chapter, we'll learn
    // how to use the `Atom` class, which is a source of state that's already implemented for us and comes
    // with a lot of useful features.
    test(`2.1 - Using Atoms without prisms`, () => {
      const initialState = {foo: 'foo', bar: 0}

      // Let's create an atom with an initial state.
      const atom = new Atom(initialState)

      // We can read our atom's state via `atom.get()` which returns an exact reference to its state
      expect(atom.get()).toBe(initialState)

      // `atom.set()` will replace the state with a new object.
      atom.set({foo: 'foo', bar: 1})

      expect(atom.get()).not.toBe(initialState)
      expect(atom.get()).toEqual({foo: 'foo', bar: 1})

      // Another way to change the state, with the reducer pattern.
      atom.reduce(({foo, bar}) => ({foo, bar: bar + 1}))
      expect(atom.get()).toEqual({foo: 'foo', bar: 2})

      // Having to write `({foo, bar}) => ({foo, bar: bar + 1})` every time we want to change the state
      // is a bit annoying. This is one place where pointers come in handy. We'll have a whole chapter
      // about pointers later, but for now, let's just say that they're a type-safe way to refer to a sub-prop of our atom's state.
      //
      // In this example, we're using the `setByPointer()` method to change the `bar` property of the state.
      atom.setByPointer((p) => p.bar, 3)
      expect(atom.get()).toEqual({foo: 'foo', bar: 3})

      // Also, note that there is nothing magical about pointers. They're just a type-safe encoding of `['path', 'to', 'property']`.
      // Pointers can even point to non-existent properties, and they'll be created when we use them. Typescript will complain if we
      // try to use a pointer to a non-existent property, but in the runtime, there will be no errors.
      // Let's silence the typescript error for the sake of the test
      // @ts-ignore and refer to `baz`, which doesn't actually exist in our state.
      atom.setByPointer((p) => p.baz, 'baz')
      // Atom will create the `baz` property for us:
      expect(atom.get()).toEqual({foo: 'foo', bar: 3, baz: 'baz'})

      // The pointer can also refer to the whole state, and we can use it to replace the whole state.
      atom.setByPointer((p) => p, {foo: 'newfoo', bar: -1})
      expect(atom.get()).toEqual({foo: 'newfoo', bar: -1})

      // `getByPointer()` is to `get()` what `setByPointer()` is to `set()`
      expect(atom.getByPointer((p) => p.bar)).toBe(-1)

      // `reduceByPointer()` is to `setByPointer()` what `reduce()` is to `set()`
      atom.reduceByPointer(
        (p) => p.bar,
        (bar) => bar + 1,
      )

      expect(atom.get()).toEqual({foo: 'newfoo', bar: 0})

      // we can use external pointers too (which we'll learn how to create in the next Pointers chapter)
      const externalPointer = atom.pointer.bar
      atom.setByPointer(() => externalPointer, 1)
      expect(atom.get()).toEqual({foo: 'newfoo', bar: 1})

      let internalPointer
      // the pointer passed to `setByPointer()` is the same as the one returned by `atom.pointer`
      atom.setByPointer((p) => {
        internalPointer = p
        return p.bar
      }, 2)

      expect(internalPointer).toBe(atom.pointer)

      expect(atom.pointer).toBe(atom.pointer)
      expect(atom.pointer.bar).toBe(atom.pointer.bar)

      // pointers don't change when the atom's state changes
      const oldPointer = atom.pointer.bar
      atom.set({foo: 'foo', bar: 10})
      expect(atom.pointer.bar).toBe(oldPointer)
    })

    // Now that we know how to set/get the state of Atoms, let's learn how to use them with prisms.
    test(`2.2 - The hard way to use Atoms with prisms`, () => {
      // In Chapter 1.3.3, we learned how to create a prism that depends on a changing value,
      // but we had to provide our own `listen` and `get` functions. Now let's see how to do the same
      // thing with an Atom.

      // Just to learn how things work under the hood, we're still going to use the `prism.source()` hook.
      // In the next chapter, we'll learn how to skip that step too.

      // Let's create an atom with an initial state.
      const atom = new Atom({foo: 'foo', bar: 0})

      // The same prism from chapter 1.3.3:
      const pr = prism(() => {
        return prism.source(listen, get) * 2
      })

      // now let's define the `listen` and `get` functions that we'll pass to `prism.source()`
      function listen(cb: (value: number) => void) {
        // `atom._onPointerValueChange()` is a method that we can use to listen to changes in a specific path of the atom's state.
        // This is not a public API, so typescript will complain, but we can silence it with `@ts-ignore`.
        // _onPointerValueChange() returns an unsubscribe function, so we'll just return that as is.
        // @ts-ignore
        return atom._onPointerValueChange(
          // the path to listen to is just the pointer to the `bar` property of the atom's state.
          atom.pointer.bar,
          cb,
        )
      }

      // The `get` function will just return the value of the `bar` property of the atom's state.
      function get() {
        return atom.get().bar
      }

      // And that's it! We can now use the prism with the atom's state.

      // let's make the prism hot
      const staleListener = jest.fn()
      const unsubscribe = pr.onStale(staleListener)
      expect(pr.isHot).toBe(true)

      // and let's read its value
      expect(pr.getValue()).toBe(0)

      // now let's change the value of the source
      atom.setByPointer((p) => p.bar, 1)

      // our prism will know that the source has changed, and it'll update its value.
      expect(pr.getValue()).toBe(2)

      unsubscribe()

      // and that's how we create a prism that depends on an atom, but that's still
      // pretty verbose. Let's see how to do the same thing in a more convenient way.
    })

    test(`2.3 - The easy way to use Atoms with prisms`, () => {
      // In the previous chapter, we learned how to create a prism that depends on an atom,
      // but we had to provide our own `listen` and `get` functions. Now let's see how to do the same
      // thing with an Atom, but in the idiomatic way. We'll use pointers and `val()`.

      // Let's create an atom with an initial state.
      const atom = new Atom({foo: 'foo', bar: 0})

      // Now instead of using `prism.source()`, we'll use val(atom.pointer):
      const pr = prism(() => {
        // We'll cover pointers and `val()` soon, but for now, just know that `val(atom.pointer.bar)`
        // will return the value of the `bar` property of the atom's state.
        return val(atom.pointer.bar) * 2
      })

      // and that's it!

      // let's test that it works as expected
      const staleListener = jest.fn()
      const unsubscribe = pr.onStale(staleListener)
      expect(pr.isHot).toBe(true)

      // and let's read its value
      expect(pr.getValue()).toBe(0)

      // now let's change the value of the source
      atom.setByPointer((p) => p.bar, 1)

      // this time, our prism will know that the source has changed, and it'll update its value.
      expect(pr.getValue()).toBe(2)

      unsubscribe()
    })
  })

  describe(`3 - Pointers`, () => {
    test('3.0 - Why pointers?', () => {
      // We've come across pointers a few times already.
      {
        // For example, we saw that Atoms provide `set|get|reduceByPointer()` methods:
        const atom = new Atom({foo: 'foo', bar: 0})
        atom.setByPointer((p) => p.bar, 1)
        // or equivalently:
        atom.setByPointer(atom.pointer.bar, 1)
      }

      // You might be wondering why not just use dot-delimited paths like in lodash's `set(val, 'path.to.prop', 1)`?
      // The answer is that pointers are much easier to type, and they work well with typescript's autocomplete.
      // Another benefit is that pointers are always cached, in so that `pointer.bar === pointer.bar` will always be true,
      // which means we can use them to attach metadata to a pointer. We'll see how to do that in a bit.

      // Another alternative to pointers is array paths, like in lodash's `set(val, ['path', 'to', 'prop'], 1)`.
      // Similar to dot-delimited paths, array paths are also not easy to type, and they don't work well with typescript's autocomplete.
      // Another problem is that creating an array path every time we want to access a property is not very efficient.
      // The JS engine will have to allocate a new array every time, and then it'll have to iterate over it to find the property.
      // Pointers on the other hand, are always cached, so they're allocated only once.

      // We'll learn how to take advantage of these benefits in the next sub-chapters.
    })
    test(`3.1 - Pointers in the runtime`, () => {
      // Let's have a look at how pointers work in the runtime.
      // Pointers refer to a specific nested property of an object. The object is called the "root" of the pointer,
      // and the property is called the "path" of the pointer.

      // So for example, if this is our root object:
      const root = {foo: 'foo', bar: 0}
      // This pointer will refer to the whole object:
      const p = pointer({root: root, path: []})

      // We can inspect the pointer's root and path using `getPointerParts()`:
      const parts = getPointerParts(p)
      expect(parts.root).toBe(root)
      expect(parts.path).toEqual([])

      // This pointer will refer to the `foo` property of the root object:
      const pointerToFoo = p.foo
      // p.foo is a pointer to the `foo` property of the root object. its only difference to p is that its path is `['foo']`
      expect(getPointerParts(pointerToFoo).path).toEqual(['foo'])
      expect(getPointerParts(pointerToFoo).root).toBe(root)

      // subPointers are cached. Calling `p.foo` twice will return the same pointer:
      expect(pointerToFoo).toBe(p.foo)

      // we can also manually construct the pointer to foo:
      const pointerToFoo2 = pointer({root: root, path: ['foo']})
      expect(getPointerParts(pointerToFoo2).path).toEqual(['foo'])
    })

    test(`3.2 - Pointers in typescript`, () => {
      // Pointers become more useful when we properly type them. Let's do that now:

      type Data = {str: string; foo?: {bar?: {baz: number}}}
      const root: Data = {str: 'some string'}

      const p = pointer<Data>({
        root,
        path: [],
      })

      // now typescript will error if we try to access a property that doesn't exist
      // @ts-expect-error
      p.baz

      // but accessing known properties and nested properties is fine
      p.foo
      p.foo.bar.baz

      // we don't need to manually type the pointer since pointers are usually provided by Atoms, and those are already typed
      const atom = new Atom(root)

      // so this  will be fine by typescript:
      atom.pointer.foo.bar.baz

      // while this will error
      // @ts-ignore
      atom.pointer.foo.bar.baz.nonExistentProperty
    })

    test(`3.3 - Creating type-safe utility functions with pointers`, () => {
      // Now that we know how to create pointers, let's see how to use them to create utility functions.

      // Let's create a function that will set a property of an object by a pointer, similar to `lodash.set()`.
      // The function will take the root object, the pointer, and the new value.
      function setByPointer<Root, Value>(
        root: Root,
        getPointer: (ptr: Pointer<Root>) => Pointer<Value>,
        newValue: Value,
      ): Root {
        // we'll create a pointer to the root object, which would not be efficient
        // if `setByPointer` was called many times. We'll see how to improve this in the next sub-chapters.
        const rootPointer = pointer({
          root: root,
          path: [],
        }) as Pointer<Root>
        // We'll use `getPointerParts()` to get the root and path of the pointer.
        const {path} = getPointerParts(getPointer(rootPointer))

        // @ts-ignore we'll ignore the typescript error because `lodash.set()` is not typed
        return lodashSet(root, path, newValue)
      }

      // now let's test our utility function
      const data = {foo: {bar: 0}}
      const newData = setByPointer(data, (p) => p.foo.bar, 1)
      expect(newData).toEqual({foo: {bar: 1}})

      // Compared to `lodash.set()`, our function is type-safe and plays nicely with intellisense and autocomplete.
    })

    test('3.4 - Converting pointers to prisms', () => {
      // So, how does the `val()` function work?
      // Let's look at its implementation:
      const val = (input: any) => {
        // if the input is a pointer, we'll convert it to a prism and `getValue()` on it
        if (isPointer(input)) {
          return pointerToPrism(input).getValue()
          // otherwise if it's already a prism, we `getValue()` on it
        } else if (isPrism(input)) {
          return input.getValue()
        } else {
          // or otherwise we return the input as is.
          return input
        }
      }

      // So, the interesting part is the `pointerToPrism()` function. How does it
      // convert a pointer to a prism?

      // Let's implement it:
      function pointerToPrismV1<V>(ptr: Pointer<V>): Prism<V> {
        // we'll use `getPointerParts()` to get the root and path of the pointer
        const {root} = getPointerParts(ptr)
        // Then we check whether the root is an atom
        if (!(root instanceof Atom)) {
          throw new Error(
            `pointerToPrismV1() only supports pointers whose root is an Atom`,
          )
        }

        // We'll need to define the listen/get functions as well

        // the listen function will listen to changes on the pointer
        const listen = (cb: (newValue: V) => void): (() => void) => {
          // @ts-ignore we'll ignore the typescript error because `_onPointerValueChange()` is not a public method
          return atom._onPointerValueChange(ptr, cb)
        }

        const get = (): V => {
          return root.getByPointer(ptr)
        }

        // then we'll create a prism that sources from the atom
        return prism(() => {
          return prism.source(listen, get)
        })
      }

      // Now let's test it:
      const atom = new Atom({foo: {bar: 0}})
      const ptr = atom.pointer.foo.bar

      const p = pointerToPrismV1(ptr)
      expect(p.getValue()).toBe(0)

      // It works!

      // Now let's see how we can improve it.

      // First, we can cache the prism so that we don't create a new prism every time we call `pointerToPrism()`.
      // This will improve performance and reduce memory usage.
      const cache = new WeakMap<Pointer<any>, Prism<unknown>>()
      function pointerToPrismV2<V>(ptr: Pointer<V>): Prism<V> {
        // we'll check whether the pointer is already in the cache
        const cached = cache.get(ptr as any)
        if (cached) {
          return cached as any
        }

        // if not, we'll create a new prism and cache it
        const p = pointerToPrismV1(ptr)
        cache.set(ptr as any, p)
        return p
      }

      // Now let's test it:
      expect(pointerToPrismV2(ptr)).toBe(pointerToPrismV2(ptr)) // the cache works
      expect(pointerToPrismV2(ptr).getValue()).toBe(0) // the prism works

      // The second improvement would be to decouple `pointerToPrism()` from the implementation of `Atom`.
      // Namely, `pointerToPrism()` only calls `Atom._onPointerValueChange()` and `Atom.getByPointer()`, which
      // are methods that can be implemented on other objects as well. Instead, we can just define an interface
      // that requires these methods to be implemented.
      // We call this interface `PointerToPrismProvider`:
      // For example, Atom implements this interface:
      expect(isPointerToPrismProvider(atom)).toBe(true)

      // So our implementation can be updated to:
      function pointerToPrismV3<V>(ptr: Pointer<V>): Prism<V> {
        const cached = cache.get(ptr as any)
        if (cached) {
          return cached as any
        }

        const {root} = getPointerParts(ptr)
        if (!isPointerToPrismProvider(root)) {
          throw new Error(
            `pointerToPrismV3() only supports pointers whose root implements PointerToPrismProvider`,
          )
        }
        // one final improvement is to allow the implementation of `PointerToPrismProvider` to create
        // the prism, rather than us calling `prism()`, and `prism.source` directly. This will allow
        // the implementation to custmoize and possibly optimise how the prism sources its value.
        const pr = root.pointerToPrism(ptr)
        cache.set(ptr as any, pr)
        return pr
      }

      // Now let's test it:
      expect(pointerToPrismV3(ptr)).toBe(pointerToPrismV3(ptr)) // the cache works
      expect(pointerToPrismV3(ptr).getValue()).toBe(0) // the prism works

      // To summarize:
      // * we've learned how to implement a `val()` function that works with pointers and prisms.
      // * we've learned how to implement a `pointerToPrism()` function that converts a pointer to a prism.
      // * we've learned how to improve the performance of `pointerToPrism()` by caching the prisms.
      // * we've learned how to decouple `pointerToPrism()` from the implementation of `Atom` by using an interface.
    })
  })

  describe('5 - Tickers', () => {
    // A ticker is how dataverse allows you to coordinate the timing of your computations.
    // For example, let's say we have a prism whose value changes every 5 milliseconds. And we want to
    // render the value of that prism every ~16 milliseconds (60fps). A ticker allows us to do that.

    test('5.1 - Our prism has gone stale...', () => {
      // In order to see how tickers fit into the picture, we should first understand how prisms
      // go stale.
      const atom = new Atom('1')

      const aParsed = prism(() => parseInt(val(atom.pointer)))

      // To illustrate how prisms go stale, we'll create a prism that computes the factorial of the atom's value.
      // Since factorial is a computationally expensive operation, we'll only want to compute it when we actually
      // need it.
      function factorial(n: number): number {
        if (n === 0) return 1
        return n * factorial(n - 1)
      }

      // we'll want to track how many times our prism actually recalculates its value, so we'll use a jest spy
      const recalculateSpy = jest.fn()
      const aFactoriel = prism(() => {
        recalculateSpy()
        return factorial(val(aParsed))
      })

      // To make it easy to inspect the state of a prism, we'll create a helper function:
      const prismState = (
        p: Prism<any>,
      ): 'cold' | 'hot:stale' | 'hot:fresh' => {
        // @ts-ignore this is a hack to access the internal state of the prism
        const internalState = p._state as any
        return internalState.hot === false
          ? 'cold'
          : internalState.handle._isFresh
          ? 'hot:fresh'
          : 'hot:stale'
      }

      // Every prism starts out as 'cold'
      expect(prismState(aFactoriel)).toBe('cold')
      expect(prismState(aParsed)).toBe('cold')

      {
        // as soon as we subscribe to its `onStale` event, it becomes 'hot:fresh'
        const unsubscribe = aFactoriel.onStale(jest.fn())
        expect(prismState(aFactoriel)).toBe('hot:fresh')
        // since its value is fresh, it should have already called our spy
        expect(recalculateSpy).toHaveBeenCalledTimes(1)
        recalculateSpy.mockClear()

        // and if we try to get its value, it won't recalculate it
        expect(aFactoriel.getValue()).toBe(1)
        expect(recalculateSpy).toHaveBeenCalledTimes(0)

        // and if we change the state of our atom,
        atom.set('2')
        // our prism will go stale:
        expect(prismState(aFactoriel)).toBe('hot:stale')
        // And so will its dependency:
        expect(prismState(aParsed)).toBe('hot:stale')

        // Has the recalculate spy been called?
        expect(recalculateSpy).toHaveBeenCalledTimes(0)
        // it hasn't. It'll only recalculate when we actually need its value:
        expect(aFactoriel.getValue()).toBe(2)
        expect(recalculateSpy).toHaveBeenCalledTimes(1)
        unsubscribe()
      }

      // So far we have established that instead of recalculating their values, prisms simply go stale when their dependencies change.
      // and they'll go fresh again when we call `getValue()` on them.

      // tickers are a way to make sure `getValue()` is called at the rate/frequency we want.
      const ticker = new Ticker()
      const onChange = jest.fn()
      // notice how we're using `onChange` only on the prism that we care about, and not on its dependencies.
      const unsubscribe = aFactoriel.onChange(ticker, onChange)
      // now our prism will go stale every time our atom changes, but it won't recalculate its value until we call `tick()`
      atom.set('3')
      expect(onChange).toHaveBeenCalledTimes(0)
      ticker.tick()
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(6)

      // We'd usually create a single ticker for an entire page, and call `tick()` on it every frame.
      // For example, on a regular web page, we'd use `requestAnimationFrame()` to `tick()` our ticker.
      // On an XR session, we'd use `XRSession.requestAnimationFrame()`.
      function tickEveryFrame() {
        ticker.tick()
        requestAnimationFrame(tickEveryFrame)
      }
      // now we're not gonna call `tickEveryFrame()` because our tests are running on node, but you get the idea.
      unsubscribe()

      // Also note that we can have multiple tickers for the same prism:
      // `pr.onChange(ticker1, ...); pr.onChange(ticker2, ...);` is perfectly valid.
      // And it would be useful if we're using the value of the same prism in multiple places.
    })

    // That's pretty much it for tickers. If you're curious how they work, have a look at `./Ticker.test.ts`
  })

  describe('6 - Prism hooks', () => {
    // Prism hooks are inspired by [React hooks](https://reactjs.org/docs/hooks-intro.html) ) and work in a similar way.
    describe(`6.1 - prism.source()`, () => {
      // We've already come across `prism.source()` in chapter 3. `prism.source()` allow a prism to react to changes in
      // some external source (other than other prisms). For example, `Atom.pointerToPrism()` uses `prism.source()` to
      // create a prism that reacts to changes in the atom's value.

      // Here is another example. Let's say we want to create a prism that reacts to changes in the value of an HTML input element:
      test(`6.1.1 - Example: listening to changes in an input element`, () => {
        function prismFromInputElement(input: HTMLInputElement): Prism<string> {
          function subscribe(cb: (value: string) => void) {
            const listener = () => {
              cb(input.value)
            }
            input.addEventListener('input', listener)
            return () => {
              input.removeEventListener('input', listener)
            }
          }

          function get() {
            return input.value
          }
          return prism(() => prism.source(subscribe, get))
        }

        // And this is how we'd use it:
        // const el = document.querySelector('input.our-input')
        // const prism = prismFromInputElement(el)
        // our prism will start listening to changes in the input element as soon as it goes hot,
        // and it will stop listening when it goes cold.
      })

      test('6.2.2 - Behavior of `prism.source()`', () => {
        // Let's use a few spies to see what's going on under the hood:
        const events: Array<'get' | 'subscribe' | 'unsubscribe'> = []

        const subscribe = () => {
          events.push('subscribe')
          return () => {
            events.push('unsubscribe')
          }
        }
        const get = () => {
          events.push('get')
        }

        const pr = prism(() => prism.source(subscribe, get))
        expect(events).toEqual([])
        pr.getValue()
        // since our prism is cold, it won't subscribe to the source and will only call `get()`
        expect(events).toEqual(['get'])
        events.length = 0 // reset the events array

        // as we know, cold prisms do not cache their values, so calling `getValue()` again will call `get()` again:
        pr.getValue()
        expect(events).toEqual(['get'])

        events.length = 0 // reset the events array

        // now let's make our prism hot:
        const unsub = pr.onStale(() => {})
        // as soon as the prism goes hot, it will subscribe to the source, and it'll also call `get()` for the first time:
        expect(events).toEqual(['subscribe', 'get'])
        events.length = 0 // reset the events array
        pr.getValue()
        expect(events).toEqual([])

        // now let's make our prism cold again:
        unsub()
        // as soon as the prism goes cold, it will unsubscribe from the source:
        expect(events).toEqual(['unsubscribe'])
      })
    })
    test(`6.2 - prism.ref()`, () => {
      // Just like React's `useRef()`, `prism.ref()` allows us to create a prism that holds a reference to some value.
      // The only difference is that `prism.ref()` requires a key to be passed into it, whlie `useRef()` doesn't.
      // This means that we can call `prism.ref()` in any order, and we can call it multiple times with the same key.
      const spy = jest.fn()
      const atom = new Atom(0)
      const pr = prism(() => {
        val(atom.pointer) // just to make our prism depend on the atom. we don't care about the value of the atom.

        const elRef = prism.ref<undefined | HTMLElement>('my-key', undefined)
        spy(elRef.current)
        if (elRef.current === undefined) {
          // @ts-ignore - we're just testing the behavior here, we won't create a real dom node
          elRef.current = {}
        }
      })
      // now, what happens if we get the value of our prism?
      pr.getValue()
      expect(spy).toHaveBeenCalledWith(undefined)
      spy.mockClear()

      // and if we get its value again?
      pr.getValue()
      expect(spy).toHaveBeenCalledWith(undefined) // the ref is still undefined
      spy.mockClear()

      // this is because `prism.ref()` only works when the prism is hot, otherwise it'll always return the initial value of the ref.
      // So let's make our prism hot:
      const unsub = pr.onStale(() => {})
      expect(spy).toHaveBeenCalledWith(undefined)
      spy.mockClear()
      // now let's make the prism go stale
      atom.set(1)
      // of course the atom won't recalculate as long as we don't call `getValue()` on it:
      expect(spy).not.toHaveBeenCalled()
      // so let's call `getValue()` on it:
      pr.getValue()
      expect(spy).toHaveBeenCalledWith({})
      // and that's how `prism.ref()` works!
      unsub()
    })
    describe(`6.3 - prism.memo()`, () => {
      // `prism.memo()` works just like React's `useMemo()` hook. It's a way to cache the result of a function call.
      // The only difference is that `prism.memo()` requires a key to be passed into it, whlie `useMemo()` doesn't.
      // This means that we can call `prism.memo()` in any order, and we can call it multiple times with the same key.

      test(`6.3.1 - Example: using prism.memo()`, () => {
        const atom = new Atom(1)
        function factorial(n: number): number {
          if (n === 0) return 1
          return n * factorial(n - 1)
        }

        const spy = jest.fn()

        const pr = prism(() => {
          // num will be between 0 and 9. This is so we can test what happens when the atom's value changes, but
          // the memoized value doesn't change.
          const num = val(atom.pointer)
          const numMod10 = num % 10
          const value = prism.memo(
            // we need a string key to identify the hook. This allows us to call `prism.memo()` in any order, or even conditionally.
            'factorial',
            // the function to memoize
            () => {
              spy()
              return factorial(numMod10)
            },
            // the dependencies of the function. If any of the dependencies change, the function will be called again.
            [numMod10],
          )

          return `number is ${num}, num % 10 is ${numMod10} and its factorial is ${value}`
        })

        // firts let's test our prism when it's cold:
        expect(pr.getValue()).toBe(
          'number is 1, num % 10 is 1 and its factorial is 1',
        )
        expect(spy).toHaveBeenCalledTimes(1)

        // since cold prisms don't cache their values, calling `getValue()` again will call the factorial function again:
        expect(pr.getValue()).toBe(
          'number is 1, num % 10 is 1 and its factorial is 1',
        )
        expect(spy).toHaveBeenCalledTimes(2)

        spy.mockClear()
        // now let's make our prism hot:
        const unsub = pr.onStale(() => {})
        pr.getValue()
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()

        // if the memo's dependencies don't change, the memoized function won't be called again:
        pr.getValue()
        expect(spy).toHaveBeenCalledTimes(0)

        // now let's change the atom's value, but not the factorial value:
        atom.set(11)
        // our prism _will_ recalculate, but the memoized function won't be called again:
        expect(pr.getValue()).toBe(
          'number is 11, num % 10 is 1 and its factorial is 1',
        )
        expect(spy).toHaveBeenCalledTimes(0)

        unsub()
        // and that's how `prism.memo()` works!
      })
    })
    describe(`6.4 - prism.effect() and prism.state()`, () => {
      // These are two more hooks that are similar to React's `useEffect()` and `useState()` hooks.

      // `prism.effect()` is similar to React's `useEffect()` hook. It allows us to run side-effects when the prism is calculated.
      // Note that prisms are supposed to be "virtually" pure functions. That means they either should not have side-effects (and thus, no calls for `prism.effect()`),
      // or their side-effects should clean themselves up when the prism goes cold.

      // `prism.state()` is similar to React's `useState()` hook. It allows us to create a stateful value that is scoped to the prism.

      // We'll defer to React's documentation for [a more detailed explanation of how `useEffect()`](https://reactjs.org/docs/hooks-effect.html)
      // and how [`useState()`](https://reactjs.org/docs/hooks-state.html) work.
      // But here's a quick example:
      test(`6.4.1 - Example: using prism.effect() and prism.state()`, () => {
        jest.useFakeTimers()
        const events: Array<
          'effectInstalled' | 'intervalCalled' | 'effectCleanedUp'
        > = []
        const pr = prism(() => {
          const [randomValue, setRandomValue] = prism.state('randomValue', 0)

          // This is only allowed for prisms that are supposed to be hot before their first calculation.
          // Otherwise it will log a warning and no effect will run.
          prism.effect(
            'update-random-value',
            () => {
              events.push('effectInstalled')
              const interval = setInterval(() => {
                events.push('intervalCalled')
                setRandomValue(Math.random())
              }, 1000)
              return () => {
                events.push('effectCleanedUp')
                clearInterval(interval)
              }
            },
            [],
          )
          return randomValue
        })

        // let's make our prism hot:
        const unsub = pr.onStale(() => {})
        // which should already have called the effect:
        expect(events).toEqual(['effectInstalled'])
        pr.getValue()
        events.length = 0 // clear the events array
        // now let's fast-forward the time by 2500ms:
        jest.advanceTimersByTime(2500)
        // and we should have seen the interval called twice:
        expect(events).toEqual(['intervalCalled', 'intervalCalled'])
        expect(pr.getValue()).toEqual(expect.any(Number))
        events.length = 0 // clear the events array

        // now let's unsubscribe from the prism:
        unsub()
        expect(events).toEqual(['effectCleanedUp'])
      })

      test('6.4.2 - A more useful example', () => {
        // This prism holds the current mouse position and updates when the mouse moves
        const mousePositionPr = prism(() => {
          const [pos, setPos] = prism.state<[x: number, y: number]>(
            'pos',
            [0, 0],
          )

          prism.effect(
            'setupListeners',
            () => {
              const handleMouseMove = (e: MouseEvent) => {
                setPos([e.screenX, e.screenY])
              }
              document.addEventListener('mousemove', handleMouseMove)

              return () => {
                document.removeEventListener('mousemove', handleMouseMove)
              }
            },
            [],
          )

          return pos
        })
        // We can't test this since our test environment doesn't have a mouse, but you get the idea :)
      })
    })

    test(`6.5 - prism.sub()`, () => {
      // `prism.sub()` is a shortcut for creating a prism inside another prism.
      // It's equivalent to calling `prism.memo(key, () => prism(fn), deps).getValue()`.
      // `prism.sub()` is useful when you want to divide your prism into smaller prisms, each of which
      // would _only_ recalculate when _certain_ dependencies change. In other words, it's an optimization tool.

      function factorial(num: number): number {
        if (num === 0) return 1
        return num * factorial(num - 1)
      }

      const events: Array<'foo-calculated' | 'bar-calculated'> = []

      // example:
      const state = new Atom({foo: 0, bar: 0})
      const pr = prism(() => {
        const resultOfFoo = prism.sub(
          'foo',
          () => {
            events.push('foo-calculated')
            const foo = val(state.pointer.foo) % 10
            // Note how `prism.sub()` is more powerful than `prism.memo()` because it allows us to use `prism.memo()` and other hooks inside of it:
            return prism.memo('factorial', () => factorial(foo), [foo])
          },
          [],
        )
        const resultOfBar = prism.sub(
          'bar',
          () => {
            events.push('bar-calculated')
            const bar = val(state.pointer.bar) % 10

            return prism.memo('factorial', () => factorial(bar), [bar])
          },
          [],
        )

        return `result of foo is ${resultOfFoo}, result of bar is ${resultOfBar}`
      })

      const unsub = pr.onStale(() => {})
      // on the first run, both subs should be calculated:
      expect(events).toEqual(['foo-calculated', 'bar-calculated'])
      events.length = 0 // clear the events array

      // now if we change the value of `bar`, only `bar` should be recalculated:
      state.setByPointer(state.pointer.bar, 2)
      pr.getValue()
      expect(events).toEqual(['bar-calculated'])

      unsub()
    })

    test(`6.6 - prism.scope()`, () => {
      // since prism hooks are keyed (as opposed to React hooks where they're identified by their order),
      // it's possible to have multiple hooks with the same key in the same prism.
      // To avoid this, we can use `prism.scope()` to create a "scope" for our hooks.
      // Example:
      const pr = prism(() => {
        prism.scope('a', () => {
          prism.memo('foo', () => 1, [])
        })

        prism.scope('b', () => {
          prism.memo('foo', () => 1, [])
        })
      })
    })
  })

  // What's next?
  // At this point we have covered all of `@theatre/dataverse`.
  // If you're planning to use Dataverse with React, have a look at [`@theatre/react`](https://github.com/theatre-js/theatre/tree/main/packages/react)
  // which provides a React integration for Dataverse as well.
})
