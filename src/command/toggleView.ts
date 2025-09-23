import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import { FavouriteMarkProvider } from '../provider/FavouriteMarkProvider'
import configMgr from '../helper/configMgr'

export function toggleView(favouriteProvider: FavouriteProvider, favouriteMarkProvider: FavouriteMarkProvider) {
  return vscode.commands.registerCommand('favourite.nav.toggleView', async function(value: Resource) {
    if (configMgr.tree.visible) {
      vscode.commands.executeCommand('setContext', 'ext:favourite-mark-view', true)
    } else {
      vscode.commands.executeCommand('setContext', 'ext:favourite-mark-view', false)
    }
  })
}
