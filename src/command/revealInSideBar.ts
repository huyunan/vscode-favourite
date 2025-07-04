import * as vscode from 'vscode'

import { Resource } from '../provider/FavouriteProvider'
import localize from '../helper/localize'

export function revealInSideBar() {
  return vscode.commands.registerCommand('favourite.revealInSideBar', async function (value: Resource) {
    if (!value && !vscode.window.activeTextEditor) {
      return vscode.window.showWarningMessage(localize('msg.add.choose.require'))
    }

    if (value.uri) {
      await vscode.commands.executeCommand('revealInExplorer', value.uri)
    }
  })
}
