import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'

export function refresh(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.nav.refresh', async function () {
    favouriteProvider.refresh()
  })
}
