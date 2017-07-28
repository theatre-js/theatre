// @flow
import path from 'path'

export const context = path.resolve(__dirname, '..')

export const aliases: {[alias: string]: string} = {
  $root: path.join(context, './'),
  $src: path.join(context, './src/'),
  $lb: path.join(context, './src/lb/'),
  $lf: path.join(context, './src/lf/'),
  $shared: path.join(context, './src/shared/'),
}