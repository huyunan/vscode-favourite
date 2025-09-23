import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import localize from '../helper/localize'
import { ItemInSettingsJson } from '../model'

export function deleteBookmark() {
  return vscode.commands.registerCommand('favourite.deleteBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    console.log(lineNumber, uri)
  })
}