import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'

export function toggleView(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.nav.toggleView', async function(value: Resource) {
    const sort = configMgr.get('sortOrder')

    if (sort === 'MANUAL') {
      configMgr.save([{key: 'sortOrder', value: 'ASC'}])
      return
    }

    configMgr.save([{key: 'sortOrder', value: 'ASC'}])
  })
}
