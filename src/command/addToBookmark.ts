import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getAllBookmarks } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'

export function addToBookmark() {
  return vscode.commands.registerCommand('favourite.addToBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return
    const start = new vscode.Position(lineNumber - 1, 0);
    const end = new vscode.Position(lineNumber - 1, 50);
    const range = new vscode.Range(start, end)
    // todo 以后要做修改，把一些单词挑选出来
    const content = activeEditor.document.getText(range)
    addBookmark(lineNumber, uri, content.trim().substring(0, 25))
  })
}

export function addToNameBookmark() {
  return vscode.commands.registerCommand('favourite.addToNameBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return
    const start = new vscode.Position(lineNumber - 1, 0);
    const end = new vscode.Position(lineNumber - 1, 50);
    const range = new vscode.Range(start, end)
    const content = activeEditor.document.getText(range)
    addBookmark(lineNumber, uri, content.trim().substring(0, 25))
  })
}

async function addBookmark(lineNumber: number, uri: vscode.Uri, content: string) {
    const fileName = uri.fsPath
    const allBookmarks = getAllBookmarks()
    const markPath = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const item = allBookmarks.find(b => b.filePath === markPath && b.group === currentGroup)
    if (item) {
      if (item.lineNumber && item.lineNumber.length > 0) {
        item.lineNumber.push(lineNumber)
        item.content.push(content)
      } else {
        item.lineNumber = [lineNumber]
        item.content = [content]
      }
    } else {
      allBookmarks.push({
        filePath: markPath,
        lineNumber: [lineNumber],
        content: [content],
        group: currentGroup
      })
    }

    await configMgr.save([{key: 'bookmarks', value: allBookmarks}]).catch(console.warn)
    if (configMgr.get('groups') == undefined || configMgr.get('groups').length == 0) {
      configMgr.save([{key: 'groups', value: [DEFAULT_GROUP]}]).catch(console.warn);
    }
}

export function setBookmark(activeEditor: vscode.TextEditor | undefined) {
    const fileName = activeEditor.document.uri.fsPath
    const allBookmarks = getAllBookmarks()
    const markPath = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const item = allBookmarks.find(b => b.filePath === markPath && b.group === currentGroup)
    if (item && item.lineNumber && item.lineNumber.length > 0) {
      const ranges = item.lineNumber.map((lineNumber: number) => {
        const start = new vscode.Position(lineNumber - 1, 0);
        const end = new vscode.Position(lineNumber - 1, 0);
        const range = new vscode.Range(start, end)
        return range
      })
      configMgr.disposeDeco(markPath)
      activeEditor.setDecorations(configMgr.getDeco(markPath), ranges)
    } else {
      configMgr.disposeDeco(markPath)
      configMgr.decoMap.delete(markPath)
    }
}