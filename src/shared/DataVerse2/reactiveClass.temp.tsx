// describe(`reactiveClass`, () => {
//   it(`should work`, () => {
//     const a = {
//       method() {
//         return this.tor
//       }
//     }

//     const p = new Proxy(a, {
//       get(target, prop, receiver) {
//         return proxyMethod(target, prop)
//       }
//     })

//     const proxyMethod = (context: $FixMe, propName: $FixMe) => {
//       const method = context[propName]
//       return new Proxy(method, {
//         apply(_, ___, args) {
//           return method.apply(contextProxy(context), args)
//         }
//       })
//     }

//     const contextProxy = (context: $FixMe) => {
//       return new Proxy(context, {
//         get(target, prop) {
//           console.log('getting', prop);
//           return 'blah'
//         }
//       })
//     }

//     expect(p.method()).toEqual('a')
//   })
// })