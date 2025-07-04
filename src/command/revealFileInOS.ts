import * as vscode from 'vscode'

import { Resource } from '../provider/FavouriteProvider'
import localize from '../helper/localize'

export function revealInOS_mac() {
  return vscode.commands.registerCommand('favourite.revealInOS.mac', async function (value: Resource) {
    revealFileInOS(value)
  })
}

export function revealInOS_windows() {
  return vscode.commands.registerCommand('favourite.revealInOS.windows', async function (value: Resource) {
    revealFileInOS(value)
  })
}

export function revealInOS_other() {
  return vscode.commands.registerCommand('favourite.revealInOS.other', async function (value: Resource) {
    revealFileInOS(value)
  })
}

async function revealFileInOS(value: Resource) {
  if (!value && !vscode.window.activeTextEditor) {
    return vscode.window.showWarningMessage(localize('msg.add.choose.require'))
  }
  if (value.uri) {
    await vscode.commands.executeCommand('revealFileInOS', value.uri)
  }
}
