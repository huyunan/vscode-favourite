import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getAllBookmarks } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'

const deco = vscode.window.createTextEditorDecorationType(
  {
    gutterIconPath: vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB0PSIxNzU4NjE1NzM4NzgxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMzNDYxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxwYXRoIGQ9Ik03MzYuOSA4OTIuNmMtMTAuOSAwLTIxLjgtMi42LTMxLjktNy45TDUxMC43IDc4Mi41IDMxNi40IDg4NC43Yy0yMy4zIDEyLjItNTAuOSAxMC4xLTcyLjEtNS4yLTIxLjItMTUuNC0zMS42LTQxLTI3LjItNjYuOWwzNy4xLTIxNi40TDk3LjEgNDQzLjFjLTE4LjgtMTguMy0yNS40LTQ1LjItMTcuMy03MC4xIDguMS0yNC45IDI5LjMtNDIuOCA1NS4yLTQ2LjZsMjE3LjItMzEuNkw0NDkuMyA5OGMxMS42LTIzLjUgMzUuMS0zOC4yIDYxLjQtMzguMiAyNi4yIDAgNDkuNyAxNC42IDYxLjMgMzguMWw5Ny4xIDE5Ni44IDIxNy4yIDMxLjVjMjYgMy44IDQ3LjIgMjEuNyA1NS4yIDQ2LjYgOC4xIDI0LjkgMS41IDUxLjgtMTcuMyA3MC4xTDc2Ny4xIDU5Ni4zbDM3LjEgMjE2LjRjNC40IDI1LjgtNiA1MS41LTI3LjIgNjYuOS0xMiA4LjYtMjYuMSAxMy00MC4xIDEzek0xNjYuOCA0MDEuMkwzMTMgNTQzLjdjMTYuMiAxNS43IDIzLjUgMzguNSAxOS43IDYwLjZsLTM0LjUgMjAxLjIgMTgwLjctOTVjMjAtMTAuNSA0My43LTEwLjUgNjMuNi0wLjFsMTgwLjcgOTUtMzQuNS0yMDEuMmMtMy45LTIyLjIgMy41LTQ0LjggMTkuNi02MC42bDE0Ni4yLTE0Mi41LTIwMi0yOS4zYy0yMi4zLTMuMy00MS42LTE3LjMtNTEuNS0zNy41bC05MC4zLTE4My05MC4zIDE4My4xYy05LjkgMjAuMi0yOS4yIDM0LjItNTEuNSAzNy40bC0yMDIuMSAyOS40eiBtMzM0LjctMjY4LjR6IiBmaWxsPSIjM0Y4NUZGIiBwLWlkPSIzMzQ2MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zNzEuNSA0ODkuM2MtMTkuMiAwLTM2LTE0LjEtMzguOS0zMy43LTMuMS0yMS41IDExLjgtNDEuNCAzMy4zLTQ0LjZsNzUuNC0xMSAzMy43LTY4LjRjOS42LTE5LjUgMzMuMi0yNy41IDUyLjctMTcuOSAxOS41IDkuNiAyNy41IDMzLjIgMTcuOSA1Mi43bC00MC4yIDgxLjRjLTcuNCAxNS4xLTIxLjggMjUuNi0zOC41IDI3LjlsLTg5LjcgMTMuMWMtMiAwLjMtMy44IDAuNS01LjcgMC41eiIgZmlsbD0iI0E0QkVFQyIgcC1pZD0iMzM0NjMiPjwvcGF0aD48L3N2Zz4=')
  }
)
export function deleteBookmark() {
  return vscode.commands.registerCommand('favourite.deleteBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return
    const fileName = activeEditor.document.uri.fsPath
    const allBookmarks = getAllBookmarks()
    const markPath = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const item = allBookmarks.find(b => b.filePath === markPath && b.group === currentGroup)
    if (item && item.lineNumber && item.lineNumber.length > 0) {
      const deletedNumbers = item.lineNumber.filter(line => line !== lineNumber)
      const ranges = deletedNumbers.map((lineNumber: number) => {
        const start = new vscode.Position(lineNumber - 1, 0);
        const end = new vscode.Position(lineNumber - 1, 0);
        const range = new vscode.Range(start, end)
        return range
      })
      activeEditor.setDecorations(deco, ranges)
      item.lineNumber = deletedNumbers
    } else {
      activeEditor.setDecorations(deco, [])
      item.lineNumber = []
    }
    await configMgr.save([{key: 'bookmarks', value: allBookmarks}]).catch(console.warn)

    if (configMgr.get('groups') == undefined || configMgr.get('groups').length == 0) {
      configMgr.save([{key: 'groups', value: [DEFAULT_GROUP]}]).catch(console.warn);
    }
  })
}