import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'

// The favourite.open command is not listed in settings.json as a contribution because it only gets invoked
//  from the user's click on an item in the FavouriteProvider tree.
// It serves as a proxy for the vscode.open command, detecting two opens of the same item in quick succession
//  and treating the second of these as a non-preview open.
export function open(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.open', async function (uri: vscode.Uri) {
    let usePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

    if (usePreview) {
      usePreview = !wasDoubleClick(uri, favouriteProvider)
    }

    await vscode.commands.executeCommand('vscode.open', uri, { preview: usePreview })
  })
}


// Return true if previously called with the same arguments within the past 0.5 seconds
function wasDoubleClick(uri: vscode.Uri, favouriteProvider: FavouriteProvider): boolean {
  let result = false;
  if (favouriteProvider.lastOpened) {
    const isTheSameUri = (favouriteProvider.lastOpened.uri === uri)
    const dateDiff = <number>(<any>new Date() - <any>favouriteProvider.lastOpened.date)
    result = isTheSameUri && dateDiff < 500
  }

  favouriteProvider.lastOpened = {
    uri: uri,
    date: new Date()
  }
  return result;
}

