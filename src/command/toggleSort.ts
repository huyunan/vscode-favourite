import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'

export function toggleSort(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.nav.sort', async function(value: Resource) {
    const config = vscode.workspace.getConfiguration('favourite')

    const sort = <string>config.get('sortOrder')

    if (sort === 'MANUAL') {
      return config.update('sortOrder', 'ASC', false)
    }

    if (sort === 'ASC') {
      return config.update('sortOrder', 'DESC', false)
    }

    config.update('sortOrder', 'ASC', false)
  })
}
