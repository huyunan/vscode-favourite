import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import localize from '../helper/localize'
import { ItemInSettingsJson } from '../model'

export function addToFavourite() {
  return vscode.commands.registerCommand('favourite.addToFavourite', async (fileUri?: vscode.Uri) => {
    if (!fileUri) {
      if (!vscode.window.activeTextEditor) {
        return vscode.window.showWarningMessage(localize('msg.add.choose.require'))
      }
      fileUri = vscode.window.activeTextEditor.document.uri
    }

    const fileName = fileUri.fsPath

    const previousResources = getCurrentResources()

    // Store the stringified uri for any resource that isn't a file
    const newResource =
      fileUri.scheme !== 'file'
        ? fileUri.toString()
        : isMultiRoots()
        ? fileName
        : fileName.substr(getSingleRootPath().length + 1)

    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP

    if (previousResources.some((r) => r.filePath === newResource && r.group === currentGroup)) {
      return
    }

    await configMgr.save(
        [{key: 'resources', value: previousResources.concat([
          { filePath: newResource, group: currentGroup },
        ] as Array<ItemInSettingsJson>)}]
      )
      .catch(console.warn)

    if (configMgr.get('groups') == undefined || configMgr.get('groups').length == 0) {
      configMgr.save([{key: 'groups', value: [DEFAULT_GROUP]}]).catch(console.warn);
    }
  })
}
