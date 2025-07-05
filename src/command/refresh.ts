import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import configMgr from '../helper/configMgr'

export function refresh(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.nav.refresh', async function () {
    const refreshTime = new Date().toLocaleString() + " " + new Date().getMilliseconds()
    configMgr.save([{key: 'refreshTime', value: refreshTime}]);
  })
}
