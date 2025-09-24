import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'

export function toggleSort(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.sort', async function(value: Resource) {
    const sort = configMgr.get('sortOrder')
    if (configMgr.marktree.visible) {
      return
    }

    if (sort === 'MANUAL') {
      configMgr.save([{key: 'sortOrder', value: 'ASC'}])
      return
    }

    if (sort === 'ASC') {
      configMgr.save([{key: 'sortOrder', value: 'DESC'}])
      return
    }

    if (sort === 'DESC') {
      configMgr.save([{key: 'sortOrder', value: 'MANUAL'}])
      return
    }

    configMgr.save([{key: 'sortOrder', value: 'ASC'}])
  })
}
