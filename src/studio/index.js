// @flow
// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import TheStudioClass from '$studio/TheStudioClass'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'

const theaterStudioInstance = new TheStudioClass()
theaterStudioInstance.run()

module.exports = {
  studio: theaterStudioInstance,
  react: {
    Root: createRootComponentForReact(theaterStudioInstance),
  },
}


// import {types, onSnapshot, onPatch} from 'mobx-state-tree'
// import {autorun} from 'mobx'

// const Todo = types.model('Todo', {
//   title: types.string,
//   done: types.boolean,
// }).actions((self) => ({
//   toggle() {
//     self.done = !self.done
//   },
// }))

// const Store = types.model('Store', {
//   todos: types.array(Todo),
// }).actions((self) => ({
//   dush(todo) {
//     self.todos.push(Todo.create(todo))
//   },
// }))

// // create an instance from a snapshot
// const store = Store.create({todos: [{
//   title: 'Get coffee',
//   done: false,
// }]})

// autorun(() => {
//   store.todos.forEach((a) => {
//     console.log('naught', a.done)
//   })
//   console.log('length', store.todos.length)
// })

// console.log(store.todos[0])

// onPatch(store, (p) => {
//   debugger
//   console.log('p', p)
// })
// // invoke action that modifies the tree
// store.todos[0].toggle()
// store.dush({title: 'hi', done: false})

// // setTimeout(() => {store.todos[1].toggle()}, 20)
