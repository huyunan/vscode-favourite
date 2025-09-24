import * as vscode from 'vscode'
import * as nconf from 'nconf'
import * as path from 'path'
import localize from '../helper/localize'

import { isMultiRoots, getSingleRootPath } from './util'
import { ItemInSettingsJson } from '../model'

class ConfigMgr {
  public tree: vscode.TreeView<any>;
  public marktree: vscode.TreeView<any>;
  public decoMap: Map<string, vscode.TextEditorDecorationType> = new Map();

  getDeco(key: string): vscode.TextEditorDecorationType {
    if (!this.decoMap.has(key)) {
      
      // const deco = vscode.window.createTextEditorDecorationType(
      //   {
      //     gutterIconPath: vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB0PSIxNzU4NjE1NzM4NzgxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMzNDYxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxwYXRoIGQ9Ik03MzYuOSA4OTIuNmMtMTAuOSAwLTIxLjgtMi42LTMxLjktNy45TDUxMC43IDc4Mi41IDMxNi40IDg4NC43Yy0yMy4zIDEyLjItNTAuOSAxMC4xLTcyLjEtNS4yLTIxLjItMTUuNC0zMS42LTQxLTI3LjItNjYuOWwzNy4xLTIxNi40TDk3LjEgNDQzLjFjLTE4LjgtMTguMy0yNS40LTQ1LjItMTcuMy03MC4xIDguMS0yNC45IDI5LjMtNDIuOCA1NS4yLTQ2LjZsMjE3LjItMzEuNkw0NDkuMyA5OGMxMS42LTIzLjUgMzUuMS0zOC4yIDYxLjQtMzguMiAyNi4yIDAgNDkuNyAxNC42IDYxLjMgMzguMWw5Ny4xIDE5Ni44IDIxNy4yIDMxLjVjMjYgMy44IDQ3LjIgMjEuNyA1NS4yIDQ2LjYgOC4xIDI0LjkgMS41IDUxLjgtMTcuMyA3MC4xTDc2Ny4xIDU5Ni4zbDM3LjEgMjE2LjRjNC40IDI1LjgtNiA1MS41LTI3LjIgNjYuOS0xMiA4LjYtMjYuMSAxMy00MC4xIDEzek0xNjYuOCA0MDEuMkwzMTMgNTQzLjdjMTYuMiAxNS43IDIzLjUgMzguNSAxOS43IDYwLjZsLTM0LjUgMjAxLjIgMTgwLjctOTVjMjAtMTAuNSA0My43LTEwLjUgNjMuNi0wLjFsMTgwLjcgOTUtMzQuNS0yMDEuMmMtMy45LTIyLjIgMy41LTQ0LjggMTkuNi02MC42bDE0Ni4yLTE0Mi41LTIwMi0yOS4zYy0yMi4zLTMuMy00MS42LTE3LjMtNTEuNS0zNy41bC05MC4zLTE4My05MC4zIDE4My4xYy05LjkgMjAuMi0yOS4yIDM0LjItNTEuNSAzNy40bC0yMDIuMSAyOS40eiBtMzM0LjctMjY4LjR6IiBmaWxsPSIjM0Y4NUZGIiBwLWlkPSIzMzQ2MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zNzEuNSA0ODkuM2MtMTkuMiAwLTM2LTE0LjEtMzguOS0zMy43LTMuMS0yMS41IDExLjgtNDEuNCAzMy4zLTQ0LjZsNzUuNC0xMSAzMy43LTY4LjRjOS42LTE5LjUgMzMuMi0yNy41IDUyLjctMTcuOSAxOS41IDkuNiAyNy41IDMzLjIgMTcuOSA1Mi43bC00MC4yIDgxLjRjLTcuNCAxNS4xLTIxLjggMjUuNi0zOC41IDI3LjlsLTg5LjcgMTMuMWMtMiAwLjMtMy44IDAuNS01LjcgMC41eiIgZmlsbD0iI0E0QkVFQyIgcC1pZD0iMzM0NjMiPjwvcGF0aD48L3N2Zz4=')
      //   }
      // )
      this.decoMap.set(key, vscode.window.createTextEditorDecorationType(
        {
          gutterIconPath: vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB0PSIxNzU4NjE1NzM4NzgxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMzNDYxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxwYXRoIGQ9Ik03MzYuOSA4OTIuNmMtMTAuOSAwLTIxLjgtMi42LTMxLjktNy45TDUxMC43IDc4Mi41IDMxNi40IDg4NC43Yy0yMy4zIDEyLjItNTAuOSAxMC4xLTcyLjEtNS4yLTIxLjItMTUuNC0zMS42LTQxLTI3LjItNjYuOWwzNy4xLTIxNi40TDk3LjEgNDQzLjFjLTE4LjgtMTguMy0yNS40LTQ1LjItMTcuMy03MC4xIDguMS0yNC45IDI5LjMtNDIuOCA1NS4yLTQ2LjZsMjE3LjItMzEuNkw0NDkuMyA5OGMxMS42LTIzLjUgMzUuMS0zOC4yIDYxLjQtMzguMiAyNi4yIDAgNDkuNyAxNC42IDYxLjMgMzguMWw5Ny4xIDE5Ni44IDIxNy4yIDMxLjVjMjYgMy44IDQ3LjIgMjEuNyA1NS4yIDQ2LjYgOC4xIDI0LjkgMS41IDUxLjgtMTcuMyA3MC4xTDc2Ny4xIDU5Ni4zbDM3LjEgMjE2LjRjNC40IDI1LjgtNiA1MS41LTI3LjIgNjYuOS0xMiA4LjYtMjYuMSAxMy00MC4xIDEzek0xNjYuOCA0MDEuMkwzMTMgNTQzLjdjMTYuMiAxNS43IDIzLjUgMzguNSAxOS43IDYwLjZsLTM0LjUgMjAxLjIgMTgwLjctOTVjMjAtMTAuNSA0My43LTEwLjUgNjMuNi0wLjFsMTgwLjcgOTUtMzQuNS0yMDEuMmMtMy45LTIyLjIgMy41LTQ0LjggMTkuNi02MC42bDE0Ni4yLTE0Mi41LTIwMi0yOS4zYy0yMi4zLTMuMy00MS42LTE3LjMtNTEuNS0zNy41bC05MC4zLTE4My05MC4zIDE4My4xYy05LjkgMjAuMi0yOS4yIDM0LjItNTEuNSAzNy40bC0yMDIuMSAyOS40eiBtMzM0LjctMjY4LjR6IiBmaWxsPSIjM0Y4NUZGIiBwLWlkPSIzMzQ2MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zNzEuNSA0ODkuM2MtMTkuMiAwLTM2LTE0LjEtMzguOS0zMy43LTMuMS0yMS41IDExLjgtNDEuNCAzMy4zLTQ0LjZsNzUuNC0xMSAzMy43LTY4LjRjOS42LTE5LjUgMzMuMi0yNy41IDUyLjctMTcuOSAxOS41IDkuNiAyNy41IDMzLjIgMTcuOSA1Mi43bC00MC4yIDgxLjRjLTcuNCAxNS4xLTIxLjggMjUuNi0zOC41IDI3LjlsLTg5LjcgMTMuMWMtMiAwLjMtMy44IDAuNS01LjcgMC41eiIgZmlsbD0iI0E0QkVFQyIgcC1pZD0iMzM0NjMiPjwvcGF0aD48L3N2Zz4=')
        }
      ))
    }
    return this.decoMap.get(key)
  }
  
  disposeDeco(key: string): void {
    if (this.decoMap.has(key)) {
      this.getDeco(key).dispose()
      this.decoMap.set(key, vscode.window.createTextEditorDecorationType(
        {
          gutterIconPath: vscode.Uri.parse('data:image/svg+xml;base64,PHN2ZyB0PSIxNzU4NjE1NzM4NzgxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjMzNDYxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjxwYXRoIGQ9Ik03MzYuOSA4OTIuNmMtMTAuOSAwLTIxLjgtMi42LTMxLjktNy45TDUxMC43IDc4Mi41IDMxNi40IDg4NC43Yy0yMy4zIDEyLjItNTAuOSAxMC4xLTcyLjEtNS4yLTIxLjItMTUuNC0zMS42LTQxLTI3LjItNjYuOWwzNy4xLTIxNi40TDk3LjEgNDQzLjFjLTE4LjgtMTguMy0yNS40LTQ1LjItMTcuMy03MC4xIDguMS0yNC45IDI5LjMtNDIuOCA1NS4yLTQ2LjZsMjE3LjItMzEuNkw0NDkuMyA5OGMxMS42LTIzLjUgMzUuMS0zOC4yIDYxLjQtMzguMiAyNi4yIDAgNDkuNyAxNC42IDYxLjMgMzguMWw5Ny4xIDE5Ni44IDIxNy4yIDMxLjVjMjYgMy44IDQ3LjIgMjEuNyA1NS4yIDQ2LjYgOC4xIDI0LjkgMS41IDUxLjgtMTcuMyA3MC4xTDc2Ny4xIDU5Ni4zbDM3LjEgMjE2LjRjNC40IDI1LjgtNiA1MS41LTI3LjIgNjYuOS0xMiA4LjYtMjYuMSAxMy00MC4xIDEzek0xNjYuOCA0MDEuMkwzMTMgNTQzLjdjMTYuMiAxNS43IDIzLjUgMzguNSAxOS43IDYwLjZsLTM0LjUgMjAxLjIgMTgwLjctOTVjMjAtMTAuNSA0My43LTEwLjUgNjMuNi0wLjFsMTgwLjcgOTUtMzQuNS0yMDEuMmMtMy45LTIyLjIgMy41LTQ0LjggMTkuNi02MC42bDE0Ni4yLTE0Mi41LTIwMi0yOS4zYy0yMi4zLTMuMy00MS42LTE3LjMtNTEuNS0zNy41bC05MC4zLTE4My05MC4zIDE4My4xYy05LjkgMjAuMi0yOS4yIDM0LjItNTEuNSAzNy40bC0yMDIuMSAyOS40eiBtMzM0LjctMjY4LjR6IiBmaWxsPSIjM0Y4NUZGIiBwLWlkPSIzMzQ2MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zNzEuNSA0ODkuM2MtMTkuMiAwLTM2LTE0LjEtMzguOS0zMy43LTMuMS0yMS41IDExLjgtNDEuNCAzMy4zLTQ0LjZsNzUuNC0xMSAzMy43LTY4LjRjOS42LTE5LjUgMzMuMi0yNy41IDUyLjctMTcuOSAxOS41IDkuNiAyNy41IDMzLjIgMTcuOSA1Mi43bC00MC4yIDgxLjRjLTcuNCAxNS4xLTIxLjggMjUuNi0zOC41IDI3LjlsLTg5LjcgMTMuMWMtMiAwLjMtMy44IDAuNS01LjcgMC41eiIgZmlsbD0iI0E0QkVFQyIgcC1pZD0iMzM0NjMiPjwvcGF0aD48L3N2Zz4=')
        }
      ))
    }
  }

  get(key): Array<ItemInSettingsJson | string> | string {
    const config = vscode.workspace.getConfiguration('favourite')
    let configValue = <Array<ItemInSettingsJson>>config.get(key)
    
    // 因为 package.json 里的配置不支持多语言，所以初次安装特殊处理
    const Default = localize('ext.default')
    if (key === 'currentGroup' && configValue === null) {
      configValue = Default
    } else if (key === 'groups' && configValue && configValue.length === 0) {
      configValue = [Default]
    }

    // 如果 vscode 工作区没有文件夹
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
      return configValue
    }

    if (isMultiRoots()) {
      return configValue
    }

    nconf.file({ file: path.resolve(getSingleRootPath(), localize('ext.setting.file.name')) })
    let nconfValue  = nconf.get(key)

    if ((['groups', 'resources', 'bookmarks'].includes(key) && nconfValue && Array.isArray(nconfValue) && nconfValue.length == 0)
      || (['sortOrder', 'markSortOrder', 'refreshTime', 'currentGroup'].includes(key) && !nconfValue)) {
      nconfValue = configValue
    }
    return nconfValue
  }

  save(items: { key: string; value: any; }[]): Promise<void> {
    const config = vscode.workspace.getConfiguration('favourite')

    // 如果 vscode 工作区没有文件夹
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
      vscode.window.showErrorMessage(localize('msg.workspace.no.folder'));
      return Promise.reject()
    }

    if (isMultiRoots()) {
      items.forEach(({key, value}) => {
        config.update(key, value, false)
      })
      return Promise.resolve()
    }

    nconf.file({ file: path.resolve(getSingleRootPath(), localize('ext.setting.file.name')) })
    items.forEach(({key, value}) => {
      nconf.set(key, value)
    })
    return new Promise<void>((resolve, reject) => {
      nconf.save((err) => {
        if (err) {
          let message = err.message
          if (err.message.indexOf("permission denied") && err.message.indexOf(localize('ext.setting.file.name'))) {
            message += localize('msg.access.deny.chmod')
          }
          vscode.window.showErrorMessage(message)
          return reject(err)
        }
        resolve()
      })
    })
  }
}

export default new ConfigMgr()
