import { resolve } from 'path';
import * as vscode from 'vscode'
import { FavouriteProvider } from './provider/FavouriteProvider'
import { FavouriteMarkProvider } from './provider/FavouriteMarkProvider'
import { ItemInSettingsJson, ItemMarkJson } from './model'
import configMgr from './helper/configMgr'
import localize from './helper/localize'
import { getAllBookmarks, getSingleRootPath, isMultiRoots, pathResolve } from './helper/util'
import * as fs from 'fs'

import {
  addToFavourite,
  addToBookmark,
  addToNameBookmark,
  setBookmark,
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
  toggleView,
  changeGroup,
  revealInOS_mac,
  revealInOS_windows,
  revealInOS_other,
  revealInSideBar,
  openToSide,
  open,
  reveal,
} from './command'
import { DEFAULT_GROUP } from './enum';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "favourite" is now active!')
  vscode.commands.executeCommand('setContext', 'ext:allFavouriteViews', ['favourite-dir-view', 'favourite-mark-view'])
  vscode.commands.executeCommand('setContext', 'ext:favourite-mark-view', false)
  changeWindowState()
  const favouriteProvider = new FavouriteProvider()

  const tree = vscode.window.createTreeView('favourite-dir-view', {
    treeDataProvider: favouriteProvider,
    showCollapseAll: true,
  })
  configMgr.tree = tree
  
  const favouriteMarkProvider = new FavouriteMarkProvider()

  const marktree = vscode.window.createTreeView('favourite-mark-view', {
    treeDataProvider: favouriteMarkProvider,
    showCollapseAll: true,
  })
  configMgr.marktree = marktree

  const currentGroup = configMgr.get('currentGroup')
  tree.message = `${localize('ext.current.group')}${currentGroup}`
  // marktree.message = `${localize('ext.current.group')}${currentGroup}`
  marktree.message = `test`
  
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
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const resources = (configMgr.get('resources') as Array<ItemInSettingsJson>) || []
    const currentResources: Array<ItemInSettingsJson> = resources.filter(item => item.group == currentGroup)
    const filePaths = currentResources.map(item => pathResolve(item.filePath))
    vscode.commands.executeCommand('setContext', 'ext:favorite.filePaths', filePaths);
    
    // bookmarks
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) return
    const fileName = activeEditor.document.uri.fsPath
    const allBookmarks = getAllBookmarks()
    const currentBookmarks: Array<ItemMarkJson> = allBookmarks.filter(b => b.group === currentGroup)
    const markFilePaths = currentBookmarks.map(item => pathResolve(item.filePath))
    vscode.commands.executeCommand('setContext', 'ext:favorite.markFilePaths', markFilePaths);
    const markPath = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)
    const item = allBookmarks.find(b => b.filePath === markPath && b.group === currentGroup)
    let markLineNumber = []
    if (item && item.bookmarks && item.bookmarks.length > 0) {
      const ranges = []
      item.bookmarks.forEach(bb => {
        markLineNumber.push(bb.lineNumber)
        const start = new vscode.Position(bb.lineNumber - 1, 0);
        const end = new vscode.Position(bb.lineNumber - 1, 0);
        const range = new vscode.Range(start, end)
        ranges.push(range)
      })
      configMgr.disposeDeco(markPath)
      activeEditor.setDecorations(configMgr.getDeco(markPath), ranges)
    } else {
      configMgr.disposeDeco(markPath)
      configMgr.decoMap.delete(markPath)
    }
    vscode.commands.executeCommand('setContext', 'ext:favorite.markLineNumber', markLineNumber);
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
  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(state => {
      if (state.focused) {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) return
        setBookmark(activeEditor)
      }
    })
  )
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(activeEditor => {
      if (!activeEditor) return
      setBookmark(activeEditor)
    })
  )
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
  context.subscriptions.push(toggleSort(favouriteProvider))
  context.subscriptions.push(copyFilePath())
  context.subscriptions.push(copyRelativeFilePath())
  context.subscriptions.push(deleteAllFavourite())
  context.subscriptions.push(refresh(favouriteProvider))
  context.subscriptions.push(toggleView(favouriteProvider, favouriteMarkProvider))
  context.subscriptions.push(changeGroup(favouriteProvider))
  context.subscriptions.push(addNewGroup(favouriteProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
