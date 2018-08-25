import React from 'react'
import {
  TPropGetter,
  ItemPropGetterContext,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import {OverlaysAPIContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'
import {TOverlaysAPI} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import {SelectionAPIContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import {TSelectionAPI} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'

export interface IWithUtilsProps {
  propGetter: TPropGetter
  overlaysAPI: TOverlaysAPI
  selectionAPI: TSelectionAPI
}

export default <P extends {}>(
  Component: React.ComponentType<P & IWithUtilsProps>,
) => (props: P) => (
  <ItemPropGetterContext.Consumer>
    {propGetter => (
      <SelectionAPIContext.Consumer>
        {selectionAPI => (
          <OverlaysAPIContext.Consumer>
            {overlaysAPI => (
              <Component
                {...props}
                propGetter={propGetter}
                overlaysAPI={overlaysAPI}
                selectionAPI={selectionAPI}
              />
            )}
          </OverlaysAPIContext.Consumer>
        )}
      </SelectionAPIContext.Consumer>
    )}
  </ItemPropGetterContext.Consumer>
)
