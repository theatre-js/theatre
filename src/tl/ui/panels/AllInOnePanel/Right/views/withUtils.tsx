import React from 'react'
import {
  TPropGetter,
  ItemPropGetterContext,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import {OverlaysAPIContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'
import {TOverlaysAPI} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'

export interface IWithUtilsProps {
  propGetter: TPropGetter
  overlaysAPI: TOverlaysAPI
}

export default <P extends {}>(
  Component: React.ComponentType<P & IWithUtilsProps>,
) => (props: P) => (
  <ItemPropGetterContext.Consumer>
    {propGetter => (
      <OverlaysAPIContext.Consumer>
        {overlaysAPI => (
          <Component
            {...props}
            propGetter={propGetter}
            overlaysAPI={overlaysAPI}
          />
        )}
      </OverlaysAPIContext.Consumer>
    )}
  </ItemPropGetterContext.Consumer>
)

// import {Subscriber} from 'react-broadcast'
// import {
//   VariablesPropGetterChannel,
//   TPropGetter,
// } from '$tl/ui/panels/AllInOnePanel/Right/variables/VariablesPropProvider'
// import {SelectionAPIChannel} from '$tl/ui/panels/AllInOnePanel/Right/selection/SelectionProvider'
// import {OverlaysAPIChannel} from '$tl/ui/panels/AllInOnePanel/Right/overlays/OverlaysProvider'
// import {TSelectionAPI} from '$tl/ui/panels/AllInOnePanel/Right/selection/types'
// import {TOverlaysAPI} from '$tl/ui/panels/AllInOnePanel/Right/overlays/types'

// export interface IWithUtilsProps {
//   propGetter: TPropGetter
//   selectionAPI: TSelectionAPI
//   overlaysAPI: TOverlaysAPI
// }

// export default <P extends {}>(
//   Component: React.ComponentType<P & IWithUtilsProps>,
// ) => (props: P) => (
//   <Subscriber channel={VariablesPropGetterChannel}>
//     {(propGetter: TPropGetter) => (
//       <Subscriber channel={SelectionAPIChannel}>
//         {(selectoinAPI: TSelectionAPI) => (
//           <Subscriber channel={OverlaysAPIChannel}>
//             {(overlaysAPI: TOverlaysAPI) => (
//               <Component
//                 {...props}
//                 propGetter={propGetter}
//                 selectionAPI={selectoinAPI}
//                 overlaysAPI={overlaysAPI}
//               />
//             )}
//           </Subscriber>
//         )}
//       </Subscriber>
//     )}
//   </Subscriber>
// )
