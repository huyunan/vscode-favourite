import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getAllBookmarks } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'

export function deleteBookmark() {
  return vscode.commands.registerCommand('favourite.deleteBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    const fileName = uri.fsPath
    const allBookmarks = getAllBookmarks()
    const markPath = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const item = allBookmarks.find(b => b.filePath === markPath && b.group === currentGroup)
    if (item && item.bookmarks && item.bookmarks.length > 0) {
      item.bookmarks = item.bookmarks.filter(line => line.lineNumber !== lineNumber)
    }
    if (!item.bookmarks || item.bookmarks.length == 0) {
      const idx = allBookmarks.findIndex(b => b.filePath === markPath && b.group === currentGroup)
      allBookmarks.splice(idx, 1)
    }
    await configMgr.save([{key: 'bookmarks', value: allBookmarks}]).catch(console.warn)

    if (configMgr.get('groups') == undefined || configMgr.get('groups').length == 0) {
      configMgr.save([{key: 'groups', value: [DEFAULT_GROUP]}]).catch(console.warn);
    }
  })
}
