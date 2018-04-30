import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import Theater from '$theater/bootstrap/Theater'

export default function withDerivation<
  OuterProps extends {},
  InnerProps extends {}
>(fn: (outerProps: Pointer<OuterProps>, theater: Theater) => InnerProps) {
  return function wrappedWithDerivation<D>(
    innerComponent: React.Component<D>,
  ): React.Component<{[K in Exclude<keyof D, keyof InnerProps>]: D[K]}> {
    const finalComponent = (outerProps: OuterProps) => {
      return (
        <PropsAsPointer props={outerProps}>
          {(outerPropsP, theater) => {
            const innerProps = fn(outerPropsP, theater) as $FixMe
            return React.createElement(innerComponent, {
              ...outerProps,
              ...innerProps,
            })
          }}
        </PropsAsPointer>
      )
    }

    // @ts-ignore @ignore
    finalComponent.displayName = `withDerivation(${innerComponent.displayName ||
      innerComponent.name ||
      'Component'})`

    hoistNonReactStatics(finalComponent, innerComponent)

    return finalComponent
  }
}
