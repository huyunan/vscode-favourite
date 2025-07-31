import * as vscode from 'vscode'
import * as nconf from 'nconf'
import * as path from 'path'
import localize from '../helper/localize'

import { isMultiRoots, getSingleRootPath } from './util'
import { ItemInSettingsJson } from '../model'

class ConfigMgr {
  public explorerTree: vscode.TreeView<any>;
  public tree: vscode.TreeView<any>;

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

    if ((['groups', 'resources'].includes(key) && nconfValue && Array.isArray(nconfValue) && nconfValue.length == 0)
      || (['sortOrder', 'refreshTime', 'currentGroup'].includes(key) && !nconfValue)) {
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
