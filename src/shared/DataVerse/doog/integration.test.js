
import {default as container, type IContainer} from './container'
import {prop, type IObjectPointer} from './pointers'

const example = it
describe('doog', () => {
  example('stuff', () => {
    (function(){
      type T = {
        str: string,
        obj: {
          objStr: string,
          objNum: number,
          objObj: {
            objObjStr: string,
          },
          objArr: Array<{
            objArrStr: string,
            objArrLiteral: 'literal',
          }>,
        },
        u: string | {uStr: string},
      }
      const c: IContainer<T> = container({
        str: 'hi',
        obj: {
          objStr: 'hi',
          objNum: 10,
          objObj: {
            objObjStr: 'str',
          },
          objArr: [{objArrStr: 'str', objArrLiteral: 'literal'}],
        },
        u: 'hi',
      })

      // declare var c: IContainer<T>

      const p = c.pointer();
      // declare var p: IObjectPointer<T>
      (prop(p, 'str').getValue(): string);
      // $FlowExpectError
      (prop(p, 'str').getValue(): number);

      (prop(prop(p, 'obj'), 'objStr').getValue(): string);
      // $FlowExpectError
      (prop(prop(p, 'obj'), 'objStr').getValue(): number);

      (prop(prop(p, 'u'), 'uStr').getValue(): string | void);
      (prop(prop(p, 'u'), 'b').getValue(): string | void);

    })



  })
})