import * as vscode from 'vscode'

import { Resource, FavouriteProvider } from '../provider/FavouriteProvider'
import { isMultiRoots, getSingleRootPath, pathResolve } from '../helper/util'
import configMgr from '../helper/configMgr'
import { ItemInSettingsJson } from '../model'

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

//  and treating the second of these as a non-preview open.
export function reveal(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.file.reveal', async function () {
    const fileUri = vscode.window.activeTextEditor?.document.uri
    const fileName = fileUri.fsPath
    // Store the stringified uri for any resource that isn't a file
    const filePath =
      fileUri.scheme !== 'file'
        ? fileUri.toString()
        : isMultiRoots()
        ? fileName
        : fileName.substr(getSingleRootPath().length + 1)

    const currentGroup = configMgr.get('currentGroup')
    const resources = (configMgr.get('resources') as Array<ItemInSettingsJson>) || []
    const index = resources.findIndex(item => item.group == currentGroup && filePath.startsWith(item.filePath))
    if (index != -1) {
      const parentPath = resources[index].filePath
      const pUri = vscode.Uri.file(pathResolve(parentPath))
      const resource = new Resource(undefined, vscode.TreeItemCollapsibleState.Collapsed, filePath, undefined)
      resource.parentPath = parentPath
      favouriteProvider.onDidExpandElement((args) => {
        console.log(args)
        configMgr.tree.reveal(args, { select: true, focus: true, expand: true })
      })
      favouriteProvider.getExpandElement({ filePath, parentPath })
      // configMgr.tree.reveal(resource, { select: true, focus: true, expand: true })
    }
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

