import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { ItemInSettingsJson } from '../model'

export function addToBookmark() {
  return vscode.commands.registerCommand('favourite.line.addToBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    // addBookmark(lineNumber, uri)
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return
    // svg 16*16 <svg t="1758615738781" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33461" width="16" height="16"><path d="M736.9 892.6c-10.9 0-21.8-2.6-31.9-7.9L510.7 782.5 316.4 884.7c-23.3 12.2-50.9 10.1-72.1-5.2-21.2-15.4-31.6-41-27.2-66.9l37.1-216.4L97.1 443.1c-18.8-18.3-25.4-45.2-17.3-70.1 8.1-24.9 29.3-42.8 55.2-46.6l217.2-31.6L449.3 98c11.6-23.5 35.1-38.2 61.4-38.2 26.2 0 49.7 14.6 61.3 38.1l97.1 196.8 217.2 31.5c26 3.8 47.2 21.7 55.2 46.6 8.1 24.9 1.5 51.8-17.3 70.1L767.1 596.3l37.1 216.4c4.4 25.8-6 51.5-27.2 66.9-12 8.6-26.1 13-40.1 13zM166.8 401.2L313 543.7c16.2 15.7 23.5 38.5 19.7 60.6l-34.5 201.2 180.7-95c20-10.5 43.7-10.5 63.6-0.1l180.7 95-34.5-201.2c-3.9-22.2 3.5-44.8 19.6-60.6l146.2-142.5-202-29.3c-22.3-3.3-41.6-17.3-51.5-37.5l-90.3-183-90.3 183.1c-9.9 20.2-29.2 34.2-51.5 37.4l-202.1 29.4z m334.7-268.4z" fill="#3F85FF" p-id="33462"></path><path d="M371.5 489.3c-19.2 0-36-14.1-38.9-33.7-3.1-21.5 11.8-41.4 33.3-44.6l75.4-11 33.7-68.4c9.6-19.5 33.2-27.5 52.7-17.9 19.5 9.6 27.5 33.2 17.9 52.7l-40.2 81.4c-7.4 15.1-21.8 25.6-38.5 27.9l-89.7 13.1c-2 0.3-3.8 0.5-5.7 0.5z" fill="#A4BEEC" p-id="33463"></path></svg>
    const deco = vscode.window.createTextEditorDecorationType(
      {
        gutterIconPath: vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB0PSIxNzU4NjE1NzM4NzgxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMzNDYxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxwYXRoIGQ9Ik03MzYuOSA4OTIuNmMtMTAuOSAwLTIxLjgtMi42LTMxLjktNy45TDUxMC43IDc4Mi41IDMxNi40IDg4NC43Yy0yMy4zIDEyLjItNTAuOSAxMC4xLTcyLjEtNS4yLTIxLjItMTUuNC0zMS42LTQxLTI3LjItNjYuOWwzNy4xLTIxNi40TDk3LjEgNDQzLjFjLTE4LjgtMTguMy0yNS40LTQ1LjItMTcuMy03MC4xIDguMS0yNC45IDI5LjMtNDIuOCA1NS4yLTQ2LjZsMjE3LjItMzEuNkw0NDkuMyA5OGMxMS42LTIzLjUgMzUuMS0zOC4yIDYxLjQtMzguMiAyNi4yIDAgNDkuNyAxNC42IDYxLjMgMzguMWw5Ny4xIDE5Ni44IDIxNy4yIDMxLjVjMjYgMy44IDQ3LjIgMjEuNyA1NS4yIDQ2LjYgOC4xIDI0LjkgMS41IDUxLjgtMTcuMyA3MC4xTDc2Ny4xIDU5Ni4zbDM3LjEgMjE2LjRjNC40IDI1LjgtNiA1MS41LTI3LjIgNjYuOS0xMiA4LjYtMjYuMSAxMy00MC4xIDEzek0xNjYuOCA0MDEuMkwzMTMgNTQzLjdjMTYuMiAxNS43IDIzLjUgMzguNSAxOS43IDYwLjZsLTM0LjUgMjAxLjIgMTgwLjctOTVjMjAtMTAuNSA0My43LTEwLjUgNjMuNi0wLjFsMTgwLjcgOTUtMzQuNS0yMDEuMmMtMy45LTIyLjIgMy41LTQ0LjggMTkuNi02MC42bDE0Ni4yLTE0Mi41LTIwMi0yOS4zYy0yMi4zLTMuMy00MS42LTE3LjMtNTEuNS0zNy41bC05MC4zLTE4My05MC4zIDE4My4xYy05LjkgMjAuMi0yOS4yIDM0LjItNTEuNSAzNy40bC0yMDIuMSAyOS40eiBtMzM0LjctMjY4LjR6IiBmaWxsPSIjM0Y4NUZGIiBwLWlkPSIzMzQ2MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zNzEuNSA0ODkuM2MtMTkuMiAwLTM2LTE0LjEtMzguOS0zMy43LTMuMS0yMS41IDExLjgtNDEuNCAzMy4zLTQ0LjZsNzUuNC0xMSAzMy43LTY4LjRjOS42LTE5LjUgMzMuMi0yNy41IDUyLjctMTcuOSAxOS41IDkuNiAyNy41IDMzLjIgMTcuOSA1Mi43bC00MC4yIDgxLjRjLTcuNCAxNS4xLTIxLjggMjUuNi0zOC41IDI3LjlsLTg5LjcgMTMuMWMtMiAwLjMtMy44IDAuNS01LjcgMC41eiIgZmlsbD0iI0E0QkVFQyIgcC1pZD0iMzM0NjMiPjwvcGF0aD48L3N2Zz4=')
      }
    )
    const start = new vscode.Position(lineNumber - 1, 0);
    const end = new vscode.Position(lineNumber - 1, 0);
    const range = new vscode.Range(start, end)
    activeEditor.setDecorations(deco, [range])
  })
}

export function addToNameBookmark() {
  return vscode.commands.registerCommand('favourite.line.addToNameBookmark', async ({ lineNumber, uri }: { lineNumber: number, uri?: vscode.Uri }) => {
    addBookmark(lineNumber, uri)
  })
}

async function addBookmark(lineNumber: number, fileUri?: vscode.Uri) {
  if (!fileUri) return

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
    [{
      key: 'resources', value: previousResources.concat([
        { filePath: newResource, group: currentGroup },
      ] as Array<ItemInSettingsJson>)
    }]
  )
    .catch(console.warn)

  if (configMgr.get('groups') == undefined || configMgr.get('groups').length == 0) {
    configMgr.save([{ key: 'groups', value: [DEFAULT_GROUP] }]).catch(console.warn);
  }
}