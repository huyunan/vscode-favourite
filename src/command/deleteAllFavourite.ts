import * as vscode from 'vscode'

import configMgr from '../helper/configMgr'
import { getAllBookmarks, getCurrentResources } from '../helper/util'
import { DEFAULT_GROUP } from '../enum'

export function deleteAllFavourite() {
  return vscode.commands.registerCommand('favourite.deleteAllFavourite', () => {
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    // bookmarks
    if (configMgr.marktree.visible) {
        const allBookmarks = getAllBookmarks()
        configMgr.save([
          {
            key: 'bookmarks',
            value: allBookmarks.filter((r) => r.group !== currentGroup),
          },
        ])
        .catch(console.warn)
        return
    }
    // favourite
    const previousResources = getCurrentResources()

    configMgr.save([
      {
        key: 'resources',
        value: previousResources.filter((r) => r.group !== currentGroup),
      },
    ])
    .catch(console.warn)
  })
}
