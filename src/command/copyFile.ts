import * as vscode from 'vscode'

import { Resource } from '../provider/FavouriteProvider'
import localize from '../helper/localize'

export function copyFilePath() {
  return vscode.commands.registerCommand('favourite.copyFilePath', async function (value: Resource) {
    if (value && value.resourceUri) {
      await vscode.env.clipboard.writeText(value.resourceUri.fsPath)
    }
  })
}

export function copyRelativeFilePath() {
  return vscode.commands.registerCommand('favourite.copyRelativeFilePath', async function (value: Resource) {
    if (value && value.value) {
      await vscode.env.clipboard.writeText(value.value)
    }
  })
}
