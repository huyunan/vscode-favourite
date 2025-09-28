import * as vscode from 'vscode'

import { getAllBookmarks, pathResolve } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { ItemMarkJson } from '../model'

export class FavouriteMarkProvider implements vscode.TreeDataProvider<MarkResource> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MarkResource | void>()
  readonly onDidChangeTreeData: vscode.Event<MarkResource | void> = this._onDidChangeTreeData.event
  private _onDidExpandElement = new vscode.EventEmitter<MarkResource | void>()
  readonly onDidExpandElement: vscode.Event<MarkResource | void> = this._onDidExpandElement.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: MarkResource): vscode.TreeItem {
    return element
  }

  getChildren(): MarkResource[] {
    const bookmarks = getAllBookmarks()
    if (!bookmarks || !bookmarks.length) {
      return []
    }
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP

    const filterData = bookmarks.filter((i) => i.group === currentGroup)
    const rootResources = this.data2Resource(filterData, 'mark')
    return rootResources
  }

  private data2Resource(data: Array<ItemMarkJson>, contextValue: string): Array<MarkResource> {
    const allResource = []
    data.forEach(i => {
      const uri = vscode.Uri.file(pathResolve(i.filePath));
      i.bookmarks.forEach(bb => {
        const markResource = new MarkResource(
          bb.content,
          i.filePath,
          contextValue,
          {
            command: 'favourite.markOpen',
            title: '',
            arguments: [uri, bb.lineNumber],
          },
          uri,
          bb.lineNumber
        )
        allResource.push(markResource)
      })
    })
    return allResource
  }
}

export class MarkResource extends vscode.TreeItem {
  public resourceUri: vscode.Uri

  constructor(
    public label: string,
    public value: string,
    public contextValue: string,
    public command?: vscode.Command,
    public uri?: vscode.Uri,
    public lineNumber?: number
  ) {
    super(label)

    this.iconPath = vscode.Uri.joinPath(configMgr.context.extensionUri, 'img/favourite.png')
    this.resourceUri = uri ? uri : vscode.Uri.file(value)
    this.tooltip = value + `（Ln ${this.lineNumber}）`
  }
}