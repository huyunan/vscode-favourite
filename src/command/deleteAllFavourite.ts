import * as vscode from 'vscode'

import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function deleteAllFavourite() {
  return vscode.commands.registerCommand('favourite.deleteAllFavourite', () => {
    const previousResources = getCurrentResources()
    const currentGroup = configMgr.get('currentGroup')

    configMgr.save([
      {
        key: 'resources',
        value: previousResources.filter((r) => r.group !== currentGroup),
      },
    ])
    .catch(console.warn)
  })
}
