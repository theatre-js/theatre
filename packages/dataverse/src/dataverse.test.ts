import {Atom, prism, Ticker, val} from '@theatre/dataverse'

describe(`Dataverse guide`, () => {
  // Hi there! I'm writing this test suite as an ever-green guide to dataverse. You should be able
  // to read it from top to bottom and understand the concepts of dataverse.
  //
  // Since this is a test suite, you should be able to run it in [debug mode](https://jestjs.io/docs/en/troubleshooting)
  // and inspect the value of variables at any point in the test.

  describe(`Chapter 0 - Concepts`, () => {
    // There 4 main concepts in dataverse:
    // - Atoms, hold the state of your application.
    // - Pointers are a type-safe way to get/set/react-to changes in Atoms.
    // - Prisms are functions that react to changes in atoms and other prisms.
    // - Tickers are a way to schedule and synchronise computations.

    // before we dive into the concepts, let me show you how a simple dataverse setup looks like.
    test('A simple dataverse setup', () => {
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

  describe(`Chapter 1 - What is a prism?`, () => {
    // A Prism is a way to create a value that depends on other values.

    // let's start with a simple example:
    test(`A pretty useless prism`, async () => {
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
    test(`prisms can depend on other prisms`, async () => {
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

    test('What about state?', () => {
      // so far, our prisms have not depended on any changing values, so in turn, _their_ values have never changed either.
      // but what if we want to create a prism that depends on a changing value?
      // we call those values "sources", and we can create them using the `prism.source()` hook:

      // let's say we want to create a prism that depends on this value:
      let value = 0

      {
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
      }

      // so, the _right_ way to do this, is to use the `source` hook:
      {
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
      }

      {
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
      }
    })

    // in practice, we'll almost never need to use the `source` hook directly,
    // and we'll never need to provide our own `listen` and `get` functions.
    // instead, we'll use `Atom`s, which are sources that are already implemented for us.
  })

  describe(`Chapter 2 - Atoms`, () => {
    // In the final test of the previous chapter, we learned how to create our own sources of state,
    // and make a prism depend on them, using the `prism.source()` hook. In this chapter, we'll learn
    // how to use the `Atom` class, which is a source of state that's already implemented for us and comes
    // with a lot of useful features.
    test(`Using Atoms`, () => {})
  })
})
