import { resolve } from 'path';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavouriteProvider } from './provider/FavouriteProvider'
import { ItemInSettingsJson } from './model'
import configMgr from './helper/configMgr'
import localize from './helper/localize'
import { pathResolve } from './helper/util'
import * as fs from 'fs'
const readline = require('readline');

import {
  addToFavourite,
  addToBookmark,
  addToNameBookmark,
  deleteBookmark,
  addNewGroup,
  deleteFavourite,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  copyFilePath,
  copyRelativeFilePath,
  deleteAllFavourite,
  refresh,
  toggleSort,
  changeGroup,
  revealInOS_mac,
  revealInOS_windows,
  revealInOS_other,
  revealInSideBar,
  openToSide,
  open,
  reveal,
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "favourite" is now active!')

  vscode.commands.executeCommand('setContext', 'ext:allFavouriteViews', ['favourite', 'favourite-full-view'])
  changeWindowState()
  const favouriteProvider = new FavouriteProvider()

  const explorerTree = vscode.window.createTreeView('favourite', { treeDataProvider: favouriteProvider, showCollapseAll: true })
  const tree = vscode.window.createTreeView('favourite-full-view', {
    treeDataProvider: favouriteProvider,
    showCollapseAll: true,
  })
  configMgr.explorerTree = explorerTree
  configMgr.tree = tree

  const currentGroup = configMgr.get('currentGroup')
  tree.message = `${localize('ext.current.group')}${currentGroup}`
  
  checkGitIgnore()

  vscode.workspace.onDidChangeConfiguration(
    () => {
      onFileChange(favouriteProvider)
    },
    this,
    context.subscriptions
  )
  const path = pathResolve(localize('ext.setting.file.name'))
  const pUri = vscode.Uri.file(path)

  if (pUri.authority == 'wsl.localhost') {
    fs.watchFile(path, {persistent: true }, () => {
      onFileChange(favouriteProvider)
    });
  } else {
    const fileWatcher = vscode.workspace.createFileSystemWatcher(path, false, false, false);
    fileWatcher.onDidCreate(() => {
      onFileChange(favouriteProvider)
    })
    fileWatcher.onDidChange(() => {
      onFileChange(favouriteProvider)
    })
    fileWatcher.onDidDelete(() => {
      onFileChange(favouriteProvider)
    })
  }

  function changeWindowState() {
    const currentGroup = configMgr.get('currentGroup')
    const resources = (configMgr.get('resources') as Array<ItemInSettingsJson>) || []
    const currentResources: Array<ItemInSettingsJson> = resources.filter(item => item.group == currentGroup)
    const filePaths = currentResources.map(item => pathResolve(item.filePath))
    vscode.commands.executeCommand('setContext', 'ext:favorite.filePaths', filePaths);
  }
  
  function onFileChange(favouriteProvider: FavouriteProvider) {
    const currentGroup = configMgr.get('currentGroup')
    tree.message = `${localize('ext.current.group')}${currentGroup}`
    changeWindowState()
    favouriteProvider.refresh()
  }
  
  // 查看是否将 .vsfavorite 添加到 .git/info/exclude .ginignore 中
  function checkGitIgnore() {
    try {
      const folders = vscode.workspace.workspaceFolders
      if (!(folders && folders.length == 1)) return
      const rootPath = folders[0].uri.fsPath
      fs.stat(resolve(rootPath, '.git'), (err, stats) => {
        if (err) {
          console.log(err?.message);
          return
        }
        if (stats.isDirectory()) {
          const readline = require('readline');
          const excludeFile = resolve(rootPath, '.git/info/exclude')
          const rule = '/' + localize('ext.setting.file.name')
          const stream = fs.createReadStream(excludeFile);
          let exitFlg = false;
          const rl = readline.createInterface({
              input: stream,
              crlfDelay: Infinity // 识别所有的换行符，包括 '\n' 和 '\r\n'
          });
          rl.on('line', (line) => {
              if (rule == line.trim()) {
                exitFlg = true;
              }
          });
          rl.on('close', () => {
            //  Finished reading the file.
            if (!exitFlg) {
              fs.appendFile(excludeFile, '\n' + rule, (err) => {
                if (err) console.log(err?.message);
              });
            }
          });
        }
      })
    } catch (error) {
      console.log(error?.message)
    }
  }

  context.subscriptions.push(addToFavourite())
  context.subscriptions.push(addToBookmark())
  context.subscriptions.push(addToNameBookmark())
  context.subscriptions.push(deleteBookmark())
  context.subscriptions.push(deleteFavourite())
  context.subscriptions.push(revealInOS_mac())
  context.subscriptions.push(revealInOS_windows())
  context.subscriptions.push(revealInOS_other())
  context.subscriptions.push(revealInSideBar())
  context.subscriptions.push(openToSide())
  context.subscriptions.push(open(favouriteProvider))
  context.subscriptions.push(reveal(favouriteProvider))
  context.subscriptions.push(moveUp(favouriteProvider))
  context.subscriptions.push(moveDown(favouriteProvider))
  context.subscriptions.push(moveToTop(favouriteProvider))
  context.subscriptions.push(moveToBottom(favouriteProvider))
  context.subscriptions.push(copyFilePath())
  context.subscriptions.push(copyRelativeFilePath())
  context.subscriptions.push(deleteAllFavourite())
  context.subscriptions.push(refresh(favouriteProvider))
  context.subscriptions.push(toggleSort(favouriteProvider))
  context.subscriptions.push(changeGroup(favouriteProvider))
  context.subscriptions.push(addNewGroup(favouriteProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
