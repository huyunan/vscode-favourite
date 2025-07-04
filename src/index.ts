// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavouriteProvider } from './provider/FavouriteProvider'
import configMgr from './helper/configMgr'
import localize from './helper/localize'

import {
  addToFavourite,
  addNewGroup,
  deleteFavourite,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  refresh,
  toggleSort,
  changeGroup,
  revealInOS_mac,
  revealInOS_windows,
  revealInOS_other,
  revealInSideBar,
  openToSide,
  open,
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "favourite" is now active!')

  vscode.commands.executeCommand('setContext', 'ext:allFavouriteViews', ['favourite', 'favourite-full-view'])

  configMgr.onConfigChange(() => {
    favouriteProvider.refresh()
  })

  const favouriteProvider = new FavouriteProvider()

  vscode.window.createTreeView('favourite', { treeDataProvider: favouriteProvider, showCollapseAll: true })
  const tree = vscode.window.createTreeView('favourite-full-view', {
    treeDataProvider: favouriteProvider,
    showCollapseAll: true,
  })

  const currentGroup = configMgr.get('currentGroup')
  tree.message = `${localize('ext.current.group')}${currentGroup}`

  vscode.workspace.onDidChangeConfiguration(
    () => {
      const currentGroup = configMgr.get('currentGroup')
      tree.message = `${localize('ext.current.group')}${currentGroup}`
      favouriteProvider.refresh()
    },
    this,
    context.subscriptions
  )

  context.subscriptions.push(addToFavourite())
  context.subscriptions.push(deleteFavourite())
  context.subscriptions.push(revealInOS_mac())
  context.subscriptions.push(revealInOS_windows())
  context.subscriptions.push(revealInOS_other())
  context.subscriptions.push(revealInSideBar())
  context.subscriptions.push(openToSide())
  context.subscriptions.push(open(favouriteProvider))
  context.subscriptions.push(moveUp(favouriteProvider))
  context.subscriptions.push(moveDown(favouriteProvider))
  context.subscriptions.push(moveToTop(favouriteProvider))
  context.subscriptions.push(moveToBottom(favouriteProvider))
  context.subscriptions.push(refresh(favouriteProvider))
  context.subscriptions.push(toggleSort(favouriteProvider))
  context.subscriptions.push(changeGroup(favouriteProvider))
  context.subscriptions.push(addNewGroup(favouriteProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
