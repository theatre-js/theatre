// @flow
import {React} from '$studio/handy'
import css from './TagsList.css'

const tags = [
  'div',
  'div with text',
  'header',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'button',
  'input',
  'footer',
  'picture',
  'video',
]

class TagsList extends React.PureComponent<any, void> {
  render() {
    const {onClick} = this.props
    return (
      <div className={css.container}>
        <div className={css.title}>Choose type of child:</div>
        <div className={css.tags}>
          {tags.map(tag => (
            <div className={css.tag} key={tag} onClick={() => onClick(tag)}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default TagsList
