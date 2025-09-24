import * as vscode from 'vscode'

import { FavouriteProvider } from '../provider/FavouriteProvider'
import { isMultiRoots, getSingleRootPath } from '../helper/util'
import configMgr from '../helper/configMgr'
import { ItemInSettingsJson } from '../model'

export function open(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.open', async function (uri: vscode.Uri) {
    let usePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

    if (usePreview) {
      usePreview = !wasDoubleClick(uri, favouriteProvider)
    }

    await vscode.commands.executeCommand('vscode.open', uri, { preview: usePreview })
  })
}

export function markOpen(favouriteProvider: FavouriteProvider) {
  return vscode.commands.registerCommand('favourite.markOpen', async function (uri: vscode.Uri, lineNumber: number) {
    let usePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

    if (usePreview) {
      usePreview = !wasDoubleClick(uri, favouriteProvider)
    }

    await vscode.commands.executeCommand('vscode.open', uri, { preview: usePreview })
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = new vscode.Position(lineNumber - 1, 0); // 行号从0开始计数
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
    }
  })
}

//  and treating the second of these as a non-preview open.
export function reveal(favouriteProvider: FavouriteProvider) {
  favouriteProvider.onDidExpandElement((args) => {
    configMgr.tree.reveal(args, { select: true, focus: true, expand: true })
  })
  return vscode.commands.registerCommand('favourite.file.reveal', async function () {
    let fileUri = vscode.window.activeTextEditor?.document.uri
    if (!fileUri) {
      await vscode.commands.executeCommand('copyFilePath');
      const copyFilePath = await vscode.env.clipboard.readText()
      if (!copyFilePath) return
      fileUri = vscode.Uri.file(copyFilePath)
    }
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
      favouriteProvider.getExpandElement({ filePath, parentPath })
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

