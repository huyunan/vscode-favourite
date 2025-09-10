import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import localize from '../helper/localize'
import { ItemInSettingsJson } from '../model'

export function addToBookmark() {
  return vscode.commands.registerCommand('favourite.addToBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    console.log(lineNumber, uri)
  })
}

export function addToNameBookmark() {
  return vscode.commands.registerCommand('favourite.addToNameBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    console.log(lineNumber, uri)
  })
}