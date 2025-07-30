// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavouriteProvider } from './provider/FavouriteProvider'
import { ItemInSettingsJson } from './model'
import configMgr from './helper/configMgr'
import localize from './helper/localize'
import { pathResolve } from './helper/util'
import * as fs from 'fs'

import {
  addToFavourite,
  addNewGroup,
  deleteFavourite,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
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

  vscode.window.createTreeView('favourite', { treeDataProvider: favouriteProvider, showCollapseAll: true })
  const tree = vscode.window.createTreeView('favourite-full-view', {
    treeDataProvider: favouriteProvider,
    showCollapseAll: true,
  })
  configMgr.tree = tree

  const currentGroup = configMgr.get('currentGroup')
  tree.message = `${localize('ext.current.group')}${currentGroup}`

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

  context.subscriptions.push(addToFavourite())
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
  context.subscriptions.push(deleteAllFavourite())
  context.subscriptions.push(refresh(favouriteProvider))
  context.subscriptions.push(toggleSort(favouriteProvider))
  context.subscriptions.push(changeGroup(favouriteProvider))
  context.subscriptions.push(addNewGroup(favouriteProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
