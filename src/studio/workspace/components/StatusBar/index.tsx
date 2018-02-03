import {React} from '$studio/handy'
import GoRepoForked from 'react-icons/lib/go/repo-forked'
import css from './index.css'

class StatusBar extends React.PureComponent<any, any> {
  render() {
    return (
      <div className={css.container}>
        <div className={css.item}>
          <GoRepoForked className={css.syncedIcon} />
          <span className={css.text}>Synced</span>
        </div>
      </div>
    )
  }
}

export default StatusBar
