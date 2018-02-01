import {StudioComponent, React, resolveCss} from '$studio/handy'
import * as css from './Panel.css'
import {Subscriber} from 'react-broadcast'
import {PanelControlChannel, IPanelControlChannelData} from '$src/studio/workspace/components/PanelController'

interface IProps {
  css?: any
  label?: string
  headerLess?: boolean
}

interface IState {}

export default class Panel extends StudioComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)
    const {children, label, headerLess} = props

    return (
      <Subscriber channel={PanelControlChannel}>
        {(config: IPanelControlChannelData) => {
          const {isActive, style, label: defaultLabel} = config
          return (
            <div
              {...classes(
                'container',
                isActive && 'isActive',
                headerLess && 'headerLess',
              )}
              style={style}
            >
              <div className={css.innerWrapper}>
                <div className={css.topBar}>
                  <div className={css.title}>{label || defaultLabel}</div>
                </div>

                <div className={css.content}>{children}</div>
              </div>
            </div>
          )
        }}
      </Subscriber>
    )
  }
}
